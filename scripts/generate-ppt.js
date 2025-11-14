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
}

(async () => {
  const ppt = new PptxGenJS();
  ppt.layout = 'LAYOUT_16x9';

  // Title
  addTitleSlide(ppt);

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

  // Team & Allocation table
  addTableSlide(ppt, 'Team & Work Allocation', [
    [{ text: 'Name', options: { bold: true } }, { text: 'Primary Modules', options: { bold: true } }, { text: 'Responsibilities', options: { bold: true } }],
    ['Manish Kumar', 'Auth, RBAC, Security, Middleware', 'Auth flows, JWT, route protection, RBAC guards, security utils'],
    ['Akash Kumar', 'Exam Engine, Reports, ML', 'Exam attempts, scoring, ML analysis, report visuals'],
    ['Manoj Kumar', 'Admin CRUD, Email', 'Admin CRUD pages/APIs, email notifications'],
    ['Shiva Jadoun', 'Student Dashboard & UX', 'Student flows, dashboard, responsive UX'],
    ['Amit Saraswat', 'QA, CI, Docs, Seed', 'Test data, CI workflows, docs, .env.example'],
    ['Somdatt Verma', 'UI Polish, A11y, Content', 'Responsive polish, accessibility, assets'],
  ]);

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

  // Roadmap & Demo
  addBulletsSlide(ppt, 'Roadmap & Deployment', [
    'Implement full auth backend and RBAC guards',
    'Complete Admin CRUD and Student data wiring',
    'Integrate ML analysis end-to-end',
    'Add CI, tests, and deployment (Vercel)',
    'Prepare demo walkthrough and documentation',
  ]);

  await ppt.writeFile({ fileName: OUT_PPT });
  console.log(`Generated PPT: ${OUT_PPT}`);
})();
