import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot/Chatbot';

// Public Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import VerifyEmail from './pages/auth/VerifyEmail';

// Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import ContactRequests from './pages/admin/ContactRequests';
import AdminReviews from './pages/admin/AdminReviews';

// Instructor Pages
import CreateExam from './pages/instructor/CreateExam';
import ExamList from './pages/instructor/ExamList';
import ExamResults from './pages/instructor/ExamResults';
import CreateCourse from './pages/instructor/CreateCourse';
import EditCourse from './pages/instructor/EditCourse';
import InstructorCourseDetails from './pages/instructor/InstructorCourseDetails';

// Student Pages
import AvailableExams from './pages/student/AvailableExams';
import ExamInterface from './pages/student/ExamInterface';
import ExamSubmissionSuccess from './pages/student/ExamSubmissionSuccess';
import MyResults from './pages/student/MyResults';
import ExamResult from './pages/student/ExamResult';
import StudentCourseCatalog from './pages/student/StudentCourseCatalog';
import MyEnrollments from './pages/student/MyEnrollments';
import CourseDetails from './pages/student/CourseDetails';

// Shared Pages
import Leaderboard from './pages/shared/Leaderboard';
import Profile from './pages/shared/Profile';
import Reviews from './pages/shared/Reviews';
import NotFound from './pages/NotFound';
function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/contact-requests" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ContactRequests />
              </ProtectedRoute>
            } />
            <Route path="/admin/reviews" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminReviews />
              </ProtectedRoute>
            } />

            {/* Instructor Routes */}
            <Route path="/instructor" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/instructor/create-exam" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <CreateExam />
              </ProtectedRoute>
            } />
            <Route path="/instructor/create-course" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <CreateCourse />
              </ProtectedRoute>
            } />
            <Route path="/instructor/edit-course/:courseId" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <EditCourse />
              </ProtectedRoute>
            } />
            <Route path="/instructor/course/:courseId" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <InstructorCourseDetails />
              </ProtectedRoute>
            } />
            <Route path="/instructor/exams" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <ExamList />
              </ProtectedRoute>
            } />
            <Route path="/instructor/results/:examId" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <ExamResults />
              </ProtectedRoute>
            } />
            <Route path="/instructor/reviews" element={
              <ProtectedRoute allowedRoles={['instructor']}>
                <Reviews />
              </ProtectedRoute>
            } />

            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            } />
            <Route path="/student/exams" element={
              <ProtectedRoute allowedRoles={['student']}>
                <AvailableExams />
              </ProtectedRoute>
            } />
            <Route path="/student/exam-submission-success" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamSubmissionSuccess />
              </ProtectedRoute>
            } />
            <Route path="/student/exam-result/:examId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamResult />
              </ProtectedRoute>
            } />
            <Route path="/student/exam/:examId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <ExamInterface />
              </ProtectedRoute>
            } />
            <Route path="/student/results" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyResults />
              </ProtectedRoute>
            } />
            <Route path="/student/courses" element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentCourseCatalog />
              </ProtectedRoute>
            } />
            <Route path="/student/enrollments" element={
              <ProtectedRoute allowedRoles={['student']}>
                <MyEnrollments />
              </ProtectedRoute>
            } />
            <Route path="/student/course/:courseId" element={
              <ProtectedRoute allowedRoles={['student']}>
                <CourseDetails />
              </ProtectedRoute>
            } />
            <Route path="/student/reviews" element={
              <ProtectedRoute allowedRoles={['student']}>
                <Reviews />
              </ProtectedRoute>
            } />

            {/* Shared Routes */}
            <Route path="/leaderboard" element={
              <ProtectedRoute allowedRoles={['admin', 'instructor', 'student']}>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'instructor', 'student']}>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Fallback Routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster position="top-right" />
          <Chatbot />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
