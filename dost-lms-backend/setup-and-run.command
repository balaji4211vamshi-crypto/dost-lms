#!/bin/bash
# DOST Academy System — one-click setup + run.
# Double-click this file in Finder. If macOS warns about an unidentified
# developer, right-click it -> Open, then confirm once.

set -e
cd "$(dirname "$0")"

echo "=== DOST Academy System — setup ==="

if ! command -v php >/dev/null 2>&1 || ! command -v composer >/dev/null 2>&1; then
    echo ""
    echo "PHP and/or Composer are not installed."
    echo "Install them first (this will ask for your Mac password):"
    echo ""
    echo "    brew install php composer"
    echo ""
    echo "Then double-click this file again."
    read -p "Press Enter to close this window..."
    exit 1
fi

echo "PHP found: $(php -v | head -n 1)"
echo "Composer found: $(composer --version)"

echo ""
echo "--- Relaxing Composer's security-advisory install policy for this project ---"
composer config --no-interaction --no-plugins policy.advisories.block false || true
composer config --no-interaction --no-plugins allow-plugins true || true
composer config --no-interaction --global policy.advisories.block false || true
export COMPOSER_DISABLE_NETWORK=0
export COMPOSER_NO_AUDIT=1

echo ""
echo "--- Installing PHP dependencies (composer install) ---"
composer install --no-interaction --no-audit || composer install --no-interaction

if [ ! -f .env ]; then
    cp .env.example .env
    php artisan key:generate --force
fi

echo ""
export PATH="/usr/local/mysql/bin:$PATH"
DB_PASSWORD=$(grep '^DB_PASSWORD=' .env | cut -d '=' -f2-)
DB_NAME=$(grep '^DB_DATABASE=' .env | cut -d '=' -f2-)
if [ ! -f .dost-seeded ]; then
    echo "--- Creating a fresh database (first run) ---"
    mysql -u root -p"$DB_PASSWORD" -e "DROP DATABASE IF EXISTS \`$DB_NAME\`; CREATE DATABASE \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
        || { echo "Could not reach MySQL with the password in .env — edit DB_PASSWORD in .env to match what you set during the MySQL installer, then run this again."; read -p "Press Enter to close..."; exit 1; }
else
    echo "--- Database already set up from a previous run — leaving your data in place ---"
    mysql -u root -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" \
        || { echo "Could not reach MySQL with the password in .env — edit DB_PASSWORD in .env to match what you set during the MySQL installer, then run this again."; read -p "Press Enter to close..."; exit 1; }
fi

echo ""
echo "--- Linking public storage ---"
php artisan storage:link || true

echo ""
if [ -f .dost-seeded ]; then
    echo "--- Running migrations (already seeded on a previous run) ---"
    php artisan migrate --force
else
    echo "--- Running migrations + seed data (first run) ---"
    php artisan migrate --seed --force
    touch .dost-seeded
fi

echo ""
echo "=== Starting the API server at http://localhost:8000 ==="
echo "Leave this window open while you use the app. Close it to stop the server."
php artisan serve
