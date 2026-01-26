import React from 'react';
import { Skeleton, Box, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';

// Skeleton for course cards
export const CourseCardSkeleton: React.FC = () => {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <Box className="space-y-4">
          {/* Course title */}
          <Skeleton variant="text" width="80%" height={32} />
          
          {/* Course description */}
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="60%" height={20} />
          
          {/* Instructor info */}
          <Box className="flex items-center space-x-3 mt-4">
            <Skeleton variant="circular" width={40} height={40} />
            <Box className="flex-1">
              <Skeleton variant="text" width="40%" height={20} />
              <Skeleton variant="text" width="30%" height={16} />
            </Box>
          </Box>
          
          {/* Price and enrollment info */}
          <Box className="flex justify-between items-center mt-4">
            <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
            <Skeleton variant="text" width="30%" height={20} />
          </Box>
          
          {/* Action button */}
          <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 2, mt: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Skeleton for course list
export const CourseListSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CourseCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Skeleton for dashboard stats
export const StatCardSkeleton: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <Box className="flex items-center justify-between">
          <Box className="flex-1">
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={36} sx={{ mt: 1 }} />
          </Box>
          <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
        </Box>
      </CardContent>
    </Card>
  );
};

// Animated loading spinner
export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = '' 
}) => {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <div
        className="border-4 border-gray-200 border-t-blue-500 rounded-full"
        style={{ width: size, height: size }}
      />
    </motion.div>
  );
};

// Full page loading overlay
export const LoadingOverlay: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 flex flex-col items-center space-y-4 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <LoadingSpinner size={48} />
        <p className="text-gray-600 font-medium">{message}</p>
      </motion.div>
    </motion.div>
  );
};

// Shimmer effect for loading states
export const ShimmerEffect: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] ${className}`} />
  );
};