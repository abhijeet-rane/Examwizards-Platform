import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, X } from 'lucide-react';
import instructorDashboard from '../assets/instructor_dashboard.png';
import exam from '../assets/exam.png';
import question_bank from '../assets/question_bank.png';
import result from '../assets/result.png';
import admin_dashboard from '../assets/admin_dashboard.png';

const Screenshots = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const screenshots = [
    {
      id: 1,
      title: 'Instructor Dashboard',
      description: 'Create and manage exams with powerful analytics',
      image: instructorDashboard,
      category: 'desktop'
    },
    {
      id: 2,
      title: 'Student Exam Interface',
      description: 'Clean, distraction-free exam taking experience',
      image: exam,
      category: 'desktop'
    },
    {
      id: 3,
      title: 'Results & Analytics',
      description: 'Detailed performance insights and PDF reports',
      image: result,
      category: 'desktop'
    },
    {
      id: 5,
      title: 'Question Bank',
      description: 'Organize and categorize questions efficiently',
      image: question_bank,
      category: 'desktop'
    },
    {
      id: 6,
      title: 'Admin Panel',
      description: 'Comprehensive system administration tools',
      image: admin_dashboard,
      category: 'desktop'
    }
  ];

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredScreenshots = activeFilter === 'all'
    ? screenshots
    : screenshots.filter(screenshot => screenshot.category === activeFilter);

  const filters = [
    { id: 'desktop', label: 'Desktop', icon: Monitor }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Platform
            <span className="bg-gradient-to-r from-purple-600 to-teal-500 bg-clip-text text-transparent"> Preview</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore the intuitive interface and powerful features that make ExamWizards
            the preferred choice for educational institutions.
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all ${activeFilter === filter.id
                    ? 'bg-gradient-to-r from-purple-600 to-teal-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
                  }`}
              >
                <filter.icon className="h-5 w-5" />
                <span className="font-medium">{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Screenshots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredScreenshots.map((screenshot) => (
            <div
              key={screenshot.id}
              className="group cursor-pointer"
              onClick={() => setSelectedImage(screenshot)}
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-teal-100 rounded-xl mb-4 overflow-hidden">
                  <img
                    src={screenshot.image}
                    alt={screenshot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                  {screenshot.title}
                </h3>
                <p className="text-gray-600">{screenshot.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="max-w-4xl w-full bg-white rounded-2xl p-6 relative">
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-teal-100 rounded-xl mb-4 overflow-hidden">
                <img
                  src={selectedImage.image}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedImage.title}</h3>
              <p className="text-gray-600">{selectedImage.description}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Screenshots;