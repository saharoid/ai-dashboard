# AI Dashboard — Project Description

## Goal

Take the existing AI Dashboard prototype and bring it to an MVP: a report
workspace where people write reports and use OpenAI to draft and summarize them.

## What exists today

A single-page React app with no backend. Everything runs in the browser.

**Stack**

| Area | Choice |
|---|---|
| Build | Vite 6, TypeScript 5.7 |
| UI | React 19, Material UI 7, Emotion |
| State | Zustand 5 with `persist` (localStorage) |
| Editor | Jodit (`jodit-react`), output is HTML |
| Drag & drop | `@dnd-kit` core/sortable |
| AI | OpenAI Chat Completions via `axios`, model `gpt-4` |
| Safety | DOMPurify on rendered report HTML |

**Features**

- **Generate draft** — type a prompt, OpenAI writes the report body. Title is
  the first 60 chars of the prompt.
- **Summarize** — one click replaces a report's content with an AI summary.
- **Edit** — dialog with title field and Jodit rich-text editor.
- **Search** — filter reports by title.
- **Reorder** — drag cards by handle; order persists.
- **Roles** — Admin / Viewer toggle. Viewer is read-only. Client-side only,
  for demo.

**Layout**

```
src/
  api/openai.ts                  OpenAI calls (generateDraft, summarizeContent)
  pages/Dashboard.tsx            Main page: role switch, prompt, search, list
  components/ReportCard.tsx      One report: render, edit, summarize, drag handle
  components/ReportEditorDialog.tsx  Create/edit dialog (Jodit)
  components/SortableReportList.tsx  dnd-kit grid
  store/reportStore.ts           Reports, selection, search, order (persisted)
  store/userStore.ts             Current role (persisted)
  types/Report.ts                Report { id, title, content }
```

Scripts: `npm run dev`, `npm run build`, `npm run lint`, `npm run preview`.

## Known issues found in review

1. ~~**API key exposed.**~~ Fixed in step 1: key moved to the Express server
   in `server/`. The old key is still in git history and must be revoked.
2. ~~**No backend.**~~ Fixed in steps 2+3: reports in Supabase Postgres,
   Supabase Auth sign-in, role in `profiles` checked by the server.
3. ~~**No way to create a blank report.**~~ Fixed: "New report" button.
4. ~~**Summarize is destructive.**~~ Fixed in step 4: summary saved in its own
   `summary` column, shown above the content.
5. ~~**Reorder while searching drops reports.**~~ Fixed: reorder moves within
   the full list.
6. ~~**AI output not formatted.**~~ Fixed in step 4: Markdown turned into HTML
   with `marked`; replies stream in.
7. ~~Leftovers~~ Fixed in steps 5+6: package and page renamed, Vite template
   CSS replaced by MUI CssBaseline, model updated, tests and CI added.

## MVP direction (proposed)

- Small backend (API proxy) holding the OpenAI key; client never sees it.
- Real persistence for reports (DB) and real auth with roles.
- Fix the bugs above; keep original content when summarizing.
- Current OpenAI model, streaming responses, clear error states.
- Basic tests and CI (lint, typecheck, build).

These are starting points to confirm, not decisions.
