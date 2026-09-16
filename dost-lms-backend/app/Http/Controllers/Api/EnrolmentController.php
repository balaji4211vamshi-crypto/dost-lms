<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrolment;
use App\Models\ProgressReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * US6/US10/US11: enrolling in courses and tracking progress.
 * Every write here also upserts the matching progress_reports row, since
 * ProgressReportController is a read-only reporting view over the same
 * numbers (Design Document §5.2 keeps them as separate tables).
 */
class EnrolmentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Enrolment::query()->with(['course']);

        if ($request->user()->isAdmin() && $request->boolean('all')) {
            $query->with('user');
        } else {
            $query->where('user_id', $request->user()->user_id);
        }

        if ($courseId = $request->query('course_id')) {
            $query->where('course_id', $courseId);
        }

        return response()->json($query->latest('enrolled_at')->paginate($request->query('per_page', 15)));
    }

    /** Learner self-enrols in a published course. */
    public function store(Request $request, Course $course): JsonResponse
    {
        abort_unless($course->is_published, 422, 'This course is not open for enrolment.');

        $user = $request->user();

        $existing = Enrolment::where('user_id', $user->user_id)->where('course_id', $course->course_id)->first();
        if ($existing) {
            return response()->json($existing, 200);
        }

        $enrolment = Enrolment::create([
            'user_id' => $user->user_id,
            'course_id' => $course->course_id,
            'progress' => 0,
            'status' => 'not_started',
            'enrolled_at' => now(),
        ]);

        ProgressReport::updateOrCreate(
            ['user_id' => $user->user_id, 'course_id' => $course->course_id],
            ['progress' => 0, 'last_updated' => now()]
        );

        return response()->json($enrolment, 201);
    }

    public function updateProgress(Request $request, Enrolment $enrolment): JsonResponse
    {
        $this->authoriseOwnerOrAdmin($request, $enrolment);

        $data = $request->validate([
            'progress' => ['required', 'integer', 'min:0', 'max:100'],
            'status' => ['sometimes', Rule::in(['not_started', 'in_progress', 'completed'])],
        ]);

        $status = $data['status'] ?? ($data['progress'] >= 100 ? 'completed' : ($data['progress'] > 0 ? 'in_progress' : 'not_started'));

        $enrolment->update([
            'progress' => $data['progress'],
            'status' => $status,
            'completed_at' => $status === 'completed' ? ($enrolment->completed_at ?? now()) : null,
        ]);

        ProgressReport::updateOrCreate(
            ['user_id' => $enrolment->user_id, 'course_id' => $enrolment->course_id],
            ['progress' => $data['progress'], 'last_updated' => now()]
        );

        return response()->json($enrolment->fresh());
    }

    public function destroy(Request $request, Enrolment $enrolment): JsonResponse
    {
        $this->authoriseOwnerOrAdmin($request, $enrolment);

        $enrolment->delete();

        return response()->json(['message' => 'Unenrolled.']);
    }

    private function authoriseOwnerOrAdmin(Request $request, Enrolment $enrolment): void
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $enrolment->user_id === $user->user_id, 403, 'You do not have permission to perform this action.');
    }
}
