<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProgressReport;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * US11: read-only reporting view of learner progress, kept up to date by
 * EnrolmentController@updateProgress. Admins can view any learner's/course's
 * report; learners can only view their own.
 */
class ProgressReportController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ProgressReport::query()->with('course');

        if ($request->user()->isAdmin()) {
            if ($userId = $request->query('user_id')) {
                $query->where('user_id', $userId);
            }
            if ($request->boolean('all') || $request->query('user_id')) {
                $query->with('user');
            } else {
                $query->where('user_id', $request->user()->user_id);
            }
        } else {
            $query->where('user_id', $request->user()->user_id);
        }

        if ($courseId = $request->query('course_id')) {
            $query->where('course_id', $courseId);
        }

        return response()->json($query->latest('last_updated')->paginate($request->query('per_page', 15)));
    }
}
