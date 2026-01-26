import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Calendar,
  Clock,
  Award,
  Globe,
  Lock,
  IndianRupee,
  GraduationCap,
  Users,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { colors } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { showToast } from '../../utils/toast';

interface CourseDetails {
  id: number;
  name: string;
  description: string;
  visibility: string;
  pricing: string;
  price?: number;
  enrollmentDate: string;
  instructor: {
    id: number;
    username: string;
    fullName: string;
  };
  examCount?: number;
  studentCount?: number;
}

interface ExamDetails {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  questionCount?: number;
  status: 'upcoming' | 'active' | 'completed' | 'expired' | 'missed';
  canAttempt: boolean;
  hasSubmitted: boolean;
  score?: number;
  percentage?: number;
}

const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [exams, setExams] = useState<ExamDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchCourseExams();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await apiService.getCourse(parseInt(courseId!));

      // Fetch additional course statistics
      let enhancedCourseData = { ...courseData };

      // Try alternative methods to get student count

      // Try multiple approaches to get student count
      let studentCount: number | string = 'N/A';

      // Method 1: Check if course data already includes student count
      if (courseData.studentCount !== undefined && courseData.studentCount !== null) {
        studentCount = courseData.studentCount;

      }
      // Method 2: For private courses, count allowed emails
      else if (courseData.visibility === 'PRIVATE' && courseData.allowedEmails && Array.isArray(courseData.allowedEmails)) {
        studentCount = courseData.allowedEmails.length;
        console.log('Using allowedEmails count for private course:', courseData.allowedEmails.length);
      }
      // Method 3: Try other possible field names
      else if (courseData.enrollmentCount !== undefined) {
        studentCount = courseData.enrollmentCount;
        console.log('Using course.enrollmentCount:', courseData.enrollmentCount);
      }
      else if (courseData.totalStudents !== undefined) {
        studentCount = courseData.totalStudents;
        console.log('Using course.totalStudents:', courseData.totalStudents);
      }
      // Method 4: Try to get actual enrollment count by analyzing student results
      else {
        try {
          // Get student results to count unique students who have taken exams
          const studentResults = await apiService.getMyResults();
          let uniqueStudents = new Set<number>();

          // Add current user to the set (we know they're enrolled)
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (currentUser.id) {
            uniqueStudents.add(currentUser.id);
          }

          // Count unique students from exam results
          if (studentResults && Array.isArray(studentResults)) {
            studentResults.forEach((result: any) => {
              if (result.userId) {
                uniqueStudents.add(result.userId);
              }
            });
          }

          if (uniqueStudents.size > 0) {
            studentCount = uniqueStudents.size;
            console.log(`Found ${uniqueStudents.size} unique students (including current user)`);
          } else if (courseData.visibility === 'PUBLIC') {
            // For public courses, we know at least the current user is enrolled
            studentCount = 1; // At least the current user
            console.log('Public course - showing 1 student (current user)');
          } else {
            studentCount = 'N/A';
            console.log('Could not determine student count');
          }
        } catch (error) {
          console.warn('Error estimating student count from results:', error);
          if (courseData.visibility === 'PUBLIC') {
            studentCount = 1; // At least the current user
            console.log('Fallback: Public course - showing 1 student');
          } else {
            studentCount = 'N/A';
            console.log('Fallback: showing N/A');
          }
        }
      }

      // Final safety check: ensure public courses always show at least 1 student
      if (courseData.visibility === 'PUBLIC' && (studentCount === 'N/A' || studentCount === 0)) {
        studentCount = 1;
        console.log('Safety check: Public course forced to show 1 student');
      }

      enhancedCourseData.studentCount = studentCount;
      console.log('Final student count assigned to course:', studentCount);
      console.log('Enhanced course data student count:', enhancedCourseData.studentCount);

      // Get enrollment date from enrolled courses
      try {
        const enrolledCourses = await apiService.getEnrolledCourses();
        const currentCourseEnrollment = enrolledCourses.find((course: any) => course.id === parseInt(courseId!));
        if (currentCourseEnrollment && currentCourseEnrollment.enrollmentDate) {
          enhancedCourseData.enrollmentDate = currentCourseEnrollment.enrollmentDate;
        }
      } catch (enrollmentError) {
        console.warn('Could not fetch enrollment date:', enrollmentError);
        enhancedCourseData.enrollmentDate = new Date().toISOString(); // Fallback to current date
      }

      setCourse(enhancedCourseData);
      console.log('Course state set with student count:', enhancedCourseData.studentCount);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseExams = async () => {
    try {
      setExamsLoading(true);
      // Fetch exams for this specific course
      const examsData = await apiService.getExamsByCourse(parseInt(courseId!));

      if (examsData && Array.isArray(examsData)) {
        // Also fetch student's results to check submission status
        let studentResults: any[] = [];
        try {
          studentResults = await apiService.getMyResults();
        } catch (resultError) {
          console.warn('Could not fetch student results:', resultError);
        }

        const processedExams = examsData.map((exam: any) => {
          const now = new Date();
          const startDateTime = new Date(`${exam.startDate} ${exam.startTime}`);
          const endDateTime = new Date(`${exam.endDate} ${exam.endTime}`);

          console.log('Processing exam:', exam.title, {
            examId: exam.exam_id || exam.id,
            now: now.toISOString(),
            startDateTime: startDateTime.toISOString(),
            endDateTime: endDateTime.toISOString(),
            studentResults: studentResults.length
          });

          // Check if student has submitted this exam - try multiple ID matching strategies
          console.log('=== DEBUGGING EXAM MATCHING ===');
          console.log('Current exam:', {
            id: exam.id,
            exam_id: exam.exam_id,
            title: exam.title,
            finalId: exam.exam_id || exam.id,
            fullExam: exam
          });

          console.log('All student results (full structure):', studentResults);
          console.log('All student results (mapped):', studentResults.map(r => ({
            resultId: r.id,
            examId: r.examId,
            examExamId: r.examExamId,
            exam_exam_id: r.exam?.exam_id,
            exam_id: r.exam?.id,
            examTitle: r.exam?.title || r.examTitle,
            allKeys: Object.keys(r),
            fullResult: r
          })));

          const currentExamId = exam.exam_id || exam.id;
          console.log('Looking for exam ID:', currentExamId, 'for exam:', exam.title);

          // TEMPORARY: If we have no student results, assume no submissions
          if (!studentResults || studentResults.length === 0) {
            console.log('No student results found - assuming no submissions for exam:', exam.title);
            // If no results, definitely not submitted
            const hasSubmitted = false;
            const score = 0;
            const totalMarks = exam.totalMarks || 0;
            const percentage = 0;

            let status: 'upcoming' | 'active' | 'completed' | 'expired' | 'missed' = 'upcoming';
            let canAttempt = false;

            if (now < startDateTime) {
              status = 'upcoming';
              canAttempt = false;
            } else if (now >= startDateTime && now <= endDateTime) {
              status = 'active';
              canAttempt = true;
            } else if (now > endDateTime) {
              status = 'missed';
              canAttempt = false;
            } else {
              status = 'expired';
              canAttempt = false;
            }

            console.log('No results - Final exam status:', exam.title, {
              hasSubmitted,
              status,
              canAttempt,
              score,
              percentage
            });

            return {
              id: exam.exam_id || exam.id,
              title: exam.title,
              description: exam.description,
              startDate: exam.startDate,
              startTime: exam.startTime,
              endDate: exam.endDate,
              endTime: exam.endTime,
              duration: exam.duration,
              totalMarks: exam.totalMarks,
              questionCount: exam.questionCount,
              status,
              canAttempt,
              hasSubmitted,
              score,
              percentage
            };
          }

          const examResult = studentResults.find((result: any) => {
            // Try different ways to match the exam ID - be more specific and strict
            const resultExamId1 = result.examExamId; // This might be the correct field name
            const resultExamId2 = result.exam?.exam_id;
            const resultExamId3 = result.exam?.id;
            const resultExamId4 = result.examId;

            console.log('Checking result against exam:', {
              examTitle: exam.title,
              currentExamId,
              currentExamIdType: typeof currentExamId,
              resultExamId1,
              resultExamId1Type: typeof resultExamId1,
              resultExamId2,
              resultExamId2Type: typeof resultExamId2,
              resultExamId3,
              resultExamId3Type: typeof resultExamId3,
              resultExamId4,
              resultExamId4Type: typeof resultExamId4,
              match1: resultExamId1 === currentExamId,
              match2: resultExamId2 === currentExamId,
              match3: resultExamId3 === currentExamId,
              match4: resultExamId4 === currentExamId,
              strictMatch1: resultExamId1 === currentExamId && resultExamId1 !== undefined && resultExamId1 !== null,
              strictMatch2: resultExamId2 === currentExamId && resultExamId2 !== undefined && resultExamId2 !== null,
              strictMatch3: resultExamId3 === currentExamId && resultExamId3 !== undefined && resultExamId3 !== null,
              strictMatch4: resultExamId4 === currentExamId && resultExamId4 !== undefined && resultExamId4 !== null
            });

            // Be more strict about matching - ensure the IDs are not null/undefined and actually match
            return (resultExamId1 === currentExamId && resultExamId1 !== undefined && resultExamId1 !== null) ||
              (resultExamId2 === currentExamId && resultExamId2 !== undefined && resultExamId2 !== null) ||
              (resultExamId3 === currentExamId && resultExamId3 !== undefined && resultExamId3 !== null) ||
              (resultExamId4 === currentExamId && resultExamId4 !== undefined && resultExamId4 !== null);
          });

          const hasSubmitted = !!examResult;
          const score = examResult?.score || 0;
          const totalMarks = exam.totalMarks || examResult?.totalMarks || 0;
          const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

          let status: 'upcoming' | 'active' | 'completed' | 'expired' | 'missed' = 'upcoming';
          let canAttempt = false;

          if (hasSubmitted) {
            status = 'completed';
            canAttempt = false;
          } else if (now < startDateTime) {
            status = 'upcoming';
            canAttempt = false;
          } else if (now >= startDateTime && now <= endDateTime) {
            status = 'active';
            canAttempt = true;
          } else if (now > endDateTime) {
            // Exam has ended and student hasn't submitted - it's missed
            status = 'missed';
            canAttempt = false;
          } else {
            status = 'expired';
            canAttempt = false;
          }

          console.log('Final exam status:', exam.title, {
            hasSubmitted,
            status,
            canAttempt,
            score,
            percentage
          });

          return {
            id: exam.exam_id || exam.id,
            title: exam.title,
            description: exam.description,
            startDate: exam.startDate,
            startTime: exam.startTime,
            endDate: exam.endDate,
            endTime: exam.endTime,
            duration: exam.duration,
            totalMarks: exam.totalMarks,
            questionCount: exam.questionCount,
            status,
            canAttempt,
            hasSubmitted,
            score,
            percentage
          };
        });

        setExams(processedExams);
      }
    } catch (error) {
      console.error('Error fetching course exams:', error);
      // Don't show error toast as this is not critical
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'PUBLIC' ? Globe : Lock;
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === 'PUBLIC'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getPricingColor = (pricing: string) => {
    return pricing === 'PAID'
      ? 'bg-green-100 text-green-800'
      : 'bg-purple-100 text-purple-800';
  };

  const getExamStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'missed':
        return <XCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getExamStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date} ${time}`);
    return dateTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatEnrollmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            {/* Enhanced Loading Animation */}
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Loading Course Details</h3>
              <p className="text-gray-600">Please wait while we fetch your course information...</p>
            </div>

            {/* Loading Progress Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center space-y-6 max-w-md mx-auto">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">Course Not Found</h2>
              <p className="text-gray-600 leading-relaxed">
                The course you're looking for doesn't exist or you don't have access to it.
                Please check the URL or contact your instructor.
              </p>
            </div>

            <div className="pt-4">
              <ModernButton
                onClick={() => navigate('/student')}
                variant="gradient"
                gradientColors={[colors.primary[500], colors.secondary[500]]}
                className="px-6 py-3"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </ModernButton>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const VisibilityIcon = getVisibilityIcon(course.visibility);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Back to Dashboard Button */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <ModernButton
              variant="outlined"
              onClick={() => navigate('/student')}
              className="flex items-center hover:scale-105 transition-transform duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </ModernButton>
          </motion.div>

          {/* Enhanced Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-indigo-600/10 rounded-3xl"></div>

            <div className="relative bg-gradient-to-br from-blue-50/90 via-indigo-50/90 to-purple-50/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-blue-200/50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Course Details</h1>
                      <p className="text-gray-600">Complete course information and exam schedule</p>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <FileText className="h-4 w-4" />
                    <span>{exams.length} Exams</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>{exams.filter(e => e.hasSubmitted).length} Completed</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>{exams.filter(e => e.status === 'active').length} Active</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Course Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50/90 via-teal-50/90 to-cyan-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-emerald-200/50">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
              </div>

              <div className="relative z-10 p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Course Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Course Header */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{course.name}</h2>
                          <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
                        </div>
                      </div>

                      {/* Enhanced Status Badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getVisibilityColor(course.visibility)} border border-white/20`}>
                          <VisibilityIcon className="h-4 w-4 mr-2" />
                          {course.visibility} Course
                        </span>
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-lg ${getPricingColor(course.pricing)} border border-white/20`}>
                          {course.pricing === 'PAID' && <IndianRupee className="h-4 w-4 mr-2" />}
                          {course.pricing === 'PAID' ? `${course.price}` : 'FREE'}
                        </span>
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-lg border border-white/20">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Enrolled
                        </span>
                      </div>
                    </div>

                    {/* Enhanced Instructor Information */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-violet-50/90 via-purple-50/90 to-fuchsia-50/90 rounded-2xl p-6 border border-violet-200/50 shadow-lg">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>

                      <div className="relative z-10">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl mr-3 shadow-lg">
                            <GraduationCap className="h-5 w-5 text-white" />
                          </div>
                          Course Instructor
                        </h3>
                        <div className="flex items-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-xl">
                            <GraduationCap className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <p className="text-xl font-bold text-gray-900">{course.instructor.fullName}</p>
                            <p className="text-sm text-gray-600">@{course.instructor.username}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Overview */}
                    <div className="bg-gradient-to-br from-amber-50/90 via-orange-50/90 to-yellow-50/90 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Your Progress
                      </h3>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{exams.filter(e => e.hasSubmitted).length}</div>
                          <div className="text-sm text-gray-600">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{exams.filter(e => e.status === 'active').length}</div>
                          <div className="text-sm text-gray-600">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{exams.filter(e => e.status === 'upcoming').length}</div>
                          <div className="text-sm text-gray-600">Upcoming</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">{exams.filter(e => e.status === 'missed').length}</div>
                          <div className="text-sm text-gray-600">Missed</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Course Statistics */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-rose-50/90 via-pink-50/90 to-red-50/90 rounded-2xl p-6 border border-rose-200/50 shadow-lg h-fit">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                        <Target className="h-5 w-5 mr-2 text-purple-600" />
                        Course Statistics
                      </h3>

                      <div className="space-y-4">
                        <div className="group relative overflow-hidden bg-gradient-to-br from-purple-50/90 to-indigo-50/90 rounded-xl p-4 shadow-sm border border-purple-200/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                                <FileText className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">Total Exams</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{exams.length}</span>
                          </div>
                        </div>

                        <div className="group relative overflow-hidden bg-gradient-to-br from-green-50/90 to-emerald-50/90 rounded-xl p-4 shadow-sm border border-green-200/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                                <CheckCircle className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">Completed</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">{exams.filter(e => e.hasSubmitted).length}</span>
                          </div>
                        </div>

                        {course.visibility !== 'PUBLIC' && (
                          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-50/90 to-cyan-50/90 rounded-xl p-4 shadow-sm border border-blue-200/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                                  <Users className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-700">Students</span>
                              </div>
                              <span className="text-xl font-bold text-gray-900">
                                {course.studentCount !== undefined && course.studentCount !== null && course.studentCount !== '' ? course.studentCount : 'N/A'}
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="group relative overflow-hidden bg-gradient-to-br from-orange-50/90 to-red-50/90 rounded-xl p-4 shadow-sm border border-orange-200/50 hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg mr-3 group-hover:scale-110 transition-transform duration-300">
                                <Calendar className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-semibold text-gray-700">Enrolled On</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {formatEnrollmentDate(course.enrollmentDate)}
                            </span>
                          </div>
                        </div>

                        {/* Performance Summary */}
                        {(exams.filter(e => e.hasSubmitted).length > 0 || exams.filter(e => e.status === 'missed').length > 0) && (
                          <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50/90 to-purple-50/90 rounded-xl border border-indigo-200/50 shadow-lg backdrop-blur-sm">
                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                              <Zap className="h-4 w-4 mr-2 text-blue-600" />
                              Performance
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Average Score</span>
                                <span className="font-semibold text-gray-900">
                                  {(() => {
                                    const completedExams = exams.filter(e => e.hasSubmitted);
                                    const missedExams = exams.filter(e => e.status === 'missed');
                                    const totalRelevantExams = completedExams.length + missedExams.length;

                                    if (totalRelevantExams === 0) return '0';

                                    // Sum of completed exam scores (missed exams contribute 0)
                                    const totalScore = completedExams.reduce((acc, exam) => acc + (exam.percentage || 0), 0);
                                    // Average = (total score from completed + 0 for missed) / (completed + missed)
                                    const averageScore = totalScore / totalRelevantExams;

                                    return Math.round(averageScore);
                                  })()}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${(() => {
                                      const completedExams = exams.filter(e => e.hasSubmitted);
                                      const missedExams = exams.filter(e => e.status === 'missed');
                                      const totalRelevantExams = completedExams.length + missedExams.length;

                                      if (totalRelevantExams === 0) return 0;

                                      const totalScore = completedExams.reduce((acc, exam) => acc + (exam.percentage || 0), 0);
                                      const averageScore = totalScore / totalRelevantExams;

                                      return Math.round(averageScore);
                                    })()}%`
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Exams Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-50/90 via-gray-50/90 to-zinc-50/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50"></div>

              <div className="relative z-10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Course Exams</h3>
                      <p className="text-gray-600">{exams.length} exams available in this course</p>
                    </div>
                  </div>
                  <Link to={`/student/exams?courseId=${course.id}`}>
                    <ModernButton
                      variant="outlined"
                      className="text-sm hover:scale-105 transition-transform duration-200"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View All Exams
                    </ModernButton>
                  </Link>
                </div>

                {examsLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center space-y-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200"></div>
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
                      </div>
                      <p className="text-gray-600">Loading exams...</p>
                    </div>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">No Exams Available</h4>
                    <p className="text-gray-600 max-w-md mx-auto">
                      No exams have been created for this course yet. Check back later or contact your instructor.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {exams.map((exam, index) => {
                      // Define different background colors for each exam based on status and index
                      const getExamBackgroundColor = (status: string, index: number) => {
                        const colors = [
                          'bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-purple-50/90 border-blue-200/50',
                          'bg-gradient-to-br from-emerald-50/95 via-teal-50/90 to-cyan-50/90 border-emerald-200/50',
                          'bg-gradient-to-br from-rose-50/95 via-pink-50/90 to-red-50/90 border-rose-200/50',
                          'bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/90 border-amber-200/50',
                          'bg-gradient-to-br from-violet-50/95 via-purple-50/90 to-fuchsia-50/90 border-violet-200/50',
                          'bg-gradient-to-br from-lime-50/95 via-green-50/90 to-emerald-50/90 border-lime-200/50',
                        ];

                        // Use status-based colors for better UX
                        switch (status) {
                          case 'active':
                            return 'bg-gradient-to-br from-green-50/95 via-emerald-50/90 to-teal-50/90 border-green-200/50';
                          case 'completed':
                            return 'bg-gradient-to-br from-blue-50/95 via-indigo-50/90 to-purple-50/90 border-blue-200/50';
                          case 'upcoming':
                            return 'bg-gradient-to-br from-amber-50/95 via-orange-50/90 to-yellow-50/90 border-amber-200/50';
                          case 'missed':
                            return 'bg-gradient-to-br from-red-50/95 via-rose-50/90 to-pink-50/90 border-red-200/50';
                          default:
                            return colors[index % colors.length];
                        }
                      };

                      return (
                        <motion.div
                          key={exam.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className={`group relative overflow-hidden ${getExamBackgroundColor(exam.status, index)} backdrop-blur-sm border rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] shadow-lg`}
                        >
                          {/* Enhanced Background Gradient on Hover */}
                          <div className={`absolute inset-0 transition-all duration-300 rounded-2xl ${exam.status === 'active'
                              ? 'bg-gradient-to-r from-green-100/0 via-emerald-100/0 to-teal-100/0 group-hover:from-green-100/60 group-hover:via-emerald-100/40 group-hover:to-teal-100/60'
                              : exam.status === 'completed'
                                ? 'bg-gradient-to-r from-blue-100/0 via-indigo-100/0 to-purple-100/0 group-hover:from-blue-100/60 group-hover:via-indigo-100/40 group-hover:to-purple-100/60'
                                : exam.status === 'upcoming'
                                  ? 'bg-gradient-to-r from-amber-100/0 via-orange-100/0 to-yellow-100/0 group-hover:from-amber-100/60 group-hover:via-orange-100/40 group-hover:to-yellow-100/60'
                                  : exam.status === 'missed'
                                    ? 'bg-gradient-to-r from-red-100/0 via-rose-100/0 to-pink-100/0 group-hover:from-red-100/60 group-hover:via-rose-100/40 group-hover:to-pink-100/60'
                                    : 'bg-gradient-to-r from-purple-50/0 via-blue-50/0 to-indigo-50/0 group-hover:from-purple-50/50 group-hover:via-blue-50/30 group-hover:to-indigo-50/50'
                            }`}></div>

                          <div className="relative z-10 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-4">
                                <h4 className="text-xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                                  {exam.title}
                                </h4>
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getExamStatusColor(exam.status)}`}>
                                  {getExamStatusIcon(exam.status)}
                                  <span className="ml-1.5 capitalize">{exam.status}</span>
                                </span>
                              </div>

                              {exam.description && (
                                <p className="text-gray-600 mb-6 leading-relaxed">{exam.description}</p>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div className="flex items-center text-gray-600 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-lg p-3 border border-blue-100/50">
                                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                  <div>
                                    <div className="text-xs text-gray-500">Start</div>
                                    <div className="text-sm font-medium">{formatDateTime(exam.startDate, exam.startTime)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gradient-to-br from-red-50/80 to-pink-50/80 rounded-lg p-3 border border-red-100/50">
                                  <Calendar className="h-4 w-4 mr-2 text-red-500" />
                                  <div>
                                    <div className="text-xs text-gray-500">End</div>
                                    <div className="text-sm font-medium">{formatDateTime(exam.endDate, exam.endTime)}</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gradient-to-br from-orange-50/80 to-amber-50/80 rounded-lg p-3 border border-orange-100/50">
                                  <Clock className="h-4 w-4 mr-2 text-orange-500" />
                                  <div>
                                    <div className="text-xs text-gray-500">Duration</div>
                                    <div className="text-sm font-medium">{exam.duration} minutes</div>
                                  </div>
                                </div>
                                <div className="flex items-center text-gray-600 bg-gradient-to-br from-purple-50/80 to-violet-50/80 rounded-lg p-3 border border-purple-100/50">
                                  <Award className="h-4 w-4 mr-2 text-purple-500" />
                                  <div>
                                    <div className="text-xs text-gray-500">Total Marks</div>
                                    <div className="text-sm font-medium">{exam.totalMarks}</div>
                                  </div>
                                </div>
                              </div>

                              {exam.hasSubmitted && exam.score !== undefined && (
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <Award className="h-5 w-5 text-blue-600 mr-2" />
                                      <span className="text-sm font-semibold text-blue-800">Your Score</span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xl font-bold text-blue-900">
                                        {exam.score}/{exam.totalMarks}
                                      </div>
                                      <div className="text-sm text-blue-700">
                                        {exam.percentage?.toFixed(1)}%
                                      </div>
                                    </div>
                                  </div>
                                  <div className="mt-3 w-full bg-blue-200 rounded-full h-2">
                                    <div
                                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${exam.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="ml-8 flex flex-col space-y-3">
                              {exam.canAttempt ? (
                                <Link to={`/student/exam/${exam.id}`}>
                                  <ModernButton
                                    variant="gradient"
                                    className="whitespace-nowrap hover:scale-105 transition-transform duration-200"
                                    gradientColors={[colors.primary[500], colors.secondary[500]]}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Start Exam
                                  </ModernButton>
                                </Link>
                              ) : exam.hasSubmitted ? (
                                <Link to={`/student/exam-result/${exam.id}`}>
                                  <ModernButton
                                    variant="outlined"
                                    className="whitespace-nowrap hover:scale-105 transition-transform duration-200"
                                  >
                                    <Award className="h-4 w-4 mr-2" />
                                    View Result
                                  </ModernButton>
                                </Link>
                              ) : (
                                <ModernButton
                                  variant="outlined"
                                  disabled
                                  className="whitespace-nowrap opacity-60"
                                >
                                  {exam.status === 'upcoming' ? (
                                    <>
                                      <Clock className="h-4 w-4 mr-2" />
                                      Not Started
                                    </>
                                  ) : exam.status === 'missed' ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Missed
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-4 w-4 mr-2" />
                                      Unavailable
                                    </>
                                  )}
                                </ModernButton>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CourseDetails;