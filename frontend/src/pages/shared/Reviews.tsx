import React, { useState, useEffect } from 'react';
import { Star, Send, Edit3, Trash2, MessageSquare, Users } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Review {
  id: number;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
  isApproved: boolean;
  user: {
    id: number;
    fullName: string;
    username: string;
    role: string;
    avatarUrl?: string;
  };
}

const Reviews: React.FC = () => {
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [hasReview, setHasReview] = useState(false);
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Debug log to verify component is loading
  console.log('Reviews component loaded');
  
  // Form state
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);

  // Pagination state for recent reviews
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const reviewsPerPage = 5;
  const maxReviews = 30;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMyReview(),
        fetchPublicReviews()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyReview = async () => {
    try {
      const response = await apiService.getMyReview();
      if (response.success && response.hasReview) {
        setMyReview(response.review);
        setHasReview(true);
        setContent(response.review.content);
        setRating(response.review.rating);
      } else {
        setHasReview(false);
        setMyReview(null);
      }
    } catch (error) {
      console.error('Error fetching my review:', error);
    }
  };

  const fetchPublicReviews = async (page: number = 1) => {
    setReviewsLoading(true);
    try {
      const offset = (page - 1) * reviewsPerPage;
      const response = await apiService.getPublicReviews(offset, reviewsPerPage);
      if (response.success) {
        if (page === 1) {
          setPublicReviews(response.reviews);
        } else {
          setPublicReviews(prev => [...prev, ...response.reviews]);
        }
      }
    } catch (error) {
      console.error('Error fetching public reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() || content.trim().length < 10) {
      toast.error('Review content must be at least 10 characters long');
      return;
    }

    if (content.trim().length > 1000) {
      toast.error('Review content must not exceed 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = { content: content.trim(), rating };
      
      let response;
      if (hasReview) {
        response = await apiService.updateReview(reviewData);
      } else {
        response = await apiService.submitReview(reviewData);
      }

      if (response.success) {
        toast.success(response.message);
        setIsEditing(false);
        await fetchMyReview();
      } else {
        toast.error(response.error || 'Failed to submit review');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error?.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const response = await apiService.deleteReview();
      if (response.success) {
        toast.success('Review deleted successfully');
        setHasReview(false);
        setMyReview(null);
        setContent('');
        setRating(5);
        setIsEditing(false);
        setCurrentPage(1);
        await fetchPublicReviews(1);
      } else {
        toast.error(response.error || 'Failed to delete review');
      }
    } catch (error: any) {
      console.error('Error deleting review:', error);
      toast.error(error?.response?.data?.error || 'Failed to delete review');
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= (interactive ? (hoveredRating || rating) : currentRating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={interactive ? () => setRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          />
        ))}
      </div>
    );
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'student':
        return 'bg-blue-100 text-blue-800';
      case 'instructor':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvatarUrl = (user: Review['user']) => {
    if (user.avatarUrl) {
      return user.avatarUrl;
    }
    // Generate a simple avatar based on user's name
    const initials = user.fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=6366f1&color=ffffff&size=40&font-size=0.6`;
  };

  const loadMoreReviews = () => {
    if (publicReviews.length < maxReviews && !reviewsLoading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPublicReviews(nextPage);
    }
  };

  const canLoadMore = publicReviews.length < maxReviews && publicReviews.length >= currentPage * reviewsPerPage;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reviews & Feedback</h1>
          <p className="text-gray-600">
            Share your experience with ExamWizards and see what others are saying
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submit/Edit Review Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Edit3 className="w-6 h-6 mr-2 text-purple-600" />
                {hasReview ? 'Your Review' : 'Write a Review'}
              </h2>
              <p className="text-gray-600 mt-2">
                {hasReview 
                  ? 'You can edit or delete your existing review'
                  : 'Share your experience with ExamWizards'
                }
              </p>
            </div>

            <div className="p-6">
              {hasReview && !isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {renderStars(myReview!.rating)}
                      <span className="text-sm text-gray-600">
                        ({myReview!.rating}/5)
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 leading-relaxed">{myReview!.content}</p>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    Submitted on {new Date(myReview!.createdAt).toLocaleDateString()}
                    {myReview!.updatedAt !== myReview!.createdAt && (
                      <span> • Updated on {new Date(myReview!.updatedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Review
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Review
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating
                    </label>
                    <div className="flex items-center space-x-2">
                      {renderStars(rating, true)}
                      <span className="text-sm text-gray-600 ml-2">
                        ({rating}/5)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Share your experience with ExamWizards..."
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      required
                      minLength={10}
                      maxLength={1000}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>Minimum 10 characters</span>
                      <span>{content.length}/1000</span>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={submitting || content.trim().length < 10}
                      className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {submitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      {submitting ? 'Submitting...' : (hasReview ? 'Update Review' : 'Submit Review')}
                    </button>
                    
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setContent(myReview!.content);
                          setRating(myReview!.rating);
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-600" />
                Recent Reviews
              </h2>
              <p className="text-gray-600 mt-2">
                See what others are saying about ExamWizards
              </p>
            </div>

            <div className="p-6">
              {publicReviews.length > 0 ? (
                <div className="space-y-6">
                  <div className="max-h-96 overflow-y-auto space-y-6">
                    {publicReviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0">
                        <div className="flex items-start space-x-3">
                          <img
                            src={getAvatarUrl(review.user)}
                            alt={review.user.fullName}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-gray-900">
                                  {review.user.fullName}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(review.user.role)}`}>
                                  {review.user.role}
                                </span>
                              </div>
                              {renderStars(review.rating)}
                            </div>
                            <p className="text-gray-700 text-sm leading-relaxed mb-2">
                              {review.content}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Load More Button */}
                  {canLoadMore && (
                    <div className="text-center pt-4 border-t border-gray-100">
                      <button
                        onClick={loadMoreReviews}
                        disabled={reviewsLoading}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center mx-auto"
                      >
                        {reviewsLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          'Load More Reviews'
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* Reviews Counter */}
                  <div className="text-center text-sm text-gray-500">
                    Showing {publicReviews.length} of {publicReviews.length >= maxReviews ? `${maxReviews}+` : publicReviews.length} reviews
                    {publicReviews.length >= maxReviews && (
                      <div className="text-xs text-gray-400 mt-1">
                        Only the 30 most recent reviews are shown
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reviews;