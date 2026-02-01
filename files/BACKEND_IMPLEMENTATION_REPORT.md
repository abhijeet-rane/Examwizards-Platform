# ExamWizards Backend

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication & Security](#authentication--security)
3. [User Management](#user-management)
4. [Course Management](#course-management)
5. [Exam Management](#exam-management)
6. [Payment System](#payment-system)
7. [Email System](#email-system)
8. [Review System](#review-system)
9. [Statistics & Analytics](#statistics--analytics)
10. [Database Layer](#database-layer)
11. [Configuration & Setup](#configuration--setup)

---

## 🏗️ Architecture Overview

### Project Structure
```
Exam_backend/
├── src/main/java/com/ExamPort/ExamPort/
│   ├── Controller/          # REST API endpoints
│   ├── Service/            # Business logic layer
│   ├── Repository/         # Data access layer
│   ├── Entity/            # Database entities/models
│   ├── Security/          # Authentication & authorization
│   ├── Exception/         # Custom exception handling
│   ├── Config/           # Configuration classes
│   └── Constants/        # Application constants
├── src/main/resources/
│   └── application.properties  # Configuration file
└── pom.xml               # Maven dependencies
```

### Technology Stack
- **Framework**: Spring Boot 3.x
- **Database**: MySQL with JPA/Hibernate
- **Security**: JWT Authentication
- **Payment**: Razorpay Integration
- **Email**: Gmail SMTP
- **Build Tool**: Maven

---

## 🔐 Authentication & Security

### 1. JWT Authentication System

#### **Files Involved:**
- `Security/JwtUtil.java` - JWT token generation and validation
- `Security/JwtAuthenticationFilter.java` - Request filtering
- `Security/SecurityConfig.java` - Security configuration
- `Controller/AuthController.java` - Authentication endpoints
- `Service/AuthService.java` - Authentication business logic

#### **Implementation Details:**

**JWT Utility (`JwtUtil.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Security/JwtUtil.java
Purpose: Handles JWT token creation, validation, and extraction
Key Methods:
- generateToken(UserDetails userDetails) - Creates JWT token
- validateToken(String token, UserDetails userDetails) - Validates token
- extractUsername(String token) - Extracts username from token
- isTokenExpired(String token) - Checks token expiration
```

**Authentication Filter (`JwtAuthenticationFilter.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Security/JwtAuthenticationFilter.java
Purpose: Intercepts HTTP requests to validate JWT tokens
Key Functionality:
- Extracts JWT from Authorization header
- Validates token and sets authentication context
- Allows requests to proceed if token is valid
```

**Security Configuration (`SecurityConfig.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Security/SecurityConfig.java
Purpose: Configures Spring Security settings
Key Configurations:
- CORS settings for frontend integration
- JWT filter chain configuration
- Public endpoints (no authentication required)
- Protected endpoints (authentication required)
```

### 2. Authentication Endpoints

#### **Auth Controller (`AuthController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/AuthController.java
Endpoints:
- POST /api/auth/login - User login
- POST /api/auth/register - User registration
- POST /api/auth/request-password-reset - Password reset request
```

#### **Auth Service (`AuthService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/AuthService.java
Key Methods:
- authenticate(username, password) - Validates user credentials
- registerUser(userData) - Creates new user account
- generatePasswordResetToken() - Creates reset tokens
```

---

## 👥 User Management

### 1. User Entity & Repository

#### **User Entity (`User.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/User.java
Fields:
- id (Long) - Primary key
- username (String) - Unique username
- email (String) - User email
- password (String) - Encrypted password
- fullName (String) - Display name
- role (String) - USER_ROLE (STUDENT, INSTRUCTOR, ADMIN)
- phoneNumber (String) - Contact number
- isEmailVerified (Boolean) - Email verification status
- createdAt (LocalDateTime) - Account creation time
```

#### **User Repository (`UserRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/UserRepository.java
Key Methods:
- findByUsername(String username) - Find user by username
- findByEmail(String email) - Find user by email
- existsByUsername(String username) - Check username availability
- existsByEmail(String email) - Check email availability
```

### 2. User Management Controllers

#### **User Controller (`UserController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/UserController.java
Endpoints:
- GET /api/users/me - Get current user profile
- PUT /api/users/me - Update user profile
- GET /api/users/{id} - Get user by ID (admin only)
```

#### **User Management Controller (`UserManagementController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/UserManagementController.java
Endpoints (Admin Only):
- GET /api/admin/users - Get all users
- GET /api/admin/users/stats - Get user statistics
- DELETE /api/admin/users/{id} - Delete user
- PUT /api/admin/users/{id}/role - Update user role
```

### 3. User Management Service

#### **User Management Service (`UserManagementService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/UserManagementService.java
Key Methods:
- getAllUsers() - Retrieve all users with pagination
- getUserStats() - Get user statistics (total, by role, etc.)
- deleteUser(userId) - Soft/hard delete user
- updateUserRole(userId, newRole) - Change user permissions
```

---

## 📚 Course Management

### 1. Course Entity & Related Entities

#### **Course Entity (`Course.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/Course.java
Fields:
- id (Long) - Primary key
- name (String) - Course title
- description (String) - Course description
- instructor (User) - Course creator
- visibility (CourseVisibility) - PUBLIC/PRIVATE
- pricing (CoursePricing) - FREE/PAID
- price (BigDecimal) - Course price (if paid)
- allowedEmails (String) - Comma-separated emails for private courses
- createdAt (LocalDateTime) - Creation timestamp
- updatedAt (LocalDateTime) - Last update timestamp
```

#### **Course Visibility Enum (`CourseVisibility.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/CourseVisibility.java
Values:
- PUBLIC - Visible to all users
- PRIVATE - Visible only to specified emails
```

#### **Course Pricing Enum (`CoursePricing.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/CoursePricing.java
Values:
- FREE - No payment required
- PAID - Payment required for enrollment
```

### 2. Course Repository

#### **Course Repository (`CourseRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/CourseRepository.java
Key Methods:
- findByInstructor_Id(Long instructorId) - Get instructor's courses
- findByVisibility(CourseVisibility visibility) - Get courses by visibility
- findByVisibilityAndPricing(visibility, pricing) - Filter by both criteria
- findPublicCourses() - Get all public courses
- searchCoursesByName(String name) - Search courses by title
```

### 3. Course Controller

#### **Course Controller (`CourseController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/CourseController.java
Endpoints:
- POST /api/courses/create - Create new course
- GET /api/courses/public - Get public courses
- GET /api/courses/instructor - Get instructor's courses
- GET /api/courses/{id} - Get course details
- PUT /api/courses/{id} - Update course
- DELETE /api/courses/{id} - Delete course
- GET /api/courses/{id}/access - Check course access
- POST /api/courses/{id}/enroll - Enroll in free course
- POST /api/courses/{id}/purchase - Initiate paid course purchase
- POST /api/courses/{id}/unenroll-all - Unenroll all students (instructor only)
```

#### **Course Create Request (`CourseCreateRequest.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/CourseCreateRequest.java
Purpose: DTO for course creation requests
Fields:
- name, description, visibility, pricing, price, allowedEmails
```

---

## 📝 Exam Management

### 1. Exam Entities

#### **Exam Entity (`Exam.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/Exam.java
Fields:
- id (Long) - Primary key
- title (String) - Exam title
- description (String) - Exam description
- course (Course) - Associated course
- instructor (User) - Exam creator
- duration (Integer) - Exam duration in minutes
- totalMarks (Integer) - Maximum possible score
- startDate (LocalDateTime) - Exam start time
- endDate (LocalDateTime) - Exam end time
- instructions (String) - Exam instructions
- isActive (Boolean) - Exam availability status
```

#### **Question Entity (`Question.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/Question.java
Fields:
- id (Long) - Primary key
- exam (Exam) - Associated exam
- questionText (String) - Question content
- questionType (String) - MCQ, DESCRIPTIVE, etc.
- marks (Integer) - Points for this question
- options (List<ExamOption>) - Multiple choice options
- correctAnswer (String) - Correct answer
- explanation (String) - Answer explanation
```

#### **Exam Option Entity (`ExamOption.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/ExamOption.java
Fields:
- id (Long) - Primary key
- question (Question) - Associated question
- optionText (String) - Option content
- isCorrect (Boolean) - Whether this is the correct option
```

#### **Result Entity (`Result.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/Result.java
Fields:
- id (Long) - Primary key
- student (User) - Student who took exam
- exam (Exam) - Exam taken
- score (Integer) - Score achieved
- totalMarks (Integer) - Maximum possible score
- percentage (Double) - Score percentage
- timeTaken (Integer) - Time taken in minutes
- submittedAt (LocalDateTime) - Submission timestamp
- answers (String) - JSON string of student answers
```

### 2. Exam Repositories

#### **Exam Repository (`Exam_repo.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/Exam_repo.java
Key Methods:
- findByCourse_Id(Long courseId) - Get exams for a course
- findByInstructor_Id(Long instructorId) - Get instructor's exams
- findActiveExams() - Get currently active exams
- findByStartDateBetween(start, end) - Get exams in date range
```

#### **Question Repository (`QuestionRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/QuestionRepository.java
Key Methods:
- findByExam_Id(Long examId) - Get questions for an exam
- countByExam_Id(Long examId) - Count questions in exam
- findByExam_IdOrderByIdAsc(Long examId) - Get ordered questions
```

#### **Result Repository (`ResultRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/ResultRepository.java
Key Methods:
- findByStudent_Id(Long studentId) - Get student's results
- findByExam_Id(Long examId) - Get all results for an exam
- findByStudent_IdAndExam_Id(studentId, examId) - Check if student took exam
- findTopScoresByExam(examId) - Get leaderboard for exam
```

### 3. Exam Controllers

#### **API Exam Controller (`ApiExamController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/ApiExamController.java
Endpoints:
- POST /api/exams - Create new exam
- GET /api/exams - Get all exams
- GET /api/exams/{id} - Get exam details
- PUT /api/exams/{id} - Update exam
- DELETE /api/exams/{id} - Delete exam
- GET /api/exams/instructor - Get instructor's exams
- GET /api/exams/course/{courseId} - Get exams for course
- POST /api/exams/{id}/submit - Submit exam answers
```

#### **Student Controller (`StudentController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/StudentController.java
Endpoints:
- GET /api/student/dashboard - Student dashboard data
- GET /api/exams/student/enrolled - Get exams for enrolled courses
- GET /api/exams/allowed/{email} - Get exams allowed for student
```

#### **Question Controller (`QuestionController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/QuestionController.java
Endpoints:
- POST /api/questions - Add question to exam
- GET /api/questions/exam/{examId} - Get questions for exam
- PUT /api/questions/{id} - Update question
- DELETE /api/questions/{id} - Delete question
- POST /api/questions/bulk-import - Import questions from Excel
```

#### **Result Controller (`ResultController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/ResultController.java
Endpoints:
- GET /api/results/my-results - Get student's results
- GET /api/results/exam/{examId} - Get results for specific exam
- GET /api/results/{id} - Get detailed result
- GET /api/results/leaderboard/{examId} - Get exam leaderboard
```

---

## 💳 Payment System

### 1. Payment Service

#### **Payment Service (`PaymentService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/PaymentService.java
Key Methods:
- createPaymentOrder(Course course, User student) - Create Razorpay order
- verifyPaymentSignature(orderId, paymentId, signature) - Verify payment
- processSuccessfulPayment(paymentId, orderId, courseId, studentId) - Complete enrollment
- hasStudentAccessToCourse(studentId, courseId) - Check course access
- getRazorpayKeyId() - Get public key for frontend

Integration Details:
- Uses Razorpay Java SDK
- Creates orders with course and student details
- Handles payment verification using webhook signatures
- Automatically enrolls students after successful payment
- Sends payment receipt emails
```

### 2. Payment Controller

#### **Payment Controller (`PaymentController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/PaymentController.java
Endpoints:
- GET /api/payment/config - Get Razorpay public key
- POST /api/courses/{id}/purchase - Initiate course purchase
- POST /api/courses/payment/verify - Verify payment completion

Security Features:
- Only provides public Razorpay key to frontend
- Validates payment signatures server-side
- Prevents duplicate enrollments
```

#### **Payment Verification Request (`PaymentVerificationRequest.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/PaymentVerificationRequest.java
Purpose: DTO for payment verification requests
Fields:
- orderId, paymentId, signature, courseId
```

---

## 📧 Email System

### 1. Email Service

#### **Email Service (`EmailService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/EmailService.java
Key Methods:
- sendWelcomeEmail(User user) - Welcome email for new users
- sendEnrollmentConfirmation(User student, Course course) - Enrollment confirmation
- sendPaymentReceiptEmail(User student, Course course, paymentId, orderId, amount) - Payment receipt
- sendPasswordResetEmail(User user, String resetToken) - Password reset
- sendExamNotification(User student, Exam exam) - Exam reminders
- sendResultNotification(User student, Result result) - Result notifications

Configuration:
- Uses Gmail SMTP server
- Configured in application.properties
- HTML email templates with styling
- Attachment support for receipts
```

### 2. Email Configuration
```properties
Location: src/main/resources/application.properties
Settings:
- spring.mail.host=smtp.gmail.com
- spring.mail.port=587
- spring.mail.username=${EMAIL_USERNAME}
- spring.mail.password=${EMAIL_PASSWORD}
- SMTP authentication and TLS enabled
```

---

## ⭐ Review System

### 1. Review Entity & Repository

#### **Review Entity (`Review.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/Review.java
Fields:
- id (Long) - Primary key
- user (User) - Review author
- content (String) - Review text
- rating (Integer) - Star rating (1-5)
- status (ReviewStatus) - PENDING, APPROVED, REJECTED
- createdAt (LocalDateTime) - Creation timestamp
- updatedAt (LocalDateTime) - Last update timestamp
```

#### **Review Repository (`ReviewRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/ReviewRepository.java
Key Methods:
- findByUser_Id(Long userId) - Get user's review
- findByStatus(ReviewStatus status) - Get reviews by status
- findApprovedReviews() - Get approved reviews for public display
- findRecentReviews(int limit) - Get latest reviews
- getAverageRating() - Calculate average rating
```

### 2. Review Service & Controller

#### **Review Service (`ReviewService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/ReviewService.java
Key Methods:
- submitReview(userId, content, rating) - Submit new review
- updateReview(userId, content, rating) - Update existing review
- deleteReview(userId) - Delete user's review
- approveReview(reviewId) - Admin approval
- rejectReview(reviewId) - Admin rejection
- getPublicReviews(page, size) - Get approved reviews with pagination
- getReviewStatistics() - Get rating statistics
```

#### **Review Controller (`ReviewController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/ReviewController.java
Endpoints:
- POST /api/reviews/submit - Submit review
- PUT /api/reviews/update - Update review
- DELETE /api/reviews/delete - Delete review
- GET /api/reviews/my-review - Get user's review
- GET /api/reviews/public - Get approved reviews
- GET /api/reviews/recent - Get recent reviews
- GET /api/reviews/statistics - Get review statistics
- GET /api/reviews/pending - Get pending reviews (admin)
- POST /api/reviews/{id}/approve - Approve review (admin)
- POST /api/reviews/{id}/reject - Reject review (admin)
```

---

## 📊 Statistics & Analytics

### 1. Statistics Service

#### **Statistics Service (`StatisticsService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/StatisticsService.java
Key Methods:
- getPublicStatistics() - Get public platform statistics
- getAdminDashboardStats() - Get comprehensive admin statistics
- getUserStatistics() - Get user-related statistics
- getCourseStatistics() - Get course-related statistics
- getExamStatistics() - Get exam-related statistics
- getEnrollmentStatistics() - Get enrollment statistics
- getRevenueStatistics() - Get payment/revenue statistics

Metrics Tracked:
- Total users, courses, exams, enrollments
- Active users, completed exams
- Revenue from paid courses
- User growth over time
- Course popularity metrics
- Exam completion rates
```

### 2. Statistics Controllers

#### **Public Stats Controller (`PublicStatsController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/PublicStatsController.java
Endpoints:
- GET /api/public/stats - Get public platform statistics
Purpose: Provides non-sensitive statistics for landing page
```

#### **Admin Dashboard Controller (`AdminDashboardController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/AdminDashboardController.java
Endpoints:
- GET /api/admin/dashboard - Get comprehensive admin dashboard data
- GET /api/admin/simple-dashboard - Get simplified dashboard data
Purpose: Provides detailed analytics for admin users
```

#### **Dashboard Controller (`DashboardController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/DashboardController.java
Endpoints:
- GET /api/dashboard - Get general dashboard data
- GET /api/instructor/dashboard - Get instructor-specific dashboard
- GET /api/student/dashboard - Get student-specific dashboard
```

---

## 🎓 Enrollment System

### 1. Enrollment Entity & Status

#### **Enrollment Entity (`Enrollment.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/Enrollment.java
Fields:
- id (Long) - Primary key
- student (User) - Enrolled student
- course (Course) - Enrolled course
- status (EnrollmentStatus) - Enrollment status
- enrollmentDate (LocalDateTime) - Enrollment timestamp
- paymentTransactionId (String) - Payment reference (for paid courses)
```

#### **Enrollment Status Enum (`EnrollmentStatus.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/EnrollmentStatus.java
Values:
- ENROLLED - Successfully enrolled
- PAYMENT_PENDING - Waiting for payment completion
- CANCELLED - Enrollment cancelled
- EXPIRED - Enrollment expired
```

### 2. Enrollment Repository & Service

#### **Enrollment Repository (`EnrollmentRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/EnrollmentRepository.java
Key Methods:
- findByStudent_Id(Long studentId) - Get student's enrollments
- findByCourse_Id(Long courseId) - Get course enrollments
- findByStudent_IdAndCourse_Id(studentId, courseId) - Check specific enrollment
- isStudentEnrolledInCourse(studentId, courseId) - Check enrollment status
- countByCourse_Id(Long courseId) - Count course enrollments
```

#### **Enrollment Service (`EnrollmentService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/EnrollmentService.java
Key Methods:
- enrollStudentInFreeCourse(studentId, courseId) - Free course enrollment
- enrollStudentInPaidCourse(studentId, courseId, paymentId) - Paid course enrollment
- cancelEnrollment(enrollmentId) - Cancel enrollment
- getStudentEnrollments(studentId) - Get student's enrollments
- getCourseEnrollments(courseId) - Get course enrollments
- checkEnrollmentAccess(studentId, courseId) - Verify access
```

### 3. Enrollment Controller

#### **Enrollment Controller (`EnrollmentController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/EnrollmentController.java
Endpoints:
- GET /api/enrollments/my-enrollments - Get student's enrollments
- GET /api/enrollments/course/{courseId} - Get course enrollments
- GET /api/enrollments/check/{courseId} - Check enrollment status
- DELETE /api/enrollments/{id} - Cancel enrollment
- GET /api/enrollments/{id} - Get enrollment details
```

---

## 📞 Contact & Communication

### 1. Contact Message System

#### **Contact Message Entity (`ContactMessage.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Entity/ContactMessage.java
Fields:
- id (Long) - Primary key
- name (String) - Sender name
- email (String) - Sender email
- subject (String) - Message subject
- message (String) - Message content
- createdAt (LocalDateTime) - Message timestamp
- isRead (Boolean) - Read status
- response (String) - Admin response
```

#### **Contact Message Repository (`ContactMessageRepository.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Repository/ContactMessageRepository.java
Key Methods:
- findByIsReadFalse() - Get unread messages
- findByEmailContaining(String email) - Search by email
- countByIsReadFalse() - Count unread messages
```

### 2. Contact Message Service & Controller

#### **Contact Message Service (`ContactMessageService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/ContactMessageService.java
Key Methods:
- saveContactMessage(name, email, subject, message) - Save new message
- getAllContactMessages() - Get all messages
- markAsRead(messageId) - Mark message as read
- respondToMessage(messageId, response) - Add admin response
```

#### **Contact Message Controller (`ContactMessageController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/ContactMessageController.java
Endpoints:
- POST /api/contact - Submit contact message
- GET /api/contact/messages - Get all messages (admin)
- PUT /api/contact/{id}/read - Mark as read (admin)
- POST /api/contact/{id}/respond - Respond to message (admin)
```

---

## 🛠️ Utility Services

### 1. Task Service

#### **Task Service (`TaskService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/TaskService.java
Purpose: Handles background tasks and scheduled operations
Key Methods:
- scheduleExamReminders() - Send exam reminder emails
- cleanupExpiredTokens() - Remove expired verification tokens
- generateReports() - Generate periodic reports
- backupData() - Backup critical data
```

### 2. Validation Service

#### **Validation Service (`ValidationService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Service/ValidationService.java
Purpose: Centralized validation logic
Key Methods:
- validateEmail(String email) - Email format validation
- validatePassword(String password) - Password strength validation
- validateCourseData(CourseData data) - Course creation validation
- validateExamData(ExamData data) - Exam creation validation
- validateUserInput(UserData data) - User input validation
```

### 3. Task Controller

#### **Task Controller (`TaskController.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Controller/TaskController.java
Endpoints (Admin Only):
- POST /api/tasks/backup - Trigger data backup
- POST /api/tasks/cleanup - Cleanup expired data
- GET /api/tasks/status - Get task status
- POST /api/tasks/reports - Generate reports
```

---

## 🗄️ Database Layer

### 1. Entity Relationships

```
User (1) ←→ (N) Course [instructor relationship]
User (1) ←→ (N) Enrollment [student relationship]
User (1) ←→ (N) Result [student relationship]
User (1) ←→ (1) Review [user relationship]

Course (1) ←→ (N) Enrollment
Course (1) ←→ (N) Exam

Exam (1) ←→ (N) Question
Exam (1) ←→ (N) Result

Question (1) ←→ (N) ExamOption

User (1) ←→ (N) VerificationToken
```

### 2. Repository Pattern

All repositories extend `JpaRepository<Entity, ID>` providing:
- Basic CRUD operations
- Pagination and sorting
- Custom query methods
- Transaction management

### 3. Database Migration

#### **Database Migration Service (`DatabaseMigrationService.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Config/DatabaseMigrationService.java
Purpose: Handles database schema updates and data migrations
Key Methods:
- migrateToLatestVersion() - Apply pending migrations
- rollbackMigration(version) - Rollback to specific version
- validateSchema() - Verify database schema integrity
```

---

## ⚠️ Exception Handling

### 1. Custom Exceptions

#### **Business Exception (`BusinessException.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Exception/BusinessException.java
Purpose: Base class for business logic exceptions
```

#### **Specific Exceptions:**
- `CourseException.java` - Course-related errors
- `EnrollmentException.java` - Enrollment-related errors
- `PaymentException.java` - Payment processing errors
- `ResourceNotFoundException.java` - Resource not found errors
- `ValidationException.java` - Input validation errors

### 2. Global Exception Handler

#### **Global Exception Handler (`GlobalExceptionHandler.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Exception/GlobalExceptionHandler.java
Purpose: Centralized exception handling for all controllers
Handles:
- Custom business exceptions
- Validation errors
- Authentication failures
- Database constraint violations
- Generic runtime exceptions

Returns standardized error responses using ErrorResponse.java
```

#### **Error Response (`ErrorResponse.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Exception/ErrorResponse.java
Purpose: Standardized error response format
Fields:
- timestamp, status, error, message, path
```

---

## ⚙️ Configuration & Setup

### 1. Application Configuration

#### **Application Properties (`application.properties`)**
```properties
Location: src/main/resources/application.properties
Configurations:
- Database connection settings
- Email SMTP settings
- Razorpay payment gateway settings
- JWT security settings
- Logging configuration
- File upload settings
```

#### **Web Configuration (`WebConfig.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/WebConfig.java
Purpose: Web-related configurations
Settings:
- CORS configuration for frontend integration
- File upload limits
- Request/response interceptors
- Static resource handling
```

#### **Logging Configuration (`LoggingConfig.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Config/LoggingConfig.java
Purpose: Centralized logging configuration
Features:
- Different log levels for different packages
- File-based logging with rotation
- Console logging for development
- Request/response logging
```

### 2. Main Application Class

#### **ExamPort Application (`ExamPortApplication.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/ExamPortApplication.java
Purpose: Spring Boot application entry point
Annotations:
- @SpringBootApplication
- @EnableJpaRepositories
- @EnableScheduling (for background tasks)
```

### 3. Constants

#### **Token Type (`TokenType.java`)**
```java
Location: src/main/java/com/ExamPort/ExamPort/Constants/TokenType.java
Purpose: Defines different types of tokens used in the system
Values:
- EMAIL_VERIFICATION
- PASSWORD_RESET
- ACCOUNT_ACTIVATION
```

---

## 🔍 Key Implementation Points

### 1. Security Features
- JWT-based authentication
- Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
- Password encryption using BCrypt
- CORS configuration for frontend integration
- Request validation and sanitization

### 2. Payment Integration
- Razorpay payment gateway integration
- Secure payment verification
- Automatic enrollment after successful payment
- Payment receipt generation and email delivery

### 3. Email System
- Gmail SMTP integration
- HTML email templates
- Automated notifications for various events
- Email verification for new accounts

### 4. Data Management
- JPA/Hibernate for database operations
- Transaction management
- Pagination for large datasets
- Soft delete for important entities

### 5. Error Handling
- Comprehensive exception handling
- Standardized error responses
- Logging for debugging and monitoring
- Graceful degradation for non-critical failures

---

## 📝 Summary

The ExamWizards backend is a comprehensive Spring Boot application that provides:

1. **Complete user management** with role-based access control
2. **Course management system** with public/private and free/paid options
3. **Exam system** with multiple question types and automatic grading
4. **Payment integration** with Razorpay for paid courses
5. **Email notifications** for all major events
6. **Review system** with admin moderation
7. **Comprehensive analytics** and reporting
8. **Robust security** with JWT authentication
9. **Exception handling** with proper error responses
10. **Scalable architecture** following Spring Boot best practices

Each feature is implemented with proper separation of concerns, following the Controller-Service-Repository pattern, and includes comprehensive error handling and logging.