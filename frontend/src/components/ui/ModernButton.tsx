import React from 'react';
import { Button, ButtonProps, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { colors, getGradient } from '../../theme/theme';

interface ModernButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'gradient' | 'glass' | 'outlined' | 'text';
  loading?: boolean;
  icon?: React.ReactNode;
  gradientColors?: [string, string];
  glowEffect?: boolean;
}

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'gradient',
  loading = false,
  disabled = false,
  icon,
  gradientColors = [colors.primary[500], colors.secondary[500]],
  glowEffect = false,
  className = '',
  onClick,
  ...props
}) => {
  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius: '12px',
      padding: '12px 24px',
      fontSize: '0.875rem',
      fontWeight: 500,
      textTransform: 'none' as const,
      minHeight: '44px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative' as const,
      overflow: 'hidden' as const,
    };

    switch (variant) {
      case 'gradient':
        return {
          ...baseStyles,
          background: getGradient(gradientColors[0], gradientColors[1]),
          color: 'white',
          border: 'none',
          boxShadow: glowEffect 
            ? `0 4px 15px ${gradientColors[0]}40` 
            : '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: glowEffect 
              ? `0 8px 25px ${gradientColors[0]}60` 
              : '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        };

      case 'glass':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          color: colors.gray[800],
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'translateY(-1px)',
          },
        };

      case 'outlined':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          border: `2px solid ${colors.primary[500]}`,
          color: colors.primary[500],
          '&:hover': {
            backgroundColor: `${colors.primary[500]}10`,
            transform: 'translateY(-1px)',
          },
        };

      case 'text':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          color: colors.primary[500],
          '&:hover': {
            backgroundColor: `${colors.primary[500]}08`,
          },
        };

      default:
        return baseStyles;
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return;
    onClick?.(event);
  };

  return (
    <motion.div
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={className}
    >
      <Button
        {...props}
        disabled={disabled || loading}
        onClick={handleClick}
        sx={getButtonStyles()}
        startIcon={loading ? null : icon}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <CircularProgress size={16} color="inherit" />
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
        
        {/* Ripple effect overlay */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0 pointer-events-none"
          whileTap={{ opacity: 0.1 }}
          transition={{ duration: 0.1 }}
        />
      </Button>
    </motion.div>
  );
};

// Floating Action Button with modern styling
export const FloatingActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
  color?: 'primary' | 'secondary';
}> = ({ icon, onClick, className = '', color = 'primary' }) => {
  const gradientColors = color === 'primary' 
    ? [colors.primary[500], colors.secondary[500]]
    : [colors.purple[500], colors.primary[500]];

  return (
    <motion.button
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white z-50 ${className}`}
      style={{
        background: getGradient(gradientColors[0], gradientColors[1]),
      }}
      whileHover={{ 
        scale: 1.1,
        boxShadow: `0 8px 25px ${gradientColors[0]}60`,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
    >
      {icon}
    </motion.button>
  );
};