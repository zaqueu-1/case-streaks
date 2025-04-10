# Configuração de Cron Jobs com GitHub Actions

Esta é uma alternativa gratuita aos Vercel Cron Jobs para planos gratuitos da Vercel.

## Como funciona

O GitHub Actions é configurado para executar um workflow a cada hora, que faz uma chamada HTTP para o endpoint da sua aplicação na Vercel. Isso simula o comportamento de um cron job sem custo adicional.

## Configuração

### 1. Configurar o Secret no GitHub

1. Vá até o repositório do GitHub onde o projeto está hospedado
2. Navegue até "Settings" > "Secrets and variables" > "Actions"
3. Clique em "New repository secret"
4. Adicione um secret com o nome `VERCEL_APP_URL` e o valor sendo a URL completa do seu app na Vercel (ex: "https://seu-app.vercel.app")
5. Clique em "Add secret"

### 2. Verificar o Workflow

O arquivo `.github/workflows/cron.yml` já está configurado para executar a cada hora e fazer uma chamada ao endpoint `/api/cron/vercel-cron`.

### 3. Testar o Workflow

Para testar manualmente:

1. Vá até a aba "Actions" no seu repositório do GitHub
2. Selecione o workflow "Hourly Cron Job" na lista
3. Clique em "Run workflow" > "Run workflow"
4. Aguarde a execução e verifique os logs

## Limitações

- O GitHub Actions tem um limite mensal de minutos gratuitos (2000 minutos/mês para repositórios públicos)
- A precisão do tempo não é garantida ao segundo (pode haver alguns minutos de atraso)
- Depende da disponibilidade do GitHub Actions

## Monitoramento

Você pode monitorar as execuções do cron job na aba "Actions" do seu repositório GitHub.

Se quiser logs mais detalhados, adicione mais comandos `echo` no workflow ou implemente logs mais detalhados no endpoint da sua aplicação. 