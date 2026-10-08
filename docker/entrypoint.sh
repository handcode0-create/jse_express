#!/bin/sh
set -e

cd /var/www/html

# Le disque persistant monté sur public/uploads appartient à root au premier démarrage.
mkdir -p public/uploads/profils public/uploads/couvertures
chown -R www-data:www-data public/uploads storage bootstrap/cache

# Le cache de routes est volontairement absent : routes/web.php utilise des closures.
php artisan config:cache
php artisan view:cache
php artisan event:cache

php artisan migrate --force --no-interaction

exec "$@"
