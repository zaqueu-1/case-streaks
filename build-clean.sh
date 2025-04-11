#!/bin/bash

# Limpar diretórios de build anteriores
rm -rf .next
rm -rf out

# Rodar build diretamente
NODE_ENV=production \
npm run build 