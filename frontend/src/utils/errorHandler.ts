import toast from 'react-hot-toast';

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
  path: string;
  fieldErrors?: Record<string, string>;
  validationErrors?: Record<string, string>;
  retryable?: boolean;
}

export interface ErrorHandlerOptions {
  showToast?: boolean;
  customMessage?: string;
  onRetry?: () => void;
  fallbackMessage?: string;
}

export class ErrorHandler {
  /**
   * Handle API errors with appropriate user feedback
   */
  static handleApiError(error: any, options: ErrorHandlerOptions = {}): ApiError | null {
    const {
      showToast = true,
      customMessage,
      onRetry,
      fallbackMessage = 'An unexpected error occurred'
    } = options;

    let apiError: ApiError | null = null;

    // Handle different error types
    if (error?.response?.data) {
      // Axios error with response
      apiError = ErrorHandler.parseApiError(error.response.data, error.response.status);
    } else if (error?.data) {
      // Direct API error object
      apiError = ErrorHandler.parseApiError(error.data, error.status || 500);
    } else if (error?.message) {
      // Generic error with message
      apiError = {
        status: 500,
        error: 'Client Error',
        message: error.message,
        timestamp: new Date().toISOString(),
        path: window.location.pathname
      };
    } else {
      // Unknown error
      apiError = {
        status: 500,
        error: 'Unknown Error',
        message: fallbackMessage,
        timestamp: new Date().toISOString(),
        path: window.location.pathname
      };
    }

    if (showToast) {
      ErrorHandler.showErrorToast(apiError, customMessage, onRetry);
    }

    // Log error for debugging
    console.error('API Error:', apiError, 'Original error:', error);

    return apiError;
  }

  /**
   * Parse API error response into standardized format
   */
  private static parseApiError(errorData: any, status: number): ApiError {
    return {
      status: errorData.status || status,
      error: errorData.error || 'API Error',
      message: errorData.message || 'An error occurred',
      timestamp: errorData.timestamp || new Date().toISOString(),
      path: errorData.path || window.location.pathname,
      fieldErrors: errorData.fieldErrors || errorData.validationErrors,
      validationErrors: errorData.validationErrors || errorData.fieldErrors,
      retryable: errorData.retryable
    };
  }

  /**
   * Show appropriate toast message based on error type
   */
  private static showErrorToast(apiError: ApiError, customMessage?: string, onRetry?: () => void) {
    const message = customMessage || ErrorHandler.getErrorMessage(apiError);

    if (apiError.retryable && onRetry) {
      toast.error(`${message} (Click to retry)`, {
        duration: 6000,
        onClick: () => {
          toast.dismiss();
          onRetry();
        }
      });
    } else {
      toast.error(message, {
        duration: ErrorHandler.getToastDuration(apiError.status)
      });
    }
  }

  /**
   * Get user-friendly error message based on error details
   */
  private static getErrorMessage(apiError: ApiError): string {
    // Handle specific error types
    switch (apiError.status) {
      case 400:
        if (apiError.fieldErrors || apiError.validationErrors) {
          return 'Please check your input and try again';
        }
        return apiError.message || 'Invalid request';
      
      case 401:
        return 'Please log in to continue';
      
      case 403:
        return 'You don\'t have permission to perform this action';
      
      case 404:
        return 'The requested resource was not found';
      
      case 409:
        return apiError.message || 'This item already exists';
      
      case 422:
        return apiError.message || 'Unable to process your request';
      
      case 429:
        return 'Too many requests. Please wait a moment and try again';
      
      case 500:
        return 'Server error. Please try again later';
      
      case 503:
        return 'Service temporarily unavailable. Please try again later';
      
      default:
        return apiError.message || 'An unexpected error occurred';
    }
  }

  /**
   * Get toast duration based on error severity
   */
  private static getToastDuration(status: number): number {
    if (status >= 500) return 6000; // Server errors - longer duration
    if (status === 401 || status === 403) return 5000; // Auth errors
    return 4000; // Default duration
  }

  /**
   * Handle validation errors specifically
   */
  static handleValidationErrors(
    fieldErrors: Record<string, string>,
    setFieldError?: (field: string, message: string) => void
  ): void {
    Object.entries(fieldErrors).forEach(([field, message]) => {
      if (setFieldError) {
        setFieldError(field, message);
      }
      toast.error(`${field}: ${message}`, { duration: 4000 });
    });
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: any): void {
    if (!navigator.onLine) {
      toast.error('No internet connection. Please check your network and try again.', {
        duration: 6000
      });
    } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('Network Error')) {
      toast.error('Network error. Please check your connection and try again.', {
        duration: 5000
      });
    } else {
      toast.error('Connection failed. Please try again.', {
        duration: 4000
      });
    }
  }

  /**
   * Handle payment errors specifically
   */
  static handlePaymentError(error: any, onRetry?: () => void): void {
    const apiError = ErrorHandler.handleApiError(error, { showToast: false });
    
    if (apiError?.status === 422) {
      // Payment processing error
      if (apiError.retryable && onRetry) {
        toast.error(`${apiError.message} (Click to retry payment)`, {
          duration: 8000,
          onClick: () => {
            toast.dismiss();
            onRetry();
          }
        });
      } else {
        toast.error(apiError.message || 'Payment failed. Please try again.', {
          duration: 6000
        });
      }
    } else {
      toast.error('Payment processing failed. Please try again or contact support.', {
        duration: 6000
      });
    }
  }

  /**
   * Show success message
   */
  static showSuccess(message: string, duration: number = 3000): void {
    toast.success(message, { duration });
  }

  /**
   * Show info message
   */
  static showInfo(message: string, duration: number = 3000): void {
    toast(message, { 
      duration,
      icon: 'ℹ️'
    });
  }

  /**
   * Show loading toast
   */
  static showLoading(message: string = 'Loading...'): string {
    return toast.loading(message);
  }

  /**
   * Dismiss specific toast
   */
  static dismiss(toastId: string): void {
    toast.dismiss(toastId);
  }

  /**
   * Dismiss all toasts
   */
  static dismissAll(): void {
    toast.dismiss();
  }
}

// Export convenience functions
export const handleApiError = ErrorHandler.handleApiError;
export const handleValidationErrors = ErrorHandler.handleValidationErrors;
export const handleNetworkError = ErrorHandler.handleNetworkError;
export const handlePaymentError = ErrorHandler.handlePaymentError;
export const showSuccess = ErrorHandler.showSuccess;
export const showInfo = ErrorHandler.showInfo;
export const showLoading = ErrorHandler.showLoading;
export const dismiss = ErrorHandler.dismiss;
export const dismissAll = ErrorHandler.dismissAll;