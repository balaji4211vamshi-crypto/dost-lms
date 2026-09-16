<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * US5-US8: browse/manage courses. Learners only ever see published,
 * non-deleted courses; admins (course authors) see everything including
 * drafts, via the `is_published` filter below.
 */
class CourseController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Course::query()->withCount(['enrolments', 'assignments']);

        if (! $request->user()->isAdmin()) {
            $query->where('is_published', true);
        }

        if ($department = $request->query('department')) {
            $query->where('department', $department);
        }

        if ($search = $request->query('search')) {
            $query->where('title', 'like', "%{$search}%");
        }

        return response()->json($query->orderBy('title')->paginate($request->query('per_page', 15)));
    }

    public function show(Request $request, Course $course): JsonResponse
    {
        if (! $course->is_published && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Course not found.'], 404);
        }

        $course->load(['materials', 'assignments', 'creator']);

        // Attach the requesting learner's own enrolment/progress, if any.
        $enrolment = $course->enrolments()->where('user_id', $request->user()->user_id)->first();
        $course->setAttribute('my_enrolment', $enrolment);

        return response()->json($course);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'department' => ['nullable', 'string', 'max:255'],
            'duration' => ['nullable', 'string', 'max:255'],
            'level' => ['required', Rule::in(['Beginner', 'Intermediate', 'Advanced'])],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $data['created_by'] = $request->user()->user_id;

        $course = Course::create($data);

        return response()->json($course, 201);
    }

    public function update(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'duration' => ['sometimes', 'nullable', 'string', 'max:255'],
            'level' => ['sometimes', Rule::in(['Beginner', 'Intermediate', 'Advanced'])],
            'is_published' => ['sometimes', 'boolean'],
        ]);

        $course->update($data);

        return response()->json($course->fresh());
    }

    /** Soft-delete (SoftDeletes trait) — keeps history for certificates/progress reports intact. */
    public function destroy(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json(['message' => 'Course deleted.']);
    }
}
