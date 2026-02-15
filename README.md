# Site Psicologa Thais Coletto

Projeto full-stack com arquitetura modular, separado em `frontend` e `backend`, com:

- Home moderna e minimalista baseada na identidade visual do logo.
- Agendamento de pacientes por disponibilidade de calendario.
- Area administrativa com login para:
- Configurar dias/horarios disponiveis.
- Gerenciar agendamentos.
- Publicar conteudos em destaque na home.
- SEO tecnico (meta tags, OG, JSON-LD, `robots.txt`, `sitemap.xml`).

## Stack

- Backend: Node.js, Express, MySQL, JWT, Zod
- Frontend: React + Vite
- Banco: MySQL 8+

## Estrutura

```text
.
├── backend
│   ├── database
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── src
│       ├── config
│       ├── modules
│       │   ├── auth
│       │   ├── availability
│       │   ├── appointments
│       │   └── content
│       ├── routes
│       └── shared
└── frontend
    ├── public
    └── src
        ├── api
        ├── components
        ├── context
        ├── pages
        └── styles
```

## Como rodar

## Opcao A: Deploy unico (producao)

Neste modo, o backend Express serve o frontend buildado:

- Frontend: arquivos estaticos em `frontend/dist`
- Backend/API: rotas em `/api`
- Mesmo dominio para site e API

Configuracao sugerida na Hostinger (app Express):

- Diretorio raiz: `backend`
- Install command: `npm ci`
- Build command: `npm run build`
- Start command: `npm start`
- O `npm run build` agora roda migracao do banco (`npm run migrate`) e depois build do frontend.

Variavel recomendada no frontend:

```env
VITE_API_URL=/api
```

Observacao: o `npm run build` do backend executa build do frontend automaticamente.
No startup, com `AUTO_MIGRATE=true`, o backend tenta criar o banco/tabelas automaticamente.

## Opcao B: Desenvolvimento local (2 processos)

## 1) Banco MySQL

Crie o schema e tabelas:

```sql
SOURCE backend/database/schema.sql;
SOURCE backend/database/seed.sql;
```

Se voce ja tinha banco criado antes desta versao, rode tambem:

```sql
SOURCE backend/database/migrations/20260215_google_whatsapp_integration.sql;
```

Alternativa automatica:

- Defina `AUTO_MIGRATE=true` no backend.
- O servidor cria tabelas/colunas faltantes ao iniciar.
- Se o usuario MySQL nao tiver permissao para `CREATE DATABASE`, o banco precisa existir previamente.
- Em hospedagens Hostinger, use o nome real do schema em `DB_NAME` (ex.: `u123456789_psicologa`).

## 2) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Credenciais iniciais de admin (definidas no `.env`):

- Email: `admin@thaiscoletto.com.br`
- Senha: `admin123`

## 3) Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Aplicacao:

- Site publico: `http://localhost:5173`
- Login admin: `http://localhost:5173/admin/login`
- API: `http://localhost:4000/api`

## Endpoints principais

- `POST /api/auth/login`
- `GET /api/public/availabilities`
- `GET /api/public/slots?date=YYYY-MM-DD`
- `POST /api/public/appointments`
- `GET /api/public/contents`
- `GET /api/admin/availabilities`
- `POST /api/admin/availabilities`
- `PUT /api/admin/availabilities/:id`
- `DELETE /api/admin/availabilities/:id`
- `GET /api/admin/appointments`
- `PATCH /api/admin/appointments/:id/status`
- `GET /api/admin/contents`
- `POST /api/admin/contents`
- `PUT /api/admin/contents/:id`
- `DELETE /api/admin/contents/:id`
- `GET /api/admin/integrations/google/status`
- `GET /api/admin/integrations/google/auth-url`
- `GET /api/admin/integrations/google/callback`
- `DELETE /api/admin/integrations/google`

## Observacoes

- Ajuste contatos, redes sociais e dominio real nos arquivos de frontend (`index.html` e `Footer.jsx`).
- Troque imediatamente as credenciais e `JWT_SECRET` em ambiente de producao.

## Integracao Google e WhatsApp

### Google Calendar + Google Meet

Configure no `.env` do backend:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI` (ex.: `http://localhost:4000/api/admin/integrations/google/callback`)
- `GOOGLE_CALENDAR_ID` (use `primary` por padrao)
- `GOOGLE_TIMEZONE` (ex.: `America/Sao_Paulo`)
- `INTEGRATION_STATE_SECRET`

Fluxo:

1. Acesse `/admin`, aba `Integracoes`.
2. Clique em `Vincular conta Google`.
3. Autorize a conta da psicologa.
4. Novos agendamentos criam evento no Google Calendar e link do Google Meet automaticamente.

### WhatsApp Cloud API

Configure no `.env` do backend:

- `WHATSAPP_ENABLED=true`
- `WHATSAPP_API_VERSION` (ex.: `v23.0`)
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_DEFAULT_COUNTRY_CODE` (ex.: `55`)

Com isso, apos criar o agendamento o sistema envia mensagem com data/horario e link do Meet (quando disponivel).

## Uso da identidade visual

Assets criados em `frontend/public/brand`:

- `logo-full.svg`: versao principal para hero e materiais institucionais.
- `logo-horizontal.svg`: versao recomendada para header e compartilhamento horizontal.
- `logo-mark.svg`: simbolo para favicon e reforco de marca.
- `og-image.svg`: imagem social para Open Graph/Twitter.

Aplicacao atual:

- Header: `logo-horizontal.svg`
- Hero: `logo-full.svg`
- Footer/Favicon: `logo-mark.svg`
- SEO social: `og-image.svg` via `og:image` e `twitter:image`
