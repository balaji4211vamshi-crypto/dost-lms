<?php

use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\AssignmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CertificateController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\CourseMaterialController;
use App\Http\Controllers\Api\EnrolmentController;
use App\Http\Controllers\Api\LmsIntegrationController;
use App\Http\Controllers\Api\ProgressReportController;
use App\Http\Controllers\Api\SubmissionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — DOST Academy System
|--------------------------------------------------------------------------
| Every route below is stateless token auth via Sanctum (auth:sanctum),
| RBAC via the 'role' middleware alias (App\Http\Middleware\EnsureUserHasRole).
| The 'login' route carries its own 5/min/IP rate limiter (RouteServiceProvider).
*/

// Public, unauthenticated — used by Render's health check on deploy.
Route::get('/health', fn () => response()->json(['status' => 'ok']));

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:password-reset');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:password-reset');

Route::middleware('auth:sanctum')->group(function () {

    // --- Account (any authenticated user) ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/me', [AuthController::class, 'updateProfile']);
    Route::put('/me/password', [AuthController::class, 'changePassword']);

    // --- Courses (US5-US9) ---
    Route::get('/courses', [CourseController::class, 'index']);
    Route::get('/courses/{course}', [CourseController::class, 'show']);
    Route::get('/courses/{course}/assignments', [AssignmentController::class, 'index']);

    // --- Enrolments (US6/US10/US11) ---
    Route::get('/enrolments', [EnrolmentController::class, 'index']);
    Route::post('/courses/{course}/enrol', [EnrolmentController::class, 'store']);
    Route::put('/enrolments/{enrolment}/progress', [EnrolmentController::class, 'updateProgress']);
    Route::delete('/enrolments/{enrolment}', [EnrolmentController::class, 'destroy']);

    // --- Assignments / quizzes (US12-US14) ---
    Route::get('/assignments/{assignment}', [AssignmentController::class, 'show']);
    Route::post('/assignments/{assignment}/submissions', [SubmissionController::class, 'store']);
    Route::get('/my-submissions', [SubmissionController::class, 'mine']);

    // --- Certificates (US15-US17) ---
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{certificate}/download', [CertificateController::class, 'download']);

    // --- Progress reports (US11) ---
    Route::get('/progress-reports', [ProgressReportController::class, 'index']);

    // --- Admin-only (US4 RBAC) ---
    Route::middleware('role:admin')->group(function () {
        Route::post('/courses', [CourseController::class, 'store']);
        Route::put('/courses/{course}', [CourseController::class, 'update']);
        Route::delete('/courses/{course}', [CourseController::class, 'destroy']);

        Route::post('/courses/{course}/materials', [CourseMaterialController::class, 'store']);
        Route::delete('/courses/{course}/materials/{material}', [CourseMaterialController::class, 'destroy']);

        Route::post('/courses/{course}/assignments', [AssignmentController::class, 'store']);
        Route::put('/assignments/{assignment}', [AssignmentController::class, 'update']);
        Route::delete('/assignments/{assignment}', [AssignmentController::class, 'destroy']);

        Route::get('/assignments/{assignment}/submissions', [SubmissionController::class, 'index']);
        Route::put('/submissions/{submission}/grade', [SubmissionController::class, 'grade']);

        Route::post('/courses/{course}/certificates/issue', [CertificateController::class, 'issue']);

        Route::apiResource('users', AdminUserController::class)->parameters(['users' => 'user']);

        // --- LMS integration (US18/US19, mocked — see LmsIntegrationService) ---
        Route::get('/lms/status', [LmsIntegrationController::class, 'status']);
        Route::post('/lms/courses/{course}/sync', [LmsIntegrationController::class, 'syncCourse']);
        Route::post('/lms/certificates/{certificate}/sync', [LmsIntegrationController::class, 'syncCertificate']);
    });
});
