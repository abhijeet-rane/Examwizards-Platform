import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Users, Trophy, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';

const Hero = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeUsers: 0,
    examsCompleted: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    totalExams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        console.log('Fetching live stats from API...');
        const data = await apiService.getPublicStats();
        console.log('Received live stats data:', data);
        console.log('Stats breakdown:', {
          activeUsers: data.activeUsers,
          examsCompleted: data.examsCompleted,
          totalCourses: data.totalCourses,
          totalEnrollments: data.totalEnrollments,
          totalExams: data.totalExams
        });
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch live stats:', error);
        console.error('Error details:', error?.response?.data);
        // Keep default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds for live updates
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-teal-50"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 mb-8"></div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent">
              Smart Online Exams.
            </span>
            <br />
            <span className="text-gray-900">Anytime, Anywhere.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Create, take, and evaluate online exams effortlessly with ExamWizards –
            the ultimate digital exam platform trusted by educators worldwide.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <button
              onClick={() => navigate('/auth')}
              className="group bg-gradient-to-r from-purple-600 to-teal-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Live Stats */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-purple-100 max-w-4xl mx-auto">


            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    `${stats.activeUsers.toLocaleString()}+`
                  )}
                </div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Trophy className="h-6 w-6 text-teal-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    `${stats.examsCompleted.toLocaleString()}+`
                  )}
                </div>
                <div className="text-sm text-gray-600">Exams Conducted</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Shield className="h-6 w-6 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    `${stats.totalCourses.toLocaleString()}+`
                  )}
                </div>
                <div className="text-sm text-gray-600">Courses Available</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Play className="h-6 w-6 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {loading ? (
                    <div className="animate-pulse bg-gray-200 h-8 w-16 rounded mx-auto"></div>
                  ) : (
                    `${stats.totalExams.toLocaleString()}+`
                  )}
                </div>
                <div className="text-sm text-gray-600">Total Exams</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;