import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Sparkles, Eye, EyeOff, Mail, Lock, User, UserCheck, Phone, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { handleApiError } from '../../utils/errorHandler';

interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  password: string;
  confirmPassword: string;
  role: 'admin' | 'instructor' | 'student';
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterFormData>();
  const password = watch('password');

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      // Call the backend registration endpoint directly to get email verification info
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: data.fullName,
          username: data.username,
          email: data.email,
          phoneNumber: data.phoneNumber,
          gender: data.gender,
          password: data.password,
          role: `ROLE_${data.role.toUpperCase()}`
        }),
      });

      const result = await response.json();

      console.log('Registration response - Status:', response.status, 'Result:', result);

      if (response.ok) {
        setUserEmail(data.email);
        setRegistrationSuccess(true);
        toast.success(result.message || 'Registration successful! Please check your email to verify your account.');
      } else {
        // Extract error message from backend response
        let errorMessage = 'Registration failed. Please try again.';

        if (result && typeof result === 'object') {
          errorMessage = result.error || result.message || errorMessage;
        } else if (typeof result === 'string') {
          errorMessage = result;
        }

        console.log('Registration error message:', errorMessage);
        toast.error(errorMessage, { duration: 6000 });
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle network and other errors
      if (!navigator.onLine) {
        toast.error('No internet connection. Please check your network and try again.');
      } else if (error.name === 'TypeError' && error.message?.includes('fetch')) {
        toast.error('Unable to connect to the server. Please check your connection and try again.');
      } else {
        toast.error('Registration failed due to network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show success screen after registration
  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            {/* Success Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h1>

              <p className="text-gray-600">
                We've sent a verification email to <strong>{userEmail}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Check your email inbox</li>
                <li>• Click the verification link</li>
                <li>• The link will expire in 24 hours</li>
                <li>• Check spam folder if you don't see it</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                to="/verify-email"
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                I've Verified My Email
              </Link>

              <button
                onClick={() => {
                  setRegistrationSuccess(false);
                  setUserEmail('');
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Register Another Account
              </button>

              <Link
                to="/login"
                className="block w-full text-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="relative">
              <BookOpen className="h-12 w-12 text-purple-600" />
              <Sparkles className="h-6 w-6 text-teal-500 absolute -top-1 -right-1" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
              ExamWizards
            </span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600">Join thousands of users on ExamWizards</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Full name must be at least 2 characters'
                    }
                  })}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: {
                      value: 3,
                      message: 'Username must be at least 3 characters'
                    },
                    maxLength: {
                      value: 20,
                      message: 'Username must be less than 20 characters'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Username can only contain letters, numbers, and underscores'
                    }
                  })}
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  id="email"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
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
                  id="phoneNumber"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your phone number"
                  onInput={(e) => {
                    // Only allow numeric input
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/[^0-9]/g, '');
                  }}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Gender Field */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                {...register('gender', { required: 'Gender is required' })}
                className="block w-full px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                defaultValue=""
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Password Length Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="text-xs text-gray-600 mb-1">Password length:</div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4].map((level) => {
                      const length = password.length;
                      let color = 'bg-gray-200';

                      if (length >= level * 2) {
                        if (length < 6) color = 'bg-red-500';
                        else if (length < 8) color = 'bg-yellow-500';
                        else color = 'bg-green-500';
                      }

                      return (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-colors ${color}`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {password.length < 8
                      ? `${password.length}/8 characters (${8 - password.length} more needed)`
                      : `${password.length}/8 characters ✓`
                    }
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              onClick={(e) => {
                // Additional safeguard to prevent any default behavior
                if (loading) {
                  e.preventDefault();
                  return false;
                }
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-purple-600 hover:text-purple-500 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;