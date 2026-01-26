import React, { useState, useEffect, useMemo } from 'react';
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
  Container,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Sort as SortIcon,
  Clear as ClearIcon,
  Quiz as QuizIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { CourseListSkeleton } from '../../components/ui/LoadingStates';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, animationVariants } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { Dialog, DialogTitle, DialogContent, DialogActions, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';

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
}

interface PublicCourseCatalogProps {
  onEnroll?: (courseId: number) => void;
  onPurchase?: (courseId: number) => void;
}

const PublicCourseCatalog: React.FC<PublicCourseCatalogProps> = ({
  onEnroll,
  onPurchase,
}) => {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'enrollments'>('name');
  const [error, setError] = useState<string>('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PublicCourse | null>(null);
  const [courseDetailsModalOpen, setCourseDetailsModalOpen] = useState(false);
  const [selectedCourseForDetails, setSelectedCourseForDetails] = useState<PublicCourse | null>(null);
  const [courseExams, setCourseExams] = useState<any[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  // Fetch public courses
  useEffect(() => {
    fetchPublicCourses();
  }, []);

  const fetchPublicCourses = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiService.getPublicCourses();
      setCourses(response as unknown as PublicCourse[]);
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

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
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
  }, [courses, searchQuery, priceFilter, sortBy]);

  const handleEnrollment = async (courseId: number) => {
    try {
      await apiService.enrollInCourse(courseId);

      toast.success('Successfully enrolled in course!');

      // Update enrollment count locally
      setCourses(prev => prev.map(course =>
        course.id === courseId
          ? { ...course, enrollmentCount: course.enrollmentCount + 1 }
          : course
      ));

      onEnroll?.(courseId);
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
    // Update enrollment count locally
    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? { ...course, enrollmentCount: course.enrollmentCount + 1 }
        : course
    ));

    onPurchase?.(courseId);
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
    setSortBy('name');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || priceFilter !== 'ALL' || sortBy !== 'name';

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-20 left-1/2 w-60 h-60 bg-purple-400/20 rounded-full blur-2xl animate-bounce"></div>
        </div>

        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <SchoolIcon className="text-white text-4xl" />
            </div>
            <Typography
              variant="h3"
              component="h1"
              className="text-white font-bold"
            >
              Course Catalog
            </Typography>
          </div>
          <Typography
            variant="h6"
            className="text-blue-100 max-w-2xl mx-auto leading-relaxed"
          >
            Discover and enroll in courses from expert instructors. Choose from free courses or premium content to advance your learning journey.
          </Typography>

          <div className="flex items-center justify-center space-x-6 mt-6 text-white/80">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">{courses.filter(c => c.pricing === 'FREE').length} Free Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm">{courses.filter(c => c.pricing === 'PAID').length} Premium Courses</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-sm">{courses.reduce((sum, c) => sum + c.enrollmentCount, 0)} Total Enrollments</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
            gradient: 'from-orange-500 via-amber-600 to-yellow-600',
            icon: MoneyIcon,
            bgPattern: 'from-orange-50 to-yellow-50',
            change: 'Premium',
            changeColor: 'text-orange-600'
          },
          {
            label: 'Total Students',
            value: courses.reduce((sum, c) => sum + c.enrollmentCount, 0),
            gradient: 'from-blue-500 via-cyan-600 to-sky-600',
            icon: PersonIcon,
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
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
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
            {hasActiveFilters && (
              <ModernButton
                variant="outlined"
                onClick={clearFilters}
                className="bg-red-50 hover:bg-red-100 text-red-600 border-red-300"
              >
                <ClearIcon className="h-4 w-4 mr-1" />
                Clear All Filters
              </ModernButton>
            )}
          </div>

          {/* Enhanced Filter Controls */}
          <Grid container spacing={4}>
            {/* Search Field */}
            <Grid item xs={12} md={4}>
              <div className="relative group">
                <TextField
                  fullWidth
                  placeholder="Search courses, instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Price Filter</InputLabel>
                <Select
                  value={priceFilter}
                  label="Price Filter"
                  onChange={(e) => setPriceFilter(e.target.value as 'ALL' | 'FREE' | 'PAID')}
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
                  <MenuItem value="ALL">All Courses ({courses.length})</MenuItem>
                  <MenuItem value="FREE">💚 Free Only ({courses.filter(c => c.pricing === 'FREE').length})</MenuItem>
                  <MenuItem value="PAID">💰 Paid Only ({courses.filter(c => c.pricing === 'PAID').length})</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Sort By */}
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort By"
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'enrollments')}
                  startAdornment={<SortIcon className="mr-2 text-green-500" />}
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
                  <MenuItem value="name">📝 Name</MenuItem>
                  <MenuItem value="price">💰 Price</MenuItem>
                  <MenuItem value="enrollments">🔥 Popularity</MenuItem>
                </Select>
              </FormControl>
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
                      label={`💰 ${priceFilter}`}
                      onDelete={() => setPriceFilter('ALL')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                      deleteIcon={<ClearIcon className="text-white" />}
                    />
                  )}
                  {sortBy !== 'name' && (
                    <Chip
                      label={`📊 Sort: ${sortBy}`}
                      onDelete={() => setSortBy('name')}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300"
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
                onClick={fetchPublicCourses}
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
                {filteredAndSortedCourses.map((course, index) => (
                  <Grid item xs={12} sm={6} lg={4} key={course.id}>
                    <motion.div
                      variants={animationVariants.slideUp}
                      transition={{ delay: index * 0.1 }}
                      className="h-full"
                    >
                      <CourseCard
                        course={course}
                        onEnroll={handleEnrollment}
                        onPurchase={handlePurchase}
                        onViewDetails={handleViewDetails}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Results Summary */}
      {!loading && !error && filteredAndSortedCourses.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <Typography variant="body2" className="text-gray-500">
            Showing {filteredAndSortedCourses.length} of {courses.length} courses
          </Typography>
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

      {/* Course Details Modal */}
      <Dialog
        open={courseDetailsModalOpen}
        onClose={() => setCourseDetailsModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        {selectedCourseForDetails && (
          <>
            <DialogTitle className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Typography variant="h5" className="font-bold text-gray-900 mb-2">
                    {selectedCourseForDetails.name}
                  </Typography>
                  <div className="flex items-center space-x-3">
                    <Chip
                      label={selectedCourseForDetails.pricing === 'FREE' ? 'Free Course' : `₹${selectedCourseForDetails.price}`}
                      color={selectedCourseForDetails.pricing === 'FREE' ? 'success' : 'primary'}
                      size="small"
                    />
                    <Chip
                      label="Public Course"
                      color="info"
                      size="small"
                      icon={<VisibilityIcon />}
                    />
                  </div>
                </div>
              </div>
            </DialogTitle>

            <DialogContent className="pt-4">
              {/* Course Description */}
              {selectedCourseForDetails.description && (
                <div className="mb-6">
                  <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
                    Course Description
                  </Typography>
                  <Typography variant="body1" className="text-gray-700 leading-relaxed">
                    {selectedCourseForDetails.description}
                  </Typography>
                </div>
              )}

              {/* Instructor Information */}
              <div className="mb-6">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
                  Instructor
                </Typography>
                <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                    <PersonIcon className="text-white" />
                  </div>
                  <div>
                    <Typography variant="subtitle1" className="font-semibold text-gray-900">
                      {selectedCourseForDetails.instructor.fullName}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      @{selectedCourseForDetails.instructor.username}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Course Statistics */}
              <div className="mb-6">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
                  Course Statistics
                </Typography>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <SchoolIcon className="text-blue-600 mr-3" />
                    <div>
                      <Typography variant="body2" className="text-gray-600">Students Enrolled</Typography>
                      <Typography variant="h6" className="font-bold text-gray-900">
                        {selectedCourseForDetails.enrollmentCount}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg border border-gray-200">
                    <QuizIcon className="text-purple-600 mr-3" />
                    <div>
                      <Typography variant="body2" className="text-gray-600">Total Exams</Typography>
                      <Typography variant="h6" className="font-bold text-gray-900">
                        {selectedCourseForDetails.examCount || 0}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exams List */}
              <div className="mb-4">
                <Typography variant="h6" className="font-semibold text-gray-900 mb-3">
                  Available Exams ({courseExams.length})
                </Typography>

                {loadingExams ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : courseExams.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <QuizIcon className="text-4xl text-gray-400 mb-2 mx-auto" />
                    <Typography variant="body1" className="text-gray-600 mb-1">
                      No exams available
                    </Typography>
                    <Typography variant="body2" className="text-gray-500">
                      The instructor hasn't created any exams for this course yet.
                    </Typography>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {courseExams.map((exam, index) => (
                      <div key={exam.exam_id || exam.id || index} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Typography variant="subtitle1" className="font-semibold text-gray-900 mb-1">
                              {exam.title || 'Untitled Exam'}
                            </Typography>
                            {exam.description && (
                              <Typography variant="body2" className="text-gray-600 mb-2 line-clamp-2">
                                {exam.description}
                              </Typography>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Duration: {exam.duration || 0} min</span>
                              <span>Marks: {exam.totalMarks || 0}</span>
                              {exam.questionCount && <span>Questions: {exam.questionCount}</span>}
                            </div>
                          </div>
                          <Chip
                            label="Preview Only"
                            size="small"
                            variant="outlined"
                            color="default"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Divider className="my-4" />

              {/* Enrollment Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Typography variant="body2" className="text-blue-800 mb-2">
                  <strong>Note:</strong> This is a preview of the course content.
                </Typography>
                <Typography variant="body2" className="text-blue-700">
                  To access exams and full course materials, you need to {selectedCourseForDetails.pricing === 'FREE' ? 'enroll in' : 'purchase'} this course.
                </Typography>
              </div>
            </DialogContent>

            <DialogActions className="px-6 pb-6">
              <ModernButton
                variant="outlined"
                onClick={() => setCourseDetailsModalOpen(false)}
              >
                Close
              </ModernButton>
              <ModernButton
                variant="gradient"
                onClick={() => {
                  setCourseDetailsModalOpen(false);
                  if (selectedCourseForDetails.pricing === 'FREE') {
                    handleEnrollment(selectedCourseForDetails.id);
                  } else {
                    handlePurchase(selectedCourseForDetails.id);
                  }
                }}
                gradientColors={
                  selectedCourseForDetails.pricing === 'FREE'
                    ? [colors.success[500], colors.success[600]]
                    : [colors.primary[500], colors.secondary[500]]
                }
              >
                {selectedCourseForDetails.pricing === 'FREE' ? 'Enroll Now' : 'Purchase Course'}
              </ModernButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

// Course Card Component with Glass Morphism Design
const CourseCard: React.FC<{
  course: PublicCourse;
  onEnroll: (courseId: number) => void;
  onPurchase: (courseId: number) => void;
  onViewDetails: (course: PublicCourse) => void;
}> = ({ course, onEnroll, onPurchase, onViewDetails }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleAction = () => {
    if (course.pricing === 'FREE') {
      onEnroll(course.id);
    } else {
      onPurchase(course.id);
    }
  };

  return (
    <motion.div
      className="h-full"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <ModernCard
        variant="glass"
        className="h-full overflow-hidden relative group"
        hover={false}
      >
        {/* Enhanced Course Header with Dynamic Gradient */}
        <div className={`relative h-48 bg-gradient-to-r ${course.pricing === 'FREE'
          ? 'from-emerald-500 via-green-600 to-teal-600'
          : 'from-orange-500 via-amber-600 to-yellow-600'
          } overflow-hidden`}>
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>
            <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full -translate-x-8 -translate-y-8 group-hover:scale-200 transition-all duration-1000"></div>
          </div>

          {/* Enhanced Price Badge */}
          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <div className={`px-4 py-2 rounded-xl font-bold shadow-lg backdrop-blur-sm ${course.pricing === 'FREE'
              ? 'bg-white/95 text-green-800 border-2 border-green-300'
              : 'bg-white/95 text-orange-800 border-2 border-orange-300'
              }`}>
              {course.pricing === 'FREE' ? (
                <span className="flex items-center">
                  <span className="text-green-600 mr-1">💚</span>
                  Free
                </span>
              ) : (
                <span className="flex items-center">
                  <MoneyIcon className="h-4 w-4 mr-1" />
                  ₹{course.price}
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
        <div className="p-6 flex-1 flex flex-col">
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
                className="w-full bg-gradient-to-r from-gray-100 to-slate-100 border-2 border-gray-300 text-gray-700 py-3 px-4 rounded-2xl font-bold hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-105"
              >
                <VisibilityIcon className="w-4 h-4 mr-2" />
                View Details
              </button>
            </motion.div>

            {/* Primary Action Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={handleAction}
                className={`w-full py-3 px-4 rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center justify-center hover:scale-105 shadow-lg ${course.pricing === 'FREE'
                  ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white'
                  : 'bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white'
                  }`}
              >
                {course.pricing === 'FREE' ? (
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

        {/* Hover Glow Effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? `0 0 30px ${colors.primary[500]}40`
              : '0 0 0px transparent',
          }}
          transition={{ duration: 0.3 }}
        />
      </ModernCard>
    </motion.div>
  );
};

export default PublicCourseCatalog;