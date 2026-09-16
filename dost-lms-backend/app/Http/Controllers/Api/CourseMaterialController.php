<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseMaterial;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/**
 * US9 (Planned in the Design Document — built here for Phase 2): admins
 * upload course materials (video/document/link); learners stream/download
 * them via the public "materials" disk.
 */
class CourseMaterialController extends Controller
{
    public function store(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['video', 'document', 'link', 'other'])],
            'file' => ['required_if:type,video,document,other', 'file', 'max:512000'], // 500MB
            'url' => ['required_if:type,link', 'nullable', 'url'],
            'sort_order' => ['sometimes', 'integer'],
        ]);

        $attributes = [
            'course_id' => $course->course_id,
            'title' => $data['title'],
            'type' => $data['type'],
            'uploaded_by' => $request->user()->user_id,
            'sort_order' => $data['sort_order'] ?? ($course->materials()->max('sort_order') + 1),
        ];

        if ($data['type'] === 'link') {
            $attributes['material_path'] = $data['url'];
            $attributes['original_filename'] = null;
            $attributes['size_bytes'] = null;
        } else {
            /** @var \Illuminate\Http\UploadedFile $file */
            $file = $request->file('file');
            $path = $file->store("course-materials/{$course->course_id}", 'public');

            $attributes['material_path'] = $path;
            $attributes['original_filename'] = $file->getClientOriginalName();
            $attributes['size_bytes'] = $file->getSize();
        }

        $material = CourseMaterial::create($attributes);

        return response()->json($material, 201);
    }

    public function destroy(Course $course, CourseMaterial $material): JsonResponse
    {
        abort_unless($material->course_id === $course->course_id, 404);

        if ($material->type !== 'link' && Storage::disk('public')->exists($material->material_path)) {
            Storage::disk('public')->delete($material->material_path);
        }

        $material->delete();

        return response()->json(['message' => 'Material removed.']);
    }
}
