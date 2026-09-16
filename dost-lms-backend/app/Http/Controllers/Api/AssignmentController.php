<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * US9/US14: assignments and quizzes share one table (`type` discriminates).
 * Quiz questions are stored with their correct_index in quiz_questions
 * (json) but learners are only ever handed questionsForLearner(), which
 * strips the answer key — see Assignment::questionsForLearner().
 */
class AssignmentController extends Controller
{
    public function index(Request $request, Course $course): JsonResponse
    {
        $query = $course->assignments();
        $isAdmin = $request->user()->isAdmin();

        if (! $isAdmin) {
            $query->where('status', 'open');
        }

        $assignments = $query->orderBy('due_date')->get();

        if (! $isAdmin) {
            // OWASP A01: never ship correct_index to a learner's browser.
            $assignments = $assignments->map(function (Assignment $assignment) {
                $payload = $assignment->toArray();
                if ($assignment->isQuiz()) {
                    $payload['quiz_questions'] = $assignment->questionsForLearner();
                }
                return $payload;
            });
        }

        return response()->json($assignments);
    }

    public function show(Request $request, Assignment $assignment): JsonResponse
    {
        $payload = $assignment->toArray();

        if ($assignment->isQuiz() && ! $request->user()->isAdmin()) {
            $payload['quiz_questions'] = $assignment->questionsForLearner();
        }

        return response()->json($payload);
    }

    public function store(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'type' => ['required', Rule::in(['assignment', 'quiz'])],
            'due_date' => ['nullable', 'date'],
            'status' => ['sometimes', Rule::in(['draft', 'open', 'closed'])],
            'max_score' => ['sometimes', 'integer', 'min:1'],
            'quiz_questions' => ['required_if:type,quiz', 'array'],
            'quiz_questions.*.question' => ['required_with:quiz_questions', 'string'],
            'quiz_questions.*.options' => ['required_with:quiz_questions', 'array', 'min:2'],
            'quiz_questions.*.correct_index' => ['required_with:quiz_questions', 'integer', 'min:0'],
        ]);

        $data['course_id'] = $course->course_id;

        $assignment = Assignment::create($data);

        return response()->json($assignment, 201);
    }

    public function update(Request $request, Assignment $assignment): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'due_date' => ['sometimes', 'nullable', 'date'],
            'status' => ['sometimes', Rule::in(['draft', 'open', 'closed'])],
            'max_score' => ['sometimes', 'integer', 'min:1'],
            'quiz_questions' => ['sometimes', 'array'],
        ]);

        $assignment->update($data);

        return response()->json($assignment->fresh());
    }

    public function destroy(Assignment $assignment): JsonResponse
    {
        $assignment->delete();

        return response()->json(['message' => 'Assignment deleted.']);
    }
}
