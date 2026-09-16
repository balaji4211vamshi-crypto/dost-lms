<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

/**
 * US1/US2/US3: registration, login, logout, "who am I" for the React SPA.
 * Token auth via Sanctum personal access tokens (not cookie/SPA mode) —
 * simplest integration for a separately-hosted React dev server.
 */
class AuthController extends Controller
{
    /**
     * Self-registration always creates an "employee" (learner) account.
     * Admin accounts are provisioned by an existing admin via
     * Admin\UserController@store — never through this public endpoint
     * (OWASP A01: Broken Access Control — no privilege escalation via signup).
     */
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'department' => ['nullable', 'string', 'max:255'],
            'job_title' => ['nullable', 'string', 'max:255'],
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'role' => 'employee',
            'department' => $data['department'] ?? null,
            'job_title' => $data['job_title'] ?? null,
        ]);

        $token = $user->createToken('dost-academy-web')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    /**
     * Rate-limited via the 'login' RateLimiter (5/min/IP) registered on this
     * route in routes/api.php — OWASP A07 (brute force mitigation).
     */
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('dost-academy-web')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    /** Invalidate every token for the user — "log out of all devices". */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logged out of all sessions.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    /** US3: learner/admin can update their own profile (not role — see Admin\UserController). */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'department' => ['sometimes', 'nullable', 'string', 'max:255'],
            'job_title' => ['sometimes', 'nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->user_id, 'user_id')],
        ]);

        $user->update($data);

        return response()->json(['message' => 'Profile updated.', 'user' => $user->fresh()]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($data['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => $data['password']]);

        return response()->json(['message' => 'Password changed. Please log in again.']);
    }

    /**
     * Forgot Password (self-service reset request).
     *
     * Generates a single-use token, stores its hash in password_reset_tokens,
     * and emails a reset link to the account's registered address — unless
     * PASSWORD_RESET_OVERRIDE_EMAIL is set in .env, in which case every reset
     * email is routed to that inbox instead. That override exists purely for
     * local development/demo, where test accounts don't have real mailboxes;
     * remove it from .env for a real deployment so resets go to the actual user.
     *
     * Always responds with the same generic message whether or not the email
     * exists, so this endpoint can't be used to enumerate registered accounts
     * (OWASP A01/A07).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($token), 'created_at' => now()]
            );

            $resetUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3000')), '/')
                . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);

            $recipient = env('PASSWORD_RESET_OVERRIDE_EMAIL') ?: $user->email;

            Mail::raw(
                "Hi {$user->name},\n\n"
                . "A password reset was requested for the DOST Academy account: {$user->email}.\n\n"
                . "Reset your password here (this link expires in 60 minutes):\n{$resetUrl}\n\n"
                . "If you didn't request this, you can safely ignore this email.",
                function ($message) use ($recipient, $user) {
                    $message->to($recipient)
                        ->subject('DOST Academy — Reset your password'
                            . (env('PASSWORD_RESET_OVERRIDE_EMAIL') ? " (for {$user->email})" : ''));
                }
            );
        }

        return response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);
    }

    /**
     * Completes a reset started by forgotPassword(): verifies the token
     * (60-minute expiry) and sets the new password.
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $record = DB::table('password_reset_tokens')->where('email', $data['email'])->first();

        if (! $record || ! Hash::check($data['token'], $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['This password reset link is invalid.'],
            ]);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $data['email'])->delete();

            throw ValidationException::withMessages([
                'token' => ['This password reset link has expired. Please request a new one.'],
            ]);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->update(['password' => $data['password']]);

        // Single-use: remove the token and revoke existing sessions.
        DB::table('password_reset_tokens')->where('email', $data['email'])->delete();
        $user->tokens()->delete();

        return response()->json(['message' => 'Password reset successful. Please log in with your new password.']);
    }
}
