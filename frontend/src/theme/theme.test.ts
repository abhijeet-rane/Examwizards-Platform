import { 
  enhancedColors, 
  componentColorScheme, 
  responsiveUtils, 
  visualHierarchy,
  accessibilityUtils,
  checkColorContrast,
  getResponsiveClasses,
  getGradient,
  getGlassMorphism 
} from './theme';

describe('Enhanced Theme System', () => {
  describe('Enhanced Colors', () => {
    test('should have all required color systems', () => {
      expect(enhancedColors.brand).toBeDefined();
      expect(enhancedColors.background).toBeDefined();
      expect(enhancedColors.surface).toBeDefined();
      expect(enhancedColors.interactive).toBeDefined();
      expect(enhancedColors.text).toBeDefined();
      expect(enhancedColors.border).toBeDefined();
      expect(enhancedColors.status).toBeDefined();
    });

    test('should have WCAG compliant colors', () => {
      expect(enhancedColors.text.primary).toBe('#0f172a');
      expect(enhancedColors.background.primary).toBe('#f8fafc');
      expect(enhancedColors.interactive.primary).toBe('#0ea5e9');
    });
  });

  describe('Component Color Scheme', () => {
    test('should have all component mappings', () => {
      expect(componentColorScheme.header).toBeDefined();
      expect(componentColorScheme.card).toBeDefined();
      expect(componentColorScheme.button).toBeDefined();
      expect(componentColorScheme.form).toBeDefined();
      expect(componentColorScheme.navigation).toBeDefined();
      expect(componentColorScheme.status).toBeDefined();
      expect(componentColorScheme.examBadge).toBeDefined();
      expect(componentColorScheme.modal).toBeDefined();
      expect(componentColorScheme.dashboard).toBeDefined();
    });

    test('should have proper button color schemes', () => {
      expect(componentColorScheme.button.primary.background).toContain('linear-gradient');
      expect(componentColorScheme.button.primary.text).toBe(enhancedColors.text.inverse);
      expect(componentColorScheme.button.secondary.border).toBe(enhancedColors.border.interactive);
    });
  });

  describe('Responsive Utilities', () => {
    test('should have media queries', () => {
      expect(responsiveUtils.mediaQueries.mobile).toBe('@media (min-width: 320px)');
      expect(responsiveUtils.mediaQueries.tablet).toBe('@media (min-width: 768px)');
      expect(responsiveUtils.mediaQueries.desktop).toBe('@media (min-width: 1024px)');
      expect(responsiveUtils.mediaQueries.wide).toBe('@media (min-width: 1280px)');
    });

    test('should have grid utilities', () => {
      expect(responsiveUtils.grid.mobile).toBe('grid-cols-1');
      expect(responsiveUtils.grid.tablet).toBe('md:grid-cols-2');
      expect(responsiveUtils.grid.desktop).toBe('lg:grid-cols-3');
      expect(responsiveUtils.grid.wide).toBe('xl:grid-cols-4');
    });

    test('should have spacing utilities', () => {
      expect(responsiveUtils.spacing.mobile.padding).toBe('px-4 py-6');
      expect(responsiveUtils.spacing.tablet.padding).toBe('md:px-6 md:py-8');
      expect(responsiveUtils.spacing.desktop.padding).toBe('lg:px-8 lg:py-12');
    });

    test('should have typography scaling', () => {
      expect(responsiveUtils.typography.mobile.h1).toBe('text-2xl font-bold');
      expect(responsiveUtils.typography.desktop.h1).toBe('lg:text-4xl');
    });
  });

  describe('Visual Hierarchy', () => {
    test('should have typography system', () => {
      expect(visualHierarchy.typography.display.fontSize).toBe('2.5rem');
      expect(visualHierarchy.typography.heading1.fontSize).toBe('2rem');
      expect(visualHierarchy.typography.body.fontSize).toBe('1rem');
    });

    test('should have spacing system', () => {
      expect(visualHierarchy.spacing.xs).toBe('0.25rem');
      expect(visualHierarchy.spacing.md).toBe('1rem');
      expect(visualHierarchy.spacing.xl).toBe('2rem');
    });

    test('should have shadow system', () => {
      expect(visualHierarchy.shadows.sm).toContain('rgba(0, 0, 0, 0.05)');
      expect(visualHierarchy.shadows.lg).toContain('rgba(0, 0, 0, 0.1)');
    });
  });

  describe('Accessibility Utils', () => {
    test('should have focus styles', () => {
      expect(accessibilityUtils.focus.outline).toContain(enhancedColors.interactive.primary);
      expect(accessibilityUtils.focus.outlineOffset).toBe('2px');
    });

    test('should have screen reader utilities', () => {
      expect(accessibilityUtils.srOnly.position).toBe('absolute');
      expect(accessibilityUtils.srOnly.width).toBe('1px');
    });

    test('should have reduced motion support', () => {
      expect(accessibilityUtils.reducedMotion['@media (prefers-reduced-motion: reduce)']).toBeDefined();
    });
  });

  describe('Utility Functions', () => {
    test('getGradient should create proper gradient', () => {
      const gradient = getGradient('#ff0000', '#00ff00');
      expect(gradient).toBe('linear-gradient(135deg, #ff0000 0%, #00ff00 100%)');
    });

    test('getGlassMorphism should create glass effect', () => {
      const glass = getGlassMorphism(0.2);
      expect(glass.backgroundColor).toBe('rgba(255, 255, 255, 0.2)');
      expect(glass.backdropFilter).toBe('blur(20px)');
    });

    test('getResponsiveClasses should combine classes', () => {
      const classes = getResponsiveClasses({
        mobile: 'text-sm',
        tablet: 'md:text-base',
        desktop: 'lg:text-lg'
      });
      expect(classes).toBe('text-sm md:text-base lg:text-lg');
    });

    test('checkColorContrast should validate contrast ratios', () => {
      const contrast = checkColorContrast(
        enhancedColors.text.primary, 
        enhancedColors.background.primary
      );
      expect(contrast.wcagAA).toBe(true);
      expect(contrast.ratio).toBeGreaterThan(4.5);
    });
  });
});