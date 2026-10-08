# syntax=docker/dockerfile:1

# --- 1. Dépendances PHP (sans les paquets de développement) ---
FROM composer:2 AS composer
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction

# --- 2. Build du front (Vite + React + Tailwind) ---
FROM node:22-alpine AS front
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY vite.config.js ./
COPY resources ./resources
COPY public ./public
RUN npm run build

# --- 3. Image d'exécution : Apache + PHP ---
FROM php:8.4-apache AS app

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev libicu-dev unzip \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql pdo_mysql zip intl bcmath opcache \
    && a2enmod rewrite headers \
    && rm -rf /var/lib/apt/lists/*

# Render fournit le port d'écoute dans $PORT (10000 par défaut).
ENV PORT=10000 \
    APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && sed -ri 's!Listen 80!Listen ${PORT}!' /etc/apache2/ports.conf \
    && sed -ri 's!<VirtualHost \*:80>!<VirtualHost *:${PORT}>!' /etc/apache2/sites-available/000-default.conf \
    && printf '<Directory ${APACHE_DOCUMENT_ROOT}>\n    AllowOverride All\n    Require all granted\n</Directory>\n' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

COPY --from=composer /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY --from=composer /app/vendor ./vendor
COPY . .
COPY --from=front /app/public/build ./public/build

RUN composer dump-autoload --optimize --no-dev --no-interaction \
    && php artisan package:discover --ansi \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs public/uploads \
    && chown -R www-data:www-data storage bootstrap/cache public/uploads

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 10000
ENTRYPOINT ["entrypoint.sh"]
CMD ["apache2-foreground"]
