<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use App\Services\LmsIntegrationService;
use Illuminate\Http\JsonResponse;

/** US18/US19: external DOST LMS integration — see LmsIntegrationService for the mock/real split. */
class LmsIntegrationController extends Controller
{
    public function __construct(private LmsIntegrationService $lms)
    {
    }

    public function status(): JsonResponse
    {
        return response()->json($this->lms->status());
    }

    /** Sync every completed enrolment for a course to the external LMS. */
    public function syncCourse(Course $course): JsonResponse
    {
        $completed = $course->enrolments()->where('status', 'completed')->get();

        $results = $completed->map(fn ($enrolment) => $this->lms->syncCourseCompletion($course, $enrolment->toArray()))->all();

        return response()->json([
            'course_id' => $course->course_id,
            'synced_count' => count($results),
            'results' => $results,
        ]);
    }

    public function syncCertificate(Certificate $certificate): JsonResponse
    {
        return response()->json($this->lms->syncCertificate($certificate));
    }
}
