import React from 'react';
import { 
  Users, 
  Clock, 
  Zap, 
  BarChart3, 
  Shield, 
  Database, 
  Mail, 
  Trophy 
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: 'Role-Based Dashboard',
      description: 'Separate portals for Admin, Instructor, and Student with tailored interfaces for each role.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Clock,
      title: 'Timed Exams',
      description: 'Secure auto-submitting exam interface with real-time countdown and progress tracking.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Zap,
      title: 'Instant Evaluation',
      description: 'Auto-calculate scores and display instant results with detailed performance analytics.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive performance charts and downloadable PDF reports for detailed insights.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Shield,
      title: 'JWT Authentication',
      description: 'Enterprise-grade security with JWT tokens ensuring safe and secure user sessions.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Database,
      title: 'Question Bank',
      description: 'Create, edit, and organize questions with categories, difficulty levels, and tags.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Mail,
      title: 'Email Notifications',
      description: 'Automated alerts for exam assignments, deadlines, and result announcements.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Trophy,
      title: 'Leaderboard & Tracking',
      description: 'Compare performance across students with interactive leaderboards and progress tracking.',
      color: 'from-teal-500 to-teal-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for 
            <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent"> Modern Education</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to create, manage, and evaluate online exams with confidence and ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;