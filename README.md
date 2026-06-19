# TaskFlow — Task Manager

A polished, full-featured task manager built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**. All data is persisted in `localStorage` — no backend or database required, so it deploys to Vercel instantly.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

**[Live Demo →](https://your-demo-link.vercel.app)** <!-- Replace after deploying -->

---

## Screenshots

> _Add screenshots after deploying. Drag images into this section on GitHub._

| Light Mode | Dark Mode |
|---|---|
| ![Light mode screenshot](./public/screenshot-light.png) | ![Dark mode screenshot](./public/screenshot-dark.png) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Storage | `localStorage` (no backend needed) |
| Fonts | [Inter](https://fonts.google.com/specimen/Inter) via `next/font` |
| Deployment | [Vercel](https://vercel.com/) |

---

## Features

- **Add / Edit / Delete tasks** — full CRUD with a clean modal form
- **Mark complete / incomplete** — one-click toggle with visual feedback
- **Priority levels** — Low / Medium / High with color-coded left borders and badges
- **Due dates** — overdue tasks highlighted in red, due-today in amber
- **Categories** — Work, Personal, Health, Finance, Learning, Home, Other
- **Search** — instant full-text search across title, description, and category
- **Filters** — filter by status (All / Active / Done), priority, and category
- **Task counter** — live count and completion percentage progress bar
- **Dark mode** — persisted preference, zero flash on page load
- **Responsive** — mobile-first layout with a floating action button on small screens
- **Empty states** — friendly illustrations for new users and empty filter results
- **Delete confirmation** — two-click delete prevents accidental loss

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- npm (comes with Node.js)

### Run locally

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app hot-reloads as you edit files.

### Build for production

```bash
npm run build   # creates an optimised production build
npm start       # serves the production build locally
```

---

## Deploying to Vercel (Step-by-Step)

This is a first-time-friendly guide — Vercel's free tier covers everything you need.

### Step 1 — Push to GitHub

1. Create a new repository on [github.com/new](https://github.com/new)
   - Name it `task-manager` (or anything you like)
   - Leave it **Public** (required for the free Vercel hobby plan)
   - **Do NOT** initialise with a README (your repo already has one)

2. In your terminal, inside the `task-manager` folder:

```bash
git init
git add .
git commit -m "Initial commit: TaskFlow task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/task-manager.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in with your GitHub account.
2. Click **"Add New… → Project"**.
3. Find your `task-manager` repository and click **"Import"**.
4. On the configuration screen:
   - **Framework Preset** — Vercel auto-detects Next.js. Leave it as is.
   - **Root Directory** — leave blank (`.`).
   - **Environment Variables** — none needed.
5. Click **"Deploy"**.

Vercel builds and deploys in ~1 minute. You'll get a live URL like `https://task-manager-abc123.vercel.app`.

### Step 3 — Update the README

Replace the placeholder live-demo link at the top of this file with your real Vercel URL, then push the change:

```bash
git add README.md
git commit -m "Add live demo link"
git push
```

Vercel automatically redeploys on every push to `main`. 

---

## Project Structure

```
task-manager/
├── app/
│   ├── globals.css        # Tailwind base + custom utilities
│   ├── layout.tsx         # Root layout, fonts, dark-mode script
│   └── page.tsx           # Main page (client component)
├── components/
│   ├── Header.tsx         # App header with stats and dark mode toggle
│   ├── FilterBar.tsx      # Search input + filter controls
│   ├── TaskList.tsx       # List wrapper + empty-state handler
│   ├── TaskCard.tsx       # Individual task card with actions
│   ├── TaskForm.tsx       # Add / edit modal form
│   └── EmptyState.tsx     # Empty state illustrations
├── hooks/
│   └── useTasks.ts        # All task state, CRUD, and filter logic
├── lib/
│   ├── types.ts           # TypeScript interfaces
│   ├── storage.ts         # localStorage read/write helpers
│   └── utils.ts           # Date helpers, constants, priority config
└── public/                # Static assets (add screenshots here)
```

---

## License

MIT — feel free to use this project as a portfolio piece or starting point.
