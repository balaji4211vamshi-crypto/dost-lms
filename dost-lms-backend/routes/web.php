<?php

use Illuminate\Support\Facades\Route;

/*
 * This is a pure API backend for the DOST Academy System (React handles the
 * whole front-end separately). The only "web" route is a friendly landing
 * page so hitting the bare domain in a browser doesn't 404 confusingly.
 */
Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'status' => 'ok',
        'api' => url('/api'),
    ]);
});
