import { 
  handleApiError, 
  formatErrorMessage, 
  isNetworkError, 
  isAuthError, 
  isValidationError,
  getErrorCode,
  getErrorDetails,
  createErrorResponse,
  logError
} from '../errorHandler';

// Mock console methods
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});

describe('errorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockConsoleError.mockRestore();
    mockConsoleWarn.mockRestore();
  });

  describe('handleApiError', () => {
    it('handles network errors', () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';

      const result = handleApiError(networkError);

      expect(result.message).toBe('Network connection failed. Please check your internet connection.');
      expect(result.type).toBe('network');
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('handles timeout errors', () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');

      const result = handleApiError(timeoutError);

      expect(result.message).toBe('Request timed out. Please try again.');
      expect(result.type).toBe('timeout');
      expect(result.code).toBe('TIMEOUT_ERROR');
    });

    it('handles 401 authentication errors', () => {
      const authError = {
        response: {
          status: 401,
          data: { error: 'Authentication required' }
        }
      };

      const result = handleApiError(authError);

      expect(result.message).toBe('Authentication required. Please log in again.');
      expect(result.type).toBe('auth');
      expect(result.code).toBe('AUTH_ERROR');
    });

    it('handles 403 authorization errors', () => {
      const authError = {
        response: {
          status: 403,
          data: { error: 'Access denied' }
        }
      };

      const result = handleApiError(authError);

      expect(result.message).toBe('You do not have permission to perform this action.');
      expect(result.type).toBe('auth');
      expect(result.code).toBe('AUTH_ERROR');
    });

    it('handles 400 validation errors', () => {
      const validationError = {
        response: {
          status: 400,
          data: { 
            error: 'Validation failed',
            details: ['Name is required', 'Email is invalid']
          }
        }
      };

      const result = handleApiError(validationError);

      expect(result.message).toBe('Validation failed');
      expect(result.type).toBe('validation');
      expect(result.code).toBe('VALIDATION_ERROR');
      expect(result.details).toEqual(['Name is required', 'Email is invalid']);
    });

    it('handles 404 not found errors', () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { error: 'Course not found' }
        }
      };

      const result = handleApiError(notFoundError);

      expect(result.message).toBe('Course not found');
      expect(result.type).toBe('client');
      expect(result.code).toBe('NOT_FOUND');
    });

    it('handles 500 server errors', () => {
      const serverError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        }
      };

      const result = handleApiError(serverError);

      expect(result.message).toBe('Server error occurred. Please try again later.');
      expect(result.type).toBe('server');
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('handles payment specific errors', () => {
      const paymentError = {
        response: {
          status: 400,
          data: { error: 'Payment verification failed' }
        }
      };

      const result = handleApiError(paymentError);

      expect(result.message).toBe('Payment verification failed. Please try again or contact support.');
      expect(result.type).toBe('payment');
      expect(result.code).toBe('PAYMENT_ERROR');
    });

    it('handles enrollment specific errors', () => {
      const enrollmentError = {
        response: {
          status: 400,
          data: { error: 'Already enrolled in this course' }
        }
      };

      const result = handleApiError(enrollmentError);

      expect(result.message).toBe('Already enrolled in this course');
      expect(result.type).toBe('enrollment');
      expect(result.code).toBe('ENROLLMENT_ERROR');
    });

    it('handles unknown errors', () => {
      const unknownError = new Error('Something went wrong');

      const result = handleApiError(unknownError);

      expect(result.message).toBe('An unexpected error occurred. Please try again.');
      expect(result.type).toBe('unknown');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('handles errors without message', () => {
      const errorWithoutMessage = {};

      const result = handleApiError(errorWithoutMessage);

      expect(result.message).toBe('An unexpected error occurred. Please try again.');
      expect(result.type).toBe('unknown');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('formatErrorMessage', () => {
    it('formats simple error messages', () => {
      const result = formatErrorMessage('Simple error');
      expect(result).toBe('Simple error');
    });

    it('formats error messages with details', () => {
      const result = formatErrorMessage('Validation failed', ['Name is required', 'Email is invalid']);
      expect(result).toBe('Validation failed: Name is required, Email is invalid');
    });

    it('handles empty details array', () => {
      const result = formatErrorMessage('Error message', []);
      expect(result).toBe('Error message');
    });

    it('handles undefined details', () => {
      const result = formatErrorMessage('Error message', undefined);
      expect(result).toBe('Error message');
    });
  });

  describe('isNetworkError', () => {
    it('identifies network errors by name', () => {
      const networkError = new Error('Network Error');
      networkError.name = 'NetworkError';
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('identifies network errors by message', () => {
      const networkError = new Error('Network connection failed');
      expect(isNetworkError(networkError)).toBe(true);
    });

    it('identifies timeout errors', () => {
      const timeoutError = new Error('timeout of 5000ms exceeded');
      expect(isNetworkError(timeoutError)).toBe(true);
    });

    it('returns false for non-network errors', () => {
      const regularError = new Error('Regular error');
      expect(isNetworkError(regularError)).toBe(false);
    });
  });

  describe('isAuthError', () => {
    it('identifies 401 errors', () => {
      const authError = { response: { status: 401 } };
      expect(isAuthError(authError)).toBe(true);
    });

    it('identifies 403 errors', () => {
      const authError = { response: { status: 403 } };
      expect(isAuthError(authError)).toBe(true);
    });

    it('returns false for non-auth errors', () => {
      const regularError = { response: { status: 400 } };
      expect(isAuthError(regularError)).toBe(false);
    });

    it('returns false for errors without response', () => {
      const regularError = new Error('Regular error');
      expect(isAuthError(regularError)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('identifies 400 validation errors', () => {
      const validationError = { response: { status: 400 } };
      expect(isValidationError(validationError)).toBe(true);
    });

    it('identifies 422 validation errors', () => {
      const validationError = { response: { status: 422 } };
      expect(isValidationError(validationError)).toBe(true);
    });

    it('returns false for non-validation errors', () => {
      const regularError = { response: { status: 500 } };
      expect(isValidationError(regularError)).toBe(false);
    });
  });

  describe('getErrorCode', () => {
    it('extracts error code from response', () => {
      const error = {
        response: {
          data: { code: 'CUSTOM_ERROR_CODE' }
        }
      };
      expect(getErrorCode(error)).toBe('CUSTOM_ERROR_CODE');
    });

    it('returns default code for errors without code', () => {
      const error = { response: { data: {} } };
      expect(getErrorCode(error)).toBe('UNKNOWN_ERROR');
    });

    it('returns default code for errors without response', () => {
      const error = new Error('Regular error');
      expect(getErrorCode(error)).toBe('UNKNOWN_ERROR');
    });
  });

  describe('getErrorDetails', () => {
    it('extracts error details from response', () => {
      const error = {
        response: {
          data: { details: ['Detail 1', 'Detail 2'] }
        }
      };
      expect(getErrorDetails(error)).toEqual(['Detail 1', 'Detail 2']);
    });

    it('returns undefined for errors without details', () => {
      const error = { response: { data: {} } };
      expect(getErrorDetails(error)).toBeUndefined();
    });
  });

  describe('createErrorResponse', () => {
    it('creates error response with all fields', () => {
      const result = createErrorResponse(
        'Test message',
        'test',
        'TEST_CODE',
        ['Detail 1', 'Detail 2']
      );

      expect(result).toEqual({
        message: 'Test message',
        type: 'test',
        code: 'TEST_CODE',
        details: ['Detail 1', 'Detail 2'],
        timestamp: expect.any(Date)
      });
    });

    it('creates error response without details', () => {
      const result = createErrorResponse('Test message', 'test', 'TEST_CODE');

      expect(result).toEqual({
        message: 'Test message',
        type: 'test',
        code: 'TEST_CODE',
        timestamp: expect.any(Date)
      });
    });
  });

  describe('logError', () => {
    it('logs errors to console', () => {
      const error = new Error('Test error');
      const context = { userId: 123, action: 'test' };

      logError(error, context);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error occurred:',
        {
          message: 'Test error',
          context,
          timestamp: expect.any(Date),
          stack: expect.any(String)
        }
      );
    });

    it('logs errors without context', () => {
      const error = new Error('Test error');

      logError(error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error occurred:',
        {
          message: 'Test error',
          context: undefined,
          timestamp: expect.any(Date),
          stack: expect.any(String)
        }
      );
    });

    it('handles errors without stack trace', () => {
      const error = { message: 'Test error' };

      logError(error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Error occurred:',
        {
          message: 'Test error',
          context: undefined,
          timestamp: expect.any(Date),
          stack: undefined
        }
      );
    });
  });
});