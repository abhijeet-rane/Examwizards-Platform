import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import PaymentModal from '../PaymentModal';
import { theme } from '../../../theme/theme';
import * as apiService from '../../../services/apiService';

// Mock the API service
jest.mock('../../../services/apiService');
const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Mock Razorpay
const mockRazorpay = {
  open: jest.fn(),
  on: jest.fn(),
};

(global as any).Razorpay = jest.fn(() => mockRazorpay);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
      <Toaster />
    </ThemeProvider>
  </BrowserRouter>
);

const mockCourse = {
  id: 1,
  name: 'Test Course',
  description: 'Test course description',
  pricing: 'PAID' as const,
  price: 1000,
  instructor: {
    fullName: 'Test Instructor',
  },
};

describe('PaymentModal', () => {
  const defaultProps = {
    open: true,
    onClose: jest.fn(),
    course: mockCourse,
    onPaymentSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders payment modal with course details', () => {
    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Complete Your Purchase')).toBeInTheDocument();
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test Instructor')).toBeInTheDocument();
    expect(screen.getByText('₹1,000')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} open={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Complete Your Purchase')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('initiates payment when pay now button is clicked', async () => {
    const mockOrderData = {
      orderId: 'order_test123',
      amount: 100000,
      currency: 'INR',
      courseName: 'Test Course',
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
    };

    mockApiService.initiatePurchase.mockResolvedValue(mockOrderData);

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockApiService.initiatePurchase).toHaveBeenCalledWith(1);
    });

    expect(global.Razorpay).toHaveBeenCalledWith({
      key: expect.any(String),
      amount: 100000,
      currency: 'INR',
      name: 'ExamPort',
      description: 'Test Course',
      order_id: 'order_test123',
      prefill: {
        name: 'Test Student',
        email: 'test@example.com',
      },
      theme: {
        color: expect.any(String),
      },
      handler: expect.any(Function),
      modal: {
        ondismiss: expect.any(Function),
      },
    });
  });

  it('handles payment initiation error', async () => {
    const error = new Error('Payment initiation failed');
    mockApiService.initiatePurchase.mockRejectedValue(error);

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(mockApiService.initiatePurchase).toHaveBeenCalledWith(1);
    });

    // Check that loading state is reset
    expect(screen.getByText('Pay Now')).toBeInTheDocument();
  });

  it('handles successful payment verification', async () => {
    const mockOrderData = {
      orderId: 'order_test123',
      amount: 100000,
      currency: 'INR',
      courseName: 'Test Course',
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
    };

    const mockPaymentResponse = {
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test123',
      razorpay_signature: 'signature_test123',
    };

    const mockVerificationResponse = {
      success: true,
      message: 'Payment verified successfully',
      enrollmentId: 1,
    };

    mockApiService.initiatePurchase.mockResolvedValue(mockOrderData);
    mockApiService.verifyPayment.mockResolvedValue(mockVerificationResponse);

    const onPaymentSuccess = jest.fn();

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} onPaymentSuccess={onPaymentSuccess} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.Razorpay).toHaveBeenCalled();
    });

    // Simulate successful payment
    const razorpayInstance = (global.Razorpay as jest.Mock).mock.results[0].value;
    const paymentHandler = (global.Razorpay as jest.Mock).mock.calls[0][0].handler;
    
    paymentHandler(mockPaymentResponse);

    await waitFor(() => {
      expect(mockApiService.verifyPayment).toHaveBeenCalledWith({
        ...mockPaymentResponse,
        courseId: 1,
      });
    });

    expect(onPaymentSuccess).toHaveBeenCalledWith(mockVerificationResponse);
  });

  it('handles payment verification error', async () => {
    const mockOrderData = {
      orderId: 'order_test123',
      amount: 100000,
      currency: 'INR',
      courseName: 'Test Course',
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
    };

    const mockPaymentResponse = {
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test123',
      razorpay_signature: 'signature_test123',
    };

    mockApiService.initiatePurchase.mockResolvedValue(mockOrderData);
    mockApiService.verifyPayment.mockRejectedValue(new Error('Verification failed'));

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.Razorpay).toHaveBeenCalled();
    });

    // Simulate successful payment but failed verification
    const paymentHandler = (global.Razorpay as jest.Mock).mock.calls[0][0].handler;
    paymentHandler(mockPaymentResponse);

    await waitFor(() => {
      expect(mockApiService.verifyPayment).toHaveBeenCalled();
    });

    // Should show error state
    expect(screen.getByText('Payment Failed')).toBeInTheDocument();
  });

  it('shows loading state during payment processing', async () => {
    mockApiService.initiatePurchase.mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays course pricing correctly for free courses', () => {
    const freeCourse = {
      ...mockCourse,
      pricing: 'FREE' as const,
      price: 0,
    };

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} course={freeCourse} />
      </TestWrapper>
    );

    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.queryByText('₹')).not.toBeInTheDocument();
  });

  it('handles modal dismiss during payment', async () => {
    const mockOrderData = {
      orderId: 'order_test123',
      amount: 100000,
      currency: 'INR',
      courseName: 'Test Course',
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
    };

    mockApiService.initiatePurchase.mockResolvedValue(mockOrderData);

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.Razorpay).toHaveBeenCalled();
    });

    // Simulate modal dismiss
    const dismissHandler = (global.Razorpay as jest.Mock).mock.calls[0][0].modal.ondismiss;
    dismissHandler();

    // Should reset to initial state
    expect(screen.getByText('Pay Now')).toBeInTheDocument();
  });

  it('displays correct payment amount formatting', () => {
    const expensiveCourse = {
      ...mockCourse,
      price: 12345.67,
    };

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} course={expensiveCourse} />
      </TestWrapper>
    );

    expect(screen.getByText('₹12,345.67')).toBeInTheDocument();
  });

  it('shows success state after payment completion', async () => {
    const mockOrderData = {
      orderId: 'order_test123',
      amount: 100000,
      currency: 'INR',
      courseName: 'Test Course',
      studentName: 'Test Student',
      studentEmail: 'test@example.com',
    };

    const mockVerificationResponse = {
      success: true,
      message: 'Payment verified successfully',
      enrollmentId: 1,
    };

    mockApiService.initiatePurchase.mockResolvedValue(mockOrderData);
    mockApiService.verifyPayment.mockResolvedValue(mockVerificationResponse);

    render(
      <TestWrapper>
        <PaymentModal {...defaultProps} />
      </TestWrapper>
    );

    const payButton = screen.getByText('Pay Now');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(global.Razorpay).toHaveBeenCalled();
    });

    // Simulate successful payment
    const paymentHandler = (global.Razorpay as jest.Mock).mock.calls[0][0].handler;
    paymentHandler({
      razorpay_order_id: 'order_test123',
      razorpay_payment_id: 'pay_test123',
      razorpay_signature: 'signature_test123',
    });

    await waitFor(() => {
      expect(screen.getByText('Payment Successful!')).toBeInTheDocument();
    });

    expect(screen.getByText('You have been successfully enrolled in the course.')).toBeInTheDocument();
  });
});