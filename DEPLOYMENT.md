# EduLearn Platform - Deployment Guide

## Overview
This is a production-ready AI-powered adaptive e-learning platform built with Next.js, featuring ML-based student analysis, personalized learning paths, and comprehensive analytics.

## Architecture

### Frontend
- Next.js 16 with App Router
- React 19 with TypeScript
- Tailwind CSS v4 for styling
- Recharts for data visualization
- shadcn/ui components

### Backend
- Next.js API Routes
- Server Actions for mutations
- Middleware for authentication
- Rate limiting and security

### AI/ML Integration
- Vercel AI SDK for LLM integration
- Custom ML models for student analysis
- Adaptive learning algorithms
- Performance prediction models

### Database
- MongoDB for data persistence
- localStorage for client-side caching
- Session management with JWT

## Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB instance
- Vercel account (for deployment)
- OpenAI API key (for AI features)

## Environment Variables

Create a `.env.local` file with:

\`\`\`
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_jwt_secret_key

# AI/LLM
OPENAI_API_KEY=your_openai_api_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@edulearn.com

# Monitoring
NEXT_PUBLIC_MONITORING_URL=your_monitoring_service_url

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## Installation

\`\`\`bash
# Clone repository
git clone <repository-url>
cd elearning-platform

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
\`\`\`

## Features

### Student Features
- Role-based authentication with email verification
- Profile management and completion
- Exam taking with deadline enforcement
- AI-powered practice sessions based on weaknesses
- Personalized learning paths
- Progress tracking and analytics
- Detailed performance reports
- Adaptive difficulty levels

### Admin Features
- Student management and monitoring
- Exam creation and editing with duration/deadline
- Question upload (MCQ, short answer, essay)
- Student assignment to exams
- Email reminders to students
- Exam status tracking
- Student performance analytics
- Platform-wide analytics dashboard

### AI/ML Features
- Weakness analysis using clustering algorithms
- Personalized content recommendations
- Adaptive learning path generation
- Performance prediction
- Learning pattern identification
- Collaborative filtering for recommendations

## Security Features

- JWT-based authentication
- Password hashing and validation
- Rate limiting on API endpoints
- Input sanitization
- CSRF protection
- Secure session management
- Error handling and logging
- Monitoring and alerting

## Deployment to Vercel

### Step 1: Prepare Repository
\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### Step 2: Connect to Vercel
1. Go to vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables
5. Deploy

### Step 3: Configure Environment Variables in Vercel
- Add all variables from `.env.local`
- Ensure MongoDB URI is accessible from Vercel
- Set production URLs

### Step 4: Database Setup
\`\`\`bash
# Connect to MongoDB
# Create collections:
# - users
# - exams
# - questions
# - exam_responses
# - reports
# - learning_paths
# - practice_sessions
\`\`\`

## Monitoring & Logging

The platform includes comprehensive logging:
- Debug, Info, Warn, Error, Critical levels
- Session tracking
- Error monitoring integration
- Performance metrics

Access logs via:
\`\`\`javascript
import { logger } from '@/lib/logger'
logger.getLogs() // Get all logs
\`\`\`

## Performance Optimization

- Server-side rendering for initial load
- Client-side caching with localStorage
- Image optimization
- Code splitting
- API response caching
- Database query optimization

## Scaling Considerations

### For 10,000+ Students
1. Implement Redis for caching
2. Use database indexing
3. Implement CDN for static assets
4. Use message queues for email
5. Implement horizontal scaling

### Database Optimization
\`\`\`javascript
// Create indexes
db.users.createIndex({ email: 1 })
db.exams.createIndex({ createdBy: 1 })
db.exam_responses.createIndex({ studentId: 1, examId: 1 })
\`\`\`

## Backup & Recovery

### Daily Backups
\`\`\`bash
# MongoDB backup
mongodump --uri "mongodb+srv://..." --out ./backups/$(date +%Y%m%d)

# Restore
mongorestore --uri "mongodb+srv://..." ./backups/YYYYMMDD
\`\`\`

## Testing

\`\`\`bash
# Run tests
npm run test

# Run with coverage
npm run test:coverage

# E2E tests
npm run test:e2e
\`\`\`

## Troubleshooting

### Common Issues

1. **Authentication fails**
   - Check JWT_SECRET is set
   - Verify token expiration
   - Check middleware configuration

2. **AI features not working**
   - Verify OpenAI API key
   - Check rate limits
   - Review error logs

3. **Database connection issues**
   - Verify MongoDB URI
   - Check network access
   - Review connection pooling

## Support & Maintenance

- Monitor error logs regularly
- Update dependencies monthly
- Review security patches
- Optimize database queries
- Monitor API performance

## License

MIT License - See LICENSE file for details
