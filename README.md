# 📰 the news - Dashboard de Leitura

Desafio Técnico/Case da empresa Waffle para uma de suas principais marcas: a The News. Trata-se de uma aplicação web para acompanhar o progresso de leitura dos assinantes da newsletter, gamificando a experiência por meio de um sistema de conquistas, níveis e streaks.

## 🚀 Tecnologias

- **Frontend**:
  - Next.js 14 (App Router)
  - React 19
  - TailwindCSS
  - NextAuth.js para autenticação
  - html2canvas para geração de imagens compartilháveis

- **Backend**:
  - Node.js
  - MongoDB com Mongoose
  - API Routes do Next.js
  - Webhook da própria The News para integração com Beehiiv

- **Deploy e Infraestrutura**:
  - Vercel
  - MongoDB Atlas
  - ngrok para desenvolvimento local

## 📁 Estrutura do Projeto

```
app/
├── api/                    # Rotas da API
│   ├── auth/              # Autenticação
│   ├── cleanup/           # Limpeza de dados
│   ├── healthcheck/       # Verificação de saúde
│   ├── stats/            # Estatísticas do usuário
│   ├── update-points/    # Atualização de pontos
│   └── webhook/          # Webhook do The News
├── components/           # Componentes React
│   ├── AccessCalendar/   # Calendário de acessos
│   ├── Achievements/     # Sistema de conquistas
│   ├── Header/          # Cabeçalho
│   ├── LevelBadge/      # Badge de nível
│   ├── ShareButton/     # Botão de compartilhamento
│   └── StatsCard/       # Cards de estatísticas
├── data/                # Dados estáticos
├── lib/                 # Bibliotecas e utilitários
├── models/             # Modelos do Mongoose
└── utils/              # Funções utilitárias
```

## 🛣️ Rotas

### 📱 Páginas

- `/` - Redirecionamento para /dashboard ou /login
- `/login` - Página de login dos usuários
- `/dashboard` - Dashboard dos usuários
- `/admin` - Dashboard dos administradores *em breve*

### 🔄 API

- `GET /api/webhook` - Recebe eventos de leitura dos usuários de hora em hora
- `GET /api/stats` - Retorna estatísticas de leitura do usuário
- `GET /api/healthcheck` - Verifica status da aplicação
- `GET /api/cleanup` - Limpa registros duplicados
- `GET /api/update-points` - Atualiza pontos dos usuários

## 🔐 Middleware

O projeto utiliza dois middlewares principais:

1. **Autenticação**: Protege rotas privadas e gerencia sessões
2. **Webhook**: Valida requisições do Beehiiv e previne duplicatas

## 📊 Modelo de Dados

### Coleção: News

```javascript
{
  email: String,          // Email do leitor
  accesses: [{           // Histórico de acessos
    id: String,          // ID do post
    timestamp: Date,     // Data/hora do acesso
    utmSource: String,   // Origem do acesso
    utmMedium: String,   // Meio do acesso
    utmCampaign: String, // Campanha
    utmChannel: String   // Canal
  }],
  lastAccess: Date,      // Último acesso
  createdAt: Date,       // Data de criação
  totalAccesses: Number, // Total de acessos
  points: Number,        // Pontos acumulados
  level: Number         // Nível atual
}
```

## ⚙️ Funcionalidades

1. **Sistema de Autenticação**
   - Login via email
   - Sessões persistentes
   - Proteção de rotas

2. **Tracking de Leitura**
   - Registro de acessos via webhook
   - Análise de UTMs
   - Prevenção de duplicatas

3. **Gamificação**
   - Sistema de níveis baseado em pontos
   - Conquistas desbloqueáveis
   - Streaks de leitura
   - Calendário de acessos

4. **Compartilhamento**
   - Geração de imagens para stories
   - Integração com Web Share API
   - Fallback para desktop

## 🤔 FAQ

### Stacks

**Quais as tecnologias usadas?**
- Next.js foi escolhido pela facilidade de criar uma aplicação full-stack com React e pela minha familiaridade com o framework
- MongoDB pela flexibilidade do schema e escalabilidade
- TailwindCSS para estilização rápida e consistente
- NextAuth.js para um sistema de autenticação robusto e já no ecossistema escolhido
- html2canvas para geração de imagens compartilháveis de forma prática

**Quais problemas você enfrentou ao desenvolver?**
Acredito que o maior problema tenha sido implementar a lógica de streaks desconsiderando os domingos e fazendo com que o avanço fosse mantido. Isso também acaba sendo refletido no sistema de níveis e, consequentemente, no sistema de badges, tornando essa regra de negócio a mais vital da aplicação.

Evitar duplicatas nas chamadas do webhook também foi um pequeno problema, mas com uma simples solução: a criação de uma rota de limpeza (/cleanup).


**Qual a organização que escolheu e por quê?**
Mirei em uma estrutura baseada em features, de forma que há uma clara separação entre API, componentes e regras de negócio. É relativamente simples modificar esses 3 pilares sem precisar desmanchar todo o projeto de uma vez.

### Dados

**Qual a estrutura do seu banco?**
O MongoDB foi escolhido ao invés de SQL pela flexibilidade do schema para evolução do produto (imagino que mais chaves entrarão nesse modelo, portanto, a flexibilidade foi uma preocupação grande). Além disso, com base em minhas experiências prévias, acredito que o MongoDB tenha uma melhor performance para leitura de documentos, maior facilidade para escalar horizontalmente e um custo de manutenção mais brando.

**Como você lida com as inserções e consultas dos leitores?**
1. Webhooks recebem eventos de leitura em tempo real
2. Middleware valida e previne duplicatas com a rota /cleanup
3. Índices otimizam consultas frequentes
4. Bulk operations para atualizações em massa
5. Cache de sessão para reduzir queries

**Ele é escalável? Explique.** Sim, o sistema é escalável por vários motivos:
1. MongoDB permite sharding para distribuir dados
2. Índices otimizam consultas comuns
3. Stateless API permite múltiplas instâncias
4. Cache reduz carga no banco
5. Webhooks processam eventos assincronamente

### Sugestões de Melhorias
1. Trazer mais dados do usuário para o retorno da API/Webhook de forma que seja possível criar uma área de perfil mais robusta (foto, nome, e-mail etc);
2. Tornar os pontos acumulados trocáveis por brindes (canecas, mousepads etc);
3. Adicionar um identificador ou link de acesso rápido que direcione para alguma matéria do dia que o usuário contabilizou um streak;
4. Sistema de ranking que mostre os usuários mais engajados, com maiores streaks ou com maior nível (e sua posição em relação a eles).

## 🚀 Como Rodar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente:
   ```
   MONGODB_URI=
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=
   ```
4. Execute: `npm run dev`
