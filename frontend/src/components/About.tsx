import React, { useState, useEffect } from 'react';
import { Target, Users, Zap, Shield, Globe, Award } from 'lucide-react';
import { apiService } from '../services/apiService';

const About = () => {
  const [stats, setStats] = useState({
    activeUsers: 0,
    examsCompleted: 0,
    totalCourses: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiService.getPublicStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        // Keep default values if API fails
      }
    };

    fetchStats();
  }, []);

  const values = [
    {
      icon: Shield,
      title: 'Secure',
      description: 'Enterprise-grade security with end-to-end encryption'
    },
    {
      icon: Zap,
      title: 'Fast',
      description: 'Lightning-fast performance with 99.9% uptime guarantee'
    },
    {
      icon: Users,
      title: 'Reliable',
      description: 'Trusted by thousands of educational institutions worldwide'
    }
  ];

  const displayStats = [
    { 
      number: stats.activeUsers > 0 ? `${stats.activeUsers.toLocaleString()}+` : '8+', 
      label: 'Active Users' 
    },
    { 
      number: stats.examsCompleted > 0 ? `${stats.examsCompleted.toLocaleString()}+` : '8+', 
      label: 'Exams Conducted' 
    },
    { 
      number: stats.totalCourses > 0 ? `${stats.totalCourses.toLocaleString()}+` : '5+', 
      label: 'Courses Available' 
    }
  ];

  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              About 
              <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent"> ExamWizards</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              ExamWizards was created to simplify online examination for institutions and learners 
              by providing a robust, user-friendly platform that supports real-time, fair, and 
              scalable assessments.
            </p>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Our mission is to democratize education technology by making high-quality examination 
              tools accessible to educational institutions of all sizes, from small schools to 
              large universities.
            </p>

            {/* Values */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h4>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Mission First, then Stats */}
          <div className="space-y-8">
            {/* Mission Statement - Moved to top */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Our Mission</h4>
                  <p className="text-gray-600">
                    To empower educators and institutions with innovative technology that makes 
                    online assessments seamless, secure, and insightful.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats - Moved below mission */}
            <div className="bg-white rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Trusted Worldwide
              </h3>
              <div className="grid grid-cols-3 gap-6">
                {displayStats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 text-xs md:text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;