import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { EnrollmentCard } from '../../components/ui/EnrollmentCard';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { colors, animationVariants } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface Enrollment {
  id: number;
  enrollmentDate: string;
  status: string;
  paymentTransactionId?: string;
  course: {
    id: number;
    name: string;
    description?: string;
    pricing: string;
    price?: number;
    instructor: {
      fullName: string;
    };
  };
}

interface EnrollmentsResponse {
  enrollments: Enrollment[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

const MyEnrollments: React.FC = () => {
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pricingFilter, setPricingFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState<string>('');

  const pageSize = 9;

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await apiService.getMyEnrollments({
        page: currentPage - 1, // Backend uses 0-based indexing
        size: pageSize,
        sortBy: 'enrollmentDate',
        sortDir: 'desc',
      }) as EnrollmentsResponse;

      setEnrollments(response.enrollments || []);
      setTotalPages(response.totalPages || 1);
      setTotalItems(response.totalItems || 0);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setError(err?.message || 'Failed to load enrollments');
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/student/courses/${courseId}`);
  };

  const handleCancelEnrollment = async (enrollmentId: number) => {
    if (!window.confirm('Are you sure you want to cancel this enrollment?')) {
      return;
    }

    try {
      await apiService.cancelEnrollment(enrollmentId);
      toast.success('Enrollment cancelled successfully');
      fetchEnrollments(); // Refresh the list
    } catch (err: any) {
      console.error('Error cancelling enrollment:', err);
      toast.error(err?.message || 'Failed to cancel enrollment');
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const matchesSearch = enrollment.course.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      enrollment.course.instructor.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || enrollment.status === statusFilter;
    const matchesPricing = pricingFilter === 'ALL' || enrollment.course.pricing === pricingFilter;
    
    return matchesSearch && matchesStatus && matchesPricing;
  });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  const EnrollmentSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} md={6} lg={4} key={index}>
          <ModernCard variant="outlined">
            <Box className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Skeleton variant="circular" width={48} height={48} />
                <div className="flex-1">
                  <Skeleton variant="text" width="80%" height={24} />
                  <Skeleton variant="text" width="60%" height={20} />
                </div>
              </div>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="70%" height={20} />
              <div className="mt-4">
                <Skeleton variant="rectangular" width="100%" height={36} />
              </div>
            </Box>
          </ModernCard>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="xl" className="py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Typography
          variant="h3"
          className="font-bold mb-4"
          sx={{
            background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          My Enrollments
        </Typography>
        <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
          Track your course enrollments and manage your learning journey
        </Typography>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ModernCard variant="glass" className="mb-6">
          <Box className="p-6">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search courses or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon className="text-gray-400" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="ENROLLED">Enrolled</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Course Type</InputLabel>
                  <Select
                    value={pricingFilter}
                    label="Course Type"
                    onChange={(e) => setPricingFilter(e.target.value)}
                    sx={{ borderRadius: '12px' }}
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="FREE">Free</MenuItem>
                    <MenuItem value="PAID">Paid</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={2}>
                <Box className="text-center">
                  <Typography variant="body2" className="text-gray-600">
                    Total: {totalItems}
                  </Typography>
                  <Typography variant="caption" className="text-gray-500">
                    enrollments
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </ModernCard>
      </motion.div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Alert severity="error" className="rounded-xl">
            {error}
          </Alert>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && <EnrollmentSkeleton />}

      {/* Enrollments Grid */}
      {!loading && (
        <AnimatePresence>
          {filteredEnrollments.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Grid container spacing={3}>
                {filteredEnrollments.map((enrollment, index) => (
                  <Grid item xs={12} md={6} lg={4} key={enrollment.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <EnrollmentCard
                        enrollment={enrollment}
                        onViewCourse={handleViewCourse}
                        onCancelEnrollment={handleCancelEnrollment}
                      />
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <SchoolIcon 
                sx={{ 
                  fontSize: 80, 
                  color: 'text.secondary',
                  mb: 2 
                }} 
              />
              <Typography variant="h5" className="text-gray-600 mb-2">
                No Enrollments Found
              </Typography>
              <Typography variant="body1" className="text-gray-500 mb-4">
                {searchQuery || statusFilter !== 'ALL' || pricingFilter !== 'ALL'
                  ? 'No enrollments match your current filters.'
                  : 'You haven\'t enrolled in any courses yet.'}
              </Typography>
              {(!searchQuery && statusFilter === 'ALL' && pricingFilter === 'ALL') && (
                <ModernButton
                  variant="gradient"
                  onClick={() => navigate('/student/courses')}
                  gradientColors={[colors.primary[500], colors.secondary[500]]}
                >
                  Browse Courses
                </ModernButton>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!loading && filteredEnrollments.length > 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mt-8"
        >
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '12px',
                fontWeight: 'medium',
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
                color: 'white',
                '&:hover': {
                  background: `linear-gradient(135deg, ${colors.primary[600]} 0%, ${colors.secondary[600]} 100%)`,
                },
              },
            }}
          />
        </motion.div>
      )}
    </Container>
  );
};

export default MyEnrollments;