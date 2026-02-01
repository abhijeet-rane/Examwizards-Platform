import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { BookOpen, Sparkles, Eye, EyeOff, Mail, Lock, User, UserCheck, Phone, ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
}

interface RegisterFormData {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  password: string;
  confirmPassword: string;
  role: 'instructor' | 'student';
}

const AuthPage = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      role: 'student' // Default to student role
    }
  });
  const registerForm = useForm<RegisterFormData>();
  const password = registerForm.watch('password');



  const onLoginSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await login(data.usernameOrEmail, data.password);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      let actualUserRole = user.role?.toLowerCase();
      // Handle both old format (ROLE_ADMIN) and new format (admin)
      if (actualUserRole?.startsWith('role_')) {
        actualUserRole = actualUserRole.replace('role_', '');
      }

      // Verify that the selected role matches the user's actual role
      if (data.role !== actualUserRole) {
        // Log out the user immediately since role doesn't match
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Show error message and prevent login
        toast.error(`Role mismatch! You have selected wrong role for your account. Please select the correct role and try again.`, { 
          duration: 6000,
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fca5a5'
          }
        });
        
        // Reset the form to allow user to try again
        loginForm.reset({
          usernameOrEmail: data.usernameOrEmail,
          password: '',
          role: actualUserRole // Set the correct role for user convenience
        });
        
        return; // Exit without navigation
      }

      // If roles match, proceed with successful login
      toast.success('Login successful!');
      navigate(`/${actualUserRole}`);
      
    } catch (error: any) {
      let errorMessage = 'An error occurred';
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
      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
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
          role: data.role.toLowerCase()
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setUserEmail(data.email);
        setRegistrationSuccess(true);
        toast.success(result.message || 'Registration successful! Please check your email to verify your account.');
      } else {
        let errorMessage = 'Registration failed. Please try again.';
        if (result && typeof result === 'object') {
          errorMessage = result.error || result.message || errorMessage;
        } else if (typeof result === 'string') {
          errorMessage = result;
        }
        toast.error(errorMessage, { duration: 6000 });
      }
    } catch (error: any) {
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
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-300">
                  <Mail className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h1>
              <p className="text-gray-600">
                We've sent a verification email to <strong className="text-purple-600">{userEmail}</strong>
              </p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Next Steps:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Check your email inbox</li>
                <li>• Click the verification link</li>
                <li>• The link will expire in 24 hours</li>
                <li>• Check spam folder if you don't see it</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link
                to="/verify-email"
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                I've Verified My Email
              </Link>

              <button
                onClick={() => {
                  setRegistrationSuccess(false);
                  setUserEmail('');
                  setIsRegisterMode(false);
                }}
                className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Register Another Account
              </button>

              <button
                onClick={() => {
                  setRegistrationSuccess(false);
                  setUserEmail('');
                  setIsRegisterMode(false);
                }}
                className="block w-full text-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 flex relative">
      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-50 flex items-center space-x-2 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 px-4 py-2 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 border border-purple-200"
      >
        <Home className="h-5 w-5" />
        <span>Back to Home</span>
      </Link>

      {/* Left Side - Login Form or Login Prompt */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8"
        animate={{
          x: isRegisterMode ? '-50%' : '0%',
          opacity: isRegisterMode ? 0.3 : 1
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {!isRegisterMode ? (
            // Login Form
            <motion.div
              key="login-form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full"
            >
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <div className="relative">
                    <BookOpen className="h-12 w-12 text-purple-600" />
                    <Sparkles className="h-6 w-6 text-pink-500 absolute -top-1 -right-1" />
                  </div>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                    ExamWizards
                  </span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to your account to continue</p>
              </div>

              {/* Login Form */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  {/* Role Selection - Moved to top */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Login as
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center justify-center p-3 bg-white/50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                        <input
                          {...loginForm.register('role', { required: 'Please select your role' })}
                          type="radio"
                          value="student"
                          className="w-4 h-4 text-purple-600 bg-white border-gray-300 focus:ring-0 mr-2"
                        />
                        <span className="text-sm text-gray-700 font-medium">Student</span>
                      </label>
                      <label className="flex items-center justify-center p-3 bg-white/50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                        <input
                          {...loginForm.register('role', { required: 'Please select your role' })}
                          type="radio"
                          value="instructor"
                          className="w-4 h-4 text-purple-600 bg-white border-gray-300 focus:ring-0 mr-2"
                        />
                        <span className="text-sm text-gray-700 font-medium">Instructor</span>
                      </label>
                      <label className="flex items-center justify-center p-3 bg-white/50 border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition-all">
                        <input
                          {...loginForm.register('role', { required: 'Please select your role' })}
                          type="radio"
                          value="admin"
                          className="w-4 h-4 text-purple-600 bg-white border-gray-300 focus:ring-0 mr-2"
                        />
                        <span className="text-sm text-gray-700 font-medium">Admin</span>
                      </label>
                    </div>
                    {loginForm.formState.errors.role && (
                      <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.role.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Select the role you want to login as</p>
                  </div>

                  {/* Username/Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...loginForm.register('usernameOrEmail', {
                          required: 'Username or email is required',
                          validate: (value) => {
                            if (!value || value.trim().length < 3) {
                              return 'Please enter a valid username or email';
                            }
                            return true;
                          }
                        })}
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                        placeholder="Enter your username or email"
                      />
                    </div>
                    {loginForm.formState.errors.usernameOrEmail && (
                      <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.usernameOrEmail.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">You can use either your username or email address</p>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...loginForm.register('password', {
                          required: 'Password is required',
                          minLength: {
                            value: 6,
                            message: 'Password must be at least 6 characters'
                          }
                        })}
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full pl-10 pr-10 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    {loginForm.formState.errors.password && (
                      <p className="mt-1 text-sm text-red-600">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-purple-600 hover:text-purple-500 font-medium"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Signing In...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            // Login Prompt (when in register mode)
            <motion.div
              key="login-prompt"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full text-center"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-300">
                    <User className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Already Have Account?</h3>
                  <p className="text-gray-600 mb-6">
                    Welcome back! Sign in to access your dashboard and continue your learning journey.
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span>Access your dashboard</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                    <span>Continue your exams</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span>View your results</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsRegisterMode(false)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                  Sign In
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Right Side - Register Prompt/Form */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8"
        animate={{
          x: isRegisterMode ? '-50%' : '0%'
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {!isRegisterMode ? (
            // Register Prompt
            <motion.div
              key="register-prompt"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="max-w-md w-full text-center"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
                <div className="mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-300">
                    <UserCheck className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">New Here?</h3>
                  <p className="text-gray-600 mb-6">
                    Join thousands of users on ExamWizards and start your learning journey today!
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span>Create and take exams</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                    <span>Track your progress</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                    <span>Join various Courses (Paid/Free)</span>
                  </div>
                </div>

                <button
                  onClick={() => setIsRegisterMode(true)}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center group"
                >
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ) : (
            // Register Form
            <motion.div
              key="register-form"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl w-full"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                <p className="text-gray-600 text-base">Fill in your details to get started</p>
              </div>

              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-5">
                  {/* Row 1: Full Name and Username */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCheck className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerForm.register('fullName', {
                            required: 'Full name is required',
                            minLength: { value: 2, message: 'Full name must be at least 2 characters' }
                          })}
                          type="text"
                          className="block w-full pl-10 pr-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      {registerForm.formState.errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.fullName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerForm.register('username', {
                            required: 'Username is required',
                            minLength: { value: 3, message: 'Username must be at least 3 characters' },
                            maxLength: { value: 20, message: 'Username must be less than 20 characters' },
                            pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Username can only contain letters, numbers, and underscores' }
                          })}
                          type="text"
                          className="block w-full pl-10 pr-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Choose a username"
                        />
                      </div>
                      {registerForm.formState.errors.username && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Email and Phone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerForm.register('email', {
                            required: 'Email is required',
                            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Please enter a valid email address' }
                          })}
                          type="email"
                          className="block w-full pl-10 pr-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Enter your email address"
                        />
                      </div>
                      {registerForm.formState.errors.email && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerForm.register('phoneNumber', {
                            required: 'Phone number is required',
                            pattern: { value: /^[0-9]{10}$/, message: 'Phone number must be exactly 10 digits' },
                            minLength: { value: 10, message: 'Phone number must be exactly 10 digits' },
                            maxLength: { value: 10, message: 'Phone number must be exactly 10 digits' }
                          })}
                          type="tel"
                          maxLength={10}
                          className="block w-full pl-10 pr-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Enter 10-digit phone number"
                          onInput={(e) => {
                            const target = e.target as HTMLInputElement;
                            target.value = target.value.replace(/[^0-9]/g, '');
                          }}
                        />
                      </div>
                      {registerForm.formState.errors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.phoneNumber.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Role and Gender */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCheck className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          {...registerForm.register('role', { required: 'Role is required' })}
                          className="block w-full pl-10 pr-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 text-sm"
                        >
                          <option value="">Select your role</option>
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                        </select>
                      </div>
                      {registerForm.formState.errors.role && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.role.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        {...registerForm.register('gender', { required: 'Gender is required' })}
                        className="block w-full px-3 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 text-sm"
                        defaultValue=""
                      >
                        <option value="" disabled>Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {registerForm.formState.errors.gender && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.gender.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Row 4: Password and Confirm Password */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerForm.register('password', {
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                          })}
                          type={showPassword ? 'text' : 'password'}
                          className="block w-full pl-10 pr-10 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Create a strong password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          )}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          {...registerForm.register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value => value === password || 'Passwords do not match'
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="block w-full pl-10 pr-10 py-3 bg-white/70 backdrop-blur-sm border border-purple-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 text-sm"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                          )}
                        </button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-4">
                      <div className="flex space-x-2 mb-2">
                        {[1, 2, 3, 4].map((level) => {
                          const length = password.length;
                          let color = 'bg-gray-200';

                          if (length >= level * 2) {
                            if (length < 6) color = 'bg-red-400';
                            else if (length < 8) color = 'bg-yellow-400';
                            else color = 'bg-green-400';
                          }

                          return (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-colors ${color}`}
                            />
                          );
                        })}
                      </div>
                      <div className="text-sm text-gray-600">
                        {password.length < 8
                          ? `Password strength: ${password.length}/8 characters`
                          : `Password strength: Strong ✓`
                        }
                      </div>
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex space-x-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center border border-gray-300 text-base"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50 transform hover:scale-105 text-base"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default AuthPage;