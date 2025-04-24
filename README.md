# AI-Enhanced Intelligence Dashboard

This is a React + TypeScript dashboard for managing reports with AI-powered draft generation and summarization. Built with Material UI, Zustand, Jodit rich text editor, and the OpenAI API.

---

🧩 Features
Create & Edit Reports
Rich-text editor with full formatting via Jodit. Create and modify reports using a Material UI dialog.

AI Summarization
Use OpenAI’s API to summarize report content with one click (Admin only).

Drag & Drop Reordering
Reorder reports manually with @dnd-kit.

Role-Based Access
Admin can create, edit, and summarize reports.
Viewer has read-only access.

Search & Filter
Filter reports based on their title.

Persistent State
Reports and user roles are persisted using localStorage.

---

## 🚀 Setup Instructions

Setup Instructions

1. Clone the repository

git clone https://github.com/saharoid/ai-dashboard.git
cd ai-dashboard

2. Install dependencies

npm install

## 🤖 AI Integration

AI features use OpenAI's Chat Completion API:

Endpoint: https://api.openai.com/v1/chat/completions

Model: gpt-4

Uses content from the report as input.

Response is parsed and saved directly into the report.

## 👥 Switching User Roles (for testing)

You can switch roles using the role switcher located in the top section of the Dashboard:

Toggle between Admin and Viewer

The app will re-render and restrict actions accordingly

## Known Limitations / Assumptions

No backend: All data is stored in localStorage. A real-world app would persist to a backend API.

OpenAI test API works a bit slow.

AI title generation is not implemented — the title must be input manually during creation.

Rich text editor output is HTML and must be sanitized.

Drag-and-drop works only horizontally, not grid-aware (e.g., wraps but doesn't reflow perfectly).

Summarization assumes content is in English and is concise enough for OpenAI to handle in a single request.
