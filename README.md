# 📰 the news - Dashboard de Leitura

Desafio Técnico/Case da empresa Waffle para uma de suas principais marcas: a The News. Trata-se de uma aplicação web para acompanhar o progresso de leitura dos assinantes da newsletter, gamificando a experiência por meio de um sistema de conquistas, níveis e streaks.

## 🚀 Features

### 👤 Autenticação

- Login via e-mail
- Autenticação persistente com Next-Auth
- Proteção de rotas baseada em perfil (admin/usuário)
- Testes automatizados para fluxos de autenticação

### 📊 Dashboard do Usuário

- Exibição do nível atual e progresso
- Sistema de pontuação baseado em dias de leitura
- Estatísticas de streak (atual e recorde)
- Calendário de acessos
- Total de acessos e dias únicos
- Compartilhamento de conquistas
- Mensagens motivacionais baseadas no streak

### 👑 Dashboard Administrativo

- Visão geral de usuários ativos e totais
- Média de streak dos usuários
- Gráfico de engajamento (usuários x acessos)
- Ranking completo de leitores com:
  - Pontuação e nível
  - Dias únicos de leitura
  - Streak máximo
  - Total de acessos
  - Último acesso registrado
  - Busca por e-mail
  - Ordenação por todas as colunas
- Estatísticas detalhadas de UTM com:
  - Fontes
  - Meios
  - Campanhas
  - Canais
  - Filtros por newsletter específica
  - Filtros por período
  - Visualização em gráficos e tabelas

### 🎯 Sistema de Gamificação

- Pontuação por dias de leitura
- Sistema de níveis progressivos
- Cálculo de streak considerando dias úteis
- Conquistas e badges

### 📱 Interface

- Design responsivo
- Tema consistente com a marca
- Loading states personalizados
- Animações suaves
- Feedback visual de ações

### ⚙️ Recursos Técnicos

- Cache otimizado
- Proteção contra acessos duplicados
- Timezone configurada para São Paulo
- Sistema de webhooks para registro de acessos
- Testes automatizados com Jest

## 🧪 Testes

O projeto utiliza Jest para testes automatizados, cobrindo:

### Testes de API

- Autenticação (`auth.test.ts`)
  - Fluxos de login
  - Proteção de rotas
  - Redirecionamentos baseados em perfil
- Estatísticas (`stats.test.ts`)
  - Cálculo de streaks
  - Pontuação e níveis
  - Dados de usuário
- Webhook (`webhook.test.ts`)
  - Registro de acessos
  - Prevenção de duplicatas
  - Parâmetros UTM
- Admin (`admin.test.ts`)
  - Estatísticas gerais
  - Ranking de usuários
  - Métricas de engajamento

### Cobertura

- Mínimo de 80% de cobertura em:
  - Branches
  - Funções
  - Linhas
  - Statements

## 🛠️ Tecnologias

- Next.js com App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Docker
- Chart.js
- Next-Auth
- Jest

## 🚀 Como Executar

1. Clone o repositório

```bash
git clone https://github.com/zaqueu-1/case-streaks
```

2. Instale as dependências

```bash
npm install
```

3. Configure as variáveis de ambiente

```bash
cp .env.example .env.local
```

4. Inicie a aplicação

```bash
docker compose up -d
```

5. Execute os testes

```bash
npm test
```

## 📝 Variáveis de Ambiente

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/case_streaks
NEXTAUTH_SECRET=YoJQvKdD+UtJkmK/JUhNbEDBrw30upbT0Utxhnl8LQs=
NEXTAUTH_URL=localhost:3000
```

## 📦 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Gera o build de produção
- `npm run start`: Inicia o servidor de produção
- `npm run lint`: Executa o linter
- `npm run format`: Formata o código
- `npm test`: Executa os testes
- `npm run test:watch`: Executa os testes em modo watch
- `npm run test:coverage`: Gera relatório de cobertura de testes

## 📁 Estrutura do Projeto

```
app/
├── admin/              # Dashboard administrativo
├── api/                # Rotas da API
│   ├── admin/         # API administrativa
│   ├── auth/          # Autenticação
│   ├── healthcheck/   # Verificação de saúde
│   ├── stats/         # Estatísticas do usuário
│   └── webhook/       # Webhook do The News
├── components/         # Componentes React
│   ├── AccessCalendar/# Calendário de acessos
│   ├── Achievements/  # Sistema de conquistas
│   ├── Header/        # Cabeçalho
│   ├── LevelBadge/    # Badge de nível
│   ├── Loader/        # Componente de loading
│   ├── ReadersRanking/# Ranking de leitores
│   ├── ReadersStats/  # Estatísticas gerais
│   ├── ShareButton/   # Botão de compartilhamento
│   ├── StatsCard/     # Cards de estatísticas
│   └── UTMStats/      # Estatísticas de UTM
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

- `GET /api/webhook` - Recebe eventos de leitura dos usuários
- `GET /api/stats` - Retorna estatísticas de leitura do usuário
- `GET /api/admin/stats` - Retorna estatísticas administrativas
- `GET /api/healthcheck` - Verifica status da aplicação

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

### Índices

```sql
CREATE INDEX idx_accesses_user_id ON accesses(user_id);
CREATE INDEX idx_accesses_timestamp ON accesses(timestamp);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_points ON users(points DESC);
```

## 🤔 FAQ

### Stacks

**Quais as tecnologias usadas?**

- Next.js foi escolhido pela facilidade de criar uma aplicação full-stack com React (requisito do desafio) e pela minha familiaridade com o framework
- TypeScript para type safety (requisito do desafio)
- PostgreSQL pela robustez, confiabilidade e recursos avançados de consulta (sendo SQL o requisito do desafio)
- TailwindCSS para estilização rápida e consistente

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
