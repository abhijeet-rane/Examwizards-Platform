import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { apiService } from '../services/apiService';

interface Review {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  user: {
    id: number;
    fullName: string;
    username: string;
    role: string;
    avatarUrl?: string;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
}

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Fallback testimonials in case no real reviews are available
  const fallbackTestimonials = [
    {
      name: 'Prof. A. Mehta',
      role: 'Head of Computer Science',
      institution: 'Delhi University',
      image: 'https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      text: 'ExamWizards made our semester assessments seamless. The platform is intuitive, reliable, and has significantly reduced our administrative workload.',
      highlight: 'Reduced admin workload by 70%'
    },
    {
      name: 'Ravi Kumar',
      role: 'Final Year Student',
      institution: 'IIT Bombay',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      text: 'The timer, auto-submit, and instant reports are excellent! The interface is clean and I never worry about technical issues during exams.',
      highlight: 'Zero technical difficulties'
    },
    {
      name: 'Dr. Sarah Johnson',
      role: 'Academic Director',
      institution: 'Oxford Online',
      image: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      text: 'Intuitive interface and reliable platform for remote exams. The analytics help us understand student performance better than ever.',
      highlight: 'Enhanced student insights'
    },
    {
      name: 'Michael Chen',
      role: 'IT Administrator',
      institution: 'Singapore Tech Institute',
      image: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      rating: 5,
      text: 'The security features and scalability are outstanding. We conducted 500+ simultaneous exams without any issues.',
      highlight: '500+ concurrent exams'
    }
  ];

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      // First test if the review system is working
      try {
        const testResponse = await fetch('/api/reviews/test');
        console.log('Review test endpoint status:', testResponse.status);
        if (!testResponse.ok) {
          console.warn('Review system test failed, using fallback testimonials');
          setLoading(false);
          return;
        }
      } catch (testError) {
        console.warn('Review system not available, using fallback testimonials:', testError);
        setLoading(false);
        return;
      }

      const [reviewsResponse, statsResponse] = await Promise.all([
        apiService.getRecentReviews(6),
        apiService.getReviewStatistics()
      ]);

      if (reviewsResponse.success && reviewsResponse.reviews.length > 0) {
        setReviews(reviewsResponse.reviews);
      }

      if (statsResponse.success) {
        setStats(statsResponse.statistics);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Use fallback data if API fails
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (user: Review['user']) => {
    if (user.avatarUrl) {
      return user.avatarUrl;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=ffffff&size=64&font-size=0.6`;
  };

  const getRoleDisplay = (role: string) => {
    switch (role.toLowerCase()) {
      case 'student':
        return 'Student';
      case 'instructor':
        return 'Instructor';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  // Function to truncate text professionally for better layout
  const truncateText = (text: string, maxLength: number = 280) => {
    if (text.length <= maxLength) return text;

    // Find the last sentence end before maxLength
    const truncated = text.substring(0, maxLength);
    const lastSentence = Math.max(
      truncated.lastIndexOf('.'),
      truncated.lastIndexOf('!'),
      truncated.lastIndexOf('?')
    );

    // If we found a sentence end, use it
    if (lastSentence > maxLength * 0.7) {
      return truncated.substring(0, lastSentence + 1);
    }

    // Otherwise, find the last space to avoid cutting words
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  };

  // Use real reviews if available, otherwise use fallback
  const displayData = reviews.length > 0 ? reviews : fallbackTestimonials;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % displayData.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + displayData.length) % displayData.length);
  };

  const getCurrentText = () => {
    const currentItem = displayData[currentIndex];
    if (reviews.length > 0) {
      return truncateText(currentItem.content, 200);
    }
    return truncateText(currentItem.text, 200);
  };

  return (
    <section id="reviews" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Our
            <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent"> Users Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of satisfied educators and students who trust ExamWizards for their assessment needs.
          </p>

          {/* Rating Badge */}
          <div className="inline-flex items-center bg-gradient-to-r from-purple-50 to-teal-50 rounded-full px-6 py-3 border border-purple-200">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <span className="text-lg font-bold text-gray-900">
                {stats ? stats.averageRating.toFixed(1) : '4.9'}/5
              </span>
              <span className="text-gray-600">
                • Based on {stats ? stats.totalReviews : '250'}+ reviews
              </span>
            </div>
          </div>
        </div>

        {/* Compact Testimonial Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-8 z-10">
            <button
              onClick={prevTestimonial}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-8 z-10">
            <button
              onClick={nextTestimonial}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200"
            >
              <ChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Main Testimonial Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="grid grid-cols-6 gap-0 min-h-[220px]">
              {/* Left Section - User Profile */}
              <div className="col-span-2 bg-gradient-to-br from-purple-600 to-indigo-700 p-8 text-white flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-2xl mb-4">
                  {reviews.length > 0
                    ? displayData[currentIndex].user.fullName.charAt(0).toUpperCase()
                    : displayData[currentIndex].name.charAt(0).toUpperCase()
                  }
                </div>

                <h3 className="text-base font-bold mb-2 leading-tight">
                  {reviews.length > 0
                    ? displayData[currentIndex].user.fullName
                    : displayData[currentIndex].name
                  }
                </h3>

                <p className="text-purple-100 text-sm mb-4">
                  {reviews.length > 0 ? getRoleDisplay(displayData[currentIndex].user.role) : displayData[currentIndex].role}
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center space-x-1 mb-4">
                  {[...Array(displayData[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-yellow-300 fill-current" />
                  ))}
                </div>

                {/* Badge */}
                <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <span className="text-sm font-medium text-white">
                    Verified {reviews.length > 0 ? getRoleDisplay(displayData[currentIndex].user.role) : 'User'}
                  </span>
                </div>
              </div>

              {/* Right Section - Testimonial Content */}
              <div className="col-span-4 p-8 flex flex-col justify-center">
                <div className="mb-6">
                  <Quote className="h-10 w-10 text-purple-200 mb-4" />
                  <p className="text-gray-700 text-base leading-relaxed font-medium">
                    {getCurrentText()}
                  </p>
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">
                      {reviews.length > 0 ? 'Verified Review' : 'Featured Testimonial'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {reviews.length > 0
                      ? new Date(displayData[currentIndex].createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })
                      : 'Aug 2025'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {displayData.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 ${index === currentIndex
                  ? 'w-6 h-2 bg-purple-600 rounded-full'
                  : 'w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;