#!/bin/bash

# Limpar diretórios de build anteriores
rm -rf .next
rm -rf out

# Executar o build com flags para evitar pré-renderização
DISABLE_ESLINT_PLUGIN=true \
NEXT_SKIP_APP_STATIC_EVALUATION=1 \
NEXT_TELEMETRY_DISABLED=1 \
NODE_ENV=production \
next build 