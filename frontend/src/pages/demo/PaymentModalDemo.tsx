import React, { useState } from 'react';
import { Container, Typography, Box } from '@mui/material';
import { ModernButton } from '../../components/ui/ModernButton';
import { PaymentModal } from '../../components/modals/PaymentModal';
import { colors } from '../../theme/theme';

const PaymentModalDemo: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const mockCourse = {
    id: 1,
    name: 'Advanced React Development',
    description: 'Learn advanced React concepts including hooks, context, performance optimization, and modern patterns.',
    price: 2999,
    instructor: {
      fullName: 'John Doe',
    },
  };

  const handlePaymentSuccess = (courseId: number) => {
    console.log('Payment successful for course:', courseId);
    // In a real app, this would update the UI, redirect, etc.
  };

  return (
    <Container maxWidth="md" className="py-8">
      <Typography variant="h3" className="text-center mb-8">
        Payment Modal Demo
      </Typography>
      
      <Box className="text-center">
        <Typography variant="body1" className="mb-6">
          Click the button below to test the PaymentModal component with a mock course.
        </Typography>
        
        <ModernButton
          variant="gradient"
          onClick={() => setIsModalOpen(true)}
          gradientColors={[colors.primary[500], colors.secondary[500]]}
          className="px-8 py-3"
        >
          Open Payment Modal
        </ModernButton>
      </Box>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={mockCourse}
        onSuccess={handlePaymentSuccess}
      />
    </Container>
  );
};

export default PaymentModalDemo;