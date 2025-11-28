# e-learnify Platform – Deep Dive Documentation

This document explains the project in depth so you can present it end‑to‑end: architecture, modules, data model, key flows, environment, and operational runbook.

## 1) Tech Stack & Architecture
- Frontend runtime: Next.js 14 (App Router) + React 18
- UI kit: shadcn/ui + TailwindCSS + lucide-react icons
- Backend: Next.js Route Handlers under `app/api/*` (serverless style)
- Database: MongoDB via Mongoose models
- Auth: Custom email/password; JWT token set as HttpOnly cookie
- Build/Run:
  - Dev: `npm run dev` (http://localhost:3000)
  - Prod: `npm run build` + `npm start`

High-level flow:
- Pages in `app/*` render UI (server/client components).
- Client pages call APIs in `app/api/*` for data mutations/reads.
- APIs connect to Mongo (via `lib/db`), validate, and return JSON.

## 2) Repository Layout (important folders)
- `app/`
  - `auth/` pages & layout (login, signup, etc.)
    - `auth/signup/page.tsx` – Signup form UI, client validation, POST to API
    - `auth/layout.tsx` – Layout wrapper (full-screen for signup)
  - `api/` – Back-end routes (Next.js App Router)
    - `api/auth/` – login, logout, signup, forgot-password
    - Learning modules:
      - `api/aptitude/*`, `api/dsa/*`, `api/cs/*`, `api/reasoning/*`
      - `api/practice/[section]/*`, `api/quiz/*`
    - Analytics & reports:
      - `api/analytics/admin/*`, `api/analytics/student/*`
      - `api/leaderboard/*`, `api/reports/*`
    - User profile: `api/profile/route.ts`
- `models/`
  - `user.ts` – Mongoose User & embedded Profile schema
- `lib/`
  - `db` – Mongo connection helper
  - `auth` – token sign/verify helpers (used by API routes)
- `components/` – Reusable shadcn UI components (e.g., `Input`, `Button`, `Label`)

## 3) Data Model (User)
Mongoose schemas (simplified):
```
User {
  firstName: string (required)
  lastName:  string (required)
  email:     string (required, unique)
  password:  string (hash, required)
  role:      'student' | 'admin' (default: student)
  profile: {
    collegeName?: string
    universityRollNumber?: string  (regex: /^[A-Za-z0-9\-_/]{4,20}$/)
    section?: string
    classRollNumber?: string       (regex: /^\d{1,4}$/)
    branch?: string
    course?: string
    leetcodeId?: string            (optional)
    githubId?: string              (optional)
    privacy?: {
      showEmail?: boolean (default false)
      showSocialIds?: boolean (default false)
    }
  }
  createdAt: Date
  updatedAt: Date
}
```

## 4) Auth Module
### Signup – UI (app/auth/signup/page.tsx)
- Responsive 3-column grid layout.
- Client validations:
  - Required (student): `firstName`, `lastName`, `email`, `password`, `collegeName`, `universityRollNumber`, `section`, `classRollNumber`, `branch`, `course`.
  - Optional: `leetcodeId`, `githubId`.
  - Password match + min length 8.
- Submits JSON to `/api/auth/signup`.

### Signup – API (app/api/auth/signup/route.ts)
- Parses `{ firstName, lastName, email, password, role, profile }`.
- If `role` not provided or `student`, requires the extended profile fields (above).
- Enforces roll number regex; checks email uniqueness.
- Hashes password via `bcryptjs` and creates user.
- Signs token, sets HttpOnly cookie, returns 201.

### Login/Logout/Forgot Password
- Similar pattern in `app/api/auth/*`.
- Login validates credentials, sets token cookie.
- Logout clears cookie.

### Token & Cookies
- JWT signed in `lib/auth`.
- Cookie: HttpOnly, SameSite=Lax, Secure in production.

## 5) User Profile (app/api/profile/route.ts)
- Requires auth via token cookie.
- PUT: accepts partial fields, validates if provided:
  - `universityRollNumber` and `classRollNumber` regex.
  - `githubId`/`leetcodeId`: either HTTP URL or valid handle by regex.
- Uses dotted `$set` to update nested `profile.*` without overwriting others.

## 6) Learning/Assessment Modules (server)
- **Aptitude/DSA/CS/Reasoning**
  - Endpoints typically include `topics`, `getQuestions`, `submitAttempt`.
  - `getQuestions` returns curated items; `submitAttempt` scores/stores attempt.
- **Practice**: `api/practice/[section]/questions` + `.../submit`
- **Quiz**: `api/quiz/getQuestions`, `.../submitAttempt`
- **Leaderboard**: aggregates attempts/scores across students.
- **Analytics**:
  - Student: performance endpoints.
  - Admin: cohort overviews, anomalies.
- **Reports**: create/download reports (uses `docx`/`pptxgenjs` packages present in deps).

## 7) Request/Response Flows (step-by-step)
### Signup
1. Client validates inputs.
2. POST `/api/auth/signup` with `{ firstName, lastName, email, password, role, profile: { ... } }`.
3. Server: validate presence (student), regex, duplicate email.
4. Hash password, create user, set token cookie, 201.
5. Client shows success and navigates to login.

### Login
1. Client sends `{ email, password }`.
2. Server verifies, sets token cookie, 200 with user snapshot.
3. Client persists state (usually via cookie/session).

### Profile Update
1. Auth cookie required.
2. PUT `/api/profile` with only fields to change.
3. Server validates formats for provided fields.
4. Uses `$set` on `profile.*` keys, returns updated snapshot.

### Practice/Quiz Attempt
1. Fetch questions from the module (`getQuestions`).
2. On completion, POST `submitAttempt` with answers.
3. Server scores & records; analytics/leaderboard update reflect this.

## 8) Frontend UI/UX Decisions
- shadcn/ui components for accessible controls.
- Tailwind for responsive layout (3-col grid at `md+`).
- Clear error/success banners with icons.
- Full-screen signup page (auth layout conditionally allows wide container on `/auth/signup`).
- Horizontal overflow safeguards (`min-w-0`, `max-w-full`).

## 9) Configuration & Environment
Create `.env.local` with typical keys (examples):
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=your-very-strong-secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=postmaster@example.com
SMTP_PASS=app-password
NEXT_PUBLIC_APP_NAME=e-learnify
```
Notes:
- JWT_SECRET required for auth token.
- SMTP only needed if forgot-password emails are enabled.

## 10) Running Locally
- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Start: `npm start`

## 11) Testing Scenarios (manual)
- Signup positive path (student): valid fields; optional IDs blank.
- Signup negative: wrong roll number formats; duplicate email.
- Login wrong password → 401.
- Profile PUT with invalid GitHub/LeetCode handle → 400.
- Practice/quiz flow: fetch → answer → submit → verify leaderboard/analytics endpoints return data.

## 12) Security Considerations
- Passwords hashed with `bcryptjs`.
- JWT in HttpOnly cookie to mitigate XSS.
- Input validation server-side (mandatory); client-side validation is for UX.
- Avoid leaking internals in error messages (generic server errors).

## 13) Deployment Notes
- Treat Next.js API routes as serverless; ensure Mongo connection is reused across invocations (`lib/db`).
- Set `NODE_ENV=production` to enforce secure cookies.

## 14) Recent Changes (for audit)
- Signup page: redesigned to full-screen 3-column grid; fixed horizontal overflow; descriptive placeholders; passwords side-by-side row.
- Auth layout: conditional full-width layout for `/auth/signup` only.
- LeetCode/GitHub IDs are optional (frontend + backend validation updated).

## 15) Presenting to Stakeholders
- Start with architecture diagram (pages ↔ API ↔ DB).
- Live demo: signup, login, practice attempt, leaderboard view.
- Show data model and validation guarantees.
- Summarize security (hashing, cookies) and extensibility (new modules under `app/api/<module>`).

---
This deep dive covers how the platform is structured and how each major module interacts. If you need a slide deck export or diagrams (sequence/ERD), say the word and I’ll generate them.
