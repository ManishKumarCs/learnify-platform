// Generate a professional PPT for the project using pptxgenjs
// Reads screenshots from docs/screenshots and outputs docs/learnify-platform-presentation.pptx
const fs = require('fs');
const path = require('path');
const PptxGenJS = require('pptxgenjs');

const OUT_PPT = path.join(__dirname, '..', 'docs', 'learnify-platform-presentation.pptx');
const SHOTS_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

function hasShot(name) {
  return fs.existsSync(path.join(SHOTS_DIR, name));
}

function addTitleSlide(ppt) {
  const slide = ppt.addSlide();
  slide.addText('EduLearn - Professional E-Learning Platform', { x: 0.5, y: 1.0, w: 9, h: 1.0, fontSize: 32, bold: true, color: '203040' });
  slide.addText('AI-powered exams, insights, and personalized learning', { x: 0.5, y: 2.1, w: 9, h: 0.6, fontSize: 18, color: '404860' });
  slide.addText('Team: Manish Kumar, Akash Kumar, Manoj Kumar, Shiva Jadoun, Amit Saraswat, Somdatt Verma', { x: 0.5, y: 3.0, w: 9, h: 0.8, fontSize: 14, color: '505a73' });
}

function addBulletsSlide(ppt, title, bullets) {
  const slide = ppt.addSlide();
  slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 0.7, fontSize: 26, bold: true, color: '203040' });
  slide.addText(bullets.map((b) => `• ${b}`).join('\n'), { x: 0.8, y: 1.4, w: 8.5, h: 4.5, fontSize: 18, color: '111111' });
  return slide;
}

function addImageSlide(ppt, title, imgName) {
  const slide = ppt.addSlide();
  slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 0.7, fontSize: 26, bold: true, color: '203040' });
  const imgPath = path.join(SHOTS_DIR, imgName);
  if (fs.existsSync(imgPath)) {
    slide.addImage({ path: imgPath, x: 0.5, y: 1.2, w: 9 });
  } else {
    slide.addText('(screenshot pending)', { x: 0.5, y: 1.5, w: 9, h: 1, fontSize: 18, italic: true, color: '888888' });
  }
  return slide;
}

function addTableSlide(ppt, title, rows) {
  const slide = ppt.addSlide();
  slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 0.7, fontSize: 26, bold: true, color: '203040' });
  slide.addTable(rows, {
    x: 0.5,
    y: 1.3,
    w: 9,
    fontSize: 14,
    color: '1a1a1a',
    border: { type: 'none' },
    fill: 'F7F9FC',
  });
  return slide;
}

function addFeatureDetailSlide(ppt, title, features, benefits) {
  const slide = ppt.addSlide();
  slide.addText(title, { x: 0.5, y: 0.4, w: 9, h: 0.7, fontSize: 26, bold: true, color: '203040' });
  slide.addText('What it includes', { x: 0.6, y: 1.2, w: 4.3, h: 0.5, fontSize: 18, bold: true, color: '1a2b49' });
  slide.addText(features.map((b) => `• ${b}`).join('\n'), { x: 0.6, y: 1.7, w: 4.3, h: 4.0, fontSize: 16, color: '111111' });
  slide.addText('How it helps users', { x: 5.1, y: 1.2, w: 4.3, h: 0.5, fontSize: 18, bold: true, color: '1a2b49' });
  slide.addText(benefits.map((b) => `• ${b}`).join('\n'), { x: 5.1, y: 1.7, w: 4.3, h: 4.0, fontSize: 16, color: '111111' });
}

(async () => {
  const ppt = new PptxGenJS();
  ppt.layout = 'LAYOUT_16x9';

  // Title
  addTitleSlide(ppt);

  // Agenda
  addBulletsSlide(ppt, 'Agenda', [
    'Problem and Solution Overview',
    'Architecture and Tech Stack',
    'Features and User Benefits',
    'Live Screens and Demo Flow',
    'Team & Work Allocation',
    'Progress, KPIs, Roadmap',
    'Q&A',
  ]);

  // Problem & Solution
  addBulletsSlide(ppt, 'Problem Statement', [
    'Traditional learning lacks personalization and deep analytics',
    'Hard to identify strengths/weaknesses for targeted improvement',
    'Admins require efficient management and oversight tools',
  ]);

  addBulletsSlide(ppt, 'Solution Overview', [
    'Next.js platform with role-based auth and secure APIs',
    'Exam engine with reporting, charts, and ML analysis',
    'Modern, responsive UI for students and admins',
  ]);

  // Architecture & Tech Stack
  addBulletsSlide(ppt, 'Architecture Overview', [
    'Next.js App Router for pages and APIs',
    'JWT-based authentication with middleware protection',
    'MongoDB-ready models and services (planned integration)',
  ]);

  addBulletsSlide(ppt, 'Tech Stack', [
    'Next.js, React, TypeScript, Tailwind CSS, shadcn/ui',
    'Recharts for visualizations',
    'JWT auth, Node services, MongoDB (planned)',
  ]);

  // Feature details with user benefits
  addFeatureDetailSlide(ppt, 'Authentication & RBAC', [
    'Signup/Login with form validation',
    'JWT issuance/verification',
    'Role-based route protection (Admin/Student)',
    'Secure middleware for API and pages',
  ], [
    'Keeps accounts secure and scoped to the right role',
    'Smooth sign-in flow builds trust and speed',
    'Prevents unauthorized access and data leaks',
    'Auditable, maintainable security boundary',
  ]);

  addFeatureDetailSlide(ppt, 'Exam Engine', [
    'Timed exams with progress tracking',
    'Question navigation and state restore',
    'Auto scoring hooks and persistence models',
    'Practice sections (Aptitude/DSA/CS/Reasoning)',
  ], [
    'Realistic exam experience boosts readiness',
    'No loss on refresh or disconnect',
    'Fast feedback for learning loops',
    'Targeted practice by category',
  ]);

  addFeatureDetailSlide(ppt, 'Reports & Analytics', [
    'Charts and breakdowns by category',
    'Attempt history and comparisons',
    'Strength/weakness highlights',
    'Export-ready summary view',
  ], [
    'Visual feedback makes performance obvious',
    'Shows progress over time for motivation',
    'Helps plan next steps efficiently',
    'Easy to share with mentors/admins',
  ]);

  addFeatureDetailSlide(ppt, 'Student Experience', [
    'Personalized dashboard and learning paths',
    'Responsive UI with accessible components',
    'Notifications and toasts for key actions',
    'Content library and practice modules',
  ], [
    'Clear next actions reduce confusion',
    'Works great on mobile and desktop',
    'Keeps users informed without friction',
    'One place for study and practice',
  ]);

  addFeatureDetailSlide(ppt, 'Admin Tools', [
    'CRUD for students, exams, questions',
    'Role management and settings',
    'Bulk operations and email triggers',
    'Dashboards for oversight',
  ], [
    'Saves time managing large cohorts',
    'Reduces human error through workflows',
    'Automates communication at scale',
    'Quickly spots issues and trends',
  ]);

  addFeatureDetailSlide(ppt, 'Email & Notifications', [
    'Registration and password reset emails',
    'Result and report notifications',
    'Provider-agnostic setup (SendGrid/Mailgun)',
  ], [
    'Users stay updated on critical actions',
    'Encourages return and course completion',
    'Easy to switch providers when needed',
  ]);

  addFeatureDetailSlide(ppt, 'ML Personalization (Planned)', [
    'Category-wise performance analytics',
    'Level classification (Beginner/Intermediate/Advanced)',
    'Personalized learning recommendations',
    'Adaptive learning path generation',
  ], [
    'Improves outcomes with tailored insights',
    'Focuses effort where it matters most',
    'Provides clear guidance after every attempt',
    'Saves time by removing guesswork',
  ]);

  // Security & ML
  addBulletsSlide(ppt, 'Security & Authentication', [
    'JWT issuance/verification and secure password hashing',
    'Role-Based Access Control (RBAC) on routes and APIs',
    'Centralized logging and security utilities',
  ]);

  addBulletsSlide(ppt, 'ML Analysis', [
    'Category-wise performance and recommendations',
    'Strength/weakness detection and level classification',
    'Learning path suggestions based on results',
  ]);

  // UI Screens
  addImageSlide(ppt, 'Landing Page', 'landing.png');
  addImageSlide(ppt, 'Auth - Login', 'auth-login.png');
  addImageSlide(ppt, 'Auth - Signup', 'auth-signup.png');
  addImageSlide(ppt, 'Student Dashboard', 'student-dashboard.png');
  addImageSlide(ppt, 'Student Exams', 'student-exams.png');
  addImageSlide(ppt, 'Reports & Charts', 'reports.png');
  addImageSlide(ppt, 'Admin Dashboard', 'admin-dashboard.png');

  // Demo Flow (referencing screenshots)
  addBulletsSlide(ppt, 'Demo Flow', [
    '1) Landing → explore features',
    '2) Auth → login/signup as role',
    '3) Student Dashboard → review modules',
    '4) Exams → attempt and submit',
    '5) Reports → view insights',
    '6) Admin → manage students/exams/questions',
  ]);

  // Team & Allocation table
  const teamSlide = addTableSlide(ppt, 'Team & Work Allocation', [
    [{ text: 'Name', options: { bold: true } }, { text: 'Primary Modules', options: { bold: true } }, { text: 'Responsibilities', options: { bold: true } }],
    ['Manish Kumar', 'Auth, RBAC, Security, Middleware', 'Auth flows, JWT, route protection, RBAC guards, security utils'],
    ['Akash Kumar', 'Exam Engine, Reports, ML', 'Exam attempts, scoring, ML analysis, report visuals'],
    ['Manoj Kumar', 'Admin CRUD, Email', 'Admin CRUD pages/APIs, email notifications'],
    ['Shiva Jadoun', 'Student Dashboard & UX', 'Student flows, dashboard, responsive UX'],
    ['Amit Saraswat', 'QA, CI, Docs, Seed', 'Test data, CI workflows, docs, .env.example'],
    ['Somdatt Verma', 'UI Polish, A11y, Content', 'Responsive polish, accessibility, assets'],
  ]);
  if (teamSlide.addNotes) teamSlide.addNotes('Each member presents their module responsibilities and contributions as per the table.');

  // Member slides with notes
  const memberSlides = [
    {
      title: 'Manish Kumar — Auth & Security',
      bullets: [
        'JWT issuance/verification',
        'RBAC policies and route guards',
        'Middleware protection',
        'Security utilities and logging',
      ],
      notes: 'Explain auth flow, token lifecycle, RBAC rules, and how middleware protects pages and APIs.',
    },
    {
      title: 'Akash Kumar — Exam Engine & Reports',
      bullets: [
        'Exam attempt lifecycle and state restore',
        'Scoring hooks and models',
        'Charts and report generation',
        'ML integration plan',
      ],
      notes: 'Walk through attempt → submit → analyze; highlight data structures and report visuals.',
    },
    {
      title: 'Manoj Kumar — Admin & Email',
      bullets: [
        'CRUD: students, exams, questions',
        'Admin dashboards and settings',
        'Email notifications (registration/results)',
      ],
      notes: 'Show admin flows and when emails are triggered for lifecycle events.',
    },
    {
      title: 'Shiva Jadoun — Student UX',
      bullets: [
        'Dashboard and learning paths',
        'Responsive components and states',
        'Navigation & feedback (toasts/alerts)',
      ],
      notes: 'Emphasize ease of navigation and responsiveness across devices.',
    },
    {
      title: 'Amit Saraswat — QA & CI',
      bullets: [
        'Seed/test data preparation',
        'Lint/build workflows on PRs',
        'Docs and .env.example maintenance',
      ],
      notes: 'Highlight reliability: automated checks, minimal tests, and documentation quality.',
    },
    {
      title: 'Somdatt Verma — UI Polish & A11y',
      bullets: [
        'Responsive polish and theming',
        'Accessibility checks',
        'Content assets management',
      ],
      notes: 'Show before/after polish screens; mention a11y considerations.',
    },
  ];
  for (const m of memberSlides) {
    const s = addBulletsSlide(ppt, m.title, m.bullets);
    if (s.addNotes && m.notes) s.addNotes(m.notes);
  }

  // Progress vs Next Steps
  addTableSlide(ppt, 'Progress vs. Next Steps', [
    [{ text: 'Area', options: { bold: true } }, { text: 'Status', options: { bold: true } }, { text: 'Next Steps', options: { bold: true } }],
    ['Scaffolding & UI', 'Completed', 'Polish and tidy components'],
    ['Landing & Auth UI', 'Completed', 'Finalize backend auth flow'],
    ['Middleware & RBAC', 'In Progress', 'Refine role checks and tokens'],
    ['Student Modules', 'In Progress', 'Wire to APIs and data models'],
    ['Admin Dashboard', 'In Progress', 'Complete CRUD and validations'],
    ['Reports & Charts', 'In Progress', 'Connect to ML and persistence'],
    ['ML Integration', 'Pending', 'Implement data pipeline and outputs'],
    ['Email Integration', 'Pending', 'Configure provider keys, test flows'],
    ['Testing & CI', 'Pending', 'Add workflows, minimal tests, lint'],
  ]);

  // KPIs & Success Metrics
  addTableSlide(ppt, 'KPIs & Success Metrics', [
    [{ text: 'Metric', options: { bold: true } }, { text: 'Target', options: { bold: true } }, { text: 'Why It Matters', options: { bold: true } }],
    ['Monthly Active Users', '500+', 'Adoption and engagement'],
    ['Exam Completion Rate', '≥ 75%', 'Stickiness and flow quality'],
    ['Avg. Score Improvement', '+10%', 'Learning impact'],
    ['Report Views per User', '≥ 3', 'Insight consumption'],
    ['7-day Retention', '≥ 40%', 'Habit formation'],
  ]);

  // Timeline / Roadmap
  addTableSlide(ppt, 'Timeline', [
    [{ text: 'Phase', options: { bold: true } }, { text: 'Scope', options: { bold: true } }, { text: 'Window', options: { bold: true } }],
    ['Phase 1', 'Auth, UI scaffolding, basic exams', 'Week 1–2'],
    ['Phase 2', 'Admin CRUD, student flows, reports UI', 'Week 3–4'],
    ['Phase 3', 'ML integration, email, polish & CI', 'Week 5–6'],
  ]);

  // Risks & Mitigations
  addTableSlide(ppt, 'Risks & Mitigations', [
    [{ text: 'Risk', options: { bold: true } }, { text: 'Impact', options: { bold: true } }, { text: 'Mitigation', options: { bold: true } }],
    ['Data security', 'High', 'RBAC, validation, secure storage'],
    ['Exam integrity', 'Medium', 'Timers, session checks, proctoring roadmap'],
    ['Scale/performance', 'Medium', 'Caching, indexes, monitoring'],
    ['Email delivery', 'Low', 'Provider retries, fallbacks'],
    ['ML data quality', 'Medium', 'Validation & continuous evaluation'],
  ]);

  // Testing & CI
  addBulletsSlide(ppt, 'Testing & CI', [
    'ESLint/type checks on PRs',
    'Build and smoke tests',
    'Planned e2e for key flows',
  ]);

  // Accessibility & Performance
  addBulletsSlide(ppt, 'Accessibility & Performance', [
    'Keyboard navigation and ARIA labels',
    'Color contrast and focus states',
    'Lighthouse performance targets',
  ]);

  // Roadmap & Demo
  addBulletsSlide(ppt, 'Roadmap & Deployment', [
    'Implement full auth backend and RBAC guards',
    'Complete Admin CRUD and Student data wiring',
    'Integrate ML analysis end-to-end',
    'Add CI, tests, and deployment (Vercel)',
    'Prepare demo walkthrough and documentation',
  ]);

  // Summary & Ask
  addBulletsSlide(ppt, 'Summary & Ask', [
    'Delivering a secure, insightful e-learning experience',
    'Clear roadmap and measurable KPIs',
    'Feedback on ML scope and deployment plan appreciated',
  ]);

  try {
    await ppt.writeFile({ fileName: OUT_PPT });
    console.log(`Generated PPT: ${OUT_PPT}`);
  } catch (err) {
    if (err && err.code === 'EBUSY') {
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const alt = OUT_PPT.replace(/\.pptx$/, `-${ts}.pptx`);
      await ppt.writeFile({ fileName: alt });
      console.log(`Output file was locked. Generated alternative PPT: ${alt}`);
    } else {
      throw err;
    }
  }
})();
