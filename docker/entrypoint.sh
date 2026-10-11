#!/bin/sh
# Aplica las migraciones pendientes y arranca Resolvo. Si la base está vacía, la API crea el administrador inicial (LOGIN_*).
set -e

echo "Resolvo: aplicando migraciones de la base de datos..."
./node_modules/.bin/prisma migrate deploy

exec "$@"
