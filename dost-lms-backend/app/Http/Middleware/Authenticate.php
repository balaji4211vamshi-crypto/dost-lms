<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request): ?string
    {
        // This is an API-only backend — never redirect, always return null so
        // Laravel responds with a plain 401 JSON error instead of trying to
        // build a "login" route that doesn't exist here.
        return null;
    }
}
