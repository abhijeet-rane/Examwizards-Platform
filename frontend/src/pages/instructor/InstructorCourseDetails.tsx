import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  Calendar,
  Clock,
  Award,
  Globe,
  Lock,
  IndianRupee,
  Users,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  Eye,
  BarChart3,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ModernCard } from '../../components/ui/ModernCard';
import { ModernButton } from '../../components/ui/ModernButton';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';
import ExamViewModal from '../../components/modals/ExamViewModal';
import ExamEditModal from '../../components/modals/ExamEditModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InstructorCourseDetails {
  id: number;
  name: string;
  description: string;
  visibility: string;
  pricing: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
  instructor: {
    id: number;
    username: string;
    fullName: string;
  };
  enrollmentCount?: number;
  allowedEmails?: string[];
  examCount?: number;
}

interface ExamDetails {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  totalMarks: number;
  questionCount?: number;
  status: 'upcoming' | 'active' | 'completed' | 'expired';
  submissionCount?: number;
  averageScore?: number;
  isActive: boolean;
}

const InstructorCourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<InstructorCourseDetails | null>(null);
  const [exams, setExams] = useState<ExamDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(true);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [examsPerPage, setExamsPerPage] = useState(3);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchCourseExams();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await apiService.getCourse(parseInt(courseId!));

      console.log('Course data received:', courseData);

      // Enhance course data with instructor-specific information
      let enhancedCourseData = { ...courseData };

      // Get enrollment count for the course
      if (courseData.visibility === 'PRIVATE' && courseData.allowedEmails) {
        enhancedCourseData.enrollmentCount = courseData.allowedEmails.length;
      } else if (courseData.visibility === 'PUBLIC') {
        // For public courses, we could try to get actual enrollment count
        // For now, we'll leave it undefined and handle in the UI
        enhancedCourseData.enrollmentCount = undefined;
      }

      // Set creation date - use current date as fallback if not available
      if (!enhancedCourseData.createdAt) {
        enhancedCourseData.createdAt = new Date().toISOString();
      }

      setCourse(enhancedCourseData);
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast.error('Failed to load course details');
      navigate('/instructor');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseExams = async () => {
    try {
      setExamsLoading(true);
      // Fetch exams for this specific course
      const examsData = await apiService.getExamsByCourse(parseInt(courseId!));

      if (examsData && Array.isArray(examsData)) {
        // Process each exam and fetch its submission statistics
        const processedExams = await Promise.all(
          examsData.map(async (exam: any) => {
            const now = new Date();
            const startDateTime = new Date(`${exam.startDate} ${exam.startTime}`);
            const endDateTime = new Date(`${exam.endDate} ${exam.endTime}`);

            let status: 'upcoming' | 'active' | 'completed' | 'expired' = 'upcoming';

            if (now < startDateTime) {
              status = 'upcoming';
            } else if (now >= startDateTime && now <= endDateTime) {
              status = 'active';
            } else {
              status = 'completed';
            }

            // Fetch submission statistics for this exam
            let submissionCount = 0;
            let averageScore = 0;

            try {
              const examId = exam.exam_id || exam.id;
              console.log(`Fetching results for exam: ${exam.title} (ID: ${examId})`);

              // Try to get exam results to calculate statistics
              const examResults = await apiService.getExamResults(examId);

              if (examResults && Array.isArray(examResults)) {
                submissionCount = examResults.length;

                if (submissionCount > 0) {
                  // Calculate average score
                  const totalScore = examResults.reduce((sum: number, result: any) => {
                    return sum + (result.score || 0);
                  }, 0);

                  const totalMarks = exam.totalMarks || 1; // Avoid division by zero
                  averageScore = Math.round((totalScore / (submissionCount * totalMarks)) * 100);
                }

                console.log(`Exam "${exam.title}": ${submissionCount} submissions, ${averageScore}% average`);
              }
            } catch (error) {
              console.warn(`Could not fetch results for exam ${exam.title}:`, error);
              // Keep default values (0) if results can't be fetched
            }

            return {
              id: exam.exam_id || exam.id,
              title: exam.title,
              description: exam.description,
              startDate: exam.startDate,
              startTime: exam.startTime,
              endDate: exam.endDate,
              endTime: exam.endTime,
              duration: exam.duration,
              totalMarks: exam.totalMarks,
              questionCount: exam.questionCount || 0,
              status,
              submissionCount, // Now fetched from actual results
              averageScore,    // Now calculated from actual results
              isActive: exam.isactive || false
            };
          })
        );

        setExams(processedExams);
      }
    } catch (error) {
      console.error('Error fetching course exams:', error);
      setExams([]);
    } finally {
      setExamsLoading(false);
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    return visibility === 'PUBLIC' ? Globe : Lock;
  };

  const getVisibilityColor = (visibility: string) => {
    return visibility === 'PUBLIC'
      ? 'bg-blue-100 text-blue-800'
      : 'bg-gray-100 text-gray-800';
  };

  const getPricingColor = (pricing: string) => {
    return pricing === 'PAID'
      ? 'bg-green-100 text-green-800'
      : 'bg-purple-100 text-purple-800';
  };

  const getExamStatusIcon = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Clock className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getExamStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const dateTime = new Date(`${date} ${time}`);
    return dateTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDeleteCourse = async () => {
    if (!course) return;

    const confirmed = window.confirm(`Are you sure you want to delete the course "${course.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await apiService.deleteCourse(course.id);
      toast.success('Course deleted successfully');
      navigate('/instructor');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  // Modal handlers
  const handleViewExam = (exam: ExamDetails) => {
    // Calculate enrolled students based on course type and data
    let studentsEnrolled = 0;

    if (course?.visibility === 'PRIVATE' && course.allowedEmails) {
      // For private courses, use the allowed emails count
      studentsEnrolled = course.allowedEmails.length;
    } else if (course?.visibility === 'PUBLIC') {
      // For public courses, we could use submission count as an approximation
      // or fetch actual enrollment data from API
      studentsEnrolled = exam.submissionCount || 0;
    }

    // Transform exam data to match modal interface
    const modalExam = {
      exam_id: exam.id,
      title: exam.title,
      description: exam.description || '',
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      startDate: exam.startDate,
      endDate: exam.endDate,
      startTime: exam.startTime,
      endTime: exam.endTime,
      status: exam.status,
      studentsEnrolled: studentsEnrolled,
      questionsCount: exam.questionCount || 0,
      averageScore: exam.averageScore
    };
    setSelectedExam(modalExam);
    setViewModalOpen(true);
  };

  const handleEditExam = async (exam: ExamDetails) => {
    try {
      // Fetch complete exam data from API to get all fields including questions
      const fullExamData = await apiService.getExam(exam.id);
      console.log('Full exam data for editing:', fullExamData);

      // Calculate enrolled students based on course type and data
      let studentsEnrolled = 0;

      if (course?.visibility === 'PRIVATE' && course.allowedEmails) {
        // For private courses, use the allowed emails count
        studentsEnrolled = course.allowedEmails.length;
      } else if (course?.visibility === 'PUBLIC') {
        // For public courses, we could use submission count as an approximation
        // or fetch actual enrollment data from API
        studentsEnrolled = exam.submissionCount || 0;
      }

      // Transform exam data to match modal interface with all required fields
      const modalExam = {
        exam_id: exam.id,
        title: fullExamData.title || exam.title,
        description: fullExamData.description || exam.description || '',
        duration: fullExamData.duration || exam.duration,
        totalMarks: fullExamData.totalMarks || exam.totalMarks,
        startDate: fullExamData.startDate || exam.startDate,
        endDate: fullExamData.endDate || exam.endDate,
        startTime: fullExamData.startTime || exam.startTime,
        endTime: fullExamData.endTime || exam.endTime,
        instructions: fullExamData.instructions || '',
        isactive: fullExamData.isactive !== undefined ? fullExamData.isactive : exam.isActive,
        course: fullExamData.course || null,
        questions: fullExamData.questions || [],
        status: exam.status,
        studentsEnrolled: studentsEnrolled,
        questionsCount: fullExamData.questions ? fullExamData.questions.length : (exam.questionCount || 0),
        averageScore: exam.averageScore
      };

      console.log('Transformed exam data for modal:', modalExam);
      setSelectedExam(modalExam);
      setEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching exam details for editing:', error);
      toast.error('Failed to load exam details for editing');
    }
  };

  const handleSaveExam = (updatedExam: any) => {
    // Handle exam update
    toast.success('Exam updated successfully');
    setEditModalOpen(false);
    // Refresh exams list
    fetchCourseExams();
  };

  // Pagination calculations
  const totalPages = Math.ceil(exams.length / examsPerPage);
  const startIndex = (currentPage - 1) * examsPerPage;
  const endIndex = startIndex + examsPerPage;
  const currentExams = exams.slice(startIndex, endIndex);

  // Reset to first page when exams per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [examsPerPage]);

  // Helper function to calculate grade based on percentage
  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    return 'F';
  };

  // Helper function to format time spent
  const formatTimeSpent = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // PDF Download Function for Course Performance Report
  const downloadCourseReport = async () => {
    if (!course) return;

    try {
      const loadingToast = toast.loading('Generating course performance report...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredHeight: number) => {
        if (yPosition + requiredHeight > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
          return true;
        }
        return false;
      };

      // Header
      pdf.setFontSize(24);
      pdf.setTextColor(88, 28, 135); // Purple color
      pdf.text('Course Performance Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Course name and instructor info
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(course.name, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Instructor: ${course.instructor.fullName}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;

      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Course Overview Section
      checkPageBreak(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Course Overview', 20, yPosition);
      yPosition += 10;

      // Course details
      const courseDetails = [
        ['Course Name', course.name],
        ['Description', course.description.length > 60 ? course.description.substring(0, 60) + '...' : course.description],
        ['Visibility', course.visibility],
        ['Pricing', course.pricing === 'PAID' ? `${course.price}` : 'FREE'],
        ['Total Exams', exams.length.toString()],
        ['Created On', course.createdAt ? formatDate(course.createdAt) : 'N/A']
      ];

      if (course.visibility === 'PRIVATE' && course.allowedEmails) {
        courseDetails.push(['Enrolled Students', course.allowedEmails.length.toString()]);
      }

      pdf.setFontSize(11);
      courseDetails.forEach(([label, value], index) => {
        const y = yPosition + index * 6;
        checkPageBreak(8);
        pdf.setTextColor(60, 60, 60);
        pdf.text(`${label}:`, 20, y);
        pdf.setTextColor(0, 0, 0);
        pdf.text(value, 80, y);
      });
      yPosition += courseDetails.length * 6 + 15;

      // Exam Performance Summary
      checkPageBreak(30);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Exam Performance Summary', 20, yPosition);
      yPosition += 15;

      // Calculate statistics for use in multiple sections
      const totalSubmissions = exams.reduce((sum, exam) => sum + (exam.submissionCount || 0), 0);
      const averageScore = exams.length > 0
        ? Math.round(exams.reduce((sum, exam) => sum + (exam.averageScore || 0), 0) / exams.length)
        : 0;
      const activeExams = exams.filter(exam => exam.status === 'active').length;
      const completedExams = exams.filter(exam => exam.status === 'completed').length;
      const upcomingExams = exams.filter(exam => exam.status === 'upcoming').length;
      const highPerformingExams = exams.filter(exam => (exam.averageScore || 0) >= 80).length;
      const lowPerformingExams = exams.filter(exam => (exam.averageScore || 0) < 60).length;

      if (exams.length === 0) {
        pdf.setFontSize(11);
        pdf.setTextColor(100, 100, 100);
        pdf.text('No exams have been created for this course yet.', 20, yPosition);
        yPosition += 20;
      } else {
        // Exam summary statistics

        const summaryStats = [
          ['Total Exams', exams.length.toString()],
          ['Active Exams', activeExams.toString()],
          ['Completed Exams', completedExams.toString()],
          ['Upcoming Exams', upcomingExams.toString()],
          ['Total Submissions', totalSubmissions.toString()],
          ['Average Score', `${averageScore}%`]
        ];

        pdf.setFontSize(11);
        summaryStats.forEach(([label, value], index) => {
          const x = 20 + (index % 2) * 90;
          const y = yPosition + Math.floor(index / 2) * 8;
          checkPageBreak(8);
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${label}:`, x, y);
          pdf.setTextColor(0, 0, 0);
          pdf.text(value, x + 50, y);
        });
        yPosition += Math.ceil(summaryStats.length / 2) * 8 + 15;

        // Detailed Exam List
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Detailed Exam Information', 20, yPosition);
        yPosition += 15;

        // Table headers
        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);
        pdf.text('Exam Title', 20, yPosition);
        pdf.text('Status', 80, yPosition);
        pdf.text('Duration', 110, yPosition);
        pdf.text('Marks', 135, yPosition);
        pdf.text('Submissions', 155, yPosition);
        pdf.text('Avg Score', 175, yPosition);
        yPosition += 8;

        // Draw line under headers
        pdf.setDrawColor(200, 200, 200);
        pdf.line(20, yPosition - 2, 190, yPosition - 2);

        exams.forEach((exam) => {
          checkPageBreak(8);
          pdf.setTextColor(0, 0, 0);

          // Truncate long exam titles
          const examTitle = exam.title.length > 20
            ? exam.title.substring(0, 20) + '...'
            : exam.title;

          pdf.text(examTitle, 20, yPosition);
          pdf.text(exam.status.charAt(0).toUpperCase() + exam.status.slice(1), 80, yPosition);
          pdf.text(`${exam.duration}m`, 110, yPosition);
          pdf.text(exam.totalMarks.toString(), 135, yPosition);
          pdf.text((exam.submissionCount || 0).toString(), 155, yPosition);
          pdf.text(`${exam.averageScore || 0}%`, 175, yPosition);
          yPosition += 6;
        });
        yPosition += 15;

        // Performance Analysis
        checkPageBreak(40);
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Performance Analysis', 20, yPosition);
        yPosition += 15;

        pdf.setFontSize(11);
        pdf.setTextColor(60, 60, 60);

        // Calculate additional insights
        const mostPopularExam = exams.length > 0
          ? exams.reduce((a, b) => (a.submissionCount || 0) > (b.submissionCount || 0) ? a : b)
          : null;
        const highestScoringExam = exams.length > 0
          ? exams.reduce((a, b) => (a.averageScore || 0) > (b.averageScore || 0) ? a : b)
          : null;

        const insights = [
          `• Course Engagement: ${totalSubmissions} total submissions across all exams`,
          `• High Performance: ${highPerformingExams} exams with 80%+ average score`,
          `• Needs Attention: ${lowPerformingExams} exams with <60% average score`,
          `• Most Popular Exam: ${mostPopularExam ? mostPopularExam.title : 'N/A'} (${mostPopularExam?.submissionCount || 0} submissions)`,
          `• Highest Scoring Exam: ${highestScoringExam ? highestScoringExam.title : 'N/A'} (${highestScoringExam?.averageScore || 0}% avg)`,
          `• Course Completion Rate: ${completedExams}/${exams.length} exams completed`,
          `• Overall Course Performance: ${calculateGrade(averageScore)} grade average`
        ];

        insights.forEach((insight) => {
          checkPageBreak(8);
          pdf.text(insight, 20, yPosition);
          yPosition += 6;
        });
      }

      // Student Enrollment Details (for private courses)
      if (course.visibility === 'PRIVATE' && course.allowedEmails && course.allowedEmails.length > 0) {
        yPosition += 15;
        checkPageBreak(30);
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Enrolled Students', 20, yPosition);
        yPosition += 15;

        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        course.allowedEmails.forEach((email, index) => {
          checkPageBreak(6);
          pdf.text(`${index + 1}. ${email}`, 20, yPosition);
          yPosition += 5;
        });
      }

      // Recommendations Section
      yPosition += 15;
      checkPageBreak(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);

      // Recommendations Section
      const recommendations = [];


      if (exams.length === 0) {
        recommendations.push('• Create your first exam to start assessing student performance');
      } else {
        if (averageScore < 60) {
          recommendations.push('• Consider reviewing exam difficulty or providing additional study materials');
        }
        if (totalSubmissions < exams.length * 5) {
          recommendations.push('• Increase student engagement through announcements and reminders');
        }
        if (upcomingExams > 0) {
          recommendations.push(`• ${upcomingExams} upcoming exam(s) - ensure students are prepared`);
        }
        if (lowPerformingExams > 0) {
          recommendations.push('• Review low-performing exams and consider providing feedback or additional resources');
        }
        if (course.visibility === 'PRIVATE' && (!course.allowedEmails || course.allowedEmails.length === 0)) {
          recommendations.push('• Add student email addresses to enable course enrollment');
        }
      }

      if (recommendations.length === 0) {
        recommendations.push('• Course is performing well - continue monitoring student progress');
        recommendations.push('• Consider creating additional assessments to track learning outcomes');
      }

      recommendations.forEach((recommendation) => {
        checkPageBreak(8);
        pdf.text(recommendation, 20, yPosition);
        yPosition += 6;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('This report was generated automatically by ExamWizards System', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      const fileName = `Course_Report_${course.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast.success('Course performance report downloaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error generating course report:', error);
      toast.error('Failed to generate course report. Please try again.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!course) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Course not found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or you don't have access to it.</p>
          <ModernButton onClick={() => navigate('/instructor')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </ModernButton>
        </div>
      </DashboardLayout>
    );
  }

  const VisibilityIcon = getVisibilityIcon(course.visibility);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Back Button */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/instructor')}
                className="bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>
            </div>

            {/* Title and Action Buttons */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="text-center lg:text-left">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
                  <h1 className="text-4xl font-bold mb-2">Course Management</h1>
                </div>
                <p className="text-gray-600 text-lg">Manage your course content and track student progress</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={downloadCourseReport}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200 hover:shadow-xl flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </button>
                <Link to={`/instructor/edit-course/${course.id}`} className="w-full sm:w-auto">
                  <button className="w-full bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 flex items-center justify-center">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Course
                  </button>
                </Link>
                <button
                  onClick={handleDeleteCourse}
                  className="w-full sm:w-auto bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 py-3 px-6 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Course
                </button>
              </div>
            </div>
          </motion.div>

          {/* Course Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ModernCard variant="elevated" className="overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 h-2"></div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Course Details */}
                  <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 mb-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-gray-900 mb-4">{course.name}</h2>
                          <p className="text-gray-600 text-lg leading-relaxed">{course.description}</p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-3 mt-6">
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md ${course.visibility === 'PUBLIC'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                          : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'}`}>
                          <VisibilityIcon className="h-4 w-4 mr-2" />
                          {course.visibility === 'PUBLIC' ? 'Public Course' : 'Private Course'}
                        </span>
                        <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold shadow-md ${course.pricing === 'PAID'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}>
                          {course.pricing === 'PAID' && <IndianRupee className="h-4 w-4 mr-2" />}
                          {course.pricing === 'PAID' ? `${course.price}` : 'FREE'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Course Statistics */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl mr-3">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        Course Statistics
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border border-purple-100">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg mr-3">
                              <FileText className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Total Exams</span>
                          </div>
                          <span className="text-2xl font-bold text-purple-600">{exams.length}</span>
                        </div>

                        {course.visibility === 'PRIVATE' && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border border-purple-100">
                            <div className="flex items-center">
                              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-2 rounded-lg mr-3">
                                <Users className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-bold text-gray-700">Enrolled Students</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">
                              {course.enrollmentCount || course.allowedEmails?.length || 0}
                            </span>
                          </div>
                        )}

                        {course.visibility === 'PRIVATE' && course.allowedEmails && course.allowedEmails.length > 0 && (
                          <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md border border-purple-100">
                            <div className="flex items-center">
                              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                                <Mail className="h-5 w-5 text-white" />
                              </div>
                              <span className="text-sm font-bold text-gray-700">Allowed Emails</span>
                            </div>
                            <span className="text-2xl font-bold text-green-600">{course.allowedEmails.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ModernCard>
          </motion.div>

          {/* Exams Management Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ModernCard variant="elevated" className="overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 h-2"></div>
              <div className="p-6">
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-xl mr-3">
                        <FileText className="h-6 w-6 text-white" />
                      </div>
                      Course Exams ({exams.length})
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3">
                      <Link to={`/instructor/exams?courseId=${course.id}`} className="w-full sm:w-auto">
                        <button className="w-full bg-white border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200 flex items-center justify-center">
                          <Eye className="h-4 w-4 mr-2" />
                          View All Exams
                        </button>
                      </Link>
                      <Link to={`/instructor/create-exam?courseId=${course.id}`} className="w-full sm:w-auto">
                        <button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200 hover:shadow-xl flex items-center justify-center">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Exam
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {exams.length > 0 && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-cyan-200">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-700">Show:</span>
                        <select
                          value={examsPerPage}
                          onChange={(e) => setExamsPerPage(Number(e.target.value))}
                          className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-cyan-300 shadow-sm"
                        >
                          <option value={3}>3 per page</option>
                          <option value={6}>6 per page</option>
                          <option value={9}>9 per page</option>
                          <option value={12}>12 per page</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        {totalPages > 1 && (
                          <span className="text-sm font-medium text-cyan-600 bg-cyan-50 px-3 py-1.5 rounded-full border border-cyan-200">
                            Page {currentPage} of {totalPages}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {examsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : exams.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-gray-400" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-3">No Exams Created</h4>
                    <p className="text-gray-600 mb-8 text-lg">Create your first exam to get started with assessments.</p>
                    <Link to={`/instructor/create-exam?courseId=${course.id}`}>
                      <button className="bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200 hover:shadow-xl flex items-center justify-center mx-auto">
                        <Plus className="h-5 w-5 mr-2" />
                        Create First Exam
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {currentExams.map((exam, index) => (
                      <motion.div
                        key={exam.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-indigo-300"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <h4 className="text-xl font-bold text-gray-900">{exam.title}</h4>
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold shadow-md ${exam.status === 'upcoming' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                                exam.status === 'active' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                                  exam.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white' :
                                    'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                                }`}>
                                {getExamStatusIcon(exam.status)}
                                <span className="ml-1 capitalize">{exam.status}</span>
                              </span>
                              {!exam.isActive && (
                                <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-md">
                                  Inactive
                                </span>
                              )}
                            </div>

                            {exam.description && (
                              <p className="text-gray-600 mb-6 text-lg">{exam.description}</p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <div className="flex items-center text-blue-700">
                                  <Calendar className="h-5 w-5 mr-2" />
                                  <div>
                                    <p className="text-xs font-medium">Start Time</p>
                                    <p className="text-sm font-bold">{formatDateTime(exam.startDate, exam.startTime)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                                <div className="flex items-center text-purple-700">
                                  <Calendar className="h-5 w-5 mr-2" />
                                  <div>
                                    <p className="text-xs font-medium">End Time</p>
                                    <p className="text-sm font-bold">{formatDateTime(exam.endDate, exam.endTime)}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <div className="flex items-center text-green-700">
                                  <Clock className="h-5 w-5 mr-2" />
                                  <div>
                                    <p className="text-xs font-medium">Duration</p>
                                    <p className="text-sm font-bold">{exam.duration} min</p>
                                  </div>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                                <div className="flex items-center text-orange-700">
                                  <Award className="h-5 w-5 mr-2" />
                                  <div>
                                    <p className="text-xs font-medium">Total Marks</p>
                                    <p className="text-sm font-bold">{exam.totalMarks}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-xl text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold">📝 Questions</span>
                                  <span className="text-2xl font-bold">{exam.questionCount}</span>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 rounded-xl text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold">📊 Submissions</span>
                                  <span className="text-2xl font-bold">{exam.submissionCount || 0}</span>
                                </div>
                              </div>
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-xl text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold">🎯 Avg Score</span>
                                  <span className="text-2xl font-bold">{exam.averageScore || 0}%</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="lg:ml-6 flex flex-col lg:flex-row lg:flex-col space-y-2 lg:space-y-2 lg:space-x-0 sm:flex-row sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => handleViewExam(exam)}
                              className="bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200 flex items-center justify-center whitespace-nowrap"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditExam(exam)}
                              className="bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200 flex items-center justify-center whitespace-nowrap"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Exam
                            </button>
                            <Link to={`/leaderboard?examId=${exam.id}&courseId=${course.id}`}>
                              <button className="w-full bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50 py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-200 flex items-center justify-center whitespace-nowrap">
                                <BarChart3 className="h-4 w-4 mr-2" />
                                View Leaderboard
                              </button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Pagination */}
                    {exams.length > 0 && totalPages > 1 && (
                      <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                            <span className="font-semibold">{Math.min(endIndex, exams.length)}</span> of{' '}
                            <span className="font-semibold">{exams.length}</span> exams
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
                                      ? 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-cyan-50 hover:border-cyan-300 hover:text-cyan-700'
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
                  </div>
                )}
              </div>
            </ModernCard>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <ExamViewModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        exam={selectedExam}
      />

      <ExamEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        exam={selectedExam}
        onSave={handleSaveExam}
      />
    </DashboardLayout>
  );
};

export default InstructorCourseDetails;