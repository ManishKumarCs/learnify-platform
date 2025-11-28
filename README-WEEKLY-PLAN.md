# e-learnify – Weekly Plan (From Sep 29, 2025)

This document outlines the week-by-week plan, deliverables, and ownership across the team. Start date assumed: Sep 29, 2025.

## Team Ownership (Summary)
- Manish Kumar: Admin Portal (CRUD, Settings, Email/Reminders)
- Akash Kumar: Exam Engine, Reports, ML Integration
- Manoj Kumar: Authentication & Notifications
- Shiva Jadoun: Student Dashboard & UX
- Amit Saraswat: QA, CI, Documentation, Seed Data
- Somdatt Verma: UI Polish, Accessibility, Content

---

## Week 1 (Sep 29 – Oct 5)
- Deliverables
  - Repo initialized; Next.js (App Router) + TypeScript scaffold
  - Tailwind + shadcn/ui setup; code structure
  - Basic landing layout and theme tokens
- Ownership
  - Manish: Repo + Next.js scaffold
  - Akash: Analytics/reports project structure
  - Manoj: Admin folder scaffold; email service placeholders
  - Shiva: Landing components baseline and theme
  - Amit: Initial README; .env example draft
  - Somdatt: UI theming, accessibility and base tokens

## Week 2 (Oct 6 – Oct 12)
- Deliverables
  - Auth pages (login/signup UI)
  - middleware.ts skeleton; shared UI; basic types; models stubs
- Ownership
  - Manish: Auth layout, middleware skeleton, auth types
  - Akash: Charting setup (Recharts) for reports shells
  - Manoj: Admin nav + sections scaffolding
  - Shiva: Student dashboard shell; sidebar UX
  - Amit: API endpoints draft; seed/test data draft
  - Somdatt: Responsive grid, button variants, color ramps

## Week 3 (Oct 13 – Oct 19)
- Deliverables
  - Student dashboard sections; Admin dashboard sections
  - Exam model/types; mocks
- Ownership
  - Manish: Role handling stubs; RBAC plan
  - Akash: Reports layout; score cards, placeholders
  - Manoj: Admin CRUD UIs (forms/list shells)
  - Shiva: Student profile pages; header/footer components
  - Amit: Populate mock data; refine .env example
  - Somdatt: UX polish for landing sections

## Week 4 (Oct 20 – Oct 26)
- Deliverables
  - Exam engine UI (timer, progress); attempt persistence stubs; reports visualization stubs
- Ownership
  - Manish: Timer + route protection on exam subpages
  - Akash: Stats cards + charts with mock data
  - Manoj: Admin “Create Exam” flow UX
  - Shiva: Student “Start Exam” UX and states
  - Amit: Test cases for flows; update README features
  - Somdatt: Visual consistency, spacing, typography

## Week 5 (Oct 27 – Nov 2)
- Deliverables
  - Auth backend (signup/login) with JWT; middleware RBAC; secured routes; email service mock
- Ownership
  - Manoj: Auth API routes, JWT cookie handling, RBAC in middleware
  - Manish: Security review and role gates plan
  - Akash: Data adapters for reports
  - Shiva: Error states and skeleton loaders
  - Amit: DEPLOYMENT draft and env keys list
  - Somdatt: Accessibility passes on auth forms

## Week 6 (Nov 3 – Nov 9)
- Deliverables
  - Signup/login UI refinements; full-screen layout fix; meaningful placeholders
  - Optional GitHub/LeetCode fields; push to GitHub
- Ownership
  - Manish: Signup layout refactor (3-column), overflow fix, password fields arrangement; make optional fields truly optional (frontend + API)
  - Akash: Validate field states and client-side feedbacks
  - Manoj: Backend validations alignment
  - Shiva: Auth layout responsiveness
  - Amit: Document UI changes
  - Somdatt: Cleanup spacing/overflow issues

## Week 7 (Nov 10 – Nov 16)
- Deliverables
  - Documentation deep-dive; Architecture; Deployment guide
  - Scripts to generate PPT/Doc
- Ownership
  - Manish: Architecture overview
  - Akash: Reports/ML analysis section
  - Manoj: Email/notifications flows doc
  - Shiva: UX/Accessibility summary
  - Amit: DEPLOYMENT.md; env variable matrix
  - Somdatt: Presentation/Doc scripts and visual polish

## Week 8 (Nov 17 – Nov 23)
- Deliverables
  - Global branding rename to “e-learnify” in UI, metadata, emails, docs, scripts
- Ownership
  - Manish: App metadata; core UI branding
  - Akash: Reports references and headings
  - Manoj: Email subjects and templates rename
  - Shiva: Landing/header/footer brand text
  - Amit: README/DEPLOYMENT updates
  - Somdatt: Icons/title/consistency check

## Week 9 (Nov 24 – Nov 30)
- Deliverables
  - Final branding sweep; admin reminder email updated; admin defaults (emails, settings)
  - Footer ©; push to GitHub; demo prep
- Ownership
  - Manish: Admin Portal ownership (CRUD, Settings, Email/Reminders) applied across code & docs; reminder email header branding
  - Akash: Final charts/reports wording aligned with brand
  - Manoj: Auth endpoint checks; JWT/RBAC sanity review; assist notifications
  - Shiva: Footer © fix; final landing polish
  - Amit: README support/test emails; DEPLOYMENT sender update
  - Somdatt: End-to-end UI consistency pass

---

## Milestones
- Milestone 1 (W2): Project scaffold and auth UI complete
- Milestone 2 (W4): Exam engine UI and reports shells ready
- Milestone 3 (W5): Auth backend with JWT and RBAC functional
- Milestone 4 (W7): Docs and deployment playbooks drafted
- Milestone 5 (W9): Branding finalized and repo ready for demo

## Risks & Mitigations
- Email delivery provider integration → Keep provider-agnostic, documented env keys; mock until keys available
- Data wiring for ML/Reports → Typed adapters and progressive enhancement with mock data
- RBAC edge cases → Middleware + handler checks; logging for unauthorized access

## Next Steps
- Finalize Admin CRUD API endpoints and wire UI to data
- Enable actual email provider keys and test flows end-to-end
- Connect reports to real attempt data; integrate ML heuristics
