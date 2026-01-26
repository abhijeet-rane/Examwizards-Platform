import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Lock, Save, Camera, Eye, EyeOff } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ProfileFormData {
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<ProfileFormData>();
  const newPassword = watch('newPassword');

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchAndPrefill = async () => {
      try {
        setLoading(true);
        const profile = await apiService.getUserProfile();
        const data = profile.data ? profile.data : profile;
        reset({
          username: data.username || '',
          email: data.email || '',
          fullName: data.fullName || '',
          phoneNumber: data.phoneNumber || '',
          gender: data.gender || 'Other',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        // Optionally update user context/localStorage
        if (data.email) {
          localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
        }
      } catch (e) {
        // fallback to context if backend fails
        if (user) {
          reset({
            username: user.username || '',
            email: user.email || '',
            fullName: user.fullName || '',
            phoneNumber: user.phoneNumber || '',
            gender: user.gender || 'Other',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchAndPrefill();
    // eslint-disable-next-line
  }, []);

  const onSubmitProfile = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const response = await apiService.updateUserProfile({
        username: data.username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        gender: data.gender
      });

      // Check if username was changed - requires re-login
      if (response && response.usernameChanged) {
        toast.success(
          `✅ ${response.message || 'Username updated successfully. Please log in again with your new username.'}`,
          { duration: 8000 }
        );

        // Show additional guidance
        setTimeout(() => {
          toast.loading(
            `🔄 Redirecting to login page in 3 seconds... New username: ${response.newUsername}`,
            { duration: 3000 }
          );
        }, 1000);

        // Clear authentication and redirect to login after 4 seconds
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 4000);

        return; // Exit early for username change
      }

      // Update local storage with new user data if response contains updated user info
      if (response && user) {
        const updatedUser = {
          ...user,
          username: response.username || data.username,
          email: response.email || data.email,
          fullName: response.fullName || data.fullName,
          phoneNumber: response.phoneNumber || data.phoneNumber,
          gender: response.gender || data.gender
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      toast.success('Profile updated successfully!', { duration: 2500 });
    } catch (error: any) {
      console.log('Profile update error:', error);
      console.log('Error response:', error?.response);
      console.log('Error data:', error?.response?.data);

      let errorMessage = 'Failed to update profile';

      // Handle different error response formats with better specificity
      if (error?.response?.data) {
        const errorData = error.response.data;
        console.log('Error data type:', typeof errorData);
        console.log('Error data content:', errorData);

        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Handle case where errorData is an object but doesn't have error/message properties
          errorMessage = JSON.stringify(errorData);
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      console.log('Final error message:', errorMessage);

      // Handle specific error scenarios
      if (errorMessage.includes('User not found') || errorMessage.includes('User session expired') || error?.response?.status === 404) {
        // This likely means the username was changed and JWT token is now invalid
        toast.error(
          '🔐 Session expired. Please log in again with your username or email.',
          { duration: 8000 }
        );

        setTimeout(() => {
          toast.loading('🔄 Redirecting to login page...', { duration: 2000 });
        }, 1000);

        // Clear authentication and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 3000);

        return; // Exit early for session expiry
      }

      // Show specific validation error messages
      if (errorMessage.includes('Username') && errorMessage.includes('already taken')) {
        toast.error('❌ ' + errorMessage, { duration: 8000 });
      } else if (errorMessage.includes('Email') && errorMessage.includes('already registered')) {
        toast.error('📧 ' + errorMessage, { duration: 8000 });
      } else if (errorMessage.includes('Phone number') && errorMessage.includes('already registered')) {
        toast.error('📱 ' + errorMessage, { duration: 8000 });
      } else if (errorMessage.includes('Phone number must be exactly 10 digits')) {
        toast.error('📱 ' + errorMessage, { duration: 6000 });
      } else if (errorMessage.includes('Error updating user profile')) {
        toast.error('⚠️ Server error: ' + errorMessage, { duration: 8000 });
      } else {
        toast.error('❌ ' + errorMessage, { duration: 6000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPassword = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      await apiService.updateUserProfile({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Password updated successfully!');
      reset({
        ...data,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.log('Password change error:', error);

      let errorMessage = 'Failed to update password';

      // Handle different error response formats
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      // Handle session expiry after username change
      if (errorMessage.includes('User not found') || errorMessage.includes('User session expired') || error?.response?.status === 404) {
        toast.error(
          '🔐 Session expired. Please log in again with your username or email.',
          { duration: 8000 }
        );

        setTimeout(() => {
          toast.loading('🔄 Redirecting to login page...', { duration: 2000 });
        }, 1000);

        // Clear authentication and redirect to login
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 3000);

        return; // Exit early for session expiry
      }

      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1 tracking-tight">Profile Settings</h1>
            <p className="text-indigo-100 text-sm font-medium">Manage your account settings and preferences</p>
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white/5 rounded-full blur-xl"></div>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-br from-white via-slate-50 to-indigo-50 rounded-xl p-4 shadow-lg border border-indigo-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/30"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative z-10 flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                    <span className="text-lg font-bold text-white relative z-10">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white mb-1">{user?.fullName || user?.username}</h2>
                  <p className="text-indigo-100 text-sm mb-2">{user?.email}</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm capitalize border border-white/30 shadow-md">
                    {user?.role}
                  </span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* Tabs */}
            <div className="bg-gradient-to-r from-slate-100 to-indigo-100 rounded-xl p-2 mb-6 shadow-md">
              <nav className="flex space-x-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-300 ${activeTab === 'profile'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 hover:shadow-sm'
                    }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 py-3 px-4 font-semibold text-sm rounded-lg transition-all duration-300 ${activeTab === 'password'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/70 hover:shadow-sm'
                    }`}
                >
                  Change Password
                </button>
              </nav>
            </div>

            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-4 shadow-lg border border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/20"></div>
                <div className="relative z-10">
                  <form onSubmit={handleSubmit(onSubmitProfile)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-1">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-indigo-500" />
                          </div>
                          <input
                            {...register('username', {
                              required: 'Username is required',
                              minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters'
                              }
                            })}
                            type="text"
                            className="block w-full pl-9 pr-3 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                            placeholder="Enter your username"
                          />
                        </div>
                        {errors.username && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.username.message}</p>
                        )}
                        <p className="mt-1 text-xs text-amber-800 bg-amber-100 p-2 rounded-md border border-amber-300 shadow-sm">
                          ⚠️ Changing your username will require you to log in again with the new username
                        </p>
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-purple-500" />
                          </div>
                          <input
                            {...register('email')}
                            type="email"
                            disabled
                            className="block w-full pl-9 pr-3 py-2.5 text-sm border-2 border-slate-200 rounded-lg bg-slate-100 text-slate-600 cursor-not-allowed shadow-sm"
                            placeholder="Email cannot be changed"
                          />
                        </div>
                        <p className="mt-1 text-xs text-slate-600 bg-slate-100 p-2 rounded-md border border-slate-200 shadow-sm">
                          🔒 Email address cannot be changed for security reasons
                        </p>
                      </div>

                      <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-semibold text-slate-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          {...register('phoneNumber', {
                            required: 'Phone number is required',
                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: 'Phone number must be exactly 10 digits',
                            },
                            minLength: {
                              value: 10,
                              message: 'Phone number must be exactly 10 digits'
                            },
                            maxLength: {
                              value: 10,
                              message: 'Phone number must be exactly 10 digits'
                            }
                          })}
                          type="tel"
                          maxLength={10}
                          className="block w-full px-3 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-200 focus:border-teal-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                          placeholder="Enter 10-digit phone number"
                          onInput={(e) => {
                            // Only allow numeric input
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9]/g, '');
                          }}
                        />
                        {errors.phoneNumber && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.phoneNumber.message}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-600 bg-slate-100 p-2 rounded-md shadow-sm">Enter exactly 10 digits (e.g., 9876543210)</p>
                      </div>

                      <div>
                        <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          {...register('fullName', {
                            required: 'Full name is required',
                            minLength: {
                              value: 2,
                              message: 'Full name must be at least 2 characters'
                            }
                          })}
                          type="text"
                          className="block w-full px-3 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                          placeholder="Enter your full name"
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.fullName.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-1">
                          Gender
                        </label>
                        <select
                          {...register('gender', { required: 'Gender is required' })}
                          className="block w-full px-3 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.gender.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-300">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-lg p-4 shadow-lg border border-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 to-pink-50/20"></div>
                <div className="relative z-10">
                  <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4" noValidate>
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-red-500" />
                        </div>
                        <input
                          {...register('currentPassword', {
                            required: 'Current password is required'
                          })}
                          type={showCurrentPassword ? "text" : "password"}
                          className="block w-full pl-9 pr-10 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-red-500 focus:outline-none transition-colors"
                          tabIndex={-1}
                          onClick={() => setShowCurrentPassword(v => !v)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.currentPassword.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-green-500" />
                          </div>
                          <input
                            {...register('newPassword', {
                              required: 'New password is required',
                              minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters'
                              }
                            })}
                            type={showNewPassword ? "text" : "password"}
                            className="block w-full pl-9 pr-10 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-green-500 focus:outline-none transition-colors"
                            tabIndex={-1}
                            onClick={() => setShowNewPassword(v => !v)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.newPassword && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.newPassword.message}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-1">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-4 w-4 text-blue-500" />
                          </div>
                          <input
                            {...register('confirmPassword', {
                              required: 'Please confirm your new password',
                              validate: value => value === newPassword || 'Passwords do not match'
                            })}
                            type={showConfirmPassword ? "text" : "password"}
                            className="block w-full pl-9 pr-10 py-2.5 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white/80 hover:bg-white shadow-sm hover:shadow-md"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-blue-500 focus:outline-none transition-colors"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword(v => !v)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 border-t border-slate-300">
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-gradient-to-r from-red-600 via-pink-600 to-purple-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;