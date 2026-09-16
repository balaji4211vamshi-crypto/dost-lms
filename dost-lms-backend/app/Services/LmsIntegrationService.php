<?php

namespace App\Services;

use App\Models\Certificate;
use App\Models\Course;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

/**
 * US18/US19: "integrate with the existing DOST Learning Management System".
 *
 * No real DOST LMS exists for this university project — there is no
 * documented API, no test credentials, nothing to point at (see
 * Implementation Plan, Dependencies/Risks). config('services.dost_lms.mock')
 * defaults to true, in which case every call below is simulated locally
 * (deterministic fake IDs, no network call) so the feature is demonstrable
 * end-to-end. If DOST ever supplies real API access, set DOST_LMS_MOCK=false
 * and DOST_LMS_BASE_URL / DOST_LMS_API_KEY in .env — the real HTTP branch
 * below is already wired to Laravel's Http client and just needs the actual
 * request/response shape adjusted to match DOST's documentation once it exists.
 */
class LmsIntegrationService
{
    public function isMocked(): bool
    {
        return (bool) config('services.dost_lms.mock', true);
    }

    public function status(): array
    {
        return [
            'mock' => $this->isMocked(),
            'base_url' => config('services.dost_lms.base_url'),
            'connected' => $this->isMocked() ? true : $this->pingReal(),
        ];
    }

    /** Simulate (or, once configured, perform) pushing one learner's course completion upstream. */
    public function syncCourseCompletion(Course $course, array $enrolment): array
    {
        if ($this->isMocked()) {
            return [
                'external_record_id' => 'MOCK-'.Str::upper(Str::random(10)),
                'course_id' => $course->course_id,
                'user_id' => $enrolment['user_id'],
                'status' => 'synced',
                'synced_at' => now()->toIso8601String(),
                'note' => 'Simulated — no real DOST LMS endpoint is configured (DOST_LMS_MOCK=true).',
            ];
        }

        $response = Http::withToken(config('services.dost_lms.api_key'))
            ->baseUrl(config('services.dost_lms.base_url'))
            ->post('/completions', [
                'course_id' => $course->course_id,
                'user_id' => $enrolment['user_id'],
                'progress' => $enrolment['progress'] ?? null,
                'status' => $enrolment['status'] ?? null,
            ]);

        return [
            'external_record_id' => $response->json('id'),
            'course_id' => $course->course_id,
            'user_id' => $enrolment['user_id'],
            'status' => $response->successful() ? 'synced' : 'failed',
            'synced_at' => now()->toIso8601String(),
        ];
    }

    public function syncCertificate(Certificate $certificate): array
    {
        if ($this->isMocked()) {
            return [
                'external_record_id' => 'MOCK-CERT-'.Str::upper(Str::random(10)),
                'certificate_number' => $certificate->certificate_number,
                'status' => 'synced',
                'synced_at' => now()->toIso8601String(),
                'note' => 'Simulated — no real DOST LMS endpoint is configured (DOST_LMS_MOCK=true).',
            ];
        }

        $response = Http::withToken(config('services.dost_lms.api_key'))
            ->baseUrl(config('services.dost_lms.base_url'))
            ->post('/certificates', [
                'certificate_number' => $certificate->certificate_number,
                'user_id' => $certificate->user_id,
                'course_id' => $certificate->course_id,
                'issued_date' => optional($certificate->issued_date)->toDateString(),
            ]);

        return [
            'external_record_id' => $response->json('id'),
            'certificate_number' => $certificate->certificate_number,
            'status' => $response->successful() ? 'synced' : 'failed',
            'synced_at' => now()->toIso8601String(),
        ];
    }

    private function pingReal(): bool
    {
        try {
            return Http::withToken(config('services.dost_lms.api_key'))
                ->baseUrl(config('services.dost_lms.base_url'))
                ->timeout(5)
                ->get('/health')
                ->successful();
        } catch (\Throwable $e) {
            return false;
        }
    }
}
