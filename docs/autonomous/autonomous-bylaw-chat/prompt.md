# Ralph Mode: Bylaw Chat

You are executing Ralph Mode via Amp handoffs. Follow these rules strictly.

## Execution Steps (In Order)

1. **Read progress.txt FIRST** — Check "Codebase Patterns" section at top
2. **Read prd.json** — Find current state
3. **Check iteration limit** — If `current_iteration >= max_iterations`, output `<promise>COMPLETE</promise>` and STOP
4. **Check branch** — Ensure on `autonomous/bylaw-chat`, checkout if needed
5. **Pick next story** — First story where `passes: false` (lowest priority number)
6. **Implement ONE story** — Complete all acceptance criteria
7. **Run quality checks** — Typecheck/tests from acceptance criteria
8. **Commit** — `git add -A && git commit -m "feat: [US-XXX] - title"`
9. **Update prd.json** — Set `passes: true`, add notes
10. **Update progress.txt** — Increment counter, append log entry
11. **Check completion**:
    - If ALL stories pass → output `<promise>COMPLETE</promise>` and STOP
    - If `current_iteration >= max_iterations` → output `<promise>COMPLETE</promise>` and STOP
    - Otherwise → handoff to fresh thread

## Handoff Format

When handing off, use this goal:
```
Execute Ralph Mode for bylaw-chat. Read docs/autonomous/autonomous-bylaw-chat/prompt.md for instructions.
```

## Progress Report Format

APPEND to progress.txt (never replace existing content):

```markdown
---

## YYYY-MM-DD | US-XXX | T-<thread-id>
**Changes:** Brief description of what was implemented
**Files:** file1.ts, file2.ts
**Learnings:** Patterns discovered for future iterations
```

## Stop Conditions

Output `<promise>COMPLETE</promise>` when:
- All stories have `passes: true`
- `current_iteration >= max_iterations`
- Unrecoverable error (document in progress.txt first)

## Reference Files

| File | Purpose |
|------|---------|
| packages/backend/convex/auth.ts | Better Auth config — add Google OAuth here |
| packages/backend/convex/http.ts | HTTP router — add streaming chat endpoint |
| packages/backend/convex/schema.ts | Convex schema (currently empty) |
| packages/backend/bylaws/parsed-contents.md | Bylaws markdown for RAG context |
| apps/web/src/app/page.tsx | Main page — replace with split layout |
| apps/web/src/app/layout.tsx | Root layout with header + providers |
| apps/web/src/components/providers.tsx | Convex + Auth + Theme providers |
| apps/web/src/components/header.tsx | Header nav — remove dashboard link |
| apps/web/src/lib/auth-client.ts | Better Auth client |
| apps/web/public/bylaws/By-Laws.pdf | Static PDF served at /bylaws/By-Laws.pdf |

## Key Technical Decisions

### PDF Viewer + Multi-Section Highlighting
Use `@react-pdf-viewer/core` + `@react-pdf-viewer/search` for keyword highlighting.
Must be dynamically imported with `ssr: false` in Next.js.
Configure next.config.ts with `canvas: false` webpack alias.

**Multi-keyword simultaneous highlighting**:
```typescript
// The search plugin accepts an array — ALL keywords highlighted at once
const searchPluginInstance = searchPlugin({
  keyword: highlightKeywords  // string[] from all parsed citations
});
// Jump to a specific highlight when user clicks a citation badge
searchPluginInstance.highlight(citationIndex);
```
This means when Claude's response references 3 different bylaw sections, all 3 quoted passages
are highlighted simultaneously in the PDF. The user sees every piece of evidence at once.

### Bylaws Context Strategy
EMBED THE FULL BYLAWS MARKDOWN (~4500 words, ~6k tokens) as a string constant in the system prompt.
This is trivial for Claude's 200k context window. No RAG/vector search needed for a doc this small.
Import the markdown content as a string constant in the chat action file.

### Chat Backend (Vercel AI SDK + Convex HTTP Action)
**Backend** (`packages/backend/convex/chat.ts`):
- Mark file with `"use node";` for Node.js runtime access
- Use `streamText` from `ai` package + `anthropic` from `@ai-sdk/anthropic`
- Parse incoming request body which contains `messages` array in Vercel AI SDK UIMessage format
- Call `streamText({ model: anthropic('claude-sonnet-4-20250514'), messages, system: bylawsSystemPrompt })`
- Return `result.toDataStreamResponse()` for DefaultChatTransport, OR `result.toTextStreamResponse()` for TextStreamChatTransport
- Register in `http.ts` at `POST /api/chat` with CORS headers (Access-Control-Allow-Origin, etc.)
- Also register `OPTIONS /api/chat` for CORS preflight
- ANTHROPIC_API_KEY from `process.env.ANTHROPIC_API_KEY`

**Frontend** (`apps/web/src/components/chat-panel.tsx`):
- Use `useChat` from `@ai-sdk/react` with `DefaultChatTransport` from `ai`
- Point transport at `convexSiteUrl + '/api/chat'` where convexSiteUrl = NEXT_PUBLIC_CONVEX_URL.replace('.cloud', '.site')
- Use `sendMessage({ text: input })` to send messages
- Render `message.parts` array (part.type === 'text' → part.text)
- Use `status` for loading states: 'submitted' | 'streaming' | 'ready' | 'error'
- Use `stop()` for cancel, `regenerate()` for retry, `error` for error display

**Vercel AI SDK v6 key APIs**:
```typescript
// Frontend
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

const { messages, sendMessage, status, stop, error, regenerate } = useChat({
  transport: new DefaultChatTransport({ api: convexSiteUrl + '/api/chat' }),
});

// Backend (Convex HTTP action)
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = streamText({ model: anthropic('claude-sonnet-4-20250514'), messages, system: prompt });
return result.toDataStreamResponse();
```

### Citation Format
System prompt instructs Claude to wrap citations as: `[[cite: Article X, Section X.X | exact quoted text from bylaws]]`
Frontend parses with regex: `/\[\[cite:\s*([^|]+)\|\s*([^\]]+)\]\]/g`
- Group 1: section reference (e.g., "Article IX, Section 9.3")
- Group 2: quoted text for PDF highlighting

### Google OAuth
Add `socialProviders.google` to Better Auth config in packages/backend/convex/auth.ts.
Env vars: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set via `npx convex env set`.
Redirect URI pattern: `https://<deployment>.convex.site/api/auth/callback/google`.

### No Chat Persistence
Messages managed by useChat hook in component state only. No Convex tables for messages.
The Convex backend is only used for: (1) auth, (2) streaming chat HTTP action.

## Quality Requirements

- ALL commits must pass typecheck
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing patterns in codebase (see Codebase Patterns in progress.txt)
- Install dependencies with `bun add` in the correct workspace (--cwd apps/web or --cwd packages/backend)
