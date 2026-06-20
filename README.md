# Nexus

A real-time workspace chat application with channels, direct messages, task management, file sharing, video calls, and notifications.

## Stack

**Backend:** Express 5 + Prisma (PostgreSQL) + Socket.io + Better Auth (Google OAuth)  
**Frontend:** React 19 + Vite + Redux Toolkit (RTK Query) + Tailwind CSS v4 + Socket.io client

## Project Structure

```
backend/          Express server (port 3000)
  src/
    server.ts     Entry point
    features/     Feature modules: channel/, dm/, friend/, notification/, search/, task/, upload/, user/
    lib/          Shared utilities (auth, prisma, socket, multer, mail, logger)
    middleware/    authenticate, rateLimiter, cors, csrf
    sockets/      Socket event handlers + middleware
    utils/        Response helpers, AppError, validation, file type detection
    services/     Task scheduler
  prisma/         Schema + migrations
  uploads/        File upload destination

frontend/         Vite + React app (port 5173)
  src/
    features/     Feature modules: auth/, workspace/, settings/, presence/, typing/, videoCall/
    shared/       Components, hooks, lib (auth client, socket client), styles, types
```

## Prerequisites

- Node.js >= 20
- pnpm
- PostgreSQL

## Setup

### Backend

```bash
cd backend
pnpm install
cp .env.example .env      # configure database URL, Google OAuth, etc.
pnpm prisma generate
pnpm prisma migrate dev   # apply migrations
pnpm seed                 # optional: seed test data
pnpm dev                  # starts on port 3000
```

### Frontend

```bash
cd frontend
pnpm install
cp .env.example .env      # set VITE_API_BASE_URL (default http://localhost:3000)
pnpm dev                  # starts on port 5173
```

## Commands

| Scope | Command | Description |
|-------|---------|-------------|
| Backend | `pnpm dev` | Dev server with hot reload |
| Backend | `pnpm build` | Bundle to `dist/server.js` |
| Backend | `pnpm start` | Run production build |
| Backend | `pnpm typecheck` | TypeScript type checking |
| Backend | `pnpm lint` | ESLint |
| Backend | `pnpm prisma migrate dev --name <name>` | Create a new migration |
| Frontend | `pnpm dev` | Vite dev server |
| Frontend | `pnpm build` | Type check + Vite build |
| Frontend | `pnpm lint` | ESLint |

## Features

- **Channels** — create, invite members, role-based moderation (owner/moderator/member)
- **Direct Messages** — one-on-one conversations with read receipts
- **Friends** — send, accept, reject friend requests
- **Tasks** — project tasks with auto-generated keys (NEXU-XXX), priorities, labels, assignees, due dates, reminders, recurrence
- **File Uploads** — image/file upload with magic-byte validation, organized by type (avatar, message, post)
- **Video Calls** — WebRTC-based peer-to-peer video calling within channels
- **Notifications** — in-app notifications with per-user preference toggles
- **Global Search** — PostgreSQL full-text search across messages, channels, users, tasks, and files
- **Presence** — real-time online/offline status
- **Typing Indicators** — real-time typing status in channels and DMs
- **Google OAuth** — Better Auth-powered authentication

## Architecture

- Each backend feature follows a **route → controller → service → schema** pattern
- Socket.io rooms: every socket auto-joins `user:<userId>`; channel rooms joined/left via events
- Auth state synced to Redux via `authSlice` from Better Auth session
- RTK Query `baseApi` handles all REST API calls with credentials included

## Planned Features

- **GitHub Integration** — connect GitHub API to link issues to tasks, sync task status bidirectionally with GitHub issues, and auto-assign based on GitHub assignees
- **Email notifications** — send email digests and real-time alerts for mentions, DMs, and task assignments
- **Message threads** — threaded replies in channels
- **Message reactions** — emoji reactions on messages
- **Message editing history** — view edit history of messages
- **Bot/Webhook API** — incoming webhooks for external services and bot users
- **Audio calls** — voice calling in addition to video
- **Screen sharing** — add screen sharing to video calls
- **pwd**
- **End-to-end encryption** — for DMs
 