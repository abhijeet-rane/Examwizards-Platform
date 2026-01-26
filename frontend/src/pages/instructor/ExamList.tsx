import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Plus, Eye, Edit, Trash2, Users, Calendar, Clock, Search, Filter, BookOpen, X, ChevronLeft, ChevronRight,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import ExamViewModal from '../../components/modals/ExamViewModal';
import ExamEditModal from '../../components/modals/ExamEditModal';

interface Exam {
  exam_id: number;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'upcoming' | 'inactive';

  // Enhanced fields from backend
  studentCount: number;
  studentsDisplay: string;
  questionCount: number;
  questionsDisplay: string;
  marksDisplay: string;
  durationDisplay: string;

  // Date/time formatting
  startDateTime?: string;
  endDateTime?: string;
  dueDateTime?: string;
  startDateFormatted?: string;
  endDateFormatted?: string;

  // Countdown timer
  timeRemaining?: string;
  countdownDisplay?: string;
  isExpired?: boolean;
  isUrgent?: boolean;
  countdownColor?: string;

  // Actions
  actions?: {
    canStart: boolean;
    canEdit: boolean;
    canDelete: boolean;
    primaryAction: {
      text: string;
      type: string;
      style: string;
      enabled: boolean;
    };
  };

  // Course info
  course?: {
    id: number;
    name: string;
  };

  // Legacy fields for backward compatibility
  studentsEnrolled?: number;
  questionsCount?: number;
  averageScore?: number;
}

interface Course {
  id: number;
  name: string;
  description?: string;
  enrollmentCount?: number;
  studentsEnrolled?: number;
  totalStudents?: number;
  enrolledStudents?: number;
}

const ExamList = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage, setExamsPerPage] = useState(6);

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesData = await apiService.getCoursesForInstructor();
      let coursesList: Course[] = [];

      if (Array.isArray(coursesData)) {
        coursesList = coursesData as Course[];
      } else if (coursesData && Array.isArray(coursesData.data)) {
        coursesList = coursesData.data as Course[];
      } else if (coursesData && Array.isArray(coursesData.courses)) {
        coursesList = coursesData.courses as Course[];
      }

      console.log('Fetched courses for filtering:', coursesList);
      setCourses(coursesList);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setCourses([]);
    }
  };

  const fetchExams = async () => {
    try {
      // Fetch exams and instructor courses in parallel to get enrollment data
      const [examData, coursesData] = await Promise.all([
        apiService.getInstructorExams(),
        apiService.getCoursesForInstructor().catch(() => [])
      ]);

      let exams: Exam[] = [];

      if (Array.isArray(examData)) {
        exams = examData as Exam[];
      } else if (examData && Array.isArray(examData.data)) {
        exams = examData.data as Exam[];
      } else if (examData && Array.isArray(examData.data?.exams)) {
        exams = examData.data.exams as Exam[];
      } else if (examData && Array.isArray(examData.exams)) {
        exams = examData.exams as Exam[];
      }

      // Create a map of course ID to enrollment count
      const courseEnrollmentMap = new Map();
      if (Array.isArray(coursesData)) {
        coursesData.forEach((course: any) => {
          const enrollmentCount = course.enrollmentCount ??
            course.studentsEnrolled ??
            course.totalStudents ??
            course.enrolledStudents ??
            0;
          courseEnrollmentMap.set(course.id, enrollmentCount);
          console.log(`Course "${course.name}" (ID: ${course.id}) has ${enrollmentCount} students`);
        });
      }

      // Map and enhance exam data
      exams = exams.map((exam: any) => {
        // Try to get student count from the exam data first
        let studentCount = exam.studentCount ??
          exam.studentsEnrolled ??
          exam.students ??
          exam.enrolledStudents ??
          exam.totalStudents ??
          exam.studentSubmissions ??
          exam.submissionCount ??
          0;

        // If exam doesn't have student count, try to get it from course enrollment data
        if (studentCount === 0 && exam.course?.id) {
          studentCount = courseEnrollmentMap.get(exam.course.id) ?? 0;
          console.log(`Using course enrollment count for exam "${exam.title}": ${studentCount}`);
        }

        // Try multiple possible field names for question count
        const questionCount = exam.questionCount ??
          exam.questionsCount ??
          exam.questions ??
          exam.totalQuestions ??
          0;

        console.log(`Exam "${exam.title}" - Final student count: ${studentCount}`);

        return {
          ...exam,
          exam_id: exam.exam_id ?? exam.Exam_id ?? exam.id,
          // Map enhanced fields with fallbacks
          studentCount: studentCount,
          studentsDisplay: exam.studentsDisplay ?? `${studentCount} students`,
          questionCount: questionCount,
          questionsDisplay: exam.questionsDisplay ?? `${questionCount} questions`,
          marksDisplay: exam.marksDisplay ?? `${exam.totalMarks ?? 0} marks`,
          durationDisplay: exam.durationDisplay ?? `${exam.duration ?? 0} minutes`,

          // Legacy compatibility
          studentsEnrolled: studentCount,
          questionsCount: questionCount,

          // Status mapping
          status: exam.status === 'upcoming' ? 'scheduled' :
            exam.status === 'inactive' ? 'draft' :
              exam.status ?? 'draft'
        };
      });

      console.log('Enhanced exams data with course enrollments:', exams);
      setExams(exams);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await apiService.deleteExam(examId);
        setExams(exams.filter((exam) => exam.exam_id !== Number(examId)));
        toast.success('Exam deleted successfully');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete exam');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase())
      || exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      || (exam.course?.name && exam.course.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter;
    const matchesCourse = courseFilter === 'all' ||
      (exam.course?.id && exam.course.id.toString() === courseFilter);
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredExams.length / examsPerPage);
  const startIndex = (currentPage - 1) * examsPerPage;
  const endIndex = startIndex + examsPerPage;
  const currentExams = filteredExams.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, courseFilter, examsPerPage]);

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCourseFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || statusFilter !== 'all' || courseFilter !== 'all';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
          <div className="text-center space-y-6">
            {/* Enhanced Loading Animation */}
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-200"></div>
              <div className="animate-spin rounded-full h-32 w-32 border-4 border-purple-600 border-t-transparent absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="h-8 w-8 text-purple-600 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Loading Your Exams</h3>
              <p className="text-gray-600">Please wait while we fetch your exam data...</p>
            </div>

            {/* Loading Progress Dots */}
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ExamViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        exam={selectedExam}
      />
      <ExamEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        exam={selectedExam}
        onSave={async (updatedExam: Exam) => {
          try {
            await apiService.updateExam(updatedExam.exam_id, updatedExam);
            toast.success('Exam updated successfully');
            setEditModalOpen(false);
            setSelectedExam(null);
            fetchExams();
          } catch (e: any) {
            toast.error(e.message || 'Failed to update exam');
          }
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
        {/* Hero Header Section - Compact Version */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-2xl p-6 mb-6 shadow-xl">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
            <div className="absolute top-10 left-1/2 w-30 h-30 bg-purple-400/20 rounded-full blur-xl animate-bounce"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">My Exams</h1>
                  <p className="text-blue-100 text-sm">Manage and monitor all your created exams</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-white/80">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">{exams.filter(e => e.status === 'active').length} Active</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">{exams.filter(e => e.status === 'scheduled').length} Scheduled</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-xs">{exams.filter(e => e.status === 'completed').length} Completed</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/instructor/create-exam"
                className="group bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:scale-105 text-sm"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Exam
              </Link>
              <Link
                to="/instructor/create-course"
                className="group bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:scale-105 text-sm"
              >
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Course
              </Link>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {[
            {
              label: 'Total Exams',
              value: exams.length,
              gradient: 'from-purple-500 via-purple-600 to-indigo-600',
              icon: FileText,
              bgPattern: 'from-purple-50 to-indigo-50',
              change: '+12%',
              changeColor: 'text-green-600'
            },
            {
              label: 'Active Exams',
              value: exams.filter(e => e.status === 'active').length,
              gradient: 'from-emerald-500 via-green-600 to-teal-600',
              icon: Clock,
              bgPattern: 'from-emerald-50 to-teal-50',
              change: '+5%',
              changeColor: 'text-green-600'
            },
            {
              label: 'Completed',
              value: exams.filter(e => e.status === 'completed').length,
              gradient: 'from-blue-500 via-cyan-600 to-sky-600',
              icon: FileText,
              bgPattern: 'from-blue-50 to-cyan-50',
              change: '+8%',
              changeColor: 'text-green-600'
            },
            {
              label: 'Total Students',
              value: exams.reduce((sum, e) => sum + (e.studentCount || e.studentsEnrolled || 0), 0),
              gradient: 'from-orange-500 via-amber-600 to-yellow-600',
              icon: Users,
              bgPattern: 'from-orange-50 to-yellow-50',
              change: '+15%',
              changeColor: 'text-green-600'
            },
            {
              label: 'My Courses',
              value: courses.length,
              gradient: 'from-rose-500 via-pink-600 to-purple-600',
              icon: BookOpen,
              bgPattern: 'from-rose-50 to-purple-50',
              change: '+3%',
              changeColor: 'text-green-600'
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className={`group relative bg-gradient-to-br ${stat.bgPattern} rounded-3xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer overflow-hidden`}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-700"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {stat.value}
                  </p>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500 rounded-3xl`}></div>
            </div>
          ))}
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 mb-8">
          <div className="flex flex-col space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                  <Filter className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Smart Filters</h3>
                  <p className="text-sm text-gray-600">Find exactly what you're looking for</p>
                </div>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="group flex items-center text-sm text-gray-500 hover:text-red-600 transition-all duration-300 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl"
                >
                  <X className="h-4 w-4 mr-1 group-hover:rotate-90 transition-transform duration-300" />
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Enhanced Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Search Input */}
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-purple-600 transition-colors duration-300">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 placeholder-gray-500 shadow-inner"
                  placeholder="Search exams, courses..."
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Status Filter */}
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-300">
                  <Filter className="h-5 w-5" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer shadow-inner"
                >
                  <option value="all">All Status</option>
                  <option value="draft">📝 Draft</option>
                  <option value="scheduled">📅 Scheduled</option>
                  <option value="active">🟢 Active</option>
                  <option value="completed">✅ Completed</option>
                </select>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              {/* Course Filter */}
              <div className="relative group">
                <div className="absolute left-4 top-4 text-gray-400 group-focus-within:text-green-600 transition-colors duration-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 text-gray-900 appearance-none cursor-pointer shadow-inner"
                >
                  <option value="all">All Courses ({exams.length} exams)</option>
                  {courses.map((course) => {
                    const courseExamCount = exams.filter(exam => exam.course?.id === course.id).length;
                    return (
                      <option key={course.id} value={course.id.toString()}>
                        📚 {course.name} ({courseExamCount} exams)
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>

            {/* Items Per Page Selector */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700">Show:</span>
                <select
                  value={examsPerPage}
                  onChange={(e) => setExamsPerPage(Number(e.target.value))}
                  className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:border-purple-300 shadow-sm"
                >
                  <option value={3}>3 per page</option>
                  <option value={6}>6 per page</option>
                  <option value={9}>9 per page</option>
                  <option value={12}>12 per page</option>
                  <option value={18}>18 per page</option>
                  <option value={24}>24 per page</option>
                </select>
              </div>

              {filteredExams.length > 0 && (
                <div className="flex items-center space-x-4">
                  {totalPages > 1 && (
                    <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                      Page {currentPage} of {totalPages}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-medium text-gray-700 flex items-center">
                    <Filter className="h-4 w-4 mr-1" />
                    Active filters:
                  </span>
                  {searchTerm && (
                    <span className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      🔍 "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      📊 {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {courseFilter !== 'all' && (
                    <span className="group inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                      📚 {courses.find(c => c.id.toString() === courseFilter)?.name || 'Unknown'}
                      <button
                        onClick={() => setCourseFilter('all')}
                        className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors duration-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Results Summary */}

          </div>
        </div>

        {/* Enhanced Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentExams.map((exam) => {
            // Calculate status and time remaining
            const now = new Date();
            const startDateTime = exam.startDate && exam.startTime
              ? new Date(`${exam.startDate} ${exam.startTime}`)
              : new Date(exam.startDate);
            const endDateTime = exam.endDate && exam.endTime
              ? new Date(`${exam.endDate} ${exam.endTime}`)
              : new Date(startDateTime.getTime() + (exam.duration * 60 * 1000));

            const isActive = now >= startDateTime && now <= endDateTime;
            const isCompleted = now > endDateTime;
            const isScheduled = now < startDateTime;

            let statusText = exam.status || 'draft';
            let statusColor = getStatusColor(statusText);

            // Override with calculated status if needed
            if (isCompleted && statusText !== 'completed') {
              statusText = 'completed';
              statusColor = 'bg-green-100 text-green-800';
            } else if (isActive && statusText !== 'active') {
              statusText = 'active';
              statusColor = 'bg-blue-100 text-blue-800';
            } else if (isScheduled && statusText === 'draft') {
              statusText = 'scheduled';
              statusColor = 'bg-yellow-100 text-yellow-800';
            }

            return (
              <div key={exam.exam_id} className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 hover:shadow-3xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-blue-50/30 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>

                {/* Enhanced Header with Dynamic Gradient */}
                <div className={`relative bg-gradient-to-r ${statusText === 'active' ? 'from-emerald-500 via-green-600 to-teal-600' :
                    statusText === 'completed' ? 'from-blue-500 via-indigo-600 to-purple-600' :
                      statusText === 'scheduled' ? 'from-orange-500 via-amber-600 to-yellow-600' :
                        'from-gray-500 via-slate-600 to-gray-600'
                  } text-white p-6 rounded-2xl mb-6 shadow-xl group-hover:shadow-2xl transition-all duration-300 overflow-hidden`}>

                  {/* Animated Background Pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 group-hover:rotate-45 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/20 rounded-full translate-y-10 -translate-x-10 group-hover:scale-150 group-hover:-rotate-45 transition-all duration-700"></div>
                    <div className="absolute top-1/2 left-1/2 w-16 h-16 bg-white/10 rounded-full -translate-x-8 -translate-y-8 group-hover:scale-200 transition-all duration-1000"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold line-clamp-1 group-hover:text-white transition-colors duration-300">{exam.title}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${statusColor} bg-white/95 backdrop-blur-sm shadow-lg`}>
                          {statusText === 'active' ? '' : statusText === 'completed' ? '' : statusText === 'scheduled' ? '' : ''}
                          {statusText.charAt(0).toUpperCase() + statusText.slice(1)}
                        </span>
                      </div>
                    </div>

                    {exam.description && (
                      <p className="text-white/90 text-sm line-clamp-2 mb-3 group-hover:text-white transition-colors duration-300">{exam.description}</p>
                    )}

                    {exam.course && (
                      <div className="flex items-center text-white/80 text-sm group-hover:text-white/90 transition-colors duration-300">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <span className="truncate font-medium">{exam.course.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Exam Details */}
                <div className="relative z-10 space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100 group-hover:border-purple-200 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Start Date</p>
                          <p className="text-sm font-bold text-gray-900">
                            {exam.startDate
                              ? new Date(exam.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })
                              : 'Not set'
                            }
                          </p>
                        </div>
                      </div>
                      {exam.countdownDisplay && !exam.isExpired && (
                        <div className={`mt-2 text-xs font-bold px-2 py-1 rounded-lg text-center ${exam.countdownColor === 'red' ? 'bg-red-100 text-red-700' :
                            exam.countdownColor === 'orange' ? 'bg-orange-100 text-orange-700' :
                              'bg-green-100 text-green-700'
                          }`}>
                          {exam.countdownDisplay}
                        </div>
                      )}
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100 group-hover:border-blue-200 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Duration</p>
                          <p className="text-sm font-bold text-gray-900">{exam.duration} min</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 group-hover:border-green-200 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                          <FileText className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Questions</p>
                          <p className="text-sm font-bold text-gray-900">{exam.questionCount || exam.questionsCount || 0}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100 group-hover:border-orange-200 transition-colors duration-300">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                          <Users className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-600">Total Marks</p>
                          <p className="text-sm font-bold text-gray-900">{exam.totalMarks || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Statistics */}
                <div className="relative z-10 mb-6">
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 text-center border border-cyan-100 group-hover:border-cyan-200 transition-all duration-300 group-hover:shadow-lg">
                    <div className="flex items-center justify-center mb-2">
                      <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg mr-2">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">
                        {exam.studentCount || exam.studentsEnrolled || 0}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Enrolled Students</p>
                  </div>
                </div>

                {/* Due date if available */}
                {exam.dueDateTime && (
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-800">Due</span>
                      <span className="text-sm text-purple-900">{exam.dueDateTime}</span>
                    </div>
                  </div>
                )}

                {/* Enhanced Action Buttons */}
                <div className="relative z-10 flex space-x-3">
                  <button
                    onClick={() => { setSelectedExam(exam); setViewModalOpen(true); }}
                    className="group flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-3 px-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 flex items-center justify-center text-sm hover:scale-105 shadow-lg"
                  >
                    <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                    View Details
                  </button>

                  <button
                    onClick={() => { setSelectedExam(exam); setEditModalOpen(true); }}
                    className="group p-3 text-gray-500 hover:text-blue-600 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg hover:scale-110 border border-gray-200 hover:border-blue-300"
                  >
                    <Edit className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  </button>

                  <button
                    onClick={() => { handleDeleteExam(String(exam.exam_id)); }}
                    className="group p-3 text-gray-500 hover:text-red-600 rounded-2xl hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 transition-all duration-300 hover:shadow-lg hover:scale-110 border border-gray-200 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {filteredExams.length > 0 && totalPages > 1 && (
          <div className="mt-12 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(endIndex, filteredExams.length)}</span> of{' '}
                <span className="font-semibold">{filteredExams.length}</span> exams
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current page
                    const showPage = page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1);

                    if (!showPage) {
                      // Show ellipsis for gaps
                      if (page === currentPage - 2 || page === currentPage + 2) {
                        return (
                          <span key={page} className="px-2 py-1 text-gray-500">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${currentPage === page
                            ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white shadow-lg hover:shadow-xl'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-purple-50 hover:border-purple-300 hover:text-purple-700'
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredExams.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-xl rounded-3xl p-12 max-w-lg mx-auto shadow-2xl border border-white/50">
              {/* Enhanced Empty State Icon */}
              <div className="relative mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <FileText className="h-12 w-12 text-purple-600" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {hasActiveFilters ? '🔍 No matching exams found' : '📝 Ready to create your first exam?'}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {hasActiveFilters
                  ? 'Your search didn\'t return any results. Try adjusting your filters or search terms to find what you\'re looking for.'
                  : 'Start building engaging exams for your students. Create comprehensive assessments with multiple question types and detailed analytics.'
                }
              </p>

              {hasActiveFilters ? (
                <div className="space-y-4">
                  <button
                    onClick={clearFilters}
                    className="group bg-gradient-to-r from-gray-600 via-gray-700 to-gray-800 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 inline-flex items-center hover:scale-105"
                  >
                    <X className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Clear All Filters
                  </button>
                  <div className="flex items-center justify-center space-x-4">
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                    <span className="text-sm text-gray-500 font-medium">or</span>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                  </div>
                  <Link
                    to="/instructor/create-exam"
                    className="group bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 inline-flex items-center hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Create New Exam
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/instructor/create-exam"
                    className="group bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 inline-flex items-center hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                    Create Your First Exam
                  </Link>
                  {courses.length === 0 && (
                    <>
                      <div className="flex items-center justify-center space-x-4">
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                        <span className="text-sm text-gray-500 font-medium">or start with</span>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                      </div>
                      <Link
                        to="/instructor/create-course"
                        className="group bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl transition-all duration-300 inline-flex items-center hover:scale-105"
                      >
                        <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                        Create Your First Course
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
};

export default ExamList;
