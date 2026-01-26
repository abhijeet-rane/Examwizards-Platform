// Accessibility utilities and helpers

export interface A11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-expanded'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-busy'?: boolean;
  role?: string;
  tabIndex?: number;
}

export class AccessibilityHelper {
  /**
   * Generate unique ID for accessibility purposes
   */
  static generateId(prefix: string = 'a11y'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create ARIA props for form fields
   */
  static createFieldProps(
    label: string,
    error?: string,
    description?: string,
    required: boolean = false
  ): A11yProps {
    const fieldId = this.generateId('field');
    const props: A11yProps = {
      'aria-label': label,
    };

    if (required) {
      props['aria-required'] = true as any;
    }

    if (error) {
      const errorId = `${fieldId}-error`;
      props['aria-describedby'] = errorId;
      props['aria-invalid'] = true as any;
    }

    if (description) {
      const descId = `${fieldId}-desc`;
      props['aria-describedby'] = props['aria-describedby'] 
        ? `${props['aria-describedby']} ${descId}` 
        : descId;
    }

    return props;
  }

  /**
   * Create ARIA props for buttons
   */
  static createButtonProps(
    label: string,
    expanded?: boolean,
    controls?: string,
    disabled: boolean = false
  ): A11yProps {
    const props: A11yProps = {
      'aria-label': label,
    };

    if (expanded !== undefined) {
      props['aria-expanded'] = expanded;
    }

    if (controls) {
      props['aria-controls'] = controls as any;
    }

    if (disabled) {
      props['aria-disabled'] = true as any;
      props.tabIndex = -1;
    }

    return props;
  }

  /**
   * Create ARIA props for modal dialogs
   */
  static createModalProps(title: string, description?: string): A11yProps {
    const titleId = this.generateId('modal-title');
    const props: A11yProps = {
      role: 'dialog',
      'aria-modal': true as any,
      'aria-labelledby': titleId,
    };

    if (description) {
      const descId = this.generateId('modal-desc');
      props['aria-describedby'] = descId;
    }

    return props;
  }

  /**
   * Create ARIA props for live regions
   */
  static createLiveRegionProps(
    type: 'polite' | 'assertive' = 'polite',
    atomic: boolean = false
  ): A11yProps {
    return {
      'aria-live': type,
      'aria-atomic': atomic,
    };
  }

  /**
   * Create ARIA props for loading states
   */
  static createLoadingProps(label: string = 'Loading'): A11yProps {
    return {
      'aria-label': label,
      'aria-busy': true,
      role: 'status',
    };
  }

  /**
   * Create ARIA props for error messages
   */
  static createErrorProps(message: string): A11yProps {
    return {
      role: 'alert',
      'aria-live': 'assertive',
      'aria-atomic': true,
      'aria-label': `Error: ${message}`,
    };
  }

  /**
   * Create ARIA props for success messages
   */
  static createSuccessProps(message: string): A11yProps {
    return {
      role: 'status',
      'aria-live': 'polite',
      'aria-atomic': true,
      'aria-label': `Success: ${message}`,
    };
  }

  /**
   * Create ARIA props for navigation
   */
  static createNavProps(label: string, current?: boolean): A11yProps {
    const props: A11yProps = {
      role: 'navigation',
      'aria-label': label,
    };

    if (current) {
      props['aria-current'] = 'page' as any;
    }

    return props;
  }

  /**
   * Create ARIA props for tabs
   */
  static createTabProps(
    label: string,
    selected: boolean,
    controls: string,
    index: number
  ): A11yProps {
    return {
      role: 'tab',
      'aria-label': label,
      'aria-selected': selected as any,
      'aria-controls': controls,
      tabIndex: selected ? 0 : -1,
      id: `tab-${index}`,
    };
  }

  /**
   * Create ARIA props for tab panels
   */
  static createTabPanelProps(
    label: string,
    tabId: string,
    index: number
  ): A11yProps {
    return {
      role: 'tabpanel',
      'aria-label': label,
      'aria-labelledby': tabId,
      id: `tabpanel-${index}`,
      tabIndex: 0,
    };
  }

  /**
   * Handle keyboard navigation for interactive elements
   */
  static handleKeyboardNavigation(
    event: React.KeyboardEvent,
    onEnter?: () => void,
    onSpace?: () => void,
    onEscape?: () => void,
    onArrowUp?: () => void,
    onArrowDown?: () => void,
    onArrowLeft?: () => void,
    onArrowRight?: () => void
  ): void {
    switch (event.key) {
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter();
        }
        break;
      case ' ':
      case 'Space':
        if (onSpace) {
          event.preventDefault();
          onSpace();
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight();
        }
        break;
    }
  }

  /**
   * Focus management utilities
   */
  static focusElement(selector: string, delay: number = 0): void {
    setTimeout(() => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        element.focus();
      }
    }, delay);
  }

  static trapFocus(containerElement: HTMLElement): () => void {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    containerElement.addEventListener('keydown', handleTabKey);

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }

    // Return cleanup function
    return () => {
      containerElement.removeEventListener('keydown', handleTabKey);
    };
  }

  /**
   * Announce message to screen readers
   */
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  /**
   * Check if user prefers reduced motion
   */
  static prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Check if user prefers high contrast
   */
  static prefersHighContrast(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches;
  }

  /**
   * Get color contrast ratio
   */
  static getContrastRatio(color1: string, color2: string): number {
    // This is a simplified version - in production, use a proper color contrast library
    const getLuminance = (color: string): number => {
      // Convert hex to RGB and calculate luminance
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  /**
   * Check if color combination meets WCAG contrast requirements
   */
  static meetsContrastRequirement(
    color1: string, 
    color2: string, 
    level: 'AA' | 'AAA' = 'AA',
    size: 'normal' | 'large' = 'normal'
  ): boolean {
    const ratio = this.getContrastRatio(color1, color2);
    
    if (level === 'AAA') {
      return size === 'large' ? ratio >= 4.5 : ratio >= 7;
    } else {
      return size === 'large' ? ratio >= 3 : ratio >= 4.5;
    }
  }
}

// Export convenience functions
export const {
  generateId,
  createFieldProps,
  createButtonProps,
  createModalProps,
  createLiveRegionProps,
  createLoadingProps,
  createErrorProps,
  createSuccessProps,
  createNavProps,
  createTabProps,
  createTabPanelProps,
  handleKeyboardNavigation,
  focusElement,
  trapFocus,
  announceToScreenReader,
  prefersReducedMotion,
  prefersHighContrast,
  getContrastRatio,
  meetsContrastRequirement,
} = AccessibilityHelper;