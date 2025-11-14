// Generate a comprehensive Word document with deep explanations, member scripts, and Q&A
// Output: docs/learnify-platform-presentation-guide.docx
const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell } = require('docx');

const OUT_DOC = path.join(__dirname, '..', 'docs', 'learnify-platform-presentation-guide.docx');

function H(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_1 });
}
function H2(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
}
function H3(text) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_3 });
}
function P(text) {
  return new Paragraph({ children: [new TextRun(text)] });
}
function Bullets(items) {
  return items.map((i) => new Paragraph({ text: i, bullet: { level: 0 } }));
}

function sectionIntro() {
  return [
    H('EduLearn – Presentation Guide (Internal)') ,
    P('Purpose: Equip all 6 members with a complete script, technical details, and Q&A to deliver a professional presentation.'),
    P('Audience: Faculty/Examiners. Duration: ~15–20 minutes.'),
  ];
}

function sectionAgenda() {
  return [
    H2('Agenda and Roles'),
    ...Bullets([
      'Manish: Authentication, RBAC, Security, Middleware',
      'Akash: Exam Engine, Reports, ML Integration',
      'Manoj: Admin CRUD, Email',
      'Shiva: Student Dashboard & UX',
      'Amit: QA, CI, Documentation, Seed Data',
      'Somdatt: UI Polish, Accessibility, Content',
    ]),
  ];
}

function sectionArchitecture() {
  return [
    H2('System Architecture (High-Level)'),
    ...Bullets([
      'Frontend: Next.js (App Router), React, TypeScript, Tailwind, shadcn/ui components',
      'State/Forms: React Hook Form + Zod validation; SWR for data fetching (planned API wiring)',
      'Auth: JWT-based with middleware for route protection; role-based access control (RBAC)',
      'Data: MongoDB planned via Mongoose models (lib/db.ts, models/*)',
      'Charts: Recharts for visual analytics',
      'Email: Nodemailer abstraction; provider-ready (SendGrid/Mailgun)',
      'ML: Analysis utilities (lib/ml-analysis.ts) prepared for integration',
    ]),
  ];
}

function sectionFeatureDeepDive() {
  return [
    H2('Feature Deep-Dive and Benefits'),
    H3('Authentication & RBAC (Manish)'),
    ...Bullets([
      'Flows: Signup/Login forms with validation and JWT issuance/verification',
      'Middleware: Protects sensitive routes and APIs; enforces role checks',
      'Security: Password hashing, input validation, centralized logging',
      'Benefits: Prevents unauthorized access; ensures correct role scoping; improves trust',
    ]),
    H3('Exam Engine (Akash)'),
    ...Bullets([
      'UI: Timed exams with navigation; state restore on refresh',
      'Logic: Question data models, scoring hooks, attempt persistence (planned)',
      'Benefits: Realistic exam experience; fast feedback; targeted practice',
    ]),
    H3('Reports & Analytics (Akash)'),
    ...Bullets([
      'Visuals: Category-wise charts; attempt history and comparison',
      'Insights: Strength/weakness highlights; export-ready summaries',
      'Benefits: Clear understanding of progress; guidance for next steps',
    ]),
    H3('Student Experience (Shiva)'),
    ...Bullets([
      'Dashboard: Personalized modules; learning path UI',
      'UX: Responsive, accessible components; toasts/notifications',
      'Benefits: Smooth navigation; clarity on tasks; works across devices',
    ]),
    H3('Admin Tools (Manoj)'),
    ...Bullets([
      'CRUD: Manage students, exams, questions in admin dashboard',
      'Ops: Role management, settings, triggers for emails',
      'Benefits: Efficient operations; lower manual effort; fewer errors',
    ]),
    H3('Email & Notifications (Manoj/Amit)'),
    ...Bullets([
      'Flows: Registration confirmation; password reset; result notifications',
      'Setup: Provider-agnostic via Nodemailer and config',
      'Benefits: Keeps users informed; aids retention and engagement',
    ]),
    H3('ML Personalization (Planned) (Akash)'),
    ...Bullets([
      'Analytics: Category performance; level classification',
      'Guidance: Personalized recommendations and learning paths',
      'Benefits: Tailored learning; efficient progress; measurable improvement',
    ]),
  ];
}

function sectionDemoScript() {
  return [
    H2('Demo Script – Step-by-Step'),
    ...Bullets([
      'Landing: Highlight value props and navigation',
      'Auth: Login as a role and show route-based experience',
      'Student Dashboard: Modules, practice sections, and status',
      'Exams: Start an exam, show timer, navigate between questions, submit',
      'Reports: Open a sample report, explain charts & insights',
      'Admin: Show managing students/exams/questions; show where email triggers fit',
    ]),
  ];
}

function sectionMemberScripts() {
  return [
    H2('Member-by-Member Speaking Scripts'),
    H3('Manish Kumar — Auth, RBAC, Security, Middleware'),
    P('Core message: We secure the platform using JWT and RBAC, ensuring only the right roles access sensitive routes.'),
    ...Bullets([
      'Explain JWT lifecycle: issue on login → attach to requests → verify in middleware',
      'Show how `middleware.ts` protects /admin and /student routes',
      'Describe RBAC checks in API handlers (role gates)',
      'Mention security utils: input validation, logging, error handling',
    ]),
    H3('Akash Kumar — Exam Engine, Reports, ML'),
    P('Core message: The exam engine provides a realistic attempt experience with analytics and future ML enhancements.'),
    ...Bullets([
      'Walk through attempt creation, navigation, and submission',
      'Describe scoring hooks and how we will persist attempts',
      'Explain reports: category breakdowns, history comparison',
      'Outline ML plan: transform attempt data → insights → recommendations',
    ]),
    H3('Manoj Kumar — Admin CRUD, Email'),
    P('Core message: Admins can manage entities at scale and trigger communication when needed.'),
    ...Bullets([
      'Show CRUD flows for students/exams/questions',
      'Demonstrate settings, roles, and validations',
      'Email triggers: registration confirmations, password resets, result notices',
    ]),
    H3('Shiva Jadoun — Student Dashboard & UX'),
    P('Core message: Students get a clear, responsive, and accessible interface that guides their learning.'),
    ...Bullets([
      'Dashboard overview, modules, and learning path UI',
      'Responsive behavior and accessibility considerations',
      'Notifications/Toasts as micro-feedback',
    ]),
    H3('Amit Saraswat — QA, CI, Docs, Seed Data'),
    P('Core message: We keep quality high with automation and documentation.'),
    ...Bullets([
      'Seed data approach and testing plan',
      'CI: Lint/build on PRs, smoke tests; plan for e2e',
      'Documentation: README, .env.example, and presentation guide',
    ]),
    H3('Somdatt Verma — UI Polish, Accessibility, Content'),
    P('Core message: We ensure the application looks professional and works for everyone.'),
    ...Bullets([
      'Polish: spacing, alignment, color, and states',
      'Accessibility: keyboard navigation, ARIA labels, contrast',
      'Content and assets management',
    ]),
  ];
}

function sectionQnA() {
  return [
    H2('Panel Q&A – Anticipated Questions and Suggested Answers'),
    H3('Architecture & Tech'),
    ...Bullets([
      'Q: Why Next.js and not a traditional SPA? A: App Router gives built-in routing/API, SSR/SSG options, and great DX. Suits rapid feature iteration.',
      'Q: How do you secure JWTs? A: HttpOnly cookies/local storage depending on route; verification in middleware and server handlers; short TTL + refresh (planned).',
      'Q: Why MongoDB? A: Flexible schema for evolving exam/question models; great with Node. We’ll add indexes and validations.',
    ]),
    H3('Security & Integrity'),
    ...Bullets([
      'Q: Prevent cheating? A: Timers, navigation restrictions, session checks; roadmap includes proctoring and question pools.',
      'Q: Data privacy? A: Minimal PII stored, encrypted transport, RBAC, and audit logging.',
    ]),
    H3('Performance & Scale'),
    ...Bullets([
      'Q: Scale to many students? A: Add caching/CDN, paginate queries, index Mongo collections, and monitor performance.',
      'Q: Email reliability? A: Provider retries, webhooks for delivery status, fallback SMTP.',
    ]),
    H3('ML & Analytics'),
    ...Bullets([
      'Q: How do ML insights get validated? A: Start with heuristic baselines; compare against ground truth and iterate models; user feedback loop.',
      'Q: Bias and fairness? A: Use explainable features, monitor per-group performance, and adjust thresholds.',
    ]),
    H3('Roadmap & Risks'),
    ...Bullets([
      'Q: Critical next step? A: Finish backend auth and RBAC; then complete Admin CRUD and Student wiring.',
      'Q: Biggest risk? A: Data integrity during exams; mitigate with robust attempt persistence and recovery.',
    ]),
  ];
}

function sectionAppendix() {
  return [
    H2('Appendix: References'),
    ...Bullets([
      'Code locations: app/* (pages), components/*, lib/*, models/*, middleware.ts',
      'Presentation: docs/learnify-platform-presentation.pptx',
      'Screenshots: docs/screenshots/*',
    ]),
  ];
}

(async () => {
  const doc = new Document({
    sections: [
      { children: [ ...sectionIntro(), ...sectionAgenda(), ...sectionArchitecture() ] },
      { children: [ ...sectionFeatureDeepDive(), ...sectionDemoScript() ] },
      { children: [ ...sectionMemberScripts(), ...sectionQnA(), ...sectionAppendix() ] },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUT_DOC, buffer);
  console.log(`Generated DOCX: ${OUT_DOC}`);
})();
