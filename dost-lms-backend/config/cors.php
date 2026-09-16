<?php

return [

    /*
     * Allow the React dev server (and any deployed frontend URL) to call
     * this API. Kept explicit rather than '*' — OWASP A05 (Security
     * Misconfiguration) guidance for CORS.
     */
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:3000'),
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
