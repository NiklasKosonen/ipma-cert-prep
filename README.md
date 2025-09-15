# IPMA Level C Certification Prep

A production-ready web application for IPMA Level C project management certification preparation, featuring role-based access control, AI-powered evaluation, and comprehensive practice sessions.

## 🚀 Features

- **Role-Based Access Control**: Separate experiences for Users, Trainers, and Admins
- **AI-Powered Evaluation**: Intelligent scoring based on Key Performance Indicators (KPIs)
- **Multi-Language Support**: English and Finnish with persistent language selection
- **Responsive Design**: Apple-like polish with WCAG 2.2 AA compliance
- **Real-Time Practice**: Timed practice sessions with auto-save functionality
- **Progress Tracking**: Comprehensive history and analytics for learners
- **Admin Console**: Full platform management capabilities

## 🛠 Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: TailwindCSS with custom design system
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ipma-cert-prep
npm install
```

### 2. Environment Setup

```bash
# Copy the environment template
cp env.example 
.env.local

# Edit .env.local with your actual values
```

Required environment variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
ADMIN_EMAIL=admin@example.com
VITE_SITE_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Supabase Setup

1. Create a new Supabase project
2. Go to Authentication > Settings
3. Add these redirect URLs:
   - `http://localhost:3000/auth/update-password`
   - `http://localhost:3000/auth/callback`
4. Copy your project URL and anon key to `.env.local`

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🧪 Testing the Application

### User Flow Testing

1. **Landing Page**: Visit `/` to see the marketing page
2. **Role Selection**: Click "Get Started" → Choose "User" role
3. **Login**: Use any email/password (mock authentication)
4. **Practice Session**:
   - Select a topic from the home page
   - Answer questions with 3-minute timer
   - Submit to see AI evaluation results
   - View score, detected/missing KPIs, and coaching feedback

### Trainer Flow Testing

1. **Trainer Login**: Go to `/auth` → Choose "Trainer" role
2. **Dashboard**: View learner results with filtering options
3. **Filtering**: Test company code, topic, and search filters
4. **Export**: Download results as CSV

### Admin Flow Testing

1. **Admin Login**: Go to `/auth` → Choose "Admin" role
2. **Admin Console**: Navigate through all tabs:
   - Overview: System stats and activity
   - Topics: Manage practice topics
   - KPIs: Manage key performance indicators
   - Questions: Manage practice questions
   - AI Training: Configure evaluation engine
   - Results: View analytics
   - Settings: System configuration
   - Company Codes: Manage organization codes

### Authentication Testing

1. **Role-Based Redirects**:
   - User → `/app/home`
   - Trainer → `/coach/dashboard`
   - Admin → `/admin`

2. **Protected Routes**: Try accessing admin pages as a user (should redirect)

3. **Password Reset**:
   - Go to `/auth/reset`
   - Enter email and submit
   - Check console for reset email (mock)

4. **Language Toggle**: Test FI/EN switching across all pages

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header with user menu
│   └── ProtectedRoute.tsx # Route protection wrapper
├── contexts/           # React contexts
│   └── LanguageContext.tsx # i18n management
├── hooks/              # Custom React hooks
│   ├── useAuth.ts     # Authentication logic
│   └── useLocalStorage.ts # Local storage utility
├── lib/                # Utility libraries
│   ├── supabase.ts    # Supabase client
│   ├── mockData.ts    # Sample data for development
│   └── evaluationEngine.ts # AI evaluation logic
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── user/          # User-specific pages
│   ├── trainer/       # Trainer dashboard
│   ├── admin/         # Admin console
│   └── Landing.tsx    # Public landing page
├── types/              # TypeScript type definitions
│   └── index.ts       # All type definitions
├── App.tsx            # Main app component with routing
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## 🎨 Design System

The application uses a custom design system built on TailwindCSS:

- **Colors**: Primary blue palette with semantic grays
- **Typography**: Inter font family with consistent sizing
- **Components**: Reusable button, input, and card styles
- **Animations**: Subtle transitions and hover effects
- **Accessibility**: WCAG 2.2 AA compliant color contrasts

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🌐 Internationalization

The application supports English and Finnish with:
- Persistent language selection (localStorage)
- Context-based translation system
- RTL-ready architecture
- Easy addition of new languages

## 🔐 Security Features

- Role-based access control (RBAC)
- Protected routes with automatic redirects
- Secure authentication with Supabase
- Input validation and sanitization
- CSRF protection via Supabase

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly interface elements
- Optimized for all device sizes

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms

The app can be deployed to any static hosting service:
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Firebase Hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Note**: This is a development version with mock data. In production, you'll need to:
1. Set up a real Supabase database with proper tables
2. Implement actual user registration and role assignment
3. Connect to OpenAI API for real AI evaluation
4. Add proper error handling and loading states
5. Implement real-time features if needed
