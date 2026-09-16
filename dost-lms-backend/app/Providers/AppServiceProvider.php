<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * We ship our own copy of Sanctum's personal_access_tokens migration in
     * database/migrations (so the whole schema lives in one place), so tell
     * Sanctum not to also load its internal copy — otherwise both try to
     * create the same table and the second one fails. This has to happen
     * here in register(), not boot(): Sanctum's own service provider loads
     * its migrations during ITS boot(), which runs before ours, so setting
     * this flag in our boot() would be too late.
     */
    public function register(): void
    {
        Sanctum::ignoreMigrations();
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
