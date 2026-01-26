# ExamWizards Frontend

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication System](#authentication-system)
3. [User Interface Components](#user-interface-components)
4. [Page Components](#page-components)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Payment System](#payment-system)
8. [Chatbot Integration](#chatbot-integration)
9. [Routing & Navigation](#routing--navigation)
10. [Styling & Theming](#styling--theming)

---

## 🏗️ Architecture Overview

### Project Structure
```
Exam_frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Basic UI components
│   │   ├── modals/         # Modal dialogs
│   │   ├── navigation/     # Navigation components
│   │   └── Chatbot/        # AI chatbot component
│   ├── pages/              # Page components
│   │   ├── auth/           # Authentication pages
│   │   ├── admin/          # Admin dashboard pages
│   │   ├── instructor/     # Instructor pages
│   │   ├── student/        # Student pages
│   │   └── shared/         # Shared pages
│   ├── services/           # API service layer
│   ├── utils/              # Utility functions
│   ├── theme/              # Theme configuration
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **Styling**: Tailwind CSS + MUI
- **Animation**: Framer Motion
- **State Management**: React Context + useState/useEffect
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Form Handling**: React Hook Form
- **Icons**: Material-UI Icons

---

## 🔐 Authentication System

### 1. Authentication Page

#### **Auth Page (`AuthPage.tsx`)**
```typescript
Location: src/pages/auth/AuthPage.tsx
Purpose: Combined login and registration page
Features:
- Toggle between login and registration forms
- Form validation with real-time feedback
- Password strength indicator
- Remember me functionality
- Forgot password link
- Social login placeholders
- Responsive design with animations

Key Components:
- LoginForm - User login functionality
- RegisterForm - New user registration
- ForgotPasswordForm - Password reset request
- FormValidation - Client-side validation
- LoadingStates - Loading indicators during API calls

State Management:
- authMode: 'login' | 'register' | 'forgot-password'
- formData: User input data
- loading: API call status
- errors: Form validation errors
```

### 2. Authentication Context

#### **Authentication Flow:**
```typescript
Location: Integrated throughout the application
Components Involved:
- App.tsx - Main app component with auth context
- apiService.ts - Authentication API calls
- Local Storage - Token persistence

Authentication States:
- isAuthenticated: boolean
- user: User object with role information
- token: JWT token for API calls
- loading: Authentication check in progress

Protected Routes:
- Admin routes require ADMIN role
- Instructor routes require INSTRUCTOR role
- Student routes require STUDENT role
- Automatic redirection based on user role
```

### 3. Role-Based Access Control

#### **User Roles & Permissions:**
```typescript
Roles:
- STUDENT: Access to courses, exams, results
- INSTRUCTOR: Course creation, exam management, student analytics
- ADMIN: User management, platform analytics, system settings

Route Protection:
- Public routes: Landing page, auth pages
- Protected routes: Dashboard, profile, course pages
- Role-specific routes: Admin panel, instructor tools
- Automatic redirection after login based on user role
```

---

## 🎨 User Interface Components

### 1. Basic UI Components

#### **Modern Button (`ModernButton.tsx`)**
```typescript
Location: src/components/ui/ModernButton.tsx
Purpose: Customizable button component with multiple variants
Variants:
- primary: Default blue button
- secondary: Gray outline button
- gradient: Gradient background button
- ghost: Transparent button
- danger: Red button for destructive actions

Features:
- Loading states with spinner
- Icon support (left/right positioning)
- Size variants (small, medium, large)
- Glow effects for special buttons
- Disabled states
- Custom gradient colors
- Full width option
```

#### **Modern Card (`ModernCard.tsx`)**
```typescript
Location: src/components/ui/ModernCard.tsx
Purpose: Flexible card component for content containers
Variants:
- default: Standard white card with shadow
- glass: Glassmorphism effect
- outlined: Border-only card
- elevated: Higher shadow elevation

Features:
- Hover animations
- Custom padding options
- Rounded corners
- Background blur effects
- Responsive design
```

### 2. Modal Components

#### **Payment Modal (`PaymentModal.tsx`)**
```typescript
Location: src/components/modals/PaymentModal.tsx
Purpose: Handles course purchase payments via Razorpay
Features:
- Course information display
- Price breakdown
- Razorpay integration
- Payment status tracking
- Success/failure animations
- Security information display
- Mobile-responsive design

Payment Flow:
1. Display course details and pricing
2. Fetch Razorpay configuration from backend
3. Initialize Razorpay payment gateway
4. Handle payment success/failure
5. Verify payment with backend
6. Show success animation and redirect

States:
- idle: Initial state showing course info
- initiating: Preparing payment
- processing: Payment in progress
- success: Payment completed successfully
- error: Payment failed with error message
```

### 3. Navigation Components

#### **Accessible Navigation (`AccessibleNavigation.tsx`)**
```typescript
Location: src/components/navigation/AccessibleNavigation.tsx
Purpose: Main navigation bar with accessibility features
Features:
- Role-based menu items
- User profile dropdown
- Responsive mobile menu
- Keyboard navigation support
- ARIA labels for screen readers
- Theme toggle (if implemented)
- Logout functionality

Navigation Items by Role:
- Student: Dashboard, Courses, Exams, Results, Profile
- Instructor: Dashboard, My Courses, Create Course, Analytics
- Admin: Dashboard, Users, Courses, Reviews, Analytics
- Public: Home, Courses, Login/Register
```

### 4. Specialized Components

#### **Hero Section (`Hero.tsx`)**
```typescript
Location: src/components/Hero.tsx
Purpose: Landing page hero section
Features:
- Animated text and graphics
- Call-to-action buttons
- Statistics display
- Responsive design
- Parallax effects
- Video background (optional)

Content:
- Platform introduction
- Key benefits
- User statistics
- Sign-up encouragement
- Feature highlights
```

#### **Testimonials (`Testimonials.tsx`)**
```typescript
Location: src/components/Testimonials.tsx
Purpose: Display user reviews and testimonials
Features:
- Carousel/slider for multiple testimonials
- Star ratings display
- User avatars and names
- Responsive grid layout
- Auto-play functionality
- Navigation controls

Data Source:
- Fetches approved reviews from backend
- Displays user ratings and comments
- Shows user profile information
- Includes review dates
```

#### **Screenshots (`Screenshots.tsx`)**
```typescript
Location: src/components/Screenshots.tsx
Purpose: Platform feature showcase with images
Features:
- Image gallery with lightbox
- Feature descriptions
- Responsive image grid
- Lazy loading
- Zoom functionality
- Navigation between images

Content:
- Dashboard screenshots
- Exam interface previews
- Course creation tools
- Mobile app views
- Admin panel features
```

---

## 📱 Page Components

### 1. Landing Page

#### **Landing Page (`LandingPage.tsx`)**
```typescript
Location: src/pages/LandingPage.tsx
Purpose: Main public-facing page for the platform
Sections:
- Hero section with main value proposition
- Features overview
- Statistics display
- Testimonials carousel
- Screenshots gallery
- Call-to-action sections
- Footer with links

Features:
- Smooth scrolling between sections
- Animated counters for statistics
- Responsive design for all devices
- SEO-optimized content
- Fast loading with optimized images
```

### 2. Student Pages

#### **Student Dashboard (`StudentDashboard.tsx`)**
```typescript
Location: src/pages/student/StudentDashboard.tsx
Purpose: Main dashboard for student users
Features:
- Enrolled courses overview
- Upcoming exams display
- Recent results summary
- Progress tracking
- Quick action buttons
- Notifications panel

Data Displayed:
- Course enrollment status
- Exam schedules and deadlines
- Performance analytics
- Achievement badges
- Recent activity feed
- Recommended courses
```

#### **Public Course Catalog (`PublicCourseCatalog.tsx`)**
```typescript
Location: src/pages/student/PublicCourseCatalog.tsx
Purpose: Browse all available public courses
Features:
- Course grid with filtering
- Search functionality
- Category filters
- Price filters (Free/Paid)
- Sorting options (Name, Price, Rating)
- Pagination
- Course preview cards

Course Card Information:
- Course title and description
- Instructor information
- Price (Free/Paid)
- Enrollment count
- Rating and reviews
- Enroll/Purchase buttons
```

#### **Student Course Catalog (`StudentCourseCatalog.tsx`)**
```typescript
Location: src/pages/student/StudentCourseCatalog.tsx
Purpose: View enrolled courses for authenticated students
Features:
- Enrolled courses grid
- Course progress tracking
- Access to course materials
- Exam links for each course
- Completion status
- Certificate download (if implemented)

Course Information:
- Enrollment date
- Progress percentage
- Available exams
- Grades and results
- Course materials access
- Instructor contact
```

#### **Course Details (`CourseDetails.tsx`)**
```typescript
Location: src/pages/student/CourseDetails.tsx
Purpose: Detailed view of a specific course
Features:
- Complete course information
- Instructor profile
- Course curriculum/syllabus
- Enrollment/Purchase button
- Reviews and ratings
- Related courses
- Prerequisites information

Enrollment Flow:
- Check if user is already enrolled
- Display appropriate action button
- Handle free enrollment
- Initiate payment for paid courses
- Show enrollment confirmation
```

#### **Available Exams (`AvailableExams.tsx`)**
```typescript
Location: src/pages/student/AvailableExams.tsx
Purpose: List all exams available to the student
Features:
- Exam list with filtering
- Exam status indicators
- Start exam functionality
- Exam schedules and deadlines
- Attempt history
- Results preview

Exam Information:
- Exam title and description
- Duration and total marks
- Start/end dates
- Attempt status
- Previous scores
- Instructions preview
```

#### **My Results (`MyResults.tsx`)**
```typescript
Location: src/pages/student/MyResults.tsx
Purpose: Display student's exam results and performance
Features:
- Results table with sorting
- Performance analytics
- Grade distribution charts
- Detailed result view
- Download certificates
- Performance trends

Result Information:
- Exam name and date
- Score and percentage
- Grade/rank
- Time taken
- Detailed answers review
- Performance comparison
```

#### **Exam Result (`ExamResult.tsx`)**
```typescript
Location: src/pages/student/ExamResult.tsx
Purpose: Detailed view of a specific exam result
Features:
- Complete score breakdown
- Question-wise analysis
- Correct/incorrect answers
- Explanations for answers
- Performance metrics
- Leaderboard position

Result Details:
- Total score and percentage
- Time taken vs. allocated time
- Question-wise marks
- Correct answer explanations
- Areas for improvement
- Comparison with class average
```

### 3. Instructor Pages

#### **Create Course (`CreateCourse.tsx`)**
```typescript
Location: src/pages/instructor/CreateCourse.tsx
Purpose: Course creation form for instructors
Features:
- Multi-step course creation wizard
- Course information form
- Pricing configuration
- Visibility settings (Public/Private)
- Student email list for private courses
- Course image upload
- Preview functionality

Form Sections:
- Basic Information (Name, Description)
- Pricing (Free/Paid with amount)
- Visibility (Public/Private)
- Allowed Students (for private courses)
- Course Materials Upload
- Review and Submit
```

#### **Instructor Course Details (`InstructorCourseDetails.tsx`)**
```typescript
Location: src/pages/instructor/InstructorCourseDetails.tsx
Purpose: Detailed course management for instructors
Features:
- Course information editing
- Student enrollment management
- Exam creation and management
- Analytics and statistics
- Student performance tracking
- Course settings

Management Options:
- Edit course details
- Add/remove students
- Create new exams
- View enrollment statistics
- Download student reports
- Course visibility settings
```

#### **Exam List (`ExamList.tsx`)**
```typescript
Location: src/pages/instructor/ExamList.tsx
Purpose: Manage all exams created by the instructor
Features:
- Exam list with status indicators
- Create new exam button
- Edit/delete exam options
- View exam results
- Student performance analytics
- Exam scheduling

Exam Management:
- Exam creation wizard
- Question management
- Result analysis
- Student attempt tracking
- Exam settings configuration
- Bulk operations
```

### 4. Admin Pages

#### **Admin Dashboard (`AdminDashboard.tsx`)**
```typescript
Location: src/pages/admin/AdminDashboard.tsx
Purpose: Comprehensive admin control panel
Features:
- Platform statistics overview
- User management quick access
- Course management overview
- System health monitoring
- Recent activity feed
- Quick action buttons

Dashboard Widgets:
- Total users by role
- Course statistics
- Exam completion rates
- Revenue analytics
- System performance metrics
- Recent registrations
```

#### **User Management (`UserManagement.tsx`)**
```typescript
Location: src/pages/admin/UserManagement.tsx
Purpose: Manage all platform users
Features:
- User list with search and filtering
- User role management
- Account activation/deactivation
- User statistics
- Bulk operations
- Export user data

User Management Options:
- View user profiles
- Change user roles
- Delete user accounts
- Send notifications
- View user activity
- Generate user reports
```

#### **Admin Reviews (`AdminReviews.tsx`)**
```typescript
Location: src/pages/admin/AdminReviews.tsx
Purpose: Moderate user reviews and testimonials
Features:
- Pending reviews list
- Review approval/rejection
- Review content moderation
- Review statistics
- Bulk review operations
- Review analytics

Review Moderation:
- View review content
- Approve/reject reviews
- Edit review content
- Ban inappropriate reviews
- Review analytics dashboard
- User review history
```

### 5. Shared Pages

#### **Profile (`Profile.tsx`)**
```typescript
Location: src/pages/shared/Profile.tsx
Purpose: User profile management for all roles
Features:
- Personal information editing
- Password change functionality
- Profile picture upload
- Account settings
- Notification preferences
- Account deletion option

Profile Sections:
- Basic Information (Name, Email, Phone)
- Security Settings (Password, 2FA)
- Preferences (Notifications, Language)
- Account Actions (Delete, Export Data)
- Activity History
- Connected Accounts
```

#### **Reviews (`Reviews.tsx`)**
```typescript
Location: src/pages/shared/Reviews.tsx
Purpose: Public reviews and testimonials page
Features:
- All approved reviews display
- Rating statistics
- Review filtering and sorting
- Submit new review (authenticated users)
- Review pagination
- Average rating display

Review Features:
- Star rating display
- Review content
- User information
- Review date
- Helpful/unhelpful voting
- Report inappropriate content
```

---

## 🔄 State Management

### 1. React Context Usage

#### **Authentication Context:**
```typescript
Context: AuthContext
Purpose: Manage user authentication state
State:
- user: Current user information
- isAuthenticated: Authentication status
- loading: Authentication check in progress
- login: Login function
- logout: Logout function
- updateUser: Update user information
```

#### **Theme Context (if implemented):**
```typescript
Context: ThemeContext
Purpose: Manage application theme
State:
- theme: 'light' | 'dark'
- toggleTheme: Switch between themes
- colors: Theme color palette
```

### 2. Component State Management

#### **Local State Patterns:**
```typescript
Common Patterns:
- useState for component-specific data
- useEffect for API calls and side effects
- useReducer for complex state logic
- Custom hooks for reusable state logic
- Form state management with controlled components
```

### 3. Data Fetching Patterns

#### **API Call Patterns:**
```typescript
Common Patterns:
- Loading states during API calls
- Error handling with user feedback
- Data caching for performance
- Optimistic updates for better UX
- Retry mechanisms for failed requests
```

---

## 🌐 API Integration

### 1. API Service Layer

#### **API Service (`apiService.ts`)**
```typescript
Location: src/services/apiService.ts
Purpose: Centralized API communication layer
Features:
- Axios instance with interceptors
- Automatic token attachment
- Error handling and retry logic
- Request/response transformation
- Network error handling

Key Methods:
- Authentication: login, register, forgotPassword
- User Management: getCurrentUser, updateProfile
- Course Management: createCourse, getCourses, enrollInCourse
- Exam Management: getExams, submitExam, getResults
- Payment: getPaymentConfig, initiatePurchase, verifyPayment
- Reviews: submitReview, getPublicReviews
- Admin: getAllUsers, getAdminDashboard
```

### 2. Error Handling

#### **Error Handler (`errorHandler.ts`)**
```typescript
Location: src/utils/errorHandler.ts
Purpose: Centralized error handling and user feedback
Features:
- API error parsing
- User-friendly error messages
- Toast notifications
- Network error detection
- Retry suggestions
- Error logging

Error Types:
- Network errors (connection issues)
- Authentication errors (401, 403)
- Validation errors (400)
- Server errors (500)
- Custom business logic errors
```

### 3. Request Interceptors

#### **Authentication Interceptor:**
```typescript
Purpose: Automatically attach JWT tokens to requests
Features:
- Token validation before attachment
- Automatic token refresh (if implemented)
- Redirect to login on token expiry
- Request queuing during token refresh
```

#### **Response Interceptor:**
```typescript
Purpose: Handle common response scenarios
Features:
- Automatic error handling
- Token expiry detection
- Rate limiting handling
- Response data transformation
```

---

## 💳 Payment System

### 1. Payment Modal Integration

#### **Razorpay Integration:**
```typescript
Location: src/components/modals/PaymentModal.tsx
Features:
- Secure payment configuration fetching
- Razorpay SDK initialization
- Payment order creation
- Payment verification
- Success/failure handling
- Receipt generation

Payment Flow:
1. User clicks "Purchase Course"
2. Modal opens with course details
3. Backend API fetches Razorpay configuration
4. Razorpay payment gateway initializes
5. User completes payment
6. Payment verification with backend
7. Automatic course enrollment
8. Success confirmation and redirect
```

### 2. Payment Security

#### **Security Measures:**
```typescript
Security Features:
- No sensitive keys in frontend code
- Payment configuration fetched from backend API
- Server-side payment verification
- Secure token-based authentication
- HTTPS enforcement for payment pages
- Payment data encryption
```

---

## 🤖 Chatbot Integration

### 1. Chatbot Component

#### **Chatbot (`Chatbot.tsx`)**
```typescript
Location: src/components/Chatbot/Chatbot.tsx
Purpose: AI-powered customer support chatbot
Features:
- Floating chat widget
- Real-time messaging interface
- Typing indicators
- Message history
- Expandable/collapsible interface
- Mobile-responsive design

Chatbot Features:
- ExamWizards-specific knowledge base
- Context-aware responses
- Multi-turn conversations
- Quick action buttons
- Escalation to human support
- Conversation history
```

### 2. Chatbot Integration

#### **Backend Integration:**
```typescript
API Endpoint: http://localhost:5000/api/ask
Purpose: Communicate with Node.js chatbot server
Features:
- Google Gemini AI integration
- ExamWizards-specific training
- Context preservation
- Error handling
- Response formatting
```

---

## 🧭 Routing & Navigation

### 1. React Router Configuration

#### **App Component (`App.tsx`)**
```typescript
Location: src/App.tsx
Purpose: Main application component with routing
Features:
- Route configuration
- Protected route handling
- Role-based route access
- Authentication state management
- Global error boundaries

Route Structure:
- Public routes: /, /login, /register, /courses
- Protected routes: /dashboard, /profile
- Role-specific routes: /admin/*, /instructor/*
- Catch-all route for 404 errors
```

### 2. Route Protection

#### **Protected Route Logic:**
```typescript
Implementation:
- Check authentication status
- Verify user role permissions
- Redirect unauthorized users
- Show loading states during auth checks
- Handle route-specific permissions
```

### 3. Navigation Patterns

#### **Navigation Components:**
```typescript
Components:
- AccessibleNavigation: Main navigation bar
- Breadcrumbs: Page hierarchy navigation
- Sidebar: Dashboard navigation (if implemented)
- Footer: Site-wide footer links
- Mobile menu: Responsive navigation
```

---

## 🎨 Styling & Theming

### 1. Material-UI Theme

#### **Theme Configuration:**
```typescript
Location: src/theme/theme.ts
Purpose: Centralized theme configuration
Features:
- Custom color palette
- Typography settings
- Component style overrides
- Responsive breakpoints
- Dark/light theme support (if implemented)

Color Palette:
- Primary: Blue gradient
- Secondary: Purple/pink gradient
- Success: Green
- Warning: Orange
- Error: Red
- Background: White/gray variants
```

### 2. Tailwind CSS Integration

#### **Utility Classes:**
```typescript
Usage:
- Layout: Flexbox, grid, spacing
- Typography: Font sizes, weights, colors
- Responsive design: Breakpoint-specific styles
- Animations: Transitions, transforms
- Custom utilities: Platform-specific styles
```

### 3. Animation Library

#### **Framer Motion:**
```typescript
Location: Throughout components
Purpose: Smooth animations and transitions
Features:
- Page transitions
- Component entrance/exit animations
- Hover effects
- Loading animations
- Gesture handling
- Scroll-triggered animations

Common Animations:
- Fade in/out
- Slide transitions
- Scale effects
- Stagger animations
- Loading spinners
- Success/error animations
```

---

## 📱 Responsive Design

### 1. Mobile-First Approach

#### **Responsive Patterns:**
```typescript
Breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

Responsive Features:
- Flexible grid layouts
- Scalable typography
- Touch-friendly interfaces
- Mobile navigation patterns
- Optimized images
- Performance considerations
```

### 2. Accessibility Features

#### **Accessibility Implementation:**
```typescript
Features:
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast support
- Focus management
- Semantic HTML structure

Compliance:
- WCAG 2.1 AA standards
- Section 508 compliance
- Keyboard-only navigation
- Screen reader testing
- Color contrast validation
```

---

## 🔧 Development Tools & Configuration

### 1. Build Configuration

#### **Vite Configuration:**
```typescript
Location: vite.config.ts
Features:
- Fast development server
- Hot module replacement
- TypeScript support
- CSS preprocessing
- Asset optimization
- Environment variable handling
```

#### **Package.json Scripts:**
```json
Scripts:
- dev: Start development server
- build: Production build
- preview: Preview production build
- lint: Code linting
- type-check: TypeScript checking
- test: Run tests (if implemented)
```

### 2. Environment Configuration

#### **Environment Variables:**
```typescript
Location: .env files
Variables:
- VITE_API_BASE_URL: Backend API URL
- VITE_NODE_ENV: Environment (development/production)
- Other non-sensitive configuration
```

---

## 🔍 Key Implementation Points

### 1. Performance Optimizations
- Lazy loading for route components
- Image optimization and lazy loading
- API response caching
- Debounced search inputs
- Virtualized lists for large datasets
- Code splitting for smaller bundles

### 2. User Experience Features
- Loading states for all async operations
- Error boundaries for graceful error handling
- Toast notifications for user feedback
- Smooth animations and transitions
- Responsive design for all devices
- Accessibility compliance

### 3. Security Measures
- No sensitive data in frontend code
- Secure API communication
- Input validation and sanitization
- XSS protection
- CSRF protection via tokens
- Secure authentication flow

### 4. Code Organization
- Component-based architecture
- Separation of concerns
- Reusable UI components
- Custom hooks for logic reuse
- TypeScript for type safety
- Consistent naming conventions

---

## 📝 Summary

The ExamWizards frontend is a comprehensive React application that provides:

1. **Complete user interface** for all user roles (Student, Instructor, Admin)
2. **Responsive design** that works on all devices
3. **Secure authentication** with role-based access control
4. **Payment integration** with Razorpay for course purchases
5. **AI chatbot** for customer support
6. **Modern UI/UX** with animations and smooth interactions
7. **Accessibility compliance** for inclusive design
8. **Performance optimization** for fast loading
9. **Type safety** with TypeScript
10. **Maintainable code** with proper architecture

The frontend seamlessly integrates with the backend API to provide a complete learning management system experience for all types of users.