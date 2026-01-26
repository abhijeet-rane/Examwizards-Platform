import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  Calendar,
  Play,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  BookOpen,
  Award,
  Eye,
  Timer,
  Target,
  RefreshCw,
  SortAsc,
  SortDesc,

  Zap,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { CourseListSkeleton } from '../../components/ui/LoadingStates';
import { colors, animationVariants } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface Exam {
  exam_id: number;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed' | 'missed' | 'inactive';
  isAttempted: boolean;
  hasSubmitted?: boolean;
  isSubmitted?: boolean;
  score?: number;

  // Enhanced fields from backend
  studentCount: number;
  studentsDisplay: string;
  questionCount: number;
  questionsDisplay: string;
  marksDisplay: string;
  durationDisplay: string;

  // Date/time formatting
  startDateTime?: string;
  endDateTime?: string;
  dueDateTime?: string;
  startDateFormatted?: string;
  endDateFormatted?: string;

  // Countdown timer
  timeRemaining?: string;
  countdownDisplay?: string;
  isExpired?: boolean;
  isUrgent?: boolean;
  countdownColor?: string;

  // Actions
  actions?: {
    canStart: boolean;
    primaryAction: {
      text: string;
      type: string;
      style: string;
      enabled: boolean;
    };
  };

  // Course info
  course?: {
    id: number;
    name: string;
  };

  // Legacy fields for backward compatibility
  questionsCount?: number;
  instructor?: string;
}

const AvailableExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status' | 'marks'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage, setExamsPerPage] = useState(6); // Show 6 exams per page

  const [error, setError] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      fetchExams();
    }
  }, [authLoading, user]);

  const fetchExams = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) {
        setRefreshing(true);
        toast.loading('Refreshing exams...', { id: 'refresh-exams' });
      }
      setError('');

      // Get user email from multiple sources
      let email = '';
      let userId = null;

      // Try to get from localStorage first
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        try {
          const userData = JSON.parse(userRaw);
          email = userData.email || '';
          userId = userData.id || userData.userId;
        } catch { }
      }

      // If no email, try to get from API
      if (!email) {
        try {
          const profile = await apiService.getUserProfile();
          const profileData = profile.data ? profile.data : profile;
          email = profileData.email || '';
          userId = profileData.id || profileData.userId;
        } catch (profileError) {
          console.warn('Failed to fetch user profile:', profileError);
        }
      }

      if (!email) {
        throw new Error('User email not found. Please log in again.');
      }

      console.log('Fetching exams for user:', { email, userId });

      // Fetch exams using the proper backend endpoint
      let allExams: any[] = [];

      try {
        // Primary method: Get exams by email (handles both private courses and enrolled courses)
        console.log('Calling /api/exams/allowed/' + email);
        const allowedExamsResponse = await apiService.getAllowedExams(email);

        // Handle different response formats
        let allowedExams = [];
        if (allowedExamsResponse && Array.isArray(allowedExamsResponse)) {
          allowedExams = allowedExamsResponse;
        } else if (allowedExamsResponse && allowedExamsResponse.data && Array.isArray(allowedExamsResponse.data)) {
          allowedExams = allowedExamsResponse.data;
        } else if (allowedExamsResponse && typeof allowedExamsResponse === 'object') {
          // Single exam object
          allowedExams = [allowedExamsResponse];
        }

        console.log('API Response structure:', {
          type: typeof allowedExamsResponse,
          isArray: Array.isArray(allowedExamsResponse),
          hasData: allowedExamsResponse && allowedExamsResponse.data,
          dataIsArray: allowedExamsResponse && allowedExamsResponse.data && Array.isArray(allowedExamsResponse.data),
          examCount: allowedExams.length
        });

        if (Array.isArray(allowedExams) && allowedExams.length > 0) {
          allExams = [...allExams, ...allowedExams];
          console.log('✅ Found allowed exams:', allowedExams.length);

          // Log first exam for debugging
          if (allowedExams[0]) {
            console.log('Sample exam data:', {
              id: allowedExams[0].exam_id || allowedExams[0].id,
              title: allowedExams[0].title,
              status: allowedExams[0].status,
              course: allowedExams[0].course,
              hasSubmitted: allowedExams[0].hasSubmitted
            });
          }
        } else {
          console.log('⚠️ No exams found in allowed exams response');
        }
      } catch (allowedError) {
        console.error('❌ Failed to fetch allowed exams:', allowedError);
        // Don't throw here, continue to try other methods
      }

      // Secondary method: Get exams from enrolled courses (alternative approach)
      try {
        console.log('Fetching exams from enrolled courses...');
        const enrolledExamsResponse = await apiService.getExamsForEnrolledCourses();

        let enrolledExams = [];
        if (enrolledExamsResponse && Array.isArray(enrolledExamsResponse)) {
          enrolledExams = enrolledExamsResponse;
        } else if (enrolledExamsResponse && enrolledExamsResponse.data && Array.isArray(enrolledExamsResponse.data)) {
          enrolledExams = enrolledExamsResponse.data;
        }

        console.log('✅ Found exams from enrolled courses:', enrolledExams.length);

        // Add enrolled exams to the total (will be deduplicated later)
        if (Array.isArray(enrolledExams) && enrolledExams.length > 0) {
          allExams = [...allExams, ...enrolledExams];
          console.log('📚 Added enrolled course exams to total');
        }
      } catch (enrolledExamsError) {
        console.warn('⚠️ Failed to fetch exams from enrolled courses:', enrolledExamsError);
      }

      // Tertiary method: Verify enrolled courses (for debugging)
      try {
        console.log('Verifying enrolled courses...');
        const enrolledCoursesResponse = await apiService.getEnrolledCourses();

        let enrolledCourses = [];
        if (enrolledCoursesResponse && Array.isArray(enrolledCoursesResponse)) {
          enrolledCourses = enrolledCoursesResponse;
        } else if (enrolledCoursesResponse && enrolledCoursesResponse.data && Array.isArray(enrolledCoursesResponse.data)) {
          enrolledCourses = enrolledCoursesResponse.data;
        }

        console.log('✅ Found enrolled courses:', enrolledCourses.length);
        enrolledCourses.forEach((course, index) => {
          console.log(`Course ${index + 1}:`, {
            id: course.id,
            name: course.name,
            visibility: course.visibility,
            instructor: course.instructor?.username
          });
        });

        if (enrolledCourses.length === 0) {
          console.log('⚠️ Student is not enrolled in any courses');
        }
      } catch (enrolledError) {
        console.warn('⚠️ Failed to fetch enrolled courses (for debugging):', enrolledError);
      }

      // Remove duplicates based on exam_id
      const uniqueExams = allExams.filter((exam, index, self) =>
        index === self.findIndex(e => (e.exam_id || e.id) === (exam.exam_id || exam.id))
      );

      console.log('📊 Exam fetch summary:', {
        totalFetched: allExams.length,
        uniqueExams: uniqueExams.length,
        duplicatesRemoved: allExams.length - uniqueExams.length
      });

      let exams = uniqueExams;

      // Map and enhance exam data with modern features
      exams = exams.map((exam: any) => {
        const enhancedExam = {
          ...exam,
          exam_id: exam.exam_id ?? exam.Exam_id ?? exam.id,
          // Map enhanced fields with fallbacks
          questionCount: exam.questionCount ?? 0,
          questionsDisplay: exam.questionsDisplay ?? `${exam.questionCount ?? 0} questions`,
          marksDisplay: exam.marksDisplay ?? `${exam.totalMarks ?? 0} marks`,
          durationDisplay: exam.durationDisplay ?? `${exam.duration ?? 0} minutes`,

          // Legacy compatibility
          questionsCount: exam.questionCount ?? exam.questionsCount ?? 0,
          instructor: exam.course?.name || exam.instructor || 'Unknown',

          // Status mapping
          status: exam.status === 'inactive' ? 'upcoming' : exam.status ?? 'upcoming',

          // Enhanced date formatting
          startDateFormatted: exam.startDate ? new Date(exam.startDate).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : '',
          endDateFormatted: exam.endDate ? new Date(exam.endDate).toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }) : '',
        };

        // Calculate countdown and urgency
        if (exam.endDate) {
          const now = new Date();
          const endDate = new Date(exam.endDate);
          const timeDiff = endDate.getTime() - now.getTime();

          if (timeDiff > 0) {
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

            if (days > 0) {
              enhancedExam.countdownDisplay = `${days}d ${hours}h left`;
              enhancedExam.countdownColor = days <= 1 ? 'red' : days <= 3 ? 'orange' : 'green';
              enhancedExam.isUrgent = days <= 1;
            } else if (hours > 0) {
              enhancedExam.countdownDisplay = `${hours}h left`;
              enhancedExam.countdownColor = 'red';
              enhancedExam.isUrgent = true;
            } else {
              enhancedExam.countdownDisplay = 'Ending soon';
              enhancedExam.countdownColor = 'red';
              enhancedExam.isUrgent = true;
            }
          } else {
            enhancedExam.isExpired = true;
          }
        }

        return enhancedExam;
      });

      // Status correction logic
      exams.forEach(exam => {
        // Frontend override: if exam is marked as completed but not actually submitted and is expired, mark as missed
        if (exam.status === 'completed' && !exam.hasSubmitted && !exam.isSubmitted && !exam.isAttempted) {
          const now = new Date();
          if (exam.endDate) {
            const examEndDate = new Date(exam.endDate);
            if (now > examEndDate) {
              exam.status = 'missed';
              exam.isExpired = true;
            }
          }
        }
      });

      setExams(exams);

      // Fetch enrolled courses for filtering
      try {
        console.log('Fetching enrolled courses for filtering...');
        const enrolledCoursesResponse = await apiService.getEnrolledCourses();

        let enrolledCourses = [];
        if (enrolledCoursesResponse && Array.isArray(enrolledCoursesResponse)) {
          enrolledCourses = enrolledCoursesResponse;
        } else if (enrolledCoursesResponse && enrolledCoursesResponse.data && Array.isArray(enrolledCoursesResponse.data)) {
          enrolledCourses = enrolledCoursesResponse.data;
        }

        console.log('✅ Enrolled courses for filtering:', enrolledCourses.length);

        // Transform enrolled courses to match our interface
        const transformedCourses = enrolledCourses.map((course: any) => ({
          id: course.id,
          name: course.name || course.title || 'Untitled Course'
        }));

        setAvailableCourses(transformedCourses);
      } catch (coursesError) {
        console.warn('⚠️ Failed to fetch enrolled courses for filtering:', coursesError);

        // Fallback: Extract unique courses from exams
        const uniqueCourses = exams
          .filter(exam => exam.course && exam.course.name)
          .reduce((acc, exam) => {
            const courseId = exam.course!.id;
            if (!acc.find(c => c.id === courseId)) {
              acc.push({
                id: courseId,
                name: exam.course!.name
              });
            }
            return acc;
          }, [] as any[]);

        setAvailableCourses(uniqueCourses);
      }

      if (showRefreshToast) {
        toast.success('Exams refreshed successfully!', { id: 'refresh-exams' });
      }
    } catch (error: any) {
      console.error('Failed to fetch allowed exams:', error);
      const errorMessage = error?.message || 'Failed to load exams';
      setError(errorMessage);
      setExams([]);

      if (showRefreshToast) {
        toast.error(errorMessage, { id: 'refresh-exams' });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'missed':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'missed':
        return <AlertCircle className="h-4 w-4" />;
      case 'inactive':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const canAttemptExam = (exam: Exam) => {
    return exam.status === 'active' && !exam.isAttempted && !exam.hasSubmitted && !exam.isSubmitted;
  };

  // Enhanced filtering and sorting with useMemo for performance
  const filteredAndSortedExams = useMemo(() => {
    let filtered = exams.filter(exam => {
      const title = typeof exam.title === 'string' ? exam.title : '';
      const description = typeof exam.description === 'string' ? exam.description : '';
      const instructor = typeof exam.instructor === 'string' ? exam.instructor : '';
      const courseName = exam.course?.name || '';

      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courseName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
      const matchesCourse = courseFilter === 'all' ||
        (exam.course?.id && exam.course.id.toString() === courseFilter.toString());



      return matchesSearch && matchesStatus && matchesCourse;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'status':
          const statusOrder = { 'active': 0, 'upcoming': 1, 'completed': 2, 'missed': 3, 'inactive': 4 };
          comparison = (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5);
          break;
        case 'marks':
          comparison = (a.totalMarks || 0) - (b.totalMarks || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [exams, searchTerm, statusFilter, courseFilter, sortBy, sortOrder, availableCourses]);

  // Statistics calculations
  const stats = useMemo(() => {
    const total = exams.length;
    const active = exams.filter(e => e.status === 'active').length;
    const completed = exams.filter(e => e.status === 'completed').length;
    const missed = exams.filter(e => e.status === 'missed').length;
    const upcoming = exams.filter(e => e.status === 'upcoming').length;
    const urgent = exams.filter(e => e.isUrgent && e.status === 'active').length;

    return { total, active, completed, missed, upcoming, urgent };
  }, [exams]);

  const handleRefresh = () => {
    fetchExams(true);
  };

  const handleSort = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCourseFilter('all');
    setCurrentPage(1); // Reset to first page
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || courseFilter !== 'all';

  // Pagination helper functions
  const getPaginatedExams = () => {
    const startIndex = (currentPage - 1) * examsPerPage;
    const endIndex = startIndex + examsPerPage;
    return filteredAndSortedExams.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredAndSortedExams.length / examsPerPage);
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType: 'search' | 'status' | 'course', value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'search':
        setSearchTerm(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'course':
        setCourseFilter(value);
        break;
    }
  };

  // Handle exams per page change
  const handleExamsPerPageChange = (newExamsPerPage: number) => {
    setExamsPerPage(newExamsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Available Exams</h1>
              <p className="text-gray-600">Loading your assigned exams...</p>
            </div>
          </div>
          <CourseListSkeleton count={6} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 mb-8 shadow-2xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-20 left-1/2 w-60 h-60 bg-purple-400/20 rounded-full blur-2xl animate-bounce"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">Available Exams</h1>
                  <p className="text-blue-100 text-md">Your assigned exams and assessments</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="group bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:scale-105"
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-300`} />
                Refresh
              </button>

            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              label: 'Total Exams',
              value: stats.total,
              gradient: 'from-purple-500 via-purple-600 to-indigo-600',
              icon: FileText,
              bgPattern: 'from-purple-50 to-indigo-50'
            },
            {
              label: 'Active Exams',
              value: stats.active,
              gradient: 'from-emerald-500 via-green-600 to-teal-600',
              icon: Play,
              bgPattern: 'from-emerald-50 to-teal-50'
            },
            {
              label: 'Upcoming',
              value: stats.upcoming,
              gradient: 'from-blue-500 via-cyan-600 to-sky-600',
              icon: Clock,
              bgPattern: 'from-blue-50 to-cyan-50'
            },
            {
              label: 'Completed',
              value: stats.completed,
              gradient: 'from-violet-500 via-purple-600 to-indigo-600',
              icon: CheckCircle,
              bgPattern: 'from-violet-50 to-purple-50'
            },
            {
              label: 'Missed',
              value: stats.missed,
              gradient: 'from-rose-500 via-red-600 to-pink-600',
              icon: AlertCircle,
              bgPattern: 'from-rose-50 to-red-50'
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`group relative bg-gradient-to-br ${stat.bgPattern} rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden`}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {stat.value}
                  </p>
                  <p className={`text-xs font-semibold ${stat.changeColor}`}>
                    {stat.change}
                  </p>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <div className="flex flex-col space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Smart Filters</h3>
                  <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="group flex items-center text-sm text-gray-500 hover:text-red-600 transition-all duration-300 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
                >
                  <X className="h-4 w-4 mr-1 group-hover:rotate-90 transition-transform duration-300" />
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Enhanced Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search Input */}
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-inner"
                  placeholder="Search exams, courses..."
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                  <Filter className="h-5 w-5" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer shadow-inner"
                >
                  <option value="all">All Status</option>
                  <option value="active">🟢 Active</option>
                  <option value="upcoming">🔵 Upcoming</option>
                  <option value="completed">🟣 Completed</option>
                  <option value="missed">� Missed</option>
                </select>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Course Filter */}
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-green-600 transition-colors duration-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <select
                  value={courseFilter}
                  onChange={(e) => handleFilterChange('course', e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer shadow-inner"
                >
                  <option value="all">All Courses ({exams.length} exams)</option>
                  {availableCourses.map((course) => {
                    const courseExamCount = exams.filter(exam => exam.course?.id === course.id).length;
                    return (
                      <option key={course.id} value={course.id.toString()}>
                        📚 {course.name} ({courseExamCount} exams)
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Enhanced Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    Active filters:
                  </span>
                  {searchTerm && (
                    <span className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      🔍 "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      📊 {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {courseFilter !== 'all' && (
                    <span className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      📚 {availableCourses.find(c => c.id.toString() === courseFilter)?.name || 'Unknown'}
                      <button
                        onClick={() => setCourseFilter('all')}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Results Summary */}

          </div>
        </div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-2 border-red-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-full shadow-lg mr-4">
                  <AlertCircle className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-bold text-xl">Failed to load exams</h3>
                  <p className="text-red-600 mt-2 font-medium">{error}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  className="ml-4 bg-gradient-to-r from-red-600 to-pink-700 text-white px-6 py-3 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Retry
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Pagination Header */}
        {!loading && !error && filteredAndSortedExams.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Available Exams</h3>
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * examsPerPage) + 1} to {Math.min(currentPage * examsPerPage, filteredAndSortedExams.length)} of {filteredAndSortedExams.length} exams
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4">
                {getTotalPages() > 1 && (
                  <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                )}
                
                {/* Exams per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700">Show:</span>
                  <select
                    value={examsPerPage}
                    onChange={(e) => handleExamsPerPageChange(Number(e.target.value))}
                    className="text-sm font-semibold bg-white border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={3}>3</option>
                    <option value={6}>6</option>
                    <option value={9}>9</option>
                    <option value={12}>12</option>
                  </select>
                  <span className="text-sm font-semibold text-gray-700">per page</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Exams Display */}
        <AnimatePresence mode="wait">
          {filteredAndSortedExams.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-16"
            >
              <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl rounded-3xl p-12 max-w-lg mx-auto shadow-2xl border border-white/50">
                {/* Enhanced Empty State Icon */}
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <FileText className="h-12 w-12 text-purple-600" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm || statusFilter !== 'all' ? '🔍 No matching exams found' : '📚 No exams assigned yet'}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {searchTerm || statusFilter !== 'all'
                    ? 'Your search didn\'t return any results. Try adjusting your filters or search terms to find what you\'re looking for.'
                    : 'No exams have been assigned to you yet. Check back later or contact your instructor.'
                  }
                </p>

                {(searchTerm || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setCurrentPage(1);
                    }}
                    className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="exams-grid"
              variants={animationVariants.stagger}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
              {getPaginatedExams().map((exam, index) => (
                <motion.div
                  key={exam.exam_id}
                  variants={animationVariants.slideUp}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <ExamCard
                    exam={exam}
                    onAttempt={canAttemptExam}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Controls */}
        {!loading && !error && filteredAndSortedExams.length > 0 && getTotalPages() > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-8 pt-6 border-t border-gray-200">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600 font-medium">
              Showing {((currentPage - 1) * examsPerPage) + 1} to {Math.min(currentPage * examsPerPage, filteredAndSortedExams.length)} of {filteredAndSortedExams.length} exams
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                  currentPage === 1
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
                        className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ${
                          currentPage === page
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
                className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${
                  currentPage === getTotalPages()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:scale-105'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && filteredAndSortedExams.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-6"
          >
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Enhanced ExamCard Component
interface ExamCardProps {
  exam: Exam;
  onAttempt: (exam: Exam) => boolean;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
}

const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onAttempt,
  getStatusColor,
  getStatusIcon
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getActionButton = () => {
    if (exam.status === 'missed') {
      return (
        <div className="w-full bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-200 text-red-700 py-3 px-4 rounded-2xl font-bold flex items-center justify-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          Exam Missed
        </div>
      );
    }

    if ((exam.hasSubmitted || exam.isSubmitted) && exam.status === 'completed') {
      return (
        <div className="w-full space-y-2">
          <div className="bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-200 text-green-800 py-3 px-4 rounded-2xl font-bold flex items-center justify-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            Submitted
          </div>
          <Link
            to={`/student/exam-result/${exam.exam_id}`}
            className="block w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 text-center hover:scale-105"
          >
            <Eye className="h-4 w-4 mr-2 inline" />
            View Result
          </Link>
        </div>
      );
    }

    if (exam.actions?.primaryAction && exam.actions.primaryAction.enabled && exam.actions.canStart) {
      return (
        <Link to={`/student/exam/${exam.exam_id}`} className="block w-full">
          <button className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-3 px-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 shadow-lg">
            <Play className="h-4 w-4 mr-2" />
            {exam.actions.primaryAction.text}
          </button>
        </Link>
      );
    }

    if (onAttempt(exam)) {
      return (
        <Link to={`/student/exam/${exam.exam_id}`} className="block w-full">
          <button className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white py-3 px-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 shadow-lg">
            <Play className="h-4 w-4 mr-2" />
            Start Exam
          </button>
        </Link>
      );
    }

    if (exam.status === 'completed') {
      return (
        <Link
          to={`/student/exam-result/${exam.exam_id}`}
          className="block w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-3 px-4 rounded-2xl font-bold hover:shadow-xl transition-all duration-300 text-center hover:scale-105"
        >
          <Eye className="h-4 w-4 mr-2 inline" />
          View Result
        </Link>
      );
    }

    if (exam.status === 'upcoming') {
      return (
        <div className="w-full bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-200 text-gray-600 py-3 px-4 rounded-2xl font-bold flex items-center justify-center">
          <Clock className="h-4 w-4 mr-2" />
          Not Yet Available
        </div>
      );
    }

    return (
      <div className="w-full bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-200 text-gray-600 py-3 px-4 rounded-2xl font-bold flex items-center justify-center">
        <AlertCircle className="h-4 w-4 mr-2" />
        {exam.status || 'Unknown Status'}
      </div>
    );
  };

  // Grid view
  return (
    <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

      {/* Enhanced Header with Dynamic Gradient */}
      <div className={`relative bg-gradient-to-r ${exam.status === 'active' ? 'from-emerald-500 via-green-600 to-teal-600' :
        exam.status === 'completed' ? 'from-blue-500 via-indigo-600 to-purple-600' :
          exam.status === 'upcoming' ? 'from-orange-500 via-amber-600 to-yellow-600' :
            exam.status === 'missed' ? 'from-red-500 via-rose-600 to-pink-600' :
              'from-gray-500 via-slate-600 to-gray-600'
        } text-white p-6 rounded-2xl mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 overflow-hidden`}>

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>
          <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full -translate-x-8 -translate-y-8 group-hover:scale-200 transition-all duration-1000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-xl font-bold line-clamp-1 group-hover:text-white transition-colors duration-300">{exam.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-white/95 backdrop-blur-sm shadow-lg flex items-center space-x-1 ${exam.status === 'active' ? 'text-green-800' :
                exam.status === 'completed' ? 'text-purple-800' :
                  exam.status === 'upcoming' ? 'text-orange-800' :
                    exam.status === 'missed' ? 'text-red-800' :
                      'text-gray-800'
                }`}>
                {getStatusIcon(exam.status)}
                <span className="capitalize">{exam.status}</span>
              </span>
            </div>
          </div>

          {exam.description && (
            <p className="text-white/90 text-sm line-clamp-2 mb-3 group-hover:text-white transition-colors duration-300">{exam.description}</p>
          )}

          {exam.course && (
            <div className="flex items-center text-white/80 text-sm group-hover:text-white/90 transition-colors duration-300">
              <BookOpen className="h-4 w-4 mr-2" />
              <span className="truncate font-medium">{exam.course.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Exam Details */}
      <div className="relative z-10 space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100 group-hover:border-purple-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Start Date</p>
                <p className="text-sm font-bold text-gray-900">
                  {exam.startDateFormatted || new Date(exam.startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {exam.countdownDisplay && !exam.isExpired && (
              <div className={`mt-2 text-xs font-bold px-2 py-1 rounded-lg text-center ${exam.countdownColor === 'red' ? 'bg-red-100 text-red-700' :
                exam.countdownColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                {exam.countdownDisplay}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100 group-hover:border-blue-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Duration</p>
                <p className="text-sm font-bold text-gray-900">{exam.duration} min</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 group-hover:border-green-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Questions</p>
                <p className="text-sm font-bold text-gray-900">{exam.questionCount || exam.questionsCount || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 group-hover:border-orange-200 transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                <Award className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Total Marks</p>
                <p className="text-sm font-bold text-gray-900">{exam.totalMarks || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Action Button */}
      <div className="relative z-10 flex justify-center">
        {getActionButton()}
      </div>
    </div>
  );
};

export default AvailableExams;