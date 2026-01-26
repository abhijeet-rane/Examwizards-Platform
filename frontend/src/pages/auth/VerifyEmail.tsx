import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmailToken(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/verify-email?token=${verificationToken}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setVerificationStatus('success');
        setMessage(data.message);
        toast.success('Email verified successfully!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(data.message);
        toast.error('Email verification failed');
      }
    } catch (error) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setMessage('Email verification failed due to network error. Please try again.');
      toast.error('Network error during verification');
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setResendEmail('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error('Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-300 to-pink-200 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
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
              {verificationStatus === 'loading' && (
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-300 shadow-lg">
                  <RefreshCw className="h-10 w-10 text-blue-600 animate-spin" />
                </div>
              )}
              {verificationStatus === 'success' && (
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center border-2 border-green-300 shadow-lg">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              )}
              {verificationStatus === 'error' && (
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center border-2 border-red-300 shadow-lg">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {verificationStatus === 'loading' && 'Verifying Email...'}
              {verificationStatus === 'success' && 'Email Verified!'}
              {verificationStatus === 'error' && 'Verification Failed'}
            </h1>
            
            <p className="text-gray-600 text-lg">
              {message}
            </p>
          </div>

          {/* Success Actions */}
          {verificationStatus === 'success' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-sm">
                <p className="text-green-800 text-center font-bold">
                  🎉 Your account is now verified! You will be redirected to login in a few seconds.
                </p>
              </div>
              
              <button
                onClick={() => navigate('/auth')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                🚀 Go to Login
              </button>
            </div>
          )}

          {/* Error Actions */}
          {verificationStatus === 'error' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 shadow-sm">
                <p className="text-red-800 text-center font-bold">
                  ⚠️ The verification link may have expired or is invalid.
                </p>
              </div>

              {/* Resend Verification */}
              <div className="border-t-2 border-gray-200 pt-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                  📧 Resend Verification Email
                </h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="block w-full pl-10 pr-3 py-4 bg-white/70 backdrop-blur-sm border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <button
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
                  >
                    {resending ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="h-5 w-5 mr-2" />
                        Resend Verification Email
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

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

export default VerifyEmail;