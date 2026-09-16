<?php

return [

    'mailgun' => [
        'domain' => env('MAILGUN_DOMAIN'),
        'secret' => env('MAILGUN_SECRET'),
        'endpoint' => env('MAILGUN_ENDPOINT', 'api.mailgun.net'),
        'scheme' => 'https',
    ],

    /*
     * Existing DOST LMS integration (US18/US19). No real credentials exist
     * for this university project — see App\Services\LmsIntegrationService
     * for the simulated/mock sync this points at until DOST provides real
     * API access and documentation (see Implementation Plan, Dependencies).
     */
    'dost_lms' => [
        'base_url' => env('DOST_LMS_BASE_URL', 'https://lms.dost.example/api'),
        'api_key' => env('DOST_LMS_API_KEY'),
        'mock' => env('DOST_LMS_MOCK', true),
    ],

];
