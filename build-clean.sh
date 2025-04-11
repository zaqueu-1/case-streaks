#!/bin/bash

# Limpar diretórios de build anteriores
rm -rf .next
rm -rf out

# Executar o build com flags para evitar problemas
NEXT_SKIP_APP_STATIC_EVALUATION=1 \
NEXT_TELEMETRY_DISABLED=1 \
DISABLE_ESLINT_PLUGIN=true \
NODE_OPTIONS="--no-warnings" \
NODE_ENV=production \
NO_LINT=1 \
NEXT_DISABLE_SOURCEMAPS=1 \
ANALYZE=false \
next build --no-lint 