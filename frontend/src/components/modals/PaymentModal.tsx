import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  Divider,
  Alert,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Payment as PaymentIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  CreditCard as CreditCardIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernButton } from '../ui/ModernButton';
import { ModernCard } from '../ui/ModernCard';
import { colors } from '../../theme/theme';
import { apiService } from '../../services/apiService';
import { handlePaymentError, showSuccess } from '../../utils/errorHandler';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: number;
    name: string;
    description?: string;
    price: number;
    instructor: {
      fullName: string;
    };
  };
  onSuccess: (courseId: number) => void;
}

interface PaymentState {
  status: 'idle' | 'initiating' | 'processing' | 'success' | 'error';
  error?: string;
  orderId?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  onSuccess,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });

  // Reset payment state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPaymentState({ status: 'idle' });
    }
  }, [isOpen]);

  const handlePayment = async () => {
    try {
      setPaymentState({ status: 'initiating' });

      // Check if Razorpay is available
      if (!window.Razorpay) {
        setPaymentState({
          status: 'error',
          error: 'Payment system is not available. Please refresh the page and try again.'
        });
        return;
      }

      // Get Razorpay configuration from backend
      const paymentConfig = await apiService.getPaymentConfig();
      const razorpayKey = paymentConfig.razorpayKeyId;

      // For development/testing - simulate payment if no real key is configured
      if (!razorpayKey || razorpayKey === 'rzp_test_1234567890') {
        // Simulate payment process for testing
        setPaymentState({ status: 'processing' });

        // Simulate payment delay
        setTimeout(() => {
          setPaymentState({ status: 'success' });
          showSuccess('Payment successful! You are now enrolled in the course.');

          // Delay to show success animation
          setTimeout(() => {
            onSuccess(course.id);
            onClose();
          }, 2000);
        }, 3000);
        return;
      }

      // Initiate payment order
      const paymentData = await apiService.initiatePurchase(course.id) as any;

      setPaymentState({
        status: 'processing',
        orderId: paymentData.orderId
      });

      // Configure Razorpay options
      const options = {
        key: razorpayKey,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        name: 'ExamWizards',
        description: `Course: ${course.name}`,
        order_id: paymentData.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment with backend
            await apiService.verifyPayment({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              courseId: course.id,
            });

            setPaymentState({ status: 'success' });
            showSuccess('Payment successful! You are now enrolled in the course.');

            // Delay to show success animation
            setTimeout(() => {
              onSuccess(course.id);
              onClose();
            }, 2000);
          } catch (verifyErr: any) {
            setPaymentState({
              status: 'error',
              error: 'Payment verification failed. Please contact support.'
            });
            handlePaymentError(verifyErr);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentState({ status: 'idle' });
          },
        },
        prefill: {
          name: paymentData.studentName || '',
          email: paymentData.studentEmail || '',
        },
        theme: {
          color: colors.primary[500],
        },
        notes: {
          course_id: course.id.toString(),
          course_name: course.name,
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response: any) => {
        setPaymentState({
          status: 'error',
          error: response.error.description || 'Payment failed. Please try again.'
        });
      });

      razorpay.open();
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to initiate payment';
      setPaymentState({ status: 'error', error: errorMessage });
      handlePaymentError(err, () => handlePayment());
    }
  };

  const handleClose = () => {
    if (paymentState.status === 'processing') {
      return; // Prevent closing during payment
    }
    onClose();
  };

  const renderContent = () => {
    switch (paymentState.status) {
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircleIcon
                className="text-green-500 mb-4 mx-auto"
                sx={{ fontSize: 80 }}
              />
            </motion.div>
            <Typography variant="h4" className="mb-2 text-green-600 font-bold">
              Payment Successful!
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-2">
              You are now enrolled in <strong>{course.name}</strong>
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              📧 A payment receipt has been sent to your email address
            </Typography>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1 }}
              className="h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto"
            />
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <ErrorIcon
              className="text-red-500 mb-4 mx-auto"
              sx={{ fontSize: 80 }}
            />
            <Typography variant="h5" className="mb-2 text-red-600 font-bold">
              Payment Failed
            </Typography>
            <Typography variant="body1" className="text-gray-600 mb-6">
              {paymentState.error}
            </Typography>
            <ModernButton
              variant="gradient"
              onClick={() => setPaymentState({ status: 'idle' })}
              gradientColors={[colors.primary[500], colors.secondary[500]]}
            >
              Try Again
            </ModernButton>
          </motion.div>
        );

      case 'initiating':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="mb-4"
            >
              <PaymentIcon
                className="text-blue-500 mx-auto"
                sx={{ fontSize: 60 }}
              />
            </motion.div>
            <Typography variant="h6" className="mb-2">
              Preparing Payment...
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              Please wait while we set up your secure payment
            </Typography>
          </motion.div>
        );

      case 'processing':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="mb-4"
            >
              <CreditCardIcon
                className="text-green-500 mx-auto"
                sx={{ fontSize: 60 }}
              />
            </motion.div>
            <Typography variant="h6" className="mb-2">
              Processing Payment...
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              Complete your payment in the Razorpay window
            </Typography>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-1 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mx-auto"
            />
          </motion.div>
        );

      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Course Information */}
            <ModernCard variant="glass" className="mb-6">
              <Box className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <SchoolIcon className="text-white text-2xl" />
                  </div>
                  <div className="flex-1">
                    <Typography variant="h6" className="font-bold mb-1">
                      {course.name}
                    </Typography>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      by {course.instructor.fullName}
                    </Typography>
                    {course.description && (
                      <Typography variant="body2" className="text-gray-500 line-clamp-2">
                        {course.description}
                      </Typography>
                    )}
                  </div>
                </div>
              </Box>
            </ModernCard>

            {/* Pricing Information */}
            <ModernCard variant="outlined" className="mb-6">
              <Box className="p-6">
                <Typography variant="h6" className="mb-4 flex items-center">
                  <PaymentIcon className="mr-2 text-blue-500" />
                  Payment Details
                </Typography>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Typography variant="body1">Course Price</Typography>
                    <Typography variant="h6" className="font-bold">
                      ₹{course.price.toLocaleString('en-IN')}
                    </Typography>
                  </div>

                  <Divider />

                  <div className="flex justify-between items-center">
                    <Typography variant="body1" className="font-semibold">
                      Total Amount
                    </Typography>
                    <Typography
                      variant="h5"
                      className="font-bold text-blue-600"
                    >
                      ₹{course.price.toLocaleString('en-IN')}
                    </Typography>
                  </div>
                </div>
              </Box>
            </ModernCard>

            {/* Security Information */}
            <Alert
              severity="info"
              icon={<SecurityIcon />}
              className="mb-6 rounded-xl"
            >
              <Typography variant="body2">
                Your payment is secured by Razorpay with 256-bit SSL encryption.
                We don't store your card details.
              </Typography>
            </Alert>

            {/* Payment Button */}
            <ModernButton
              variant="gradient"
              fullWidth
              onClick={handlePayment}
              className="py-4 text-lg font-semibold"
              gradientColors={[colors.primary[500], colors.secondary[500]]}
              glowEffect
            >
              <PaymentIcon className="mr-2" />
              Pay ₹{course.price.toLocaleString('en-IN')} Securely
            </ModernButton>

            {/* Payment Methods Info */}
            <Typography
              variant="caption"
              className="text-center text-gray-500 mt-4 block"
            >
              Supports UPI, Cards, Net Banking, and Wallets
            </Typography>
          </motion.div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={handleClose}
          maxWidth="sm"
          fullWidth
          fullScreen={isMobile}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: isMobile ? 0 : '16px',
              margin: isMobile ? 0 : 2,
              maxHeight: isMobile ? '100vh' : '90vh',
            },
          }}
          slots={{
            backdrop: motion.div,
          }}
          slotProps={{
            backdrop: {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              transition: { duration: 0.3 },
              style: {
                backdropFilter: 'blur(8px)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
              },
            } as any,
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <DialogContent className="p-0">
              {/* Header */}
              <div className="relative p-6 pb-4">
                <div className="flex items-center justify-between">
                  <Typography variant="h5" className="font-bold">
                    {paymentState.status === 'success' ? 'Payment Complete' :
                      paymentState.status === 'error' ? 'Payment Failed' :
                        paymentState.status === 'processing' ? 'Processing Payment' :
                          'Complete Purchase'}
                  </Typography>

                  {paymentState.status !== 'processing' && (
                    <IconButton
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-600"
                      size="small"
                    >
                      <CloseIcon />
                    </IconButton>
                  )}
                </div>

                {/* Progress indicator */}
                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{
                    width: paymentState.status === 'idle' ? '25%' :
                      paymentState.status === 'initiating' ? '50%' :
                        paymentState.status === 'processing' ? '75%' :
                          '100%'
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={paymentState.status}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </div>
            </DialogContent>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;