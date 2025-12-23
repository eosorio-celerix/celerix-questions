#!/bin/bash

# Script de deployment para S3 y CloudFront
# Uso: ./deploy.sh [bucket-name] [cloudfront-distribution-id]

BUCKET_NAME=${1:-"tu-bucket-name"}
DISTRIBUTION_ID=${2:-"tu-distribution-id"}

echo "🔨 Construyendo la aplicación..."
npm run build:prod

if [ $? -ne 0 ]; then
  echo "❌ Error en el build. Abortando deployment."
  exit 1
fi

echo "📦 Subiendo archivos a S3..."
aws s3 sync dist/celerix-questions/browser/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --exclude "service-worker.js"

# Subir HTML con cache corto
aws s3 sync dist/celerix-questions/browser/ s3://$BUCKET_NAME/ \
  --delete \
  --cache-control "public, max-age=0, must-revalidate" \
  --exclude "*" \
  --include "*.html"

# Subir service worker sin cache
aws s3 cp dist/celerix-questions/browser/service-worker.js s3://$BUCKET_NAME/service-worker.js \
  --cache-control "public, max-age=0, must-revalidate" 2>/dev/null || true

# Configurar Content-Type para archivos HTML
echo "🔧 Configurando Content-Type para archivos HTML..."
aws s3 cp dist/celerix-questions/browser/index.html s3://$BUCKET_NAME/index.html \
  --content-type "text/html; charset=utf-8" \
  --cache-control "public, max-age=0, must-revalidate"

# Invalidar caché de CloudFront
if [ ! -z "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "tu-distribution-id" ]; then
  echo "🔄 Invalidando caché de CloudFront..."
  aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
fi

echo "✅ Deployment completado!"

