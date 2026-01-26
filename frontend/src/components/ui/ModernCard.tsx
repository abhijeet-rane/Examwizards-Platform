import React from 'react';
import { Card, CardProps } from '@mui/material';
import { motion } from 'framer-motion';
import { colors, getGlassMorphism } from '../../theme/theme';
import { AccessibilityHelper, A11yProps } from '../../utils/accessibility';
import { useMuiBreakpoints, prefersReducedMotion } from '../../utils/responsive';

interface ModernCardProps extends Omit<CardProps, 'variant'> {
  variant?: 'elevated' | 'glass' | 'gradient' | 'outlined';
  hover?: boolean;
  gradientColors?: [string, string];
  children: React.ReactNode;
  ariaLabel?: string;
  role?: string;
  interactive?: boolean;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  variant = 'elevated',
  hover = true,
  gradientColors = [colors.primary[500], colors.secondary[500]],
  className = '',
  ariaLabel,
  role,
  interactive = false,
  onClick,
  onKeyDown,
  ...props
}) => {
  const breakpoints = useMuiBreakpoints();
  const shouldReduceMotion = prefersReducedMotion();

  // Create accessibility props
  const a11yProps: A11yProps = {};
  if (ariaLabel) a11yProps['aria-label'] = ariaLabel;
  if (role) a11yProps.role = role;
  if (interactive) {
    a11yProps.tabIndex = 0;
    a11yProps.role = role || 'button';
  }

  // Handle keyboard navigation for interactive cards
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (interactive && onClick) {
      AccessibilityHelper.handleKeyboardNavigation(
        event,
        onClick, // Enter
        onClick  // Space
      );
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };
  const getCardStyles = () => {
    const baseStyles = {
      borderRadius: '16px',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden' as const,
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: `1px solid ${colors.gray[200]}`,
          backgroundColor: '#ffffff',
          '&:hover': hover ? {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            transform: 'translateY(-4px)',
          } : {},
        };

      case 'glass':
        return {
          ...baseStyles,
          ...getGlassMorphism(0.1),
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          '&:hover': hover ? {
            ...getGlassMorphism(0.15),
            transform: 'translateY(-2px)',
          } : {},
        };

      case 'gradient':
        return {
          ...baseStyles,
          background: `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`,
          color: 'white',
          boxShadow: `0 4px 15px ${gradientColors[0]}40`,
          '&:hover': hover ? {
            boxShadow: `0 8px 25px ${gradientColors[0]}60`,
            transform: 'translateY(-2px)',
          } : {},
        };

      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          border: `2px solid ${colors.gray[200]}`,
          '&:hover': hover ? {
            borderColor: colors.primary[300],
            backgroundColor: `${colors.primary[50]}`,
            transform: 'translateY(-2px)',
          } : {},
        };

      default:
        return baseStyles;
    }
  };

  // Responsive padding based on screen size
  const responsivePadding = breakpoints.isMdDown ? '12px' : '16px';
  
  // Animation settings based on user preferences
  const animationProps = shouldReduceMotion 
    ? { initial: false, animate: false, transition: { duration: 0 } }
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: 'easeOut' } };

  return (
    <motion.div
      {...animationProps}
      className={className}
    >
      <Card
        {...props}
        {...a11yProps}
        onClick={interactive ? onClick : props.onClick}
        onKeyDown={handleKeyDown}
        sx={{
          ...getCardStyles(),
          padding: responsivePadding,
          cursor: interactive ? 'pointer' : 'default',
          '&:focus': interactive ? {
            outline: `2px solid ${colors.primary[500]}`,
            outlineOffset: '2px',
          } : {},
        }}
      >
        {children}
      </Card>
    </motion.div>
  );
};

// Specialized card for course display
export const CourseCard: React.FC<{
  title: string;
  description?: string;
  instructor: string;
  price?: number;
  isPaid: boolean;
  enrollmentCount?: number;
  imageUrl?: string;
  onAction: () => void;
  actionLabel: string;
  className?: string;
}> = ({
  title,
  description,
  instructor,
  price,
  isPaid,
  enrollmentCount = 0,
  imageUrl,
  onAction,
  actionLabel,
  className = '',
}) => {
  return (
    <ModernCard className={`h-full ${className}`}>
      <div className="relative">
        {/* Course Image or Gradient Background */}
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div 
            className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
            }}
          />
        )}
        
        {/* Price Badge */}
        {isPaid && price && (
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-semibold text-gray-800">₹{price}</span>
          </div>
        )}
        
        {/* Free Badge */}
        {!isPaid && (
          <div className="absolute top-4 right-4 bg-green-500 bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-semibold text-white">Free</span>
          </div>
        )}
      </div>
      
      <div className="p-6">
        {/* Course Title */}
        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
        
        {/* Course Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {description}
          </p>
        )}
        
        {/* Instructor Info */}
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
            <span className="text-white text-sm font-semibold">
              {instructor.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{instructor}</p>
            <p className="text-xs text-gray-500">Instructor</p>
          </div>
        </div>
        
        {/* Enrollment Count */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            {enrollmentCount} student{enrollmentCount !== 1 ? 's' : ''} enrolled
          </span>
        </div>
        
        {/* Action Button */}
        <motion.button
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
        >
          {actionLabel}
        </motion.button>
      </div>
    </ModernCard>
  );
};