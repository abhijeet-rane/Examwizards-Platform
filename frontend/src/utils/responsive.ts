import { useMediaQuery, useTheme, Theme } from '@mui/material';
import { useState, useEffect } from 'react';

// Breakpoint definitions (matching Material-UI defaults)
export const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Responsive utilities
export class ResponsiveHelper {
  /**
   * Get current breakpoint based on window width
   */
  static getCurrentBreakpoint(width: number): Breakpoint {
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }

  /**
   * Check if current width matches breakpoint
   */
  static isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
    return width >= breakpoints[breakpoint];
  }

  /**
   * Get responsive value based on breakpoint
   */
  static getResponsiveValue<T>(
    values: Partial<Record<Breakpoint, T>>,
    currentBreakpoint: Breakpoint,
    fallback: T
  ): T {
    // Try current breakpoint first
    if (values[currentBreakpoint] !== undefined) {
      return values[currentBreakpoint]!;
    }

    // Fall back to smaller breakpoints
    const breakpointOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp]!;
      }
    }

    return fallback;
  }

  /**
   * Generate responsive CSS classes
   */
  static generateResponsiveClasses(
    baseClass: string,
    values: Partial<Record<Breakpoint, string>>
  ): string {
    const classes: string[] = [];

    Object.entries(values).forEach(([breakpoint, value]) => {
      if (breakpoint === 'xs') {
        classes.push(`${baseClass}-${value}`);
      } else {
        classes.push(`${breakpoint}:${baseClass}-${value}`);
      }
    });

    return classes.join(' ');
  }

  /**
   * Get grid columns for different breakpoints
   */
  static getGridColumns(
    columns: Partial<Record<Breakpoint, number>>,
    currentBreakpoint: Breakpoint
  ): number {
    return this.getResponsiveValue(columns, currentBreakpoint, 1);
  }

  /**
   * Get spacing for different breakpoints
   */
  static getSpacing(
    spacing: Partial<Record<Breakpoint, number>>,
    currentBreakpoint: Breakpoint
  ): number {
    return this.getResponsiveValue(spacing, currentBreakpoint, 2);
  }
}

// Custom hooks for responsive design
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('md');

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(ResponsiveHelper.getCurrentBreakpoint(window.innerWidth));
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

export function useResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  fallback: T
): T {
  const breakpoint = useBreakpoint();
  return ResponsiveHelper.getResponsiveValue(values, breakpoint, fallback);
}

export function useIsMobile(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs' || breakpoint === 'sm';
}

export function useIsTablet(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'md';
}

export function useIsDesktop(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl';
}

// Material-UI breakpoint hooks
export function useMuiBreakpoints() {
  const theme = useTheme();
  
  return {
    isXs: useMediaQuery(theme.breakpoints.only('xs')),
    isSm: useMediaQuery(theme.breakpoints.only('sm')),
    isMd: useMediaQuery(theme.breakpoints.only('md')),
    isLg: useMediaQuery(theme.breakpoints.only('lg')),
    isXl: useMediaQuery(theme.breakpoints.only('xl')),
    
    isSmUp: useMediaQuery(theme.breakpoints.up('sm')),
    isMdUp: useMediaQuery(theme.breakpoints.up('md')),
    isLgUp: useMediaQuery(theme.breakpoints.up('lg')),
    isXlUp: useMediaQuery(theme.breakpoints.up('xl')),
    
    isSmDown: useMediaQuery(theme.breakpoints.down('sm')),
    isMdDown: useMediaQuery(theme.breakpoints.down('md')),
    isLgDown: useMediaQuery(theme.breakpoints.down('lg')),
    isXlDown: useMediaQuery(theme.breakpoints.down('xl')),
  };
}

// Responsive grid configuration
export interface ResponsiveGridConfig {
  columns: Partial<Record<Breakpoint, number>>;
  spacing: Partial<Record<Breakpoint, number>>;
  itemMinWidth?: Partial<Record<Breakpoint, number>>;
}

export function useResponsiveGrid(config: ResponsiveGridConfig) {
  const breakpoint = useBreakpoint();
  
  return {
    columns: ResponsiveHelper.getGridColumns(config.columns, breakpoint),
    spacing: ResponsiveHelper.getSpacing(config.spacing, breakpoint),
    itemMinWidth: config.itemMinWidth 
      ? ResponsiveHelper.getResponsiveValue(config.itemMinWidth, breakpoint, 200)
      : 200,
  };
}

// Responsive typography
export interface ResponsiveTypographyConfig {
  fontSize: Partial<Record<Breakpoint, string>>;
  lineHeight?: Partial<Record<Breakpoint, string>>;
  fontWeight?: Partial<Record<Breakpoint, string>>;
}

export function useResponsiveTypography(config: ResponsiveTypographyConfig) {
  const breakpoint = useBreakpoint();
  
  return {
    fontSize: ResponsiveHelper.getResponsiveValue(config.fontSize, breakpoint, '1rem'),
    lineHeight: config.lineHeight 
      ? ResponsiveHelper.getResponsiveValue(config.lineHeight, breakpoint, '1.5')
      : '1.5',
    fontWeight: config.fontWeight 
      ? ResponsiveHelper.getResponsiveValue(config.fontWeight, breakpoint, 'normal')
      : 'normal',
  };
}

// Container queries (for modern browsers)
export function useContainerQuery(containerRef: React.RefObject<HTMLElement>) {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  return {
    containerWidth,
    isContainerSmall: containerWidth < 400,
    isContainerMedium: containerWidth >= 400 && containerWidth < 800,
    isContainerLarge: containerWidth >= 800,
  };
}

// Touch and gesture detection
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    checkTouch();
    window.addEventListener('touchstart', checkTouch, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouch);
    };
  }, []);

  return isTouch;
}

// Orientation detection
export function useOrientation(): 'portrait' | 'landscape' {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    handleOrientationChange(); // Set initial value
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}

// Responsive image utilities
export interface ResponsiveImageConfig {
  src: Partial<Record<Breakpoint, string>>;
  alt: string;
  sizes?: string;
}

export function getResponsiveImageProps(config: ResponsiveImageConfig, breakpoint: Breakpoint) {
  const src = ResponsiveHelper.getResponsiveValue(config.src, breakpoint, '');
  
  return {
    src,
    alt: config.alt,
    sizes: config.sizes || '100vw',
  };
}

// Motion preferences detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    const handleChange = () => {
      setReducedMotion(mediaQuery.matches);
    };

    handleChange(); // Set initial value
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return reducedMotion;
}

// Export all utilities
export default ResponsiveHelper;