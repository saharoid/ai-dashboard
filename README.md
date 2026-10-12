# AI-Enhanced Intelligence Dashboard

This is a React + TypeScript dashboard for managing reports with AI-powered draft generation and summarization. Built with Material UI, Zustand, Jodit rich text editor, and the OpenAI API.

---

🧩 Features
Create & Edit Reports
Rich-text editor with full formatting via Jodit. Create and modify reports using a Material UI dialog.

AI Drafts & Summaries
Generate a report from a prompt, or summarize a report with one click (Admin only). Text streams in as it is written. The summary is saved next to the report, so the original content is kept.

Drag & Drop Reordering
Reorder reports manually with @dnd-kit.

Role-Based Access
Sign in with email and password (Supabase Auth). Admin can create, edit, reorder, and summarize reports.
Viewer has read-only access. Roles are checked on the server.

Search & Filter
Filter reports based on their title.

Persistent State
Reports are stored in Supabase Postgres, shared by all users.

---

## 🚀 Setup Instructions

Setup Instructions

1. Clone the repository

git clone https://github.com/saharoid/ai-dashboard.git
cd ai-dashboard

2. Install dependencies

npm install

3. Set up Supabase

Create a project at https://supabase.com. In the SQL editor, run `supabase/migrations/0001_reports_and_profiles.sql`.

Or run Supabase locally (needs Docker): `npx supabase start`. It applies the migration and prints the URL and keys for `.env`.

4. Add your keys

cp .env.example .env   # then fill in every value

`OPENAI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are read only by the Express server in `server/`. They are never sent to the browser. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (public) go to the browser.

5. Run

npm run dev   # starts Vite (web) and the API server together; Vite forwards /api to it

6. Make yourself admin

Sign up in the app, then run in the Supabase SQL editor:

update public.profiles set role = 'admin' where email = 'you@example.com';

New accounts are viewers by default.

## 🔌 API

All routes except `/api/health` need `Authorization: Bearer <Supabase access token>`.

| Route | Who | What |
|---|---|---|
| `GET /api/me` | any user | current user and role |
| `GET /api/reports` | any user | all reports, in order |
| `POST /api/reports` | admin | create `{ title, content }` |
| `PUT /api/reports/:id` | admin | update `{ title, content }` |
| `DELETE /api/reports/:id` | admin | delete |
| `PUT /api/reports/order` | admin | save order `{ ids }` |
| `POST /api/draft` | admin | stream an AI draft `{ prompt }` (Markdown, plain text) |
| `POST /api/reports/:id/summarize` | admin | stream an AI summary, then save it as `summary` |

## 🤖 AI Integration

The browser calls our API server, which calls OpenAI's Chat Completions API with streaming on and passes the text through as it arrives.

- Model defaults to `gpt-5-mini`. Set `OPENAI_MODEL` to change it.
- `OPENAI_BASE_URL` points at any OpenAI-compatible API (useful for tests).
- Replies are Markdown. They are turned into HTML (with `marked`) and sanitized with DOMPurify when shown.
- If the stream is cut off, the summary is not saved and the old one stays.

## Known Limitations / Assumptions

OpenAI test API works a bit slow.

AI title generation is not implemented — the title must be input manually during creation.

Rich text editor output is HTML and must be sanitized.

Drag-and-drop works only horizontally, not grid-aware (e.g., wraps but doesn't reflow perfectly).

Summarization assumes content is in English and is concise enough for OpenAI to handle in a single request.
