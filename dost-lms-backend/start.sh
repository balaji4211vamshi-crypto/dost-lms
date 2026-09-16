#!/usr/bin/env bash
# Render's start command for the web service. Runs once per deploy/restart.
set -e

php artisan config:clear
php artisan storage:link || true
php artisan migrate --force

echo "=== Starting Laravel on port ${PORT:-10000} ==="
php artisan serve --host 0.0.0.0 --port "${PORT:-10000}"
