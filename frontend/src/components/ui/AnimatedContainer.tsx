import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { animationVariants } from '../../theme/theme';

interface AnimatedContainerProps extends MotionProps {
  children: React.ReactNode;
  variant?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scale' | 'stagger';
  className?: string;
  delay?: number;
}

export const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  variant = 'fadeIn',
  className = '',
  delay = 0,
  ...motionProps
}) => {
  const animation = animationVariants[variant];
  
  return (
    <motion.div
      className={className}
      initial={animation.initial}
      animate={animation.animate}
      exit={animation.exit}
      transition={{
        ...animation.transition,
        delay,
      }}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export const AnimatedList: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={animationVariants.stagger}
      initial="initial"
      animate="animate"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={animationVariants.slideUp}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};