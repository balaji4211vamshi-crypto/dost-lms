<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\Course;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * US15/US16/US17: certificate issuance on course completion. An admin
 * (or an automated completion check — not wired to a scheduler in this
 * academic build, see Implementation Plan §Future Work) issues a
 * certificate for a learner who has completed a course; the PDF is
 * rendered once at issue time and cached on the "public" disk.
 */
class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Certificate::query()->with(['course']);

        if ($request->user()->isAdmin() && $request->boolean('all')) {
            $query->with('user');
        } else {
            $query->where('user_id', $request->user()->user_id);
        }

        return response()->json($query->latest('issued_date')->paginate($request->query('per_page', 15)));
    }

    public function issue(Request $request, Course $course): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,user_id'],
        ]);

        $enrolment = $course->enrolments()->where('user_id', $data['user_id'])->first();
        abort_unless($enrolment && $enrolment->status === 'completed', 422, 'Learner has not completed this course yet.');

        $existing = Certificate::where('user_id', $data['user_id'])->where('course_id', $course->course_id)->first();
        if ($existing) {
            return response()->json($existing, 200);
        }

        $certificate = Certificate::create([
            'user_id' => $data['user_id'],
            'course_id' => $course->course_id,
            'certificate_number' => 'DOST-'.now()->format('Y').'-'.Str::upper(Str::random(8)),
            'issued_date' => now(),
            'issued_by' => $request->user()->user_id,
        ]);

        $certificate->load(['user', 'course']);

        $pdf = Pdf::loadView('certificates.pdf', [
            'certificate' => $certificate,
            'user' => $certificate->user,
            'course' => $certificate->course,
        ]);

        $path = "certificates/{$certificate->certificate_id}.pdf";
        Storage::disk('public')->put($path, $pdf->output());
        $certificate->update(['pdf_path' => $path]);

        return response()->json($certificate->fresh(), 201);
    }

    public function download(Request $request, Certificate $certificate): Response
    {
        $user = $request->user();
        abort_unless($user->isAdmin() || $certificate->user_id === $user->user_id, 403, 'You do not have permission to perform this action.');
        abort_unless($certificate->pdf_path && Storage::disk('public')->exists($certificate->pdf_path), 404, 'Certificate PDF not found.');

        return Storage::disk('public')->response($certificate->pdf_path, "certificate-{$certificate->certificate_number}.pdf");
    }
}
