# 📰 the news - Dashboard de Leitura

Desafio Técnico/Case da empresa Waffle para uma de suas principais marcas: a The News. Trata-se de uma aplicação web para acompanhar o progresso de leitura dos assinantes da newsletter, gamificando a experiência por meio de um sistema de conquistas, níveis e streaks.

## 🚀 Tecnologias

- **Frontend**:

  - Next.js 14 (App Router)
  - React 19
  - TypeScript
  - TailwindCSS
  - NextAuth.js para autenticação
  - html2canvas para geração de imagens compartilháveis

- **Backend**:

  - Node.js
  - PostgreSQL com pg
  - API Routes do Next.js
  - Webhook da própria The News para integração com Beehiiv
  - TypeScript para type safety

- **Deploy e Infraestrutura**:
  - Vercel
  - PostgreSQL
  - ngrok para desenvolvimento local

## 📁 Estrutura do Projeto

```
app/
├── admin/              # Dashboard administrativo
├── api/                # Rotas da API
│   ├── auth/          # Autenticação
│   ├── cleanup/       # Limpeza de dados
│   ├── healthcheck/   # Verificação de saúde
│   ├── stats/         # Estatísticas do usuário
│   ├── update-points/ # Atualização de pontos
│   └── webhook/       # Webhook do The News
├── components/         # Componentes React
│   ├── AccessCalendar/# Calendário de acessos
│   ├── Achievements/  # Sistema de conquistas
│   ├── Header/        # Cabeçalho
│   ├── LevelBadge/    # Badge de nível
│   ├── ShareButton/   # Botão de compartilhamento
│   └── StatsCard/     # Cards de estatísticas
├── data/              # Dados estáticos
├── lib/               # Bibliotecas e utilitários
├── types/             # Tipos TypeScript
└── utils/             # Funções utilitárias
```

## 🛣️ Rotas

### 📱 Páginas

- `/` - Redirecionamento para /dashboard ou /login
- `/login` - Página de login dos usuários
- `/dashboard` - Dashboard dos usuários
- `/admin` - Dashboard dos administradores

### 🔄 API

- `GET /api/webhook` - Recebe eventos de leitura dos usuários de hora em hora
- `GET /api/stats` - Retorna estatísticas de leitura do usuário
- `GET /api/healthcheck` - Verifica status da aplicação
- `GET /api/cleanup` - Limpa registros duplicados
- `GET /api/update-points` - Atualiza pontos dos usuários

## 🔐 Middleware

O projeto utiliza três middlewares principais:

1. **Autenticação**: Protege rotas privadas e gerencia sessões
2. **Webhook**: Valida requisições do Beehiiv e previne duplicatas
3. **Admin**: Controla acesso à área administrativa

## 📊 Modelo de Dados

### Tabela: users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  last_access TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  total_accesses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1
);
```

### Tabela: accesses

```sql
CREATE TABLE accesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id VARCHAR(255) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_channel VARCHAR(255)
);
```

## ⚙️ Funcionalidades

1. **Sistema de Autenticação**

   - Login via email
   - Sessões persistentes
   - Proteção de rotas
   - Área administrativa restrita

2. **Tracking de Leitura**

   - Registro de acessos via webhook
   - Análise de UTMs
   - Prevenção de duplicatas
   - Validação de dados

3. **Gamificação**

   - Sistema de níveis baseado em pontos
   - Conquistas desbloqueáveis
   - Streaks de leitura (excluindo domingos)
   - Calendário de acessos

4. **Compartilhamento**

   - Geração de imagens para stories
   - Integração com Web Share API
   - Fallback para desktop

5. **Área Administrativa**
   - Atualização manual de pontos
   - Monitoramento de engajamento
   - Filtros por período e status
   - Ranking de leitores (em breve)

## 🤔 FAQ

### Stacks

**Quais as tecnologias usadas?**

- Next.js foi escolhido pela facilidade de criar uma aplicação full-stack com React e pela minha familiaridade com o framework
- TypeScript para type safety e melhor DX
- PostgreSQL pela robustez, confiabilidade e recursos avançados de consulta
- TailwindCSS para estilização rápida e consistente
- NextAuth.js para um sistema de autenticação robusto e já no ecossistema escolhido
- html2canvas para geração de imagens compartilháveis de forma prática

**Quais problemas você enfrentou ao desenvolver?** O maior desafio foi implementar a lógica de streaks desconsiderando os domingos e fazendo com que o avanço fosse mantido. Isso também acaba sendo refletido no sistema de níveis e, consequentemente, no sistema de badges, tornando essa regra de negócio a mais vital da aplicação.

Evitar duplicatas nas chamadas do webhook também foi um pequeno problema, mas com uma simples solução: a criação de uma rota de limpeza (/cleanup).

**Qual a organização que escolheu e por quê?** Mirei em uma estrutura baseada em features, de forma que há uma clara separação entre API, componentes e regras de negócio. É relativamente simples modificar esses 3 pilares sem precisar desmanchar todo o projeto de uma vez.

### Dados

**Qual a estrutura do seu banco?** O PostgreSQL foi escolhido por sua robustez, confiabilidade e recursos avançados de consulta. A estrutura relacional com tabelas `users` e `accesses` permite um controle preciso dos dados e facilita consultas complexas usando recursos como CTEs e window functions.

**Como você lida com as inserções e consultas dos leitores?**

1. Webhooks recebem eventos de leitura em tempo real
2. Transações garantem consistência dos dados
3. Índices otimizam consultas frequentes
4. Queries otimizadas com CTEs e window functions
5. Cache de sessão para reduzir queries

**Ele é escalável? Explique.** Sim, o sistema é escalável por vários motivos:

1. PostgreSQL suporta particionamento de tabelas
2. Índices otimizam consultas comuns
3. Stateless API permite múltiplas instâncias
4. Cache reduz carga no banco
5. Webhooks processam eventos assincronamente

### Sugestões de Melhorias

1. Trazer mais dados do usuário para o retorno da API/Webhook de forma que seja possível criar uma área de perfil mais robusta (foto, nome, e-mail etc);
2. Tornar os pontos acumulados trocáveis por brindes (canecas, mousepads etc);
3. Adicionar um identificador ou link de acesso rápido que direcione para alguma matéria do dia que o usuário contabilizou um streak;
4. Sistema de ranking que mostre os usuários mais engajados, com maiores streaks ou com maior nível (e sua posição em relação a eles);
5. Expandir área administrativa com mais métricas e controles.

## 🚀 Como Rodar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/case_streaks
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   ```
4. Execute: `npm run dev`

Ou usando Docker:

```bash
docker-compose up -d
```

Isso irá iniciar:

- Aplicação Next.js na porta 3000
- PostgreSQL na porta 5433
- pgAdmin na porta 5050
