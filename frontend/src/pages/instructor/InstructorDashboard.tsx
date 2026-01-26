import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FileText,
  Users,
  BarChart3,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  IndianRupee,
  Globe,
  Lock,
  TrendingUp,
  BookOpen,
  Settings,
  MoreVertical,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { colors, animationVariants } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { Icon } from '@mui/material';

// Types for dashboard data
interface Course {
  id: number;
  name: string;
  description?: string;
  visibility: 'PRIVATE' | 'PUBLIC';
  pricing: 'FREE' | 'PAID';
  price?: number;
  enrollmentCount?: number;
  allowedEmailsCount?: number;
  examCount?: number;
  instructor?: {
    id: number;
    username: string;
    fullName: string;
  };
}

interface Exam {
  id: number;
  title: string;
  date: string;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  duration: number;
  students: number;
  studentCount?: number;
  status: string;
  questionCount?: number;
  totalMarks?: number;
  averageScore?: number | null;
  timeRemaining?: string;
  isExpired?: boolean;
  course?: {
    id: number;
    name: string;
  };
}

interface Stats {
  totalExams: number;
  totalStudents: number;
  averageScore: number;
  completionRate: number;
  totalCourses?: number;
  totalEnrollments?: number;
  totalRevenue?: number;
}

interface DashboardData {
  myExams: Exam[];
  myCourses?: Course[];
  stats: Stats;
}

const InstructorDashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    myExams: [],
    myCourses: [],
    stats: {
      totalExams: 0,
      totalStudents: 0,
      averageScore: 0,
      completionRate: 0
    },
  });
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const location = useLocation();

  // Filter states
  const [visibilityFilter, setVisibilityFilter] = useState<'ALL' | 'PRIVATE' | 'PUBLIC'>('ALL');
  const [pricingFilter, setPricingFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(6);

  useEffect(() => {
    fetchDashboardData();
    fetchCourses();
  }, []);

  // Add effect to refresh data when navigating back to dashboard
  useEffect(() => {
    // Refresh data whenever the location changes to this dashboard
    if (location.pathname === '/instructor') {
      console.log('Dashboard location changed, refreshing data...');
      fetchCourses();
      fetchDashboardData();
    }
  }, [location.pathname]);

  // Add effect to refresh data when component becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible, refresh data
        console.log('Page became visible, refreshing courses...');
        fetchCourses();
      }
    };

    const handleFocus = () => {
      // Window gained focus, refresh data
      console.log('Window gained focus, refreshing courses...');
      fetchCourses();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats and instructor exams in parallel
      const [dashboardStats, instructorExams] = await Promise.all([
        apiService.getDashboardData().catch(() => null),
        apiService.getInstructorExams().catch(() => [])
      ]);

      console.log('Dashboard API response:', dashboardStats);
      console.log('Instructor exams response:', instructorExams);

      // Calculate total exams from actual exams data
      const totalExams = Array.isArray(instructorExams) ? instructorExams.length : 0;

      // Merge dashboard stats with calculated exam count
      const stats = {
        totalExams: totalExams,
        totalStudents: dashboardStats?.stats?.totalStudents || 0,
        averageScore: dashboardStats?.stats?.averageScore || 0,
        completionRate: dashboardStats?.stats?.completionRate || 0,
        totalCourses: dashboardStats?.stats?.totalCourses || 0,
        totalEnrollments: dashboardStats?.stats?.totalEnrollments || 0,
        totalRevenue: dashboardStats?.stats?.totalRevenue || 0
      };

      setDashboardData(prev => ({
        ...prev,
        myExams: Array.isArray(instructorExams) ? instructorExams : [],
        stats: stats
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data. Please check your connection.');
      // Set empty data instead of mock data to see the real issue
      setDashboardData(prev => ({
        ...prev,
        myExams: [],
        stats: {
          totalExams: 0,
          totalStudents: 0,
          averageScore: 0,
          completionRate: 0,
          totalCourses: 0,
          totalEnrollments: 0,
          totalRevenue: 0
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      const courses = await apiService.getCoursesForInstructor();
      console.log('Courses API response:', courses);

      // Process courses - use actual data from backend
      const processedCourses = Array.isArray(courses) ? courses.map((course: any) => ({
        ...course,
        enrollmentCount: course.enrollmentCount || 0,
        examCount: course.examCount || 0
      })) : [];

      setDashboardData(prev => ({
        ...prev,
        myCourses: processedCourses
      }));
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      toast.error('Failed to load courses. Please check your connection.');
      // Set empty array instead of keeping old data
      setDashboardData(prev => ({
        ...prev,
        myCourses: []
      }));
    } finally {
      setCoursesLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Courses',
      value: (dashboardData.stats?.totalCourses ?? dashboardData.myCourses?.length ?? 0).toString(),
      icon: BookOpen,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      name: 'Total Exams',
      value: (dashboardData.stats?.totalExams ?? 0).toString(),
      icon: FileText,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Total Enrollments',
      value: (dashboardData.stats?.totalEnrollments ?? 0).toString(),
      icon: Users,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      name: 'Revenue',
      value: `₹${(dashboardData.stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`,
      icon: IndianRupee,
      color: 'from-green-500 to-green-600'
    }
  ];
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

  const handleCourseEdit = (courseId: number) => {
    // Navigate to course edit page
    window.location.href = `/instructor/edit-course/${courseId}`;
  };

  // Filter courses based on selected filters
  const getFilteredCourses = () => {
    if (!dashboardData.myCourses) return [];

    return dashboardData.myCourses.filter(course => {
      const visibilityMatch = visibilityFilter === 'ALL' || course.visibility === visibilityFilter;
      const pricingMatch = pricingFilter === 'ALL' || course.pricing === pricingFilter;
      return visibilityMatch && pricingMatch;
    });
  };

  // Pagination calculations
  const filteredCourses = getFilteredCourses();
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const endIndex = startIndex + coursesPerPage;
  const currentCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to first page when filters or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [visibilityFilter, pricingFilter, coursesPerPage]);

  const handleCourseDelete = async (courseId: number) => {
    const course = dashboardData.myCourses?.find(c => c.id === courseId);
    const courseName = course?.name || 'this course';

    if (window.confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone and will remove all associated exams and enrollments.`)) {
      try {
        const loadingToast = toast.loading('Deleting course...');
        await apiService.deleteCourse(courseId);
        toast.success('Course deleted successfully!', { id: loadingToast });
        fetchCourses(); // Refresh courses
      } catch (error: any) {
        let errorMessage = 'Failed to delete course';

        // Handle different error response formats
        if (error?.response?.data) {
          const errorData = error.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData?.error) {
            const backendError = errorData.error;

            // Handle specific error cases with user-friendly messages
            if (backendError.includes('has exams')) {
              errorMessage = `Cannot delete "${courseName}" because it contains exams. Please delete all exams first.`;
            } else if (backendError.includes('has student enrollments')) {
              errorMessage = `Cannot delete "${courseName}" because students are enrolled. Please remove all enrollments first.`;
            } else if (backendError.includes('existing dependencies')) {
              errorMessage = `Cannot delete "${courseName}" due to existing dependencies. Please ensure all related exams and enrollments are removed first.`;
            } else if (backendError.includes('Data Integrity Violation')) {
              errorMessage = `Cannot delete "${courseName}" because it has associated data. Please remove all exams and enrollments first.`;
            } else {
              errorMessage = backendError;
            }
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } else if (error?.error) {
          errorMessage = error.error;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        toast.error(errorMessage, { duration: 8000 });
        console.error('Course deletion error:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600">Manage your exams and track student performance</p>
          </div>
          <div className="flex gap-4">
            <Link
              to="/instructor/create-exam"
              className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Exam
            </Link>
            <Link
              to="/instructor/create-course"
              className="bg-gradient-to-r from-cyan-600 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Course
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-6 shadow-xl border-2 transform hover:scale-105 transition-all duration-300 ${index === 0 ? 'bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200' :
                index === 1 ? 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200' :
                  index === 2 ? 'bg-gradient-to-br from-cyan-50 to-teal-100 border-cyan-200' :
                    'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200'
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

        {/* Course Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-8 shadow-xl border border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1 rounded-full mb-6"></div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl mr-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                My Courses
              </h3>
              <div className="flex items-center space-x-3">
                {totalPages > 1 && (
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-200">
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Visibility:</span>
                <div className="flex space-x-1">
                  {(['ALL', 'PRIVATE', 'PUBLIC'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setVisibilityFilter(filter)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${visibilityFilter === filter
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-600 hover:bg-indigo-50 border border-indigo-200 hover:border-indigo-300'
                        }`}
                    >
                      {filter === 'ALL' ? 'All' : filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Pricing:</span>
                <div className="flex space-x-1">
                  {(['ALL', 'FREE', 'PAID'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setPricingFilter(filter)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-300 ${pricingFilter === filter
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-600 hover:bg-green-50 border border-green-200 hover:border-green-300'
                        }`}
                    >
                      {filter === 'ALL' ? 'All' : filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Per Page Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <select
                  value={coursesPerPage}
                  onChange={(e) => setCoursesPerPage(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 hover:border-indigo-300"
                >
                  <option value={3}>3 per page</option>
                  <option value={6}>6 per page</option>
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={18}>18 per page</option>
                  <option value={24}>24 per page</option>
                </select>
              </div>

              {/* Clear Filters */}
              {(visibilityFilter !== 'ALL' || pricingFilter !== 'ALL') && (
                <button
                  onClick={() => {
                    setVisibilityFilter('ALL');
                    setPricingFilter('ALL');
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 underline font-medium bg-white/70 px-2 py-1 rounded-full"
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
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {currentCourses.map((course, index) => {
                      const VisibilityIcon = getVisibilityIcon(course.visibility);
                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <div className="h-full bg-gradient-to-br from-white via-gray-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-indigo-100 hover:shadow-2xl hover:border-indigo-200 transition-all duration-300 transform hover:scale-105">
                            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-1 rounded-t-2xl"></div>
                            <div className="p-6">
                              {/* Course Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                    {course.name}
                                  </h4>
                                  {course.description && (
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                      {course.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  <button
                                    onClick={() => handleCourseEdit(course.id)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCourseDelete(course.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Status Badges */}
                              <div className="flex items-center space-x-2 mb-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVisibilityColor(course.visibility)}`}>
                                  <VisibilityIcon className="h-3 w-3 mr-1" />
                                  {course.visibility}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPricingColor(course.pricing)}`}>
                                  {course.pricing === 'PAID' && <IndianRupee className="h-3 w-3 mr-1" />}
                                  {course.pricing === 'PAID' ? `${course.price}` : 'FREE'}
                                </span>
                              </div>

                              {/* Statistics */}
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="text-center p-3 bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl border border-cyan-200 shadow-sm">
                                  <div className="flex items-center justify-center mb-1">
                                    <Users className="h-4 w-4 text-cyan-600 mr-1" />
                                    <span className="text-lg font-bold text-gray-900">
                                      {course.visibility === 'PRIVATE'
                                        ? (course.enrollmentCount || 0)
                                        : (course.enrollmentCount || 0)
                                      }
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-700">
                                    {course.visibility === 'PRIVATE' ? 'Enrolled' : 'Students'}
                                  </p>
                                  {/* Show allowed count for private courses */}
                                  {course.visibility === 'PRIVATE' && course.allowedEmailsCount !== undefined && (
                                    <p className="text-xs text-gray-600 mt-1 flex items-center justify-center">
                                      <span>of {course.allowedEmailsCount} allowed</span>
                                    </p>
                                  )}
                                </div>
                                <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl border border-purple-200 shadow-sm">
                                  <div className="flex items-center justify-center mb-1">
                                    <FileText className="h-4 w-4 text-purple-600 mr-1" />
                                    <span className="text-lg font-bold text-gray-900">
                                      {course.examCount || 0}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-gray-700">Exams</p>
                                </div>
                              </div>

                              {/* Revenue for Paid Courses */}
                              {course.pricing === 'PAID' && course.price && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 mb-4 border border-green-200 shadow-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-green-800 flex items-center">
                                      <IndianRupee className="h-4 w-4 mr-1" />
                                      Total Revenue
                                    </span>
                                    <span className="text-lg font-bold text-green-900">
                                      ₹{((course.enrollmentCount || 0) * course.price).toLocaleString('en-IN')}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Quick Actions */}
                              <div className="flex space-x-2">
                                <Link
                                  to={`/instructor/course/${course.id}`}
                                  className="flex-1"
                                >
                                  <button className="w-full bg-white border-2 border-indigo-200 text-indigo-700 py-2 px-3 rounded-xl font-semibold hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 flex items-center justify-center text-sm transform hover:scale-105">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Details
                                  </button>
                                </Link>
                                <Link
                                  to={`/instructor/create-exam?courseId=${course.id}`}
                                  className="flex-1"
                                >
                                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center text-sm transform hover:scale-105">
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Exam
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {filteredCourses.length > 0 && totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/40 shadow-sm">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                      <span className="font-semibold">{Math.min(endIndex, filteredCourses.length)}</span> of{' '}
                      <span className="font-semibold">{filteredCourses.length}</span> courses
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </button>

                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          // Show first page, last page, current page, and pages around current page
                          const showPage = page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!showPage) {
                            // Show ellipsis for gaps
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return (
                                <span key={page} className="px-2 py-1 text-gray-500">
                                  ...
                                </span>
                              );
                            }
                            return null;
                          }

                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${currentPage === page
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-indigo-50 hover:border-indigo-300'
                                }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Empty State */}
            {!coursesLoading && filteredCourses.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12"
              >
                <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                {(!dashboardData.myCourses || dashboardData.myCourses.length === 0) ? (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h4>
                    <p className="text-gray-600 mb-6">Create your first course to get started</p>
                    <Link to="/instructor/create-course">
                      <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center transform hover:scale-105">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Your First Course
                      </button>
                    </Link>
                  </>
                ) : (
                  <>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No courses match your filters</h4>
                    <p className="text-gray-600 mb-6">
                      Try adjusting your filters or{' '}
                      <button
                        onClick={() => {
                          setVisibilityFilter('ALL');
                          setPricingFilter('ALL');
                        }}
                        className="text-indigo-600 hover:text-indigo-700 underline"
                      >
                        clear all filters
                      </button>
                    </p>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};
export default InstructorDashboard;