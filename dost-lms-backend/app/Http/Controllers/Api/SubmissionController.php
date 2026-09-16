<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * US12/US13/US14: learners submit assignments (file) or quizzes (answers,
 * auto-graded on the spot); admins grade file-based submissions manually.
 */
class SubmissionController extends Controller
{
    /** Admin view of everyone's submissions for one assignment (grading queue). */
    public function index(Request $request, Assignment $assignment): JsonResponse
    {
        return response()->json(
            $assignment->submissions()->with('user')->latest('submitted_at')->paginate($request->query('per_page', 15))
        );
    }

    /** The requesting learner's own submission history across all courses. */
    public function mine(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->submissions()->with('assignment.course')->latest('submitted_at')->paginate($request->query('per_page', 15))
        );
    }

    public function store(Request $request, Assignment $assignment): JsonResponse
    {
        abort_unless($assignment->status === 'open', 422, 'This assignment is not open for submissions.');

        $user = $request->user();

        $existing = Submission::where('assignment_id', $assignment->assignment_id)->where('user_id', $user->user_id)->first();
        abort_if($existing, 422, 'You have already submitted this assignment.');

        if ($assignment->isQuiz()) {
            $data = $request->validate([
                'quiz_answers' => ['required', 'array'],
                'quiz_answers.*' => ['integer', 'min:0'],
            ]);

            [$score, $result] = $this->gradeQuiz($assignment, $data['quiz_answers']);

            $submission = Submission::create([
                'assignment_id' => $assignment->assignment_id,
                'user_id' => $user->user_id,
                'quiz_answers' => $data['quiz_answers'],
                'score' => $score,
                'result' => $result,
                'submitted_at' => now(),
                'graded_at' => now(),
            ]);
        } else {
            $data = $request->validate([
                'file' => ['required', 'file', 'max:51200'], // 50MB
                'notes' => ['nullable', 'string'],
            ]);

            $path = $request->file('file')->store("submissions/{$assignment->assignment_id}", 'public');

            $submission = Submission::create([
                'assignment_id' => $assignment->assignment_id,
                'user_id' => $user->user_id,
                'file_path' => $path,
                'notes' => $data['notes'] ?? null,
                'result' => 'pending',
                'submitted_at' => now(),
            ]);
        }

        return response()->json($submission, 201);
    }

    /** Admin grades a file-based (non-quiz) submission. */
    public function grade(Request $request, Submission $submission): JsonResponse
    {
        $assignment = $submission->assignment;
        abort_if($assignment->isQuiz(), 422, 'Quizzes are graded automatically.');

        $data = $request->validate([
            'score' => ['required', 'integer', 'min:0', "max:{$assignment->max_score}"],
            'result' => ['required', Rule::in(['pass', 'fail'])],
        ]);

        $submission->update([
            'score' => $data['score'],
            'result' => $data['result'],
            'graded_at' => now(),
        ]);

        return response()->json($submission->fresh());
    }

    /**
     * @param array<int, int> $answers selected option index per question, in question order
     * @return array{0: int, 1: string} [score out of assignment.max_score, 'pass'|'fail']
     */
    private function gradeQuiz(Assignment $assignment, array $answers): array
    {
        $questions = $assignment->quiz_questions ?? [];
        $total = count($questions) ?: 1;
        $correct = 0;

        foreach ($questions as $i => $question) {
            if (($answers[$i] ?? null) === ($question['correct_index'] ?? null)) {
                $correct++;
            }
        }

        $score = (int) round(($correct / $total) * $assignment->max_score);
        $result = $score >= (int) round($assignment->max_score * 0.5) ? 'pass' : 'fail';

        return [$score, $result];
    }
}
