import React from 'react';
import {
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Visibility as ViewIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { ModernCard } from './ModernCard';
import { ModernButton } from './ModernButton';
import { colors } from '../../theme/theme';

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

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onViewCourse: (courseId: number) => void;
  onCancelEnrollment: (enrollmentId: number) => void;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  onViewCourse,
  onCancelEnrollment,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ENROLLED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ENROLLED':
        return <CheckCircleIcon />;
      case 'PENDING':
        return <AccessTimeIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <SchoolIcon />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const canCancel = enrollment.status.toUpperCase() === 'ENROLLED';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <ModernCard variant="elevated" className="h-full">
        <Box className="p-6">
          {/* Header with Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <Typography
                variant="h6"
                className="font-semibold text-gray-900 mb-2 line-clamp-2"
              >
                {enrollment.course.name}
              </Typography>
              <div className="flex items-center space-x-2">
                <Chip
                  label={enrollment.status}
                  color={getStatusColor(enrollment.status) as any}
                  icon={getStatusIcon(enrollment.status)}
                  size="small"
                  className="font-medium"
                />
                <Chip
                  label={enrollment.course.pricing === 'PAID' ? `₹${enrollment.course.price}` : 'Free'}
                  color={enrollment.course.pricing === 'PAID' ? 'primary' : 'success'}
                  icon={enrollment.course.pricing === 'PAID' ? <MoneyIcon /> : undefined}
                  size="small"
                  variant="outlined"
                />
              </div>
            </div>
          </div>

          {/* Course Description */}
          {enrollment.course.description && (
            <Typography
              variant="body2"
              className="text-gray-600 mb-4 line-clamp-2"
            >
              {enrollment.course.description}
            </Typography>
          )}

          {/* Instructor Info */}
          <div className="flex items-center mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
              <PersonIcon className="text-white text-sm" />
            </div>
            <div>
              <Typography variant="subtitle2" className="font-medium text-gray-900">
                {enrollment.course.instructor.fullName}
              </Typography>
              <Typography variant="caption" className="text-gray-500">
                Instructor
              </Typography>
            </div>
          </div>

          {/* Enrollment Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-2" />
              <span>Enrolled on {formatDate(enrollment.enrollmentDate)}</span>
            </div>
            {enrollment.paymentTransactionId && (
              <div className="flex items-center text-sm text-gray-600">
                <MoneyIcon className="h-4 w-4 mr-2" />
                <span>Payment ID: {enrollment.paymentTransactionId.substring(0, 16)}...</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <ModernButton
              variant="gradient"
              className="flex-1 text-sm py-2"
              onClick={() => onViewCourse(enrollment.course.id)}
              gradientColors={[colors.primary[500], colors.secondary[500]]}
            >
              <ViewIcon className="h-4 w-4 mr-1" />
              View Course
            </ModernButton>
            
            {canCancel && (
              <Tooltip title="Cancel Enrollment">
                <IconButton
                  onClick={() => onCancelEnrollment(enrollment.id)}
                  className="text-red-500 hover:bg-red-50"
                  size="small"
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </Box>
      </ModernCard>
    </motion.div>
  );
};

export default EnrollmentCard;