# bylaw-chat

Chat with the bylaws of The 1399 Park Avenue Condominium. Ask questions in plain English, get concise answers with citations that link directly to the relevant page in the PDF.

Built with Next.js, Convex (auth only), Vercel AI SDK, and Anthropic Claude.

## Architecture

```
apps/web/          → Next.js frontend + API route for chat
packages/backend/  → Convex (Better Auth only)
packages/env/      → Shared env validation
packages/config/   → Shared TS config
```

- **Chat API** — `apps/web/src/app/api/chat/route.ts` streams responses via Vercel AI SDK + Anthropic
- **Auth** — Better Auth via Convex (`packages/backend/convex/auth.ts`)
- **PDF viewer** — `@react-pdf-viewer/core` with page navigation on citation click

## Local Development

```bash
bun install
bun run dev:setup    # configure Convex project
bun run dev          # starts Next.js + Convex dev server
```

Open [http://localhost:3001](http://localhost:3001).

### Environment Variables

**Convex** (set via `bun convex env set`):
- `GOOGLE_CLIENT_ID` — Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` — Google OAuth client secret

**Next.js** (`apps/web/.env.local`):
- `NEXT_PUBLIC_CONVEX_URL` — Convex deployment URL
- `NEXT_PUBLIC_CONVEX_SITE_URL` — Convex site URL
- `ANTHROPIC_API_KEY` — Anthropic API key

## Deploy to Vercel

### 1. Deploy Convex backend

```bash
cd packages/backend && npx convex deploy --cmd 'cd ../../apps/web && npx next build'
```

This deploys Convex functions first, then builds the Next.js app (which needs `NEXT_PUBLIC_CONVEX_URL` at build time).

Set Convex env vars if not already done:

```bash
npx convex env set GOOGLE_CLIENT_ID <your-client-id>
npx convex env set GOOGLE_CLIENT_SECRET <your-client-secret>
```

### 2. Deploy Next.js to Vercel

```bash
npx vercel
```

Vercel project settings:

| Setting | Value |
|---|---|
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && cd packages/backend && npx convex deploy --cmd 'cd ../../apps/web && npx next build'` |
| **Output Directory** | `.next` |
| **Install Command** | `cd ../.. && bun install` |

Environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `https://<your-project>.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://<your-project>.convex.site` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `CONVEX_DEPLOY_KEY` | From Convex dashboard → Settings → Deploy keys |

### 3. Update Google OAuth redirect

Add your Vercel production URL to Google OAuth authorized redirect URIs:

```
https://<your-convex-deployment>.convex.site/api/auth/callback/google
```
