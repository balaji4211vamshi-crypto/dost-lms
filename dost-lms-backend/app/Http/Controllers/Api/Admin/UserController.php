<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

/**
 * US4: admin-only user management (the only place an "admin" role can be
 * granted — never through public self-registration, see AuthController).
 */
class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }
        if ($search = $request->query('search')) {
            $query->where(fn ($q) => $q->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"));
        }

        return response()->json($query->orderBy('name')->paginate($request->query('per_page', 20)));
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['enrolments.course', 'certificates']));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['employee', 'admin'])],
            'department' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create($data);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->user_id, 'user_id')],
            'role' => ['sometimes', Rule::in(['employee', 'admin'])],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'job_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'password' => ['sometimes', 'string', 'min:8'],
        ]);

        $user->update($data);

        return response()->json($user->fresh());
    }

    /** Soft-delete — keeps historical enrolments/certificates/submissions intact. */
    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_if($user->user_id === $request->user()->user_id, 422, 'You cannot delete your own account.');

        $user->delete();

        return response()->json(['message' => 'User deactivated.']);
    }
}
