# EduLearn - Professional E-Learning Platform

A comprehensive, AI-powered e-learning platform built with Next.js, featuring intelligent exam analysis, role-based access control, and personalized learning recommendations.

## Features

### Core Features
- **Professional Landing Page** - Engaging hero section with feature highlights
- **Role-Based Authentication** - Separate admin and student login/signup
- **Email Integration** - Registration confirmation and password reset emails
- **Student Profile System** - Complete profile before taking exams
- **Interactive Exam Module** - Real-time exam interface with timer and progress tracking
- **ML-Based Analysis** - Intelligent analysis of exam responses
- **Detailed Reports** - Comprehensive performance reports with visualizations
- **Admin Dashboard** - Manage students, exams, and questions

### Security Features
- Protected routes with authentication middleware
- JWT token-based authentication
- Password hashing and validation
- Role-based access control (RBAC)
- Secure API endpoints

### User Experience
- Beautiful, modern UI with blue-cyan gradient theme
- Responsive design for all devices
- Interactive charts and visualizations
- Real-time notifications
- Smooth animations and transitions

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Charts**: Recharts for data visualization
- **Authentication**: JWT tokens
- **Database**: MongoDB (ready for integration)
- **Email**: SendGrid/Mailgun (ready for integration)

## Project Structure

\`\`\`
├── app/
│   ├── page.tsx                 # Landing page
│   ├── auth/                    # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── forgot-password/
│   ├── admin/                   # Admin dashboard
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── exams/
│   │   ├── questions/
│   │   └── settings/
│   ├── student/                 # Student dashboard
│   │   ├── dashboard/
│   │   ├── exams/
│   │   ├── exam/[id]/
│   │   ├── profile/
│   │   └── reports/
│   └── api/                     # API routes
├── components/
│   ├── landing/                 # Landing page components
│   ├── admin/                   # Admin components
│   ├── student/                 # Student components
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── auth.ts                  # Authentication utilities
│   ├── db.ts                    # Database configuration
│   ├── types.ts                 # TypeScript types
│   ├── ml-analysis.ts           # ML analysis functions
│   └── email-service.ts         # Email service
└── middleware.ts                # Route protection middleware
\`\`\`

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd elearning-platform
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Run the development server
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Test Credentials

### Admin Account
- Email: `admin@edulearn.com`
- Password: `admin123`

### Student Account
- Email: `student@edulearn.com`
- Password: `student123`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset

### Reports
- `POST /api/reports/generate` - Generate exam report
- `GET /api/reports/list` - Get student reports

## Database Schema

### Users Collection
\`\`\`typescript
{
  _id: ObjectId,
  firstName: string,
  lastName: string,
  email: string,
  password: string (hashed),
  role: "student" | "admin",
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Exams Collection
\`\`\`typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  duration: number,
  totalQuestions: number,
  categories: string[],
  createdBy: ObjectId,
  createdAt: Date
}
\`\`\`

### Reports Collection
\`\`\`typescript
{
  _id: ObjectId,
  studentId: ObjectId,
  examId: ObjectId,
  score: number,
  categoryScores: Array,
  strengths: string[],
  weaknesses: string[],
  recommendations: string[],
  generatedAt: Date
}
\`\`\`

## ML Analysis Features

The platform includes intelligent analysis of exam responses:

- **Category-wise Performance**: Breakdown of scores by subject
- **Strength Identification**: Automatic detection of strong areas
- **Weakness Analysis**: Identification of areas needing improvement
- **Personalized Recommendations**: AI-generated learning suggestions
- **Performance Prediction**: Student level classification (Beginner/Intermediate/Advanced)
- **Learning Path Generation**: Customized study recommendations

## Email Integration

The platform supports email notifications for:
- User registration confirmation
- Password reset links
- Exam result notifications
- Report generation alerts

To enable email:
1. Set up SendGrid/Mailgun account
2. Add API keys to environment variables
3. Configure email templates

## Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

\`\`\`bash
vercel deploy
\`\`\`

### Environment Variables Required

\`\`\`
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_API_URL=your_api_url
SENDGRID_API_KEY=your_sendgrid_key
\`\`\`

## Future Enhancements

- [ ] Advanced ML model integration for better analysis
- [ ] Video tutorials and learning materials
- [ ] Discussion forums and peer learning
- [ ] Gamification with badges and leaderboards
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Integration with popular learning platforms

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For support, email support@edulearn.com or open an issue on GitHub.

## Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Charts powered by Recharts
- Inspired by modern e-learning platforms

## Team and Work Allocation

This section documents the team members, their academic CPI, assigned responsibilities, and current progress. Assignments are balanced so higher CPI members own complex, core modules, while others focus on integration, testing, and quality to ensure reliable delivery.

### Team Roster

| Roll No. | Sec | Name | CPI |
|---|---|---|---|
| 2315990033 | A 75 | Manish Kumar | 8.53 |
| 2315990006 | A 74 | Akash Kumar | 8.53 |
| 2315990035 | G 75 | Manoj Kumar | 7.48 |
| 2315990062 | H 75 | Shiva Jadoun | 7.39 |
| 2215000217 | S 11 | Amit Saraswat | 6.18 |
| 201500699 | T 01 | Somdatt Verma | 6.05 |

### Work Allocation

| Name | Primary Modules | Key Responsibilities |
|---|---|---|
| Manish Kumar | Authentication, RBAC, Security, Middleware | Implement auth flows and JWT handling, protect routes via `middleware.ts`, enforce RBAC on API routes, harden security utilities in `lib/security.ts` and logging in `lib/logger.ts`. |
| Akash Kumar | Exam Engine, Reports, ML Integration | Build exam attempt flows (`app/student/exam/[id]`), scoring and persistence models, integrate analysis from `lib/ml-analysis.ts`, generate visual reports in `app/student/reports/*`. |
| Manoj Kumar | Admin Dashboard CRUD, Email | Implement admin CRUD for students/exams/questions under `app/admin/*`, wire email notifications via `lib/email-service.ts` and `lib/mail.ts`. |
| Shiva Jadoun | Student Dashboard & UX | Complete student dashboard and profile (`app/student/*`), learning paths, integrate UI components from `components/ui/*`, ensure responsive UX. |
| Amit Saraswat | QA, Test Data, CI | Prepare seed/test data, write basic tests where applicable, set up CI (GitHub Actions) for lint/build, maintain documentation and `.env.example`. |
| Somdatt Verma | UI Polish, Accessibility, Content | Refine styling and responsiveness, a11y checks, image/content population in `public/`, assist with component cleanup and bug bashes. |

### Current Progress Snapshot

| Area | Status | Notes |
|---|---|---|
| Project scaffolding (Next.js, TS, Tailwind, shadcn/ui) | Completed | App routes and UI components are present. |
| Landing page | Completed | `app/page.tsx` and landing components implemented. |
| Auth pages (UI) | Completed | Login/Signup pages exist; backend auth wiring to be finalized. |
| Middleware & RBAC | In Progress | `middleware.ts` present; refine role checks and protected routes. |
| Student dashboard & modules | In Progress | Pages under `app/student/*` scaffolded; needs data wiring. |
| Admin dashboard | In Progress | Admin components exist; CRUD actions to be completed. |
| Reports & charts | In Progress | UI and chart components exist; connect to analysis and models. |
| ML analysis integration | Pending | Functions scaffolded in `lib/ml-analysis.ts`; requires data + flow. |
| Email integration | Pending | `lib/email-service.ts` and related files prepared; add provider keys. |
| Testing/CI | Pending | Set up workflows, add minimal tests and lint checks. |

### Near-Term Tasks by Member

- Manish Kumar: Secure auth endpoints, finalize JWT issuance/verification, RBAC guards.
- Akash Kumar: Exam attempt save/restore, scoring logic, connect reports to ML outputs.
- Manoj Kumar: Admin CRUD APIs and pages (Students/Exams/Questions), email triggers.
- Shiva Jadoun: Hook student pages to APIs, dashboards, and learning path UI states.
- Amit Saraswat: Create `.env.example`, add GitHub Actions workflow, populate seed data.
- Somdatt Verma: Responsive polish, a11y passes, content assets, and bug triage.

Note: You can track issues and PRs per module for clarity. Open issues should reference the owner’s name and module.
