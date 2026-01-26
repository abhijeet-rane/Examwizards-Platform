import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Award,
  Calendar,
  Play,
  BookOpen,
  Globe,
  Lock,
  IndianRupee,
  ShoppingCart,
  Eye,
  GraduationCap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

// Type definitions
interface Exam {
  id: number;
  exam_id?: number;
  title: string;
  date: string;
  time?: string;
  duration: number;
  instructor: string;
  totalMarks?: number;
  courseName?: string;
  statusMessage?: string;
  canAttempt?: boolean;
}

interface Result {
  id: number;
  title: string;
  score: number;
  totalMarks: number;
  date: string;
  grade: string;
}

interface PerformanceData {
  subject: string;
  score: number;
}

interface Course {
  id: number;
  name: string;
  description?: string;
  visibility: string;
  pricing: string;
  price?: number;
  enrollmentDate: string;
  examCount?: number;
  instructor: {
    username: string;
    fullName: string;
  };
}

const StudentDashboard = () => {
  const [dashboardData, setDashboardData] = useState<{
    upcomingExams: Exam[];
    recentResults: Result[];
    stats: {
      totalExams: number;
      completedExams: number;
      missedExams: number;
      averageScore: number;
      rank: number;
      totalCourses: number;
      completedCourses: number;
    };
    performanceData: PerformanceData[];
  }>({
    upcomingExams: [],
    recentResults: [],
    stats: {
      totalExams: 0,
      completedExams: 0,
      missedExams: 0,
      averageScore: 0,
      rank: 0,
      totalCourses: 0,
      completedCourses: 0
    },
    performanceData: []
  });
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Filter states
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PRIVATE' | 'PUBLIC'>('ALL');
  const [pricingFilter, setPricingFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');

  // Pagination states for enrolled courses
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(6); // Show 6 courses per page

  // Filter courses based on selected filters
  const getFilteredCourses = () => {
    if (!enrolledCourses) return [];

    return enrolledCourses.filter(course => {
      const visibilityMatch = visibilityFilter === 'ALL' || course.visibility === visibilityFilter;
      const pricingMatch = pricingFilter === 'ALL' || course.pricing === pricingFilter;
      return visibilityMatch && pricingMatch;
    });
  };

  // Get paginated courses
  const getPaginatedCourses = () => {
    const filteredCourses = getFilteredCourses();
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    return filteredCourses.slice(startIndex, endIndex);
  };

  // Calculate total pages
  const getTotalPages = () => {
    const filteredCourses = getFilteredCourses();
    return Math.ceil(filteredCourses.length / coursesPerPage);
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType: 'visibility' | 'pricing', value: string) => {
    setCurrentPage(1);
    if (filterType === 'visibility') {
      setVisibilityFilter(value as 'ALL' | 'PRIVATE' | 'PUBLIC');
    } else {
      setPricingFilter(value as 'ALL' | 'FREE' | 'PAID');
    }
  };

  // Handle courses per page change
  const handleCoursesPerPageChange = (newCoursesPerPage: number) => {
    setCoursesPerPage(newCoursesPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      // Fetch enrolled courses first, then dashboard data
      fetchEnrolledCourses().then(() => {
        fetchDashboardData();
      });
    }
  }, [authLoading, user]);

  const fetchEnrolledCourses = async () => {
    try {
      setCoursesLoading(true);

      // Fetch enrolled courses directly
      const courses = await apiService.getEnrolledCourses();
      console.log('Enrolled courses API response:', courses);

      const enrolledCoursesArray = Array.isArray(courses) ? courses : [];

      // Fetch exam counts for each course
      const coursesWithExamCounts = await Promise.all(
        enrolledCoursesArray.map(async (course: any) => {
          try {
            const courseExams = await apiService.getExamsByCourse(course.id);
            return {
              ...course,
              examCount: Array.isArray(courseExams) ? courseExams.length : 0
            };
          } catch (error) {
            console.warn(`Failed to fetch exam count for course ${course.id}:`, error);
            return {
              ...course,
              examCount: 0
            };
          }
        })
      );

      setEnrolledCourses(coursesWithExamCounts);

      // Calculate enrollment statistics
      const stats = {
        totalEnrollments: enrolledCoursesArray.length,
        activeEnrollments: enrolledCoursesArray.length, // All returned courses are enrolled
        completedCourses: 0, // Can be calculated based on course completion status
        paidCourses: enrolledCoursesArray.filter((course: any) => course.pricing === 'PAID').length,
        freeCourses: enrolledCoursesArray.filter((course: any) => course.pricing === 'FREE').length
      };

      console.log('Enrollment stats calculated:', stats);

      // Update dashboard stats with enrollment information
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalCourses: stats.totalEnrollments,
          completedCourses: stats.completedCourses
        }
      }));
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
      toast.error('Failed to load enrolled courses. Please check your connection.');
      // Mock enrolled courses for demo
      const mockCourses = [
        {
          id: 1,
          name: 'Advanced Mathematics',
          description: 'Comprehensive course covering calculus, algebra, and statistics',
          visibility: 'PUBLIC',
          pricing: 'PAID',
          enrollmentDate: '2024-01-10T10:00:00Z',
          instructor: {
            username: 'prof_johnson',
            fullName: 'Prof. Johnson'
          }
        },
        {
          id: 2,
          name: 'Physics Fundamentals',
          description: 'Basic physics concepts and principles',
          visibility: 'PUBLIC',
          pricing: 'FREE',
          enrollmentDate: '2024-01-05T14:30:00Z',
          instructor: {
            username: 'dr_smith',
            fullName: 'Dr. Smith'
          }
        }
      ];
      setEnrolledCourses(mockCourses);
      console.log('Using mock courses, count:', mockCourses.length);
      setDashboardData(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          totalCourses: mockCourses.length,
          completedCourses: 1
        }
      }));
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch real exam results to calculate performance data
      const resultsData = await apiService.getMyResults();
      console.log('Dashboard - API Results:', resultsData);

      // Fetch total available exams for the student
      let totalAvailableExams = 0;
      try {
        const allowedExamsData = await apiService.getAllowedExams(user?.email || '');
        totalAvailableExams = Array.isArray(allowedExamsData) ? allowedExamsData.length : 0;
        console.log('Dashboard - Total available exams:', totalAvailableExams);
      } catch (error) {
        console.warn('Could not fetch total available exams:', error);
        // Fallback: try to get exams for enrolled courses
        try {
          const enrolledExamsData = await apiService.getExamsForEnrolledCourses();
          totalAvailableExams = Array.isArray(enrolledExamsData) ? enrolledExamsData.length : 0;
          console.log('Dashboard - Total enrolled course exams:', totalAvailableExams);
        } catch (fallbackError) {
          console.warn('Could not fetch enrolled course exams either:', fallbackError);
        }
      }

      let processedResults = [];
      let performanceData = [];
      let recentResults = [];
      let stats = {
        totalExams: totalAvailableExams, // Use total available exams, not just completed
        completedExams: 0,
        averageScore: 0,
        rank: 0,
        totalCourses: 0,
        completedCourses: 0
      };

      if (resultsData && resultsData.length > 0) {
        // Process results data same as in MyResults component
        processedResults = resultsData.map((result: any) => {
          // Extract subject with multiple fallback options (same logic as MyResults)
          let subject = 'General';

          if (result.exam?.course?.name) {
            subject = result.exam.course.name;
          } else if (result.exam?.course) {
            subject = typeof result.exam.course === 'string' ? result.exam.course : result.exam.course.name || 'General';
          } else if (result.exam?.subject) {
            subject = result.exam.subject;
          } else if (result.course?.name) {
            subject = result.course.name;
          } else if (result.course) {
            subject = typeof result.course === 'string' ? result.course : result.course.name || 'General';
          } else if (result.subject) {
            subject = result.subject;
          } else {
            // Try to extract subject from exam title as last resort
            const examTitle = result.exam?.title || result.examTitle || '';
            if (examTitle.toLowerCase().includes('sample')) {
              subject = 'OOPs';
            } else if (examTitle.toLowerCase().includes('science')) {
              subject = examTitle.toLowerCase().includes('div c') ? 'div C science' : 'Science';
            } else if (examTitle.toLowerCase().includes('math')) {
              subject = 'Math';
            } else if (examTitle.toLowerCase().includes('physics')) {
              subject = 'Physics';
            } else if (examTitle.toLowerCase().includes('chemistry')) {
              subject = 'Chemistry';
            } else if (examTitle.toLowerCase().includes('biology')) {
              subject = 'Biology';
            }
          }

          return {
            id: result.id?.toString() || Math.random().toString(),
            examTitle: result.exam?.title || result.examTitle || 'Unknown Exam',
            score: result.score || 0,
            totalMarks: result.exam?.totalMarks || result.totalMarks || 0,
            percentage: result.percentage || 0,
            completedAt: result.attemptDate || result.completedAt || new Date().toISOString(),
            subject: subject
          };
        });



        // Calculate recent results (last 3)
        recentResults = processedResults
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 3)
          .map(result => ({
            id: result.id,
            title: result.examTitle,
            score: result.score,
            totalMarks: result.totalMarks,
            date: new Date(result.completedAt).toLocaleDateString(),
            grade: calculateGrade(result.percentage)
          }));

        // Calculate stats - keep the total available exams, update completed exams
        const completedExams = processedResults.length;

        // Calculate average score including missed exams as 0 (but not currently available exams)
        let averageScore = 0;
        // We'll calculate this after we know the missed exams count

        stats = {
          totalExams: totalAvailableExams, // Keep the total available exams we fetched earlier
          completedExams: completedExams, // Set completed exams to the number of results
          averageScore: 0, // Will be calculated later after we know missed exams count
          rank: 0, // This would need to be calculated from leaderboard data
          totalCourses: 0, // Will be updated from enrolled courses
          completedCourses: 0
        };
      }

      // Try to fetch upcoming exams and calculate missed exams
      let upcomingExams = [];
      let missedExamsCount = 0;
      let missedExamsBySubject = {};

      try {
        const examsData = await apiService.getExamsForEnrolledCourses();
        console.log('Raw exams data for dashboard:', examsData);

        if (examsData && Array.isArray(examsData)) {
          const now = new Date();

          // Calculate missed exams (exams that ended but student didn't submit)
          const missedExams = examsData.filter(exam => {
            const examEndDate = new Date(`${exam.endDate} ${exam.endTime}`);
            return now > examEndDate && !exam.hasSubmitted;
          });

          missedExamsCount = missedExams.length;
          console.log(`Found ${missedExamsCount} missed exams`);

          // Group missed exams by subject for performance calculation
          missedExams.forEach(exam => {
            let subject = 'General';
            
            if (exam.course?.name) {
              subject = exam.course.name;
            } else if (exam.courseName) {
              subject = exam.courseName;
            } else if (exam.subject) {
              subject = exam.subject;
            } else {
              // Try to extract subject from exam title
              const examTitle = exam.title || '';
              if (examTitle.toLowerCase().includes('sample')) {
                subject = 'OOPs';
              } else if (examTitle.toLowerCase().includes('science')) {
                subject = examTitle.toLowerCase().includes('div c') ? 'div C science' : 'Science';
              } else if (examTitle.toLowerCase().includes('math')) {
                subject = 'Math';
              } else if (examTitle.toLowerCase().includes('physics')) {
                subject = 'Physics';
              } else if (examTitle.toLowerCase().includes('chemistry')) {
                subject = 'Chemistry';
              } else if (examTitle.toLowerCase().includes('biology')) {
                subject = 'Biology';
              }
            }

            if (!missedExamsBySubject[subject]) {
              missedExamsBySubject[subject] = 0;
            }
            missedExamsBySubject[subject]++;
          });

          console.log('Missed exams by subject:', missedExamsBySubject);

          // Process upcoming/active exams and try to get instructor info from enrolled courses
          const processedExams = await Promise.all(
            examsData
              .filter(exam => {
                // Filter for active/upcoming exams
                const examEndDate = new Date(`${exam.endDate} ${exam.endTime}`);
                return now <= examEndDate && !exam.hasSubmitted;
              })
              .slice(0, 3) // Show only first 3
              .map(async (exam) => {
                console.log('Processing exam for instructor info:', {
                  title: exam.title,
                  instructor: exam.instructor,
                  course: exam.course,
                  fullExam: exam
                });

                // Try multiple ways to get instructor name (now enhanced with backend instructor info)
                let instructorName = 'Unknown';

                if (exam.instructor) {
                  instructorName = exam.instructor;
                } else if (exam.instructorName) {
                  instructorName = exam.instructorName;
                } else if (exam.course?.instructor?.fullName) {
                  instructorName = exam.course.instructor.fullName;
                } else if (exam.course?.instructor?.username) {
                  instructorName = exam.course.instructor.username;
                } else if (exam.course?.instructor) {
                  instructorName = exam.course.instructor;
                } else if (exam.courseName) {
                  instructorName = `Course: ${exam.courseName}`;
                } else {
                  // Try to get instructor info from enrolled courses
                  const courseId = exam.course?.id || exam.courseId;
                  if (courseId) {
                    const enrolledCourse = enrolledCourses.find(course => course.id === courseId);
                    if (enrolledCourse && enrolledCourse.instructor) {
                      instructorName = enrolledCourse.instructor.fullName || enrolledCourse.instructor.username;
                    }
                  }
                }

                console.log(`Final instructor name for "${exam.title}": ${instructorName}`);

                const processedExam = {
                  id: exam.exam_id || exam.id,
                  exam_id: exam.exam_id || exam.id, // Keep both for compatibility
                  title: exam.title,
                  date: exam.startDate || exam.endDate,
                  time: exam.startTime || exam.endTime,
                  duration: exam.duration || 0,
                  instructor: instructorName,
                  canAttempt: exam.status === 'active'
                };

                console.log(`Processed exam object for "${exam.title}":`, processedExam);
                return processedExam;
              })
          );

          upcomingExams = processedExams;
        }
      } catch (examError) {
        console.log('Could not fetch upcoming exams:', examError);
      }

      // Calculate average score correctly: only include completed + missed exams, not currently available
      const completedExams = processedResults.length;
      const totalRelevantExams = completedExams + missedExamsCount; // Only completed + missed, not currently available
      let correctedAverageScore = 0;
      
      console.log('Average Score Calculation:', {
        completedExams,
        missedExamsCount,
        totalRelevantExams,
        totalAvailableExams: totalAvailableExams
      });
      
      if (totalRelevantExams > 0) {
        // Sum of all completed exam scores (missed exams count as 0)
        const totalScoreFromCompleted = processedResults.reduce((sum, r) => sum + r.percentage, 0);
        // Average = (total score from completed exams + 0 for missed exams) / (completed + missed exams)
        correctedAverageScore = totalScoreFromCompleted / totalRelevantExams;
        
        console.log('Average Score Details:', {
          totalScoreFromCompleted,
          correctedAverageScore: Math.round(correctedAverageScore * 10) / 10
        });
      }

      // Calculate subject performance data including missed exams (moved here after missed exams calculation)
      // Get all subjects from both completed and missed exams
      const completedSubjects = [...new Set(processedResults.map(r => r.subject))];
      const missedSubjects = Object.keys(missedExamsBySubject);
      const allSubjects = [...new Set([...completedSubjects, ...missedSubjects])];
      
      performanceData = allSubjects.map(subject => {
        const subjectResults = processedResults.filter(r => r.subject === subject);
        const completedExamsCount = subjectResults.length;
        const missedExamsCount = missedExamsBySubject[subject] || 0;
        const totalExamsForSubject = completedExamsCount + missedExamsCount;
        
        if (totalExamsForSubject === 0) {
          return {
            subject: subject,
            score: 0
          };
        }
        
        // Calculate average including missed exams as 0%
        const totalScoreFromCompleted = subjectResults.reduce((sum, r) => sum + r.percentage, 0);
        // Missed exams contribute 0 to the total score
        const avgScore = totalScoreFromCompleted / totalExamsForSubject;
        
        console.log(`Subject ${subject}: ${completedExamsCount} completed, ${missedExamsCount} missed, avg: ${avgScore.toFixed(1)}%`);
        
        return {
          subject: subject,
          score: Math.round(avgScore)
        };
      });

      setDashboardData(prev => ({
        upcomingExams: upcomingExams,
        recentResults: recentResults,
        stats: {
          ...stats,
          missedExams: missedExamsCount, // Add missed exams count
          averageScore: Math.round(correctedAverageScore * 10) / 10, // Corrected average score
          // Preserve course counts from enrolled courses fetch
          totalCourses: prev.stats.totalCourses,
          completedCourses: prev.stats.completedCourses
        },
        performanceData: performanceData
      }));

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Set empty data but preserve course counts
      setDashboardData(prev => ({
        upcomingExams: [],
        recentResults: [],
        stats: {
          totalExams: 0,
          completedExams: 0,
          averageScore: 0,
          rank: 0,
          // Preserve course counts from enrolled courses fetch
          totalCourses: prev.stats.totalCourses,
          completedCourses: prev.stats.completedCourses
        },
        performanceData: []
      }));
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate grade (same as MyResults)
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const stats = [
    {
      name: 'Enrolled Courses',
      value: dashboardData.stats.totalCourses.toString(),
      icon: BookOpen,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Total Exams',
      value: dashboardData.stats.totalExams.toString(),
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Average Score',
      value: `${dashboardData.stats.averageScore}%`,
      icon: Award,
      color: 'from-teal-500 to-teal-600'
    }

  ];

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'PUBLIC' ? Globe : Lock;
  };



  const formatEnrollmentDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate remaining exams properly to avoid negative values
  const completedExams = dashboardData.stats.completedExams || 0;
  const missedExams = dashboardData.stats.missedExams || 0;
  const totalExams = dashboardData.stats.totalExams || 0;
  const remainingExams = Math.max(0, totalExams - completedExams - missedExams);

  console.log('Pie chart data calculation:', {
    totalExams,
    completedExams,
    missedExams,
    remainingExams,
    calculation: `${totalExams} - ${completedExams} - ${missedExams} = ${remainingExams}`
  });

  const pieData = [
    { name: 'Completed', value: completedExams, color: '#10B981' },
    { name: 'Missed', value: missedExams, color: '#EF4444' },
    { name: 'Remaining', value: remainingExams, color: '#E5E7EB' }
  ].filter(item => item.value > 0); // Only show segments with values > 0

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
          <p className="text-gray-600">Track your exam progress and performance</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-6 shadow-xl border-2 transform hover:scale-105 transition-all duration-300 ${index === 0 ? 'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200' :
                index === 1 ? 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200' :
                  'bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enrolled Courses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ModernCard variant="glass" className="p-6 bg-gradient-to-br from-white to-indigo-50 border-2 border-indigo-200 shadow-xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 space-y-3 lg:space-y-0">
              <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3 shadow-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                My Enrolled Courses
              </h3>
              <div className="flex flex-wrap items-center gap-3">
              
                {getTotalPages() > 1 && (
                  <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                )}
                {/* Courses per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700">Show:</span>
                  <select
                    value={coursesPerPage}
                    onChange={(e) => handleCoursesPerPageChange(Number(e.target.value))}
                    className="text-sm font-semibold bg-white border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                  <span className="text-sm font-semibold text-gray-700">per page</span>
                </div>
                <Link to="/student/courses">
                  <button className="text-sm font-bold bg-emerald-700 text-white px-4 py-2 rounded-lg hover:bg-emerald-800 hover:shadow-lg transition-all duration-300 border-2 border-emerald-800">
                    <ShoppingCart className="h-4 w-4 mr-1 inline" />
                    Browse Courses
                  </button>
                </Link>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gradient-to-r from-slate-50 to-gray-100 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-700">Visibility:</span>
                <div className="flex space-x-1">
                  {(['ALL', 'PRIVATE', 'PUBLIC'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange('visibility', filter)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border-2 ${visibilityFilter === filter
                        ? 'bg-indigo-700 text-white border-indigo-800 shadow-lg transform scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300 hover:border-indigo-400 hover:shadow-md'
                        }`}
                    >
                      {filter === 'ALL' ? 'All' : filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-700">Pricing:</span>
                <div className="flex space-x-1">
                  {(['ALL', 'FREE', 'PAID'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange('pricing', filter)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 border-2 ${pricingFilter === filter
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-lg transform scale-105'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-300 hover:border-emerald-400 hover:shadow-md'
                        }`}
                    >
                      {filter === 'ALL' ? 'All' : filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(visibilityFilter !== 'ALL' || pricingFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setCurrentPage(1);
                    setVisibilityFilter('ALL');
                    setPricingFilter('ALL');
                  }}
                  className="text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full transition-colors border-2 border-red-700"
                >
                  Clear filters
                </button>
              )}
            </div>

            {coursesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {getPaginatedCourses().map((course, index) => {
                    const VisibilityIcon = getVisibilityIcon(course.visibility);
                    return (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <ModernCard variant="elevated" className="transition-all duration-300">
                          <div className="p-4 bg-gray-100">
                            <div className="flex items-center justify-between">
                              {/* Left Section - Course Info */}
                              <div className="flex items-center space-x-4 flex-1 min-w-0">
                                {/* Course Title & Description */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">
                                      {course.name}
                                    </h4>
                                    {/* Status Badges */}
                                    <div className="flex items-center space-x-1 flex-shrink-0">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${course.visibility === 'PUBLIC'
                                        ? 'bg-blue-600 text-white border-blue-700'
                                        : 'bg-gray-600 text-white border-gray-700'
                                        }`}>
                                        <VisibilityIcon className="h-2.5 w-2.5 mr-1" />
                                        {course.visibility}
                                      </span>
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${course.pricing === 'PAID'
                                        ? 'bg-emerald-600 text-white border-emerald-700'
                                        : 'bg-purple-600 text-white border-purple-700'
                                        }`}>
                                        {course.pricing === 'PAID' && <IndianRupee className="h-2.5 w-2.5 mr-1" />}
                                        {course.pricing}
                                      </span>
                                    </div>
                                  </div>
                                  {course.description && (
                                    <p className="text-xs text-slate-600 truncate">
                                      {course.description}
                                    </p>
                                  )}
                                </div>

                                {/* Instructor Info */}
                                <div className="flex items-center space-x-2 bg-indigo-100 rounded-lg px-3 py-2 border-2 border-indigo-300 flex-shrink-0">
                                  <div className="w-6 h-6 bg-indigo-700 rounded-full flex items-center justify-center">
                                    <GraduationCap className="h-3 w-3 text-white" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-indigo-900">
                                      {course.instructor.fullName}
                                    </p>
                                    <p className="text-xs text-indigo-700 font-semibold">Instructor</p>
                                  </div>
                                </div>

                                {/* Course Stats */}
                                <div className="flex items-center space-x-3 flex-shrink-0">
                                  <div className="flex items-center space-x-1 bg-purple-100 rounded-lg px-2 py-1 border-2 border-purple-300">
                                    <div className="bg-purple-700 p-0.5 rounded">
                                      <FileText className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-sm font-bold text-purple-900">
                                      {course.examCount || 0}
                                    </span>
                                    <span className="text-xs text-purple-800 font-bold">Exams</span>
                                  </div>
                                  <div className="flex items-center space-x-1 bg-blue-100 rounded-lg px-2 py-1 border-2 border-blue-300">
                                    <div className="bg-blue-700 p-0.5 rounded">
                                      <Calendar className="h-3 w-3 text-white" />
                                    </div>
                                    <span className="text-xs text-blue-900 font-bold">
                                      {formatEnrollmentDate(course.enrollmentDate)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right Section - Actions */}
                              <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                                <Link
                                  to={`/student/course/${course.id}`}
                                  className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 hover:shadow-lg transition-all duration-200 border-2 border-blue-800"
                                  title="View Course Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Link>
                                <Link
                                  to={`/student/exams?courseId=${course.id}`}
                                >
                                  <button className="text-sm py-2 px-4 font-bold bg-green-700 text-white rounded-lg hover:bg-green-800 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-green-800">
                                    <FileText className="h-3 w-3 mr-1 inline" />
                                    View Exams
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </ModernCard>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Pagination Controls */}
                {!coursesLoading && getFilteredCourses().length > 0 && getTotalPages() > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-6 pt-4 border-t border-gray-200">
                    {/* Pagination Info */}
                    <div className="text-sm text-gray-600 font-medium">
                      Showing {((currentPage - 1) * coursesPerPage) + 1} to {Math.min(currentPage * coursesPerPage, getFilteredCourses().length)} of {getFilteredCourses().length} courses
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:scale-105'
                          }`}
                      >
                        Previous
                      </button>

                      <div className="flex items-center space-x-1">
                        {/* Smart pagination - show ellipsis for large page counts */}
                        {(() => {
                          const totalPages = getTotalPages();
                          const pages = [];

                          if (totalPages <= 7) {
                            // Show all pages if 7 or fewer
                            for (let i = 1; i <= totalPages; i++) {
                              pages.push(i);
                            }
                          } else {
                            // Smart pagination with ellipsis
                            if (currentPage <= 4) {
                              // Show first 5 pages + ellipsis + last page
                              pages.push(1, 2, 3, 4, 5, '...', totalPages);
                            } else if (currentPage >= totalPages - 3) {
                              // Show first page + ellipsis + last 5 pages
                              pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                            } else {
                              // Show first + ellipsis + current-1, current, current+1 + ellipsis + last
                              pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                            }
                          }

                          return pages.map((page, index) => (
                            page === '...' ? (
                              <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400 font-bold">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page as number)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === page
                                  ? 'bg-indigo-600 text-white shadow-lg transform scale-110'
                                  : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:shadow-md'
                                  }`}
                              >
                                {page}
                              </button>
                            )
                          ));
                        })()}
                      </div>

                      <button
                        onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                        disabled={currentPage === getTotalPages()}
                        className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === getTotalPages()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:scale-105'
                          }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!coursesLoading && getFilteredCourses().length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border-2 border-slate-200"
              >
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-4 shadow-lg">
                  <BookOpen className="h-16 w-16 text-white" />
                </div>
                {enrolledCourses.length === 0 ? (
                  <>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">No courses enrolled</h4>
                    <p className="text-slate-600 mb-6 font-medium">Browse and enroll in courses to get started</p>
                    <Link to="/student/courses">
                      <button className="bg-emerald-700 text-white px-6 py-3 rounded-lg hover:bg-emerald-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-bold border-2 border-emerald-800">
                        <ShoppingCart className="h-5 w-5 mr-2 inline" />
                        Browse Course Catalog
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">No courses match your filters</h4>
                    <p className="text-slate-600 mb-6 font-medium">
                      Try adjusting your filters or{' '}
                      <button
                        onClick={() => {
                          setVisibilityFilter('ALL');
                          setPricingFilter('ALL');
                        }}
                        className="text-white bg-indigo-700 hover:bg-indigo-800 font-bold px-3 py-1 rounded-full transition-colors border-2 border-indigo-800"
                      >
                        clear all filters
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </ModernCard>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Exams */}
          <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Upcoming Exams</h3>
              <Link
                to="/student/exams"
                className="text-purple-600 hover:text-purple-500 font-medium text-sm"
              >
                View All
              </Link>
            </div>

            {dashboardData.upcomingExams.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Exams Available</h4>
                <p className="text-gray-600">
                  There are no active or scheduled exams remaining for you to attempt at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.upcomingExams.map((exam) => (
                  <div key={exam.id} className={`flex items-center justify-between p-4 rounded-xl border ${exam.canAttempt
                    ? 'bg-gradient-to-r from-purple-50 to-teal-50 border-purple-100'
                    : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100'
                    }`}>
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${exam.canAttempt
                        ? 'bg-gradient-to-br from-purple-500 to-teal-500'
                        : 'bg-gradient-to-br from-yellow-500 to-orange-500'
                        }`}>
                        {exam.canAttempt ? (
                          <FileText className="h-6 w-6 text-white" />
                        ) : (
                          <Calendar className="h-6 w-6 text-white" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{exam.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {exam.date}
                          </div>
                          {exam.time && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {exam.time} ({exam.duration} min)
                            </div>
                          )}
                          {exam.totalMarks && (
                            <div className="flex items-center">
                              <Award className="h-4 w-4 mr-1" />
                              {exam.totalMarks} marks
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {exam.courseName && `${exam.courseName} • `}by {exam.instructor}
                        </p>
                        {exam.statusMessage && (
                          <p className={`text-sm font-medium mt-1 ${exam.canAttempt ? 'text-green-600' : 'text-orange-600'
                            }`}>
                            {exam.statusMessage}
                          </p>
                        )}
                      </div>
                    </div>

                    {exam.canAttempt ? (
                      <Link
                        to={`/student/exam/${exam.exam_id}`}
                        className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Exam
                      </Link>
                    ) : (
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Scheduled
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress Chart */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Exam Progress</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance and Recent Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Chart */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Results */}
          <div className="bg-gray-50 rounded-2xl p-6 shadow-lg border-2 border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Recent Results</h3>
              <Link
                to="/student/results"
                className="text-purple-600 hover:text-purple-500 font-medium text-sm"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <h4 className="font-semibold text-gray-900">{result.title}</h4>
                    <p className="text-sm text-gray-600">{result.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">
                        {result.score}/{result.totalMarks}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${result.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                        result.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {result.grade}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;