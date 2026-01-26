import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle, BookOpen, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setEmailSent(true);
        toast.success('Password reset email sent!');
      } else {
        // Display specific error message from backend
        const errorMessage = data.error || data.message || 'Failed to send password reset email';
        toast.error(errorMessage, { duration: 6000 });
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-purple-200">
            {/* Success Header */}
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
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-300 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Check Your Email
              </h1>
              
              <p className="text-gray-600 text-lg">
                We've sent a password reset link to <strong className="text-purple-600">{email}</strong>
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">📧 Next Steps:</h3>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Check your email inbox
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Click the password reset link
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  The link will expire in 30 minutes
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Check spam folder if you don't see it
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Another Email
              </button>
              
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
                <Mail className="h-10 w-10 text-purple-600" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Forgot Password?
            </h1>
            
            <p className="text-gray-600 text-lg">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="block w-full pl-10 pr-3 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send Reset Link
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

export default ForgotPassword;