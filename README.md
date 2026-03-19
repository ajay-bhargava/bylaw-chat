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

**Convex** (set via `bun convex env set KEY value`):

| Variable | Description |
|---|---|
| `BETTER_AUTH_SECRET` | Auth encryption key. Generate: `openssl rand -base64 32` |
| `SITE_URL` | App base URL (`http://localhost:3001` for dev, your Vercel URL for prod) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

**Next.js** (`apps/web/.env`):

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `https://<project>.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://<project>.convex.site` |
| `ANTHROPIC_API_KEY` | Anthropic API key (used by the chat API route) |

## Deploy to Vercel

### 1. Set Convex production env vars

Switch to your production deployment and set all required variables:

```bash
bun convex env set BETTER_AUTH_SECRET $(openssl rand -base64 32)
bun convex env set SITE_URL https://your-app.vercel.app
bun convex env set GOOGLE_CLIENT_ID <your-client-id>
bun convex env set GOOGLE_CLIENT_SECRET <your-client-secret>
```

### 2. Update Google OAuth redirect URI

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), add this authorized redirect URI:

```
https://<your-convex-deployment>.convex.site/api/auth/callback/google
```

### 3. Deploy to Vercel

```bash
npx vercel
```

**Vercel project settings:**

| Setting | Value |
|---|---|
| **Root Directory** | `apps/web` |
| **Build Command** | `cd ../.. && cd packages/backend && npx convex deploy --cmd 'cd ../../apps/web && npx next build'` |
| **Output Directory** | `.next` |
| **Install Command** | `cd ../.. && bun install` |

**Vercel environment variables:**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | `https://<project>.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://<project>.convex.site` |
| `ANTHROPIC_API_KEY` | `sk-ant-...` |
| `CONVEX_DEPLOY_KEY` | From [Convex dashboard](https://dashboard.convex.dev) → Settings → Deploy keys |
