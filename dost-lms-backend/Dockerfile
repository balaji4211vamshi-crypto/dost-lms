# Deploys the Laravel API to Render. This uses PHP's own built-in server
# (php artisan serve) rather than nginx+php-fpm — simpler to get right for a
# free/demo deployment, and it's the same server the local dev setup script
# already uses via setup-and-run.command.
FROM php:8.2-cli

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev libonig-dev \
    && docker-php-ext-install pdo_pgsql pdo_mysql mbstring bcmath zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .

RUN composer install --no-dev --optimize-autoloader --no-interaction --no-audit

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 10000
CMD ["/start.sh"]
