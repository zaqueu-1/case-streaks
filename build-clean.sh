#!/bin/bash

# Limpar diretórios de build anteriores
rm -rf .next
rm -rf out

# Limpar cache
npm cache clean --force

# Instalar dependências
npm ci

# Executar o build com flags para evitar pré-renderização
DISABLE_ESLINT_PLUGIN=true \
NEXT_SKIP_APP_STATIC_EVALUATION=1 \
NEXT_TELEMETRY_DISABLED=1 \
NEXT_DISABLE_OPTIMIZATION=1 \
NEXT_DISABLE_STATIC_IMAGES=1 \
NODE_ENV=production \
npm run build 