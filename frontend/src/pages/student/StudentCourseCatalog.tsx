import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  TextField,
  InputAdornment,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Clear as ClearIcon,
  CheckCircle,
  Public as Globe,
  Quiz as QuizIcon,
  Visibility as VisibilityIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { CourseListSkeleton } from '../../components/ui/LoadingStates';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { colors, animationVariants } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';

interface PublicCourse {
  id: number;
  name: string;
  description?: string;
  visibility: 'PUBLIC';
  pricing: 'FREE' | 'PAID';
  price?: number;
  instructor: {
    id: number;
    username: string;
    fullName: string;
  };
  enrollmentCount: number;
  examCount?: number;
  isEnrolled?: boolean;
}

const StudentCourseCatalog: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'ALL' | 'ENROLLED' | 'NOT_ENROLLED'>('ALL');
  const [sortBy, setSortBy] = useState<'price' | 'enrollments'>('price');
  const [error, setError] = useState<string>('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null);
  const [courseDetailsModalOpen, setCourseDetailsModalOpen] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<PublicCourse | null>(null);
  const [courseExams, setCourseExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage, setCoursesPerPage] = useState(6); // Show 6 courses per page

  // Fetch public courses and enrolled courses
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch both public courses and enrolled courses
      const [publicCoursesResponse, enrolledCoursesResponse] = await Promise.all([
        apiService.getPublicCourses(),
        apiService.getEnrolledCourses().catch(() => []) // Don't fail if enrolled courses can't be fetched
      ]);

      const publicCourses = publicCoursesResponse as unknown as PublicCourse[];
      const enrolledCourses = Array.isArray(enrolledCoursesResponse) ? enrolledCoursesResponse : [];

      // Create a set of enrolled course IDs for quick lookup
      const enrolledCourseIds = new Set(enrolledCourses.map((course: any) => course.id));
      setEnrolledCourses(Array.from(enrolledCourseIds));

      // Mark courses as enrolled
      const coursesWithEnrollmentStatus = publicCourses.map(course => ({
        ...course,
        isEnrolled: enrolledCourseIds.has(course.id)
      }));

      setCourses(coursesWithEnrollmentStatus);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch courses';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    let filtered = courses;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query) ||
        course.instructor.fullName.toLowerCase().includes(query) ||
        course.instructor.username.toLowerCase().includes(query)
      );
    }

    // Apply price filter
    if (priceFilter !== 'ALL') {
      filtered = filtered.filter(course => course.pricing === priceFilter);
    }

    // Apply enrollment filter
    if (enrollmentFilter !== 'ALL') {
      filtered = filtered.filter(course =>
        enrollmentFilter === 'ENROLLED' ? course.isEnrolled : !course.isEnrolled
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          const priceA = a.pricing === 'FREE' ? 0 : (a.price || 0);
          const priceB = b.pricing === 'FREE' ? 0 : (b.price || 0);
          return priceA - priceB;
        case 'enrollments':
          return b.enrollmentCount - a.enrollmentCount;
        default:
          return 0;
      }
    });

    return filtered;
  }, [courses, searchQuery, priceFilter, enrollmentFilter, sortBy]);

  // Pagination helper functions
  const getPaginatedCourses = () => {
    const startIndex = (currentPage - 1) * coursesPerPage;
    const endIndex = startIndex + coursesPerPage;
    return filteredAndSortedCourses.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredAndSortedCourses.length / coursesPerPage);
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType: 'search' | 'price' | 'enrollment' | 'sort', value: string) => {
    setCurrentPage(1);
    switch (filterType) {
      case 'search':
        setSearchQuery(value);
        break;
      case 'price':
        setPriceFilter(value as 'ALL' | 'FREE' | 'PAID');
        break;
      case 'enrollment':
        setEnrollmentFilter(value as 'ALL' | 'ENROLLED' | 'NOT_ENROLLED');
        break;
      case 'sort':
        setSortBy(value as 'price' | 'enrollments');
        break;
    }
  };

  // Handle courses per page change
  const handleCoursesPerPageChange = (newCoursesPerPage: number) => {
    setCoursesPerPage(newCoursesPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const handleEnrollment = async (courseId: number) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Enrolling in course...');

      await apiService.enrollInCourse(courseId);

      // Dismiss loading and show success
      toast.dismiss(loadingToast);
      toast.success('Successfully enrolled in course!');

      // Update local state
      setCourses(prev => prev.map(course =>
        course.id === courseId
          ? {
            ...course,
            enrollmentCount: course.enrollmentCount + 1,
            isEnrolled: true
          }
          : course
      ));

      setEnrolledCourses(prev => [...prev, courseId]);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to enroll in course';
      toast.error(errorMessage);
    }
  };

  const handlePurchase = (courseId: number) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = (courseId: number) => {
    // Update local state
    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? {
          ...course,
          enrollmentCount: course.enrollmentCount + 1,
          isEnrolled: true
        }
        : course
    ));

    setEnrolledCourses(prev => [...prev, courseId]);
  };

  const handleViewDetails = async (course: PublicCourse) => {
    setSelectedCourseForDetails(course);
    setCourseDetailsModalOpen(true);
    setLoadingExams(true);

    try {
      // Fetch exams for this course
      const exams = await apiService.getExamsByCourse(course.id);
      setCourseExams(exams || []);
    } catch (error) {
      console.error('Failed to fetch course exams:', error);
      setCourseExams([]);
    } finally {
      setLoadingExams(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setPriceFilter('ALL');
    setEnrollmentFilter('ALL');
    setSortBy('price');
    setCurrentPage(1); // Reset to first page
  };

  const hasActiveFilters = searchQuery.trim() !== '' || priceFilter !== 'ALL' || enrollmentFilter !== 'ALL' || sortBy !== 'price';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Hero Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-10 left-1/2 w-30 h-30 bg-purple-400/20 rounded-full blur-xl animate-bounce"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <SchoolIcon className="text-white text-2xl" />
              </div>
              <Typography
                variant="h4"
                component="h1"
                className="text-white font-bold"
              >
                Course Catalog
              </Typography>
            </div>
            <Typography
              variant="body1"
              className="text-blue-100 max-w-2xl leading-relaxed mb-4"
            >
              Discover and enroll in courses from expert instructors. Track your learning progress and access course materials.
            </Typography>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              label: 'Total Courses',
              value: courses.length,
              gradient: 'from-purple-500 via-purple-600 to-indigo-600',
              icon: SchoolIcon,
              bgPattern: 'from-purple-50 to-indigo-50',
              change: 'Available',
              changeColor: 'text-purple-600'
            },
            {
              label: 'Free Courses',
              value: courses.filter(c => c.pricing === 'FREE').length,
              gradient: 'from-emerald-500 via-green-600 to-teal-600',
              icon: SchoolIcon,
              bgPattern: 'from-emerald-50 to-teal-50',
              change: 'No Cost',
              changeColor: 'text-green-600'
            },
            {
              label: 'Premium Courses',
              value: courses.filter(c => c.pricing === 'PAID').length,
              gradient: 'from-red-500 via-pink-600 to-rose-600',
              icon: MoneyIcon,
              bgPattern: 'from-red-50 to-pink-50',
              change: 'Premium',
              changeColor: 'text-red-600'
            },
            {
              label: 'My Enrollments',
              value: enrolledCourses.length,
              gradient: 'from-blue-500 via-cyan-600 to-sky-600',
              icon: CheckCircle,
              bgPattern: 'from-blue-50 to-cyan-50',
              change: 'Enrolled',
              changeColor: 'text-blue-600'
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

        {/* Enhanced Search and Filter Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
          <div className="flex flex-col space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <FilterIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <Typography variant="h6" className="font-bold text-gray-900">Smart Filters</Typography>
                  <Typography variant="body2" className="text-gray-600">Find your perfect course</Typography>
                </div>
              </div>
            </div>

            {/* Enhanced Filter Controls */}
            <Grid container spacing={4}>
              {/* Search Field */}
              <Grid item xs={12} md={3}>
                <div className="relative group">
                  <TextField
                    fullWidth
                    placeholder="Search courses, instructors..."
                    value={searchQuery}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon className="text-purple-500 group-focus-within:text-purple-600 transition-colors duration-300" />
                          </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ClearIcon
                                className="text-gray-400 cursor-pointer hover:text-gray-600"
                                onClick={() => setSearchQuery('')}
                              />
                            </motion.div>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '16px',
                        border: '2px solid #e5e7eb',
                        '&:hover': {
                          borderColor: '#a855f7',
                        },
                        '&.Mui-focused': {
                          borderColor: '#a855f7',
                          boxShadow: '0 0 0 4px rgba(168, 85, 247, 0.1)',
                        },
                      },
                    }}
                  />
                </div>
              </Grid>

              {/* Price Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Price</InputLabel>
                  <Select
                    value={priceFilter}
                    label="Price"
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    startAdornment={<FilterIcon className="mr-2 text-blue-500" />}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '2px solid #e5e7eb',
                      '&:hover': {
                        borderColor: '#3b82f6',
                      },
                      '&.Mui-focused': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.1)',
                      },
                    }}
                  >
                    <MenuItem value="ALL">All ({courses.length})</MenuItem>
                    <MenuItem value="FREE">💚 Free ({courses.filter(c => c.pricing === 'FREE').length})</MenuItem>
                    <MenuItem value="PAID">💰 Paid ({courses.filter(c => c.pricing === 'PAID').length})</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Enrollment Filter */}
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Enrollment</InputLabel>
                  <Select
                    value={enrollmentFilter}
                    label="Enrollment"
                    onChange={(e) => handleFilterChange('enrollment', e.target.value)}
                    startAdornment={<CheckCircle className="mr-2 text-green-500" />}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      borderRadius: '16px',
                      border: '2px solid #e5e7eb',
                      '&:hover': {
                        borderColor: '#10b981',
                      },
                      '&.Mui-focused': {
                        borderColor: '#10b981',
                        boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)',
                      },
                    }}
                  >
                    <MenuItem value="ALL">📚 All Courses</MenuItem>
                    <MenuItem value="ENROLLED">✅ Enrolled ({enrolledCourses.length})</MenuItem>
                    <MenuItem value="NOT_ENROLLED">🔍 Available ({courses.filter(c => !c.isEnrolled).length})</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Clear Filters */}
              <Grid item xs={12} md={3}>
                <ModernButton
                  variant="outlined"
                  fullWidth
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="h-14"
                >
                  Clear Filters
                </ModernButton>
              </Grid>
            </Grid>

            {/* Enhanced Active Filters Display */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-gray-700 flex items-center">
                      <FilterIcon className="h-4 w-4 mr-1" />
                      Active filters:
                    </span>
                    {searchQuery && (
                      <Chip
                        label={`🔍 "${searchQuery}"`}
                        onDelete={() => setSearchQuery('')}
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        deleteIcon={<ClearIcon className="text-white" />}
                      />
                    )}
                    {priceFilter !== 'ALL' && (
                      <Chip
                        label={`₹ ${priceFilter}`}
                        onDelete={() => setPriceFilter('ALL')}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        deleteIcon={<ClearIcon className="text-white" />}
                      />
                    )}
                    {enrollmentFilter !== 'ALL' && (
                      <Chip
                        label={`📊 ${enrollmentFilter.replace('_', ' ')}`}
                        onDelete={() => setEnrollmentFilter('ALL')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        deleteIcon={<ClearIcon className="text-white" />}
                      />
                    )}
                    {sortBy !== 'price' && (
                      <Chip
                        label={`📊 Sort: ${sortBy}`}
                        onDelete={() => handleFilterChange('sort', 'price')}
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        deleteIcon={<ClearIcon className="text-white" />}
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Enhanced Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl p-8 shadow-2xl border-2 border-red-200">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 p-4 rounded-full shadow-lg mr-4">
                  <SearchIcon className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <Typography variant="h6" className="text-red-800 font-bold mb-2">
                    Failed to load courses
                  </Typography>
                  <Typography variant="body2" className="text-red-600 font-medium">
                    {error}
                  </Typography>
                </div>
                <ModernButton
                  variant="gradient"
                  onClick={fetchData}
                  className="ml-4 bg-gradient-to-r from-red-600 to-pink-700 text-white hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Retry
                </ModernButton>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CourseListSkeleton count={6} />
          </motion.div>
        )}

        {/* Pagination Header */}
        {!loading && !error && filteredAndSortedCourses.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <SchoolIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Browse Courses</h3>
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * coursesPerPage) + 1} to {Math.min(currentPage * coursesPerPage, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} courses
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
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
              </div>
            </div>
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            {filteredAndSortedCourses.length === 0 ? (
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
                      <SchoolIcon className="h-12 w-12 text-purple-600" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  </div>

                  <Typography variant="h5" className="text-2xl font-bold text-gray-900 mb-3">
                    {hasActiveFilters ? '🔍 No matching courses found' : '📚 No courses available'}
                  </Typography>
                  <Typography variant="body1" className="text-gray-600 mb-8 leading-relaxed">
                    {hasActiveFilters
                      ? 'Your search didn\'t return any results. Try adjusting your filters or search terms to find what you\'re looking for.'
                      : 'No public courses are available at the moment. Check back later for new courses.'}
                  </Typography>
                  {hasActiveFilters && (
                    <ModernButton
                      variant="gradient"
                      onClick={clearFilters}
                      className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    >
                      Clear All Filters
                    </ModernButton>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="course-grid"
                variants={animationVariants.stagger}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Grid container spacing={4}>
                  {getPaginatedCourses().map((course, index) => (
                    <Grid item xs={12} sm={6} lg={4} key={course.id}>
                      <motion.div
                        variants={animationVariants.slideUp}
                        transition={{ delay: index * 0.1 }}
                        className="h-full"
                      >
                        <StudentCourseCard
                          course={course}
                          onEnroll={handleEnrollment}
                          onPurchase={handlePurchase}
                          onViewDetails={handleViewDetails}
                          navigate={navigate}
                        />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Pagination Controls */}
        {!loading && !error && filteredAndSortedCourses.length > 0 && getTotalPages() > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 mt-8 pt-6 border-t border-gray-200">
            {/* Pagination Info */}
            <div className="text-sm text-gray-600 font-medium">
              Showing {((currentPage - 1) * coursesPerPage) + 1} to {Math.min(currentPage * coursesPerPage, filteredAndSortedCourses.length)} of {filteredAndSortedCourses.length} courses
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

        {/* Results Summary */}
        {!loading && !error && filteredAndSortedCourses.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center"
          >
          </motion.div>
        )}

        {/* Payment Modal */}
        {selectedCourse && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onClose={() => {
              setPaymentModalOpen(false);
              setSelectedCourse(null);
            }}
            course={{
              id: selectedCourse.id,
              name: selectedCourse.name,
              description: selectedCourse.description,
              price: selectedCourse.price || 0,
              instructor: {
                fullName: selectedCourse.instructor.fullName,
              },
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* Course Details Modal - Scrollable Design for 80% Zoom */}
        <Dialog
          open={courseDetailsModalOpen}
          onClose={() => setCourseDetailsModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: '16px',
              maxHeight: '90vh',
              minHeight: '70vh',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }
          }}
        >
          {selectedCourseForDetails && (
            <>
              {/* Fixed Header Section */}
              <div className={`flex-shrink-0 px-6 py-6 text-white ${selectedCourseForDetails.pricing === 'PAID'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600'
                : 'bg-gradient-to-r from-emerald-600 to-teal-600'
                }`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedCourseForDetails.name}</h2>
                    <div className="flex items-center mb-4">
                      <PersonIcon className="w-5 h-5 mr-2" />
                      <div>
                        <p className="font-semibold">{selectedCourseForDetails.instructor.fullName}</p>
                        <p className="text-sm opacity-90">Course Instructor</p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex space-x-6">
                      <div className="flex items-center">
                        <SchoolIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">{selectedCourseForDetails.enrollmentCount} Students</span>
                      </div>
                      <div className="flex items-center">
                        <QuizIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm">{courseExams.length} Exams</span>
                      </div>
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 mr-1" />
                        <span className="text-sm">Public</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <span className="text-xl font-bold">
                        {selectedCourseForDetails.pricing === 'FREE' ? 'FREE' : `₹${selectedCourseForDetails.price}`}
                      </span>
                    </div>
                    {selectedCourseForDetails.isEnrolled && (
                      <div className="bg-green-500 px-3 py-1 rounded-full flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm font-semibold">Enrolled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scrollable Content Section */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                <div className="p-6 space-y-6">
                  {/* Description */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-white text-sm">📖</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Course Description</h3>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {selectedCourseForDetails.description || 'This course provides comprehensive learning materials and practical exercises to help you master the subject matter. Join thousands of students who have already benefited from this expertly crafted curriculum.'}
                    </p>
                  </div>

                  {/* Assessments Section */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                        <QuizIcon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Course Assessments</h3>
                    </div>

                    {loadingExams ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-4 border-indigo-500 border-t-transparent mr-3"></div>
                        <span className="text-gray-600">Loading assessments...</span>
                      </div>
                    ) : courseExams.length > 0 ? (
                      <div className="space-y-3">
                        {courseExams.map((exam: any, index: number) => (
                          <div key={exam.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                                  <QuizIcon className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">
                                    {exam.title || `Assessment ${index + 1}`}
                                  </h4>
                                  <p className="text-sm text-gray-600">Course Examination</p>
                                  {exam.description && (
                                    <p className="text-sm text-gray-700 mt-1">{exam.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                {selectedCourseForDetails.isEnrolled ? (
                                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                    ✅ Available
                                  </span>
                                ) : (
                                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                                    🔒 Enroll to Access
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <QuizIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">No Assessments Yet</h4>
                        <p className="text-gray-500">The instructor hasn't added any exams to this course yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Additional spacing at bottom for better scrolling */}
                  <div className="h-4"></div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    {selectedCourseForDetails.isEnrolled
                      ? 'You are enrolled in this course'
                      : `Join ${selectedCourseForDetails.enrollmentCount} other students`}
                  </p>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setCourseDetailsModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>

                    {!selectedCourseForDetails.isEnrolled && (
                      <button
                        onClick={() => {
                          setCourseDetailsModalOpen(false);
                          if (selectedCourseForDetails.pricing === 'FREE') {
                            handleEnrollment(selectedCourseForDetails.id);
                          } else {
                            handlePurchase(selectedCourseForDetails.id);
                          }
                        }}
                        className={`px-6 py-2 rounded-lg text-white font-semibold transition-colors ${selectedCourseForDetails.pricing === 'FREE'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                      >
                        {selectedCourseForDetails.pricing === 'FREE' ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2 inline" />
                            Enroll Now - Free
                          </>
                        ) : (
                          <>
                            <MoneyIcon className="w-4 h-4 mr-2 inline" />
                            Purchase for ₹{selectedCourseForDetails.price}
                          </>
                        )}
                      </button>
                    )}

                    {selectedCourseForDetails.isEnrolled && (
                      <button
                        onClick={() => {
                          setCourseDetailsModalOpen(false);
                          navigate(`/student/course/${selectedCourseForDetails.id}`);
                        }}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
                      >
                        <VisibilityIcon className="w-4 h-4 mr-2 inline" />
                        View Course Content
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

// Student Course Card Component with Enrollment Status
const StudentCourseCard: React.FC<{
  course: PublicCourse;
  onEnroll: (courseId: number) => void;
  onPurchase: (courseId: number) => void;
  onViewDetails: (course: PublicCourse) => void;
  navigate: (path: string) => void;
}> = ({ course, onEnroll, onPurchase, onViewDetails, navigate }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAction = () => {
    if (course.isEnrolled) {
      // Navigate to course details page
      navigate(`/student/course/${course.id}`);
      return;
    }

    if (course.pricing === 'FREE') {
      onEnroll(course.id);
    } else {
      onPurchase(course.id);
    }
  };

  const getActionButtonText = () => {
    if (course.isEnrolled) return 'View Course';
    return course.pricing === 'FREE' ? 'Enroll Now' : 'Purchase Course';
  };

  return (
    <motion.div
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="h-full relative group">
        {/* Enhanced Border Effect Container */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-full h-full bg-white rounded-3xl"></div>
        </div>

        {/* Main Card with Enhanced Borders */}
        <ModernCard
          variant="glass"
          className="h-full overflow-hidden relative z-10 border-2 border-gray-200/50 group-hover:border-transparent transition-all duration-500 shadow-lg group-hover:shadow-2xl"
          hover={false}
        >
          {/* Enhanced Course Header with Dynamic Gradient */}
          <div className={`relative h-48 bg-gradient-to-r ${course.pricing === 'FREE'
            ? 'from-emerald-500 via-green-600 to-teal-600'
            : 'from-red-500 via-pink-600 to-rose-600'
            } overflow-hidden rounded-t-3xl`}>
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>
              <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full -translate-x-8 -translate-y-8 group-hover:scale-200 transition-all duration-1000"></div>
            </div>

            {/* Enrollment Status Badge */}
            {course.isEnrolled && (
              <motion.div
                className="absolute top-4 left-4 z-10"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <div className="bg-emerald-500 text-white px-3 py-1.5 rounded-full flex items-center shadow-lg backdrop-blur-sm">
                  <CheckCircle className="w-4 h-4 mr-1.5" />
                  <span className="text-sm font-semibold">Enrolled</span>
                </div>
              </motion.div>
            )}

            {/* Enhanced Price Badge */}
            <motion.div
              className="absolute top-4 right-4 z-10"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <div className={`px-4 py-2 rounded-xl font-bold shadow-lg backdrop-blur-sm ${course.pricing === 'FREE'
                ? 'bg-white/95 text-green-800 border-2 border-green-300'
                : 'bg-white/95 text-red-800 border-2 border-red-300'
                }`}>
                {course.pricing === 'FREE' ? (
                  <span className="flex items-center">
                    Free
                  </span>
                ) : (
                  <span className="flex items-center">
                    ₹ {course.price}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Enhanced Course Title Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent">
              <Typography
                variant="h6"
                className="text-white font-bold mb-2 line-clamp-2 group-hover:text-white transition-colors duration-300"
              >
                {course.name}
              </Typography>
              <div className="flex items-center text-white/80 text-sm">
                <PersonIcon className="h-4 w-4 mr-1" />
                <span className="truncate font-medium">{course.instructor.fullName}</span>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-6 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50/30 rounded-b-3xl border-t border-gray-100/50">
            {/* Description */}
            {course.description && (
              <Typography
                variant="body2"
                className="text-gray-600 mb-4 line-clamp-3 flex-1"
              >
                {course.description}
              </Typography>
            )}

            {/* Instructor Info */}
            <div className="flex items-center mb-4">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3"
                whileHover={{ scale: 1.1 }}
              >
                <PersonIcon className="text-white text-sm" />
              </motion.div>
              <div className="flex-1">
                <Typography variant="subtitle2" className="font-semibold text-gray-900">
                  {course.instructor.fullName}
                </Typography>
                <Typography variant="caption" className="text-gray-500">
                  Instructor
                </Typography>
              </div>
            </div>

            {/* Enhanced Course Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-3 border border-blue-100 group-hover:border-blue-200 transition-colors duration-300">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <SchoolIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-blue-600 font-semibold block">
                      Students
                    </Typography>
                    <Typography variant="body2" className="font-bold text-blue-900">
                      {course.enrollmentCount}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-3 border border-purple-100 group-hover:border-purple-200 transition-colors duration-300">
                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg">
                    <QuizIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <Typography variant="caption" className="text-purple-600 font-semibold block">
                      Exams
                    </Typography>
                    <Typography variant="body2" className="font-bold text-purple-900">
                      {course.examCount || 0}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="space-y-3">
              {/* View Details Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onViewDetails(course)}
                  className="w-full bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 hover:border-gray-400 text-gray-700 py-3 px-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-105 relative overflow-hidden group/btn"
                >
                  <VisibilityIcon className="w-4 h-4 mr-2" />
                  View Details
                  {/* Button Border Highlight */}
                  <div className="absolute inset-0 border border-white/50 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                </button>
              </motion.div>

              {/* Primary Action Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={handleAction}
                  className={`w-full py-3 px-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 shadow-lg relative overflow-hidden group/btn border-2 ${course.isEnrolled
                    ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white border-purple-400/50 hover:border-purple-300'
                    : course.pricing === 'FREE'
                      ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white border-emerald-400/50 hover:border-emerald-300'
                      : 'bg-gradient-to-r from-red-600 via-pink-600 to-rose-600 text-white border-red-400/50 hover:border-red-300'
                    }`}
                >
                  {course.isEnrolled ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      View Course
                    </>
                  ) : course.pricing === 'FREE' ? (
                    <>
                      <span className="mr-2">💚</span>
                      Enroll Now
                    </>
                  ) : (
                    <>
                      <MoneyIcon className="w-4 h-4 mr-2" />
                      Purchase Course
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </div>

          {/* Enhanced Hover Glow Effect */}
          <motion.div
            className="absolute inset-0 rounded-3xl pointer-events-none"
            animate={{
              boxShadow: isHovered
                ? `0 0 40px ${course.isEnrolled ? colors.success[500] : colors.primary[500]}30, 0 0 80px ${course.isEnrolled ? colors.success[500] : colors.primary[500]}20`
                : '0 0 0px transparent',
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Inner Border Highlight */}
          <div className="absolute inset-[1px] rounded-3xl border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </ModernCard>

        {/* Dynamic Border Based on Course Type */}
        <div className={`absolute inset-0 rounded-3xl border-2 pointer-events-none transition-all duration-500 ${course.isEnrolled
          ? 'border-emerald-300/50 group-hover:border-emerald-400/80 shadow-emerald-200/50'
          : course.pricing === 'FREE'
            ? 'border-green-300/50 group-hover:border-green-400/80 shadow-green-200/50'
            : 'border-red-300/50 group-hover:border-red-400/80 shadow-red-200/50'
          } group-hover:shadow-lg`}></div>

        {/* Corner Accent Lines */}
        <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute top-0 left-0 w-full h-[2px] rounded-full ${course.isEnrolled
            ? 'bg-gradient-to-r from-emerald-400 to-transparent'
            : course.pricing === 'FREE'
              ? 'bg-gradient-to-r from-green-400 to-transparent'
              : 'bg-gradient-to-r from-red-400 to-transparent'
            }`}></div>
          <div className={`absolute top-0 left-0 w-[2px] h-full rounded-full ${course.isEnrolled
            ? 'bg-gradient-to-b from-emerald-400 to-transparent'
            : course.pricing === 'FREE'
              ? 'bg-gradient-to-b from-green-400 to-transparent'
              : 'bg-gradient-to-b from-red-400 to-transparent'
            }`}></div>
        </div>

        <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute bottom-0 right-0 w-full h-[2px] rounded-full ${course.isEnrolled
            ? 'bg-gradient-to-l from-emerald-400 to-transparent'
            : course.pricing === 'FREE'
              ? 'bg-gradient-to-l from-green-400 to-transparent'
              : 'bg-gradient-to-l from-red-400 to-transparent'
            }`}></div>
          <div className={`absolute bottom-0 right-0 w-[2px] h-full rounded-full ${course.isEnrolled
            ? 'bg-gradient-to-t from-emerald-400 to-transparent'
            : course.pricing === 'FREE'
              ? 'bg-gradient-to-t from-green-400 to-transparent'
              : 'bg-gradient-to-t from-red-400 to-transparent'
            }`}></div>
        </div>
      </div>
    </motion.div>
  );
};

export default StudentCourseCatalog;