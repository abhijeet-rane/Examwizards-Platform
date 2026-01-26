# PaymentModal Component

A modern, mobile-optimized payment modal component with Razorpay integration for course purchases.

## Features

### 🎨 Modern UI/UX Design
- **Glass-morphism design** with backdrop blur effects
- **Smooth animations** using Framer Motion
- **Mobile-optimized** with responsive design
- **Progress indicators** showing payment flow stages
- **Success/failure animations** with visual feedback

### 💳 Payment Integration
- **Razorpay integration** with secure payment processing
- **Multiple payment methods** (UPI, Cards, Net Banking, Wallets)
- **Payment verification** with backend confirmation
- **Error handling** with retry mechanisms
- **Loading states** throughout the payment flow

### 📱 Mobile Optimization
- **Full-screen modal** on mobile devices
- **Touch-friendly** interface elements
- **Responsive typography** and spacing
- **Optimized keyboard input** for mobile devices

### ♿ Accessibility Features
- **Keyboard navigation** support
- **Screen reader** compatible
- **Focus management** with proper focus trapping
- **ARIA labels** and semantic HTML structure

## Usage

```tsx
import { PaymentModal } from '../../components/modals/PaymentModal';

const MyComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const course = {
    id: 1,
    name: 'Advanced React Development',
    description: 'Learn advanced React concepts...',
    price: 2999,
    instructor: {
      fullName: 'John Doe',
    },
  };

  const handlePaymentSuccess = (courseId: number) => {
    console.log('Payment successful for course:', courseId);
    // Update UI, redirect, etc.
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Purchase Course
      </button>
      
      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        course={course}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | ✅ | Controls modal visibility |
| `onClose` | `() => void` | ✅ | Called when modal should close |
| `course` | `CourseInfo` | ✅ | Course information for payment |
| `onSuccess` | `(courseId: number) => void` | ✅ | Called after successful payment |

### CourseInfo Type

```tsx
interface CourseInfo {
  id: number;
  name: string;
  description?: string;
  price: number;
  instructor: {
    fullName: string;
  };
}
```

## Payment Flow States

The component manages several payment states:

1. **`idle`** - Initial state showing course info and payment button
2. **`initiating`** - Creating payment order with backend
3. **`processing`** - Razorpay payment window is open
4. **`success`** - Payment completed successfully
5. **`error`** - Payment failed or verification error

## Environment Variables

Make sure to set the Razorpay key in your environment:

```env
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Backend Integration

The component expects these API endpoints:

- `POST /api/courses/{courseId}/purchase` - Initiate payment order
- `POST /api/courses/payment/verify` - Verify payment signature

### Expected API Responses

**Initiate Purchase Response:**
```json
{
  "orderId": "order_xyz123",
  "amount": 299900,
  "currency": "INR",
  "courseName": "Advanced React Development",
  "studentName": "John Doe",
  "studentEmail": "john@example.com"
}
```

**Verify Payment Request:**
```json
{
  "razorpay_order_id": "order_xyz123",
  "razorpay_payment_id": "pay_abc456",
  "razorpay_signature": "signature_hash",
  "courseId": 1
}
```

## Security Features

- **Payment signature verification** prevents tampering
- **Secure token handling** with JWT authentication
- **No sensitive data storage** - relies on Razorpay for card details
- **SSL encryption** for all API communications

## Animations

The component includes several smooth animations:

- **Modal entrance/exit** with scale and fade effects
- **State transitions** with slide animations
- **Loading indicators** with rotating and pulsing effects
- **Success celebration** with scale and progress animations
- **Progress bar** showing payment flow completion

## Error Handling

Comprehensive error handling for:

- **Network failures** during payment initiation
- **Payment cancellation** by user
- **Payment verification failures**
- **Backend API errors**
- **Razorpay integration errors**

## Customization

The component uses the theme system for consistent styling:

```tsx
// Custom gradient colors
<PaymentModal
  // ... other props
  // Component automatically uses theme colors
/>
```

## Testing

The component can be tested using the demo page:

```tsx
import PaymentModalDemo from '../pages/demo/PaymentModalDemo';
```

## Dependencies

- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `framer-motion` - Animations
- `react-hot-toast` - Toast notifications
- Razorpay checkout script (loaded in index.html)

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **Lazy loading** - Modal content only renders when open
- **Optimized animations** with hardware acceleration
- **Minimal re-renders** with proper state management
- **Code splitting** ready for dynamic imports