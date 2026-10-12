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
2. **No backend.** Data lives only in one browser's localStorage. Roles are a
   UI toggle, not auth.
3. **No way to create a blank report.** The editor dialog supports create, but
   nothing in the UI opens it without a selected report.
4. **Summarize is destructive.** It overwrites the original content.
5. **Reorder while searching drops reports.** `reorderReports` saves only the
   filtered list, so hidden reports are lost.
6. **AI output not formatted.** Model returns plain text/markdown, stored as
   HTML content.
7. Leftovers: package name `test-app`, page title "Vite + React + TS", outdated
   model (`gpt-4`), `any` in drag handler, no tests.

## MVP direction (proposed)

- Small backend (API proxy) holding the OpenAI key; client never sees it.
- Real persistence for reports (DB) and real auth with roles.
- Fix the bugs above; keep original content when summarizing.
- Current OpenAI model, streaming responses, clear error states.
- Basic tests and CI (lint, typecheck, build).

These are starting points to confirm, not decisions.
