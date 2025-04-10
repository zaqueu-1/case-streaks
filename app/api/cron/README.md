# Cron Jobs para Simulação de Acessos de Usuários

Este diretório contém a implementação de cron jobs para simular acessos aleatórios de usuários no sistema.

## Funcionalidades

- Gera acessos aleatórios de usuários a cada hora
- Usa um conjunto de emails fictícios para simular diversos usuários
- Gera parâmetros UTM aleatórios para simular diferentes origens de tráfego
- Executa a mesma lógica de negócio que o webhook original

## Arquivos

- `/app/api/cron/random-accesses/route.ts` - Endpoint que gera os acessos aleatórios
- `/app/lib/cron.ts` - Configuração do cron job
- `/app/components/CronInitializer.tsx` - Componente que inicializa os cron jobs no servidor

## Como funciona

1. O cron job é configurado para rodar a cada hora (no minuto 0)
2. Quando executado, ele gera de 1 a 5 acessos aleatórios
3. Cada acesso simula um usuário diferente acessando um post com parâmetros UTM aleatórios
4. O sistema processa esses acessos da mesma forma que processaria acessos reais

## Configuração

O cron job é iniciado automaticamente quando a aplicação é iniciada, através do componente `CronInitializer`.

Para modificar a frequência de execução, altere o padrão cron em `/app/lib/cron.ts`. O padrão atual é `0 * * * *` (a cada hora). 