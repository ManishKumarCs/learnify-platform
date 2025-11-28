# e-learnify Platform - Architecture Documentation

## System Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Landing    │  │   Auth       │  │   Dashboard  │       │
│  │   Pages      │  │   Pages      │  │   Pages      │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js API Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Auth API   │  │   Exam API   │  │  Report API  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   AI API     │  │  Analytics   │  │   Email API  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Business Logic Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   ML Models  │  │   Auth Logic │  │   Validation │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   Security   │  │   Logging    │  │   Caching    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   MongoDB    │  │   Redis      │  │   Cache      │       │
│  │   Database   │  │   (optional) │  │   Storage    │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  External Services                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │   OpenAI     │  │   SendGrid   │  │   Monitoring │       │
│  │   (AI/LLM)   │  │   (Email)    │  │   (Logging)  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
\`\`\`

## Data Flow

### Exam Taking Flow
1. Student views available exams
2. Clicks "Start Exam"
3. Exam interface loads with questions
4. Student answers questions
5. Responses stored in localStorage
6. On submit, responses sent to API
7. ML analysis performed
8. Report generated and stored
9. Student views report with recommendations

### Learning Path Flow
1. Student completes exam
2. ML analysis identifies weaknesses
3. Learning path generated based on weaknesses
4. Path steps unlocked progressively
5. Student completes learning content
6. Practice sessions recommended
7. Progress tracked and updated
8. Next steps unlocked upon completion

### AI Practice Flow
1. Student views practice sessions
2. Selects difficulty level
3. AI generates questions based on weaknesses
4. Student answers questions
5. Explanations provided
6. Score calculated
7. Progress saved
8. Recommendations generated

## Database Schema

### Users Collection
\`\`\`javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  name: String,
  role: "student" | "admin",
  profile: {
    phone: String,
    department: String,
    bio: String,
    avatar: String
  },
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Exams Collection
\`\`\`javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  duration: Number (minutes),
  deadline: Date,
  passingScore: Number,
  createdBy: ObjectId (admin),
  questions: [ObjectId],
  assignedStudents: [ObjectId],
  status: "active" | "expired",
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Exam Responses Collection
\`\`\`javascript
{
  _id: ObjectId,
  studentId: ObjectId,
  examId: ObjectId,
  answers: [Number],
  score: Number,
  timeSpent: Number,
  completedAt: Date,
  reportId: ObjectId
}
\`\`\`

## API Endpoints

### Authentication
- POST /api/auth/signup
- POST /api/auth/login
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Exams
- GET /api/exams
- POST /api/exams
- PUT /api/exams/[id]
- DELETE /api/exams/[id]
- POST /api/exams/[id]/submit

### Reports
- GET /api/reports
- GET /api/reports/[id]
- POST /api/reports/generate

### Analytics
- GET /api/analytics/student
- GET /api/analytics/admin
- GET /api/analytics/platform

## Security Architecture

### Authentication Flow
1. User submits credentials
2. Password validated against hash
3. JWT token generated
4. Token stored in httpOnly cookie
5. Token verified on each request
6. Middleware checks token validity

### Authorization
- Role-based access control (RBAC)
- Student can only access own data
- Admin can access all student data
- Protected routes with middleware

### Data Protection
- Passwords hashed with bcrypt
- Sensitive data encrypted
- HTTPS enforced
- CORS configured
- Rate limiting enabled

## Performance Considerations

### Caching Strategy
- Client-side: localStorage for user data
- Server-side: Redis for session data
- API response caching
- Database query caching

### Optimization
- Lazy loading of components
- Code splitting
- Image optimization
- Database indexing
- Query optimization

## Scalability

### Horizontal Scaling
- Stateless API design
- Load balancing ready
- Database replication
- Cache distribution

### Vertical Scaling
- Database optimization
- Query optimization
- Memory management
- CPU optimization
