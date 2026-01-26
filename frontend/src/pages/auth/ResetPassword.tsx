import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Invalid reset link. No token provided.');
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const passwordErrors = validatePassword(newPassword);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors[0]);
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token,
          newPassword 
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password reset successfully!');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        toast.error(data.message || 'Failed to reset password');
        if (data.message?.includes('invalid') || data.message?.includes('expired')) {
          setTokenValid(false);
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
            {/* Error Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="relative">
                  <BookOpen className="h-10 w-10 text-purple-600" />
                  <Sparkles className="h-5 w-5 text-pink-500 absolute -top-1 -right-1" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  ExamWizards
                </span>
              </div>
              
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-red-300 shadow-lg">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Invalid Reset Link
              </h1>
              
              <p className="text-gray-600 text-lg">
                This password reset link is invalid or has expired.
              </p>
            </div>

            {/* Error Message */}
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-sm">
              <p className="text-red-800 text-center font-medium">
                ⏰ Password reset links expire after 30 minutes for security reasons.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Link
                to="/forgot-password"
                className="block w-full text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🔄 Request New Reset Link
              </Link>
              
              <Link
                to="/auth"
                className="block w-full text-center bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-4 px-6 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 border border-gray-300"
              >
                <ArrowLeft className="inline mr-2 h-5 w-5" />
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const passwordStrength = newPassword.length > 0 ? validatePassword(newPassword) : [];
  const isPasswordStrong = passwordStrength.length === 0 && newPassword.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="relative">
                <BookOpen className="h-10 w-10 text-purple-600" />
                <Sparkles className="h-5 w-5 text-pink-500 absolute -top-1 -right-1" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                ExamWizards
              </span>
            </div>
            
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-purple-300 shadow-lg">
                <Lock className="h-10 w-10 text-purple-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Reset Your Password
            </h1>
            
            <p className="text-gray-600 text-lg">
              Enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-bold text-gray-700 mb-2">
                🔐 New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="block w-full pl-10 pr-12 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  required
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
              
              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-600 mb-2 font-medium">Password strength:</div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-full rounded-full ${
                      isPasswordStrong ? 'bg-green-200' : 'bg-red-200'
                    }`}>
                      <div className={`h-3 rounded-full transition-all duration-500 ${
                        isPasswordStrong ? 'bg-gradient-to-r from-green-400 to-green-600 w-full' : 'bg-gradient-to-r from-red-400 to-red-600 w-1/3'
                      }`}></div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      isPasswordStrong ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {isPasswordStrong ? '✓ Strong' : '⚠ Weak'}
                    </span>
                  </div>
                  
                  {passwordStrength.length > 0 && (
                    <ul className="mt-3 text-xs text-red-600 space-y-1 bg-red-50 p-3 rounded-xl border border-red-200">
                      {passwordStrength.map((error, index) => (
                        <li key={index} className="flex items-center">
                          <div className="w-1 h-1 bg-red-500 rounded-full mr-2"></div>
                          {error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                🔒 Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="block w-full pl-10 pr-12 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  required
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
              
              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <div className="mt-3 flex items-center space-x-2">
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-green-600 font-bold bg-green-100 px-3 py-1 rounded-full">✓ Passwords match</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full">✗ Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isPasswordStrong || newPassword !== confirmPassword}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock className="inline mr-2 h-5 w-5" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              to="/auth"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 font-bold transition-all duration-300 transform hover:scale-105 bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;