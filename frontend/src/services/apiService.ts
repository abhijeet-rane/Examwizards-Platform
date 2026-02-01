import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { handleApiError, handleNetworkError } from '../utils/errorHandler';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Check if token looks valid (basic format check)
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Invalid token format, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        // Invalid token, clear it
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle network errors
    if (!error.response) {
      handleNetworkError(error);
      return Promise.reject(error);
    }

    // Handle specific HTTP status codes
    switch (error.response.status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;

      case 403:
        // Forbidden - show error but don't redirect
        break;

      case 429:
        // Rate limiting
        handleApiError(error, {
          customMessage: 'Too many requests. Please wait a moment and try again.'
        });
        break;

      default:
        // Let individual API calls handle other errors
        break;
    }

    return Promise.reject(error);
  }
);

// API Service Class
export class ApiService {
  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string | null) {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Clear authentication tokens and reset client
   */
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  }

  // Authentication
  async login(credentials: { username: string; password: string }) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Login failed. Please check your credentials.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    fullName: string;
    role: string;
  }) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Registration failed. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  // Course Management
  async createCourse(formData: FormData) {
    const response = await apiClient.post('/courses/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getInstructorCourses() {
    try {
      const response = await apiClient.get('/courses/instructor');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load your courses.',
        showToast: false
      });
    }
  }

  async getPublicCourses() {
    try {
      const response = await apiClient.get('/courses/public');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load courses. Please refresh the page.',
        showToast: false
      });
    }
  }

  async getCourse(courseId: number) {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Course not found or access denied.',
        showToast: false
      });
    }
  }

  async checkCourseAccess(courseId: number) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/access`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to check course access.',
        showToast: false
      });
    }
  }

  // Enrollment Management
  async enrollInFreeCourse(courseId: number) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to enroll in course. Please try again.',
        showToast: false
      });
    }
  }

  async enrollInCourse(courseId: number) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/enroll`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to enroll in course. Please try again.',
        showToast: false
      });
    }
  }

  async getMyEnrollments(params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: string;
  }) {
    try {
      const response = await apiClient.get('/enrollments/my-enrollments', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load your enrollments.',
        showToast: false
      });
    }
  }

  async getEnrolledCourses() {
    try {
      const response = await apiClient.get('/courses/student/enrolled');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load enrolled courses.',
        showToast: false
      });
    }
  }

  async getEnrollmentDetails(enrollmentId: number) {
    try {
      const response = await apiClient.get(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load enrollment details.',
        showToast: false
      });
    }
  }

  async checkEnrollment(courseId: number) {
    try {
      const response = await apiClient.get(`/enrollments/check/${courseId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to check enrollment status.',
        showToast: false
      });
    }
  }

  async cancelEnrollment(enrollmentId: number) {
    try {
      const response = await apiClient.delete(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to cancel enrollment. Please try again.',
        showToast: false
      });
    }
  }

  // Payment Management
  async getPaymentConfig() {
    try {
      const response = await apiClient.get('/payment/config');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load payment configuration.',
        showToast: false
      });
    }
  }

  async initiatePurchase(courseId: number) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/purchase`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to initiate payment. Please try again.',
        showToast: false
      });
    }
  }

  async verifyPayment(paymentData: {
    orderId: string;
    paymentId: string;
    signature: string;
    courseId: number;
  }) {
    try {
      const response = await apiClient.post('/courses/payment/verify', paymentData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Payment verification failed. Please contact support if amount was deducted.',
        showToast: false
      });
    }
  }

  // Instructor Dashboard
  async getInstructorStats() {
    try {
      const response = await apiClient.get('/enrollments/instructor/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load instructor statistics.',
        showToast: false
      });
    }
  }

  async getDashboardData() {
    try {
      const response = await apiClient.get('/instructor/dashboard');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load dashboard data.',
        showToast: false
      });
    }
  }

  async getCoursesForInstructor() {
    try {
      const response = await apiClient.get('/courses/instructor');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load instructor courses.',
        showToast: false
      });
    }
  }

  async updateCourse(courseId: number, formData: FormData) {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to update course. Please check your input and try again.',
        showToast: false
      });
    }
  }

  async deleteCourse(courseId: number) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to delete course. Please try again.',
        showToast: false
      });
    }
  }

  async unenrollAllStudents(courseId: number) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/unenroll-all`);
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Failed to unenroll students. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  async getCourseEnrollments(courseId: number, params: {
    page: number;
    size: number;
  }) {
    try {
      const response = await apiClient.get(`/enrollments/course/${courseId}`, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load course enrollments.',
        showToast: false
      });
    }
  }

  // Exam Management (existing functionality)
  async createExam(examData: any) {
    try {
      const response = await apiClient.post('/exams', examData);
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Failed to create exam. Please check your input and try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  async updateExam(examId: number, examData: any) {
    try {
      const response = await apiClient.put(`/exams/${examId}`, examData);
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Failed to update exam. Please check your input and try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  async deleteExam(examId: number) {
    try {
      const response = await apiClient.delete(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to delete exam. Please try again.',
        showToast: false
      });
    }
  }

  async getExams() {
    try {
      const response = await apiClient.get('/exams');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load exams.',
        showToast: false
      });
    }
  }

  async getInstructorExams() {
    try {
      const response = await apiClient.get('/exams/instructor');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load instructor exams.',
        showToast: false
      });
    }
  }

  async getStudentDashboardData() {
    try {
      const response = await apiClient.get('/student/dashboard');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load student dashboard data.',
        showToast: false
      });
    }
  }

  async getAllowedExams(email: string) {
    try {
      const response = await apiClient.get(`/exams/allowed/${email}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load available exams.',
        showToast: false
      });
    }
  }

  async getExamsForEnrolledCourses() {
    try {
      const response = await apiClient.get('/exams/student/enrolled');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load exams for enrolled courses.',
        showToast: false
      });
    }
  }

  async getExamsByCourse(courseId: number) {
    try {
      const response = await apiClient.get(`/exams/course/${courseId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load exams for this course.',
        showToast: false
      });
    }
  }

  async getMyResults() {
    try {
      const response = await apiClient.get('/results/my-results');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load your exam results.',
        showToast: false
      });
    }
  }

  async getExam(examId: number) {
    try {
      const response = await apiClient.get(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Exam not found or access denied.',
        showToast: false
      });
    }
  }

  // Alias for compatibility with ExamInterface component
  async getExamById(examId: number) {
    return this.getExam(examId);
  }

  async getEmailStatus() {
    try {
      const response = await apiClient.get('/email/status');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to get email status.',
        showToast: false
      });
    }
  }

  async submitExam(examId: number, answers: any, timeTaken?: number) {
    try {
      const requestBody = {
        answers: answers,
        timeTaken: timeTaken || 0
      };
      const response = await apiClient.post(`/exams/${examId}/submit`, requestBody);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to submit exam. Please try again.',
        showToast: false
      });
    }
  }

  async getExamResults(examId: number) {
    try {
      const response = await apiClient.get(`/results/exam/${examId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load exam results.',
        showToast: false
      });
    }
  }

  // User Management
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load user information.',
        showToast: false
      });
    }
  }

  async getUserProfile() {
    try {
      const response = await apiClient.get('/users/me');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load user profile.',
        showToast: false
      });
    }
  }

  async updateProfile(userData: any) {
    try {
      const response = await apiClient.put('/users/me', userData);
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Failed to update profile. Please try again.';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  async updateUserProfile(userData: any) {
    return this.updateProfile(userData);
  }

  // Password Reset functionality
  async forgotPassword(email: string) {
    try {
      const response = await apiClient.post('/auth/request-password-reset', { email });
      return response.data;
    } catch (error: any) {
      // Extract error message from response
      let errorMessage = 'Failed to send password reset email';

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      }

      // Create a standardized error object
      const apiError = {
        response: {
          data: { error: errorMessage },
          status: error?.response?.status || 500
        },
        message: errorMessage
      };

      throw apiError;
    }
  }

  // Public Statistics
  async getPublicStats() {
    try {
      console.log('Making API call to /public/stats');
      const response = await apiClient.get('/public/stats');
      console.log('Public stats API response:', response.data);
      return {
        activeUsers: response.data.activeUsers || 0,
        examsCompleted: response.data.examsCompleted || 0,
        totalCourses: response.data.totalCourses || 0,
        totalEnrollments: response.data.totalEnrollments || 0,
        totalExams: response.data.totalExams || 0
      };
    } catch (error) {
      console.error('Failed to fetch public stats:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Return default values if API fails
      return {
        activeUsers: 0,
        examsCompleted: 0,
        totalCourses: 0,
        totalEnrollments: 0,
        totalExams: 0
      };
    }
  }

  // Admin Dashboard
  async getAdminDashboardData() {
    try {
      console.log('Making API call to /admin/dashboard');
      const response = await apiClient.get('/admin/dashboard');
      console.log('Admin dashboard API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Admin dashboard API call failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);

      // Try the simple admin dashboard endpoint as fallback
      try {
        console.log('Trying fallback endpoint /admin/simple-dashboard');
        const fallbackResponse = await apiClient.get('/admin/simple-dashboard');
        console.log('Fallback admin dashboard API response:', fallbackResponse.data);
        return fallbackResponse.data;
      } catch (fallbackError) {
        console.error('Fallback admin dashboard API call also failed:', fallbackError);

        // Try the old dashboard endpoint as last resort
        try {
          console.log('Trying last resort endpoint /dashboard');
          const lastResortResponse = await apiClient.get('/dashboard');
          console.log('Last resort dashboard API response:', lastResortResponse.data);
          return lastResortResponse.data;
        } catch (lastResortError) {
          console.error('All dashboard endpoints failed:', lastResortError);
          throw error;
        }
      }
    }
  }

  // User Management
  async getAllUsers() {
    try {
      console.log('Making API call to /admin/users');
      const response = await apiClient.get('/admin/users');
      console.log('Get all users API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get all users API call failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async getUserStats() {
    try {
      console.log('Making API call to /admin/users/stats');
      const response = await apiClient.get('/admin/users/stats');
      console.log('Get user stats API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get user stats API call failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      console.log('Making API call to delete user:', userId);
      const response = await apiClient.delete(`/admin/users/${userId}`);
      console.log('Delete user API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Delete user API call failed:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  }

  // Chatbot endpoint
  async askChatbot(question: string) {
    const CHATBOT_API_URL = 'http://localhost:5000/api/ask';
    try {
      const response = await axios.post(CHATBOT_API_URL, { question });
      return response.data;
    } catch (error: any) {
      console.error('Chatbot error:', error?.response?.data?.error || 'Chatbot error');
      throw error;
    }
  }

  // Review Management
  async submitReview(reviewData: { content: string; rating: number }) {
    try {
      const response = await apiClient.post('/reviews/submit', reviewData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to submit review. Please try again.',
        showToast: false
      });
    }
  }

  async updateReview(reviewData: { content: string; rating: number }) {
    try {
      const response = await apiClient.put('/reviews/update', reviewData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to update review. Please try again.',
        showToast: false
      });
    }
  }

  async getMyReview() {
    try {
      const response = await apiClient.get('/reviews/my-review');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load your review.',
        showToast: false
      });
    }
  }

  async deleteReview() {
    try {
      const response = await apiClient.delete('/reviews/delete');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to delete review. Please try again.',
        showToast: false
      });
    }
  }

  async getPublicReviews(page: number = 0, size: number = 10) {
    try {
      const response = await apiClient.get(`/reviews/public?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load reviews.',
        showToast: false
      });
    }
  }

  async getRecentReviews(limit: number = 6) {
    try {
      const response = await apiClient.get(`/reviews/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load recent reviews.',
        showToast: false
      });
    }
  }

  async getReviewStatistics() {
    try {
      const response = await apiClient.get('/reviews/statistics');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load review statistics.',
        showToast: false
      });
    }
  }

  // Admin Review Management
  async getPendingReviews(page: number = 0, size: number = 10) {
    try {
      const response = await apiClient.get(`/reviews/pending?page=${page}&size=${size}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load pending reviews.',
        showToast: false
      });
    }
  }

  async approveReview(reviewId: number) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/approve`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to approve review.',
        showToast: false
      });
    }
  }

  async rejectReview(reviewId: number) {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/reject`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to reject review.',
        showToast: false
      });
    }
  }

  // Utility methods
  async healthCheck() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Service is currently unavailable.',
        showToast: false
      });
    }
  }

  // File upload utility
  async uploadFile(file: File, endpoint: string) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for file uploads
      });

      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'File upload failed. Please try again.',
        showToast: false
      });
    }
  }

  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  }

  // Contact Management
  async submitContactForm(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    try {
      const response = await apiClient.post('/contact', contactData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to send message. Please try again.',
        showToast: false
      });
    }
  }

  async getContactMessages(params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: string;
    email?: string;
    status?: string;
    searchTerm?: string;
    startDate?: string;
    endDate?: string;
  }) {
    try {
      const response = await apiClient.get('/contact/admin/messages', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load contact messages.',
        showToast: false
      });
    }
  }

  async getContactStats() {
    try {
      const response = await apiClient.get('/contact/admin/stats');
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load contact statistics.',
        showToast: false
      });
    }
  }

  async updateContactMessageStatus(messageId: number, statusData: {
    status: string;
    adminResponse?: string;
  }) {
    try {
      const response = await apiClient.put(`/contact/admin/messages/${messageId}/status`, statusData);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to update message status.',
        showToast: false
      });
    }
  }

  async deleteContactMessage(messageId: number) {
    try {
      const response = await apiClient.delete(`/contact/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to delete message.',
        showToast: false
      });
    }
  }

  async getContactMessage(messageId: number) {
    try {
      const response = await apiClient.get(`/contact/admin/messages/${messageId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error, {
        customMessage: 'Failed to load message details.',
        showToast: false
      });
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;