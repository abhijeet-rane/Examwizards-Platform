import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Download, Trophy, TrendingUp, Calendar, FileText, Search, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

interface ExamResult {
  id: string;
  examId: string; // Add exam ID for linking
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  completedAt: string;
  duration: number;
  timeSpent: number;
  instructor: string;
  subject: string;
  status: 'completed' | 'missed';
}

const MyResults = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(10); // Show 10 results per page

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Fetch both completed results and available exams to calculate missed exams
      const [resultsData, availableExamsData] = await Promise.all([
        apiService.getMyResults(),
        apiService.getExamsForEnrolledCourses().catch(() => []) // Don't fail if this fails
      ]);

      console.log('API Results:', resultsData);
      console.log('Available Exams:', availableExamsData);

      let completedResults = [];
      let missedExams = [];

      // Process completed results
      if (resultsData && resultsData.length > 0) {
        completedResults = resultsData;
      }

      // Calculate missed exams
      if (availableExamsData && Array.isArray(availableExamsData)) {
        const now = new Date();
        const completedExamIds = new Set(completedResults.map((r: any) => r.exam?.exam_id || r.exam?.id || r.examId));

        missedExams = availableExamsData.filter((exam: any) => {
          const examEndDate = new Date(`${exam.endDate} ${exam.endTime}`);
          const examId = exam.exam_id || exam.id;
          return now > examEndDate && !completedExamIds.has(examId) && !exam.hasSubmitted;
        });

        console.log('Missed exams calculated:', missedExams.length);
      }

      // Map completed results to expected format
      const mappedCompletedResults = completedResults.map((result: any) => {
        console.log('Processing result:', result);
        console.log('All result keys:', Object.keys(result));
        console.log('Exam object:', result.exam);
        console.log('Exam keys:', result.exam ? Object.keys(result.exam) : 'No exam object');
        console.log('Subject from exam:', result.exam?.subject);
        console.log('Subject direct:', result.subject);
        console.log('Course from exam:', result.exam?.course);
        console.log('Title from exam:', result.exam?.title);

        // Try different time properties and formats
        let timeSpentMinutes = 0;

        // First, try the formatted time as it's most reliable
        if (result.timeTakenFormatted) {
          // Parse formatted time like "0:08" (minutes:seconds)
          const timeParts = result.timeTakenFormatted.split(':');
          if (timeParts.length >= 2) {
            const minutes = parseInt(timeParts[0]) || 0;
            const seconds = parseInt(timeParts[1]) || 0;
            // Convert to total minutes (with decimal for seconds)
            timeSpentMinutes = minutes + (seconds / 60);
            console.log(`Parsed from formatted: ${result.timeTakenFormatted} -> ${timeSpentMinutes} minutes`);
          }
        } else if (result.timeTaken && result.timeTaken > 0) {
          // If timeTaken is available, determine if it's seconds or minutes
          if (result.timeTaken > 300) {
            // Likely in seconds if > 5 minutes (300 seconds)
            timeSpentMinutes = result.timeTaken / 60;
            console.log(`Parsed from seconds: ${result.timeTaken}s -> ${timeSpentMinutes} minutes`);
          } else {
            // For small numbers, assume it's already in minutes or treat as seconds
            // Since we saw timeTaken: 8 with timeTakenFormatted: "0:08", it's likely seconds
            timeSpentMinutes = result.timeTaken / 60;
            console.log(`Parsed from small timeTaken: ${result.timeTaken}s -> ${timeSpentMinutes} minutes`);
          }
        } else if (result.timeSpent && result.timeSpent > 0) {
          // Direct time spent in minutes
          timeSpentMinutes = result.timeSpent;
          console.log(`Used direct timeSpent: ${timeSpentMinutes} minutes`);
        }

        // If still 0, try to use any available time data as fallback
        if (timeSpentMinutes === 0) {
          // Check for other possible time properties
          timeSpentMinutes = result.duration_taken || result.time_spent || result.elapsed_time || 0;
          if (timeSpentMinutes > 0) {
            console.log(`Used fallback time: ${timeSpentMinutes} minutes`);
          }
        }

        console.log('Calculated timeSpentMinutes:', timeSpentMinutes);

        // Extract subject with multiple fallback options
        let subject = 'General';

        // Try different ways to get the subject/course name
        if (result.exam?.course?.name) {
          subject = result.exam.course.name;
        } else if (result.exam?.course) {
          subject = typeof result.exam.course === 'string' ? result.exam.course : result.exam.course.name || 'General';
        } else if (result.exam?.subject) {
          subject = result.exam.subject;
        } else if (result.course?.name) {
          subject = result.course.name;
        } else if (result.course) {
          subject = typeof result.course === 'string' ? result.course : result.course.name || 'General';
        } else if (result.subject) {
          subject = result.subject;
        } else {
          // Try to extract subject from exam title as last resort
          const examTitle = result.exam?.title || result.examTitle || '';
          if (examTitle.toLowerCase().includes('sample')) {
            subject = 'OOPs';
          } else if (examTitle.toLowerCase().includes('science')) {
            subject = examTitle.toLowerCase().includes('div c') ? 'div C science' : 'Science';
          } else if (examTitle.toLowerCase().includes('math')) {
            subject = 'Math';
          } else if (examTitle.toLowerCase().includes('physics')) {
            subject = 'Physics';
          } else if (examTitle.toLowerCase().includes('chemistry')) {
            subject = 'Chemistry';
          } else if (examTitle.toLowerCase().includes('biology')) {
            subject = 'Biology';
          }
        }

        console.log('Final subject extracted:', subject);

        return {
          id: result.id?.toString() || result.result_id?.toString() || Math.random().toString(),
          examId: result.exam?.exam_id?.toString() || result.exam?.id?.toString() || result.examId?.toString() || result.examExamId?.toString() || '1',
          examTitle: result.exam?.title || result.examTitle || 'Unknown Exam',
          score: result.score || 0,
          totalMarks: result.exam?.totalMarks || result.totalMarks || 0,
          percentage: result.percentage || 0,
          grade: calculateGrade(result.percentage || 0),
          completedAt: result.attemptDate || result.completedAt || new Date().toISOString(),
          duration: result.exam?.duration || result.duration || 0,
          timeSpent: timeSpentMinutes,
          instructor: result.exam?.instructor || result.instructor || 'Unknown',
          subject: subject,
          status: 'completed'
        };
      });

      // Map missed exams to expected format
      const mappedMissedResults = missedExams.map((exam: any) => {
        // Extract subject from missed exam
        let subject = 'General';
        if (exam.course?.name) {
          subject = exam.course.name;
        } else if (exam.courseName) {
          subject = exam.courseName;
        } else if (exam.title?.toLowerCase().includes('science')) {
          subject = 'Science';
        } else if (exam.title?.toLowerCase().includes('math')) {
          subject = 'Math';
        }

        return {
          id: `missed_${exam.exam_id || exam.id || Math.random()}`,
          examId: (exam.exam_id || exam.id)?.toString() || '1',
          examTitle: exam.title || 'Unknown Exam',
          score: 0,
          totalMarks: exam.totalMarks || 0,
          percentage: 0,
          grade: 'F',
          completedAt: exam.endDate ? `${exam.endDate}T${exam.endTime || '23:59'}:00` : new Date().toISOString(),
          duration: exam.duration || 0,
          timeSpent: 0,
          instructor: exam.instructor || exam.course?.instructor?.fullName || 'Unknown',
          subject: subject,
          status: 'missed'
        };
      });

      // Combine completed and missed results
      const allResults = [...mappedCompletedResults, ...mappedMissedResults];
      setResults(allResults);
    } catch (error) {
      console.error('Failed to fetch results:', error);
      // No mock data fallback - only show empty state
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatTimeSpent = (timeSpent: number): string => {
    if (timeSpent === 0 || !timeSpent) return 'N/A';

    // Handle very small numbers (less than 1 minute)
    if (timeSpent < 1) {
      const seconds = Math.round(timeSpent * 60);
      return `${seconds} sec`;
    }

    // Handle minutes
    if (timeSpent < 60) {
      const minutes = Math.round(timeSpent);
      return `${minutes} min`;
    }

    // Handle hours and minutes
    const hours = Math.floor(timeSpent / 60);
    const minutes = Math.round(timeSpent % 60);

    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  // Mock data removed - only using real API data

  // Get unique courses from results
  const courses = [...new Set(results.map(r => r.subject))];

  // Calculate statistics including missed exams
  const completedResults = results.filter(r => r.status === 'completed');
  const missedResults = results.filter(r => r.status === 'missed');

  const totalExams = results.length;
  const completedExams = completedResults.length;
  const missedExams = missedResults.length;

  // Average score includes missed exams as 0
  const averageScore = results.length > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length : 0;
  const highestScore = completedResults.length > 0 ? Math.max(...completedResults.map(r => r.percentage)) : 0;

  // Subject performance data including missed exams (matching Student Dashboard format)
  const coursePerformance = courses.map(course => {
    const courseResults = results.filter(r => r.subject === course);
    const completedCourseResults = courseResults.filter(r => r.status === 'completed');
    const missedCourseResults = courseResults.filter(r => r.status === 'missed');

    // Average includes missed exams as 0
    const avgScore = courseResults.length > 0 ?
      courseResults.reduce((sum, r) => sum + r.percentage, 0) / courseResults.length : 0;

    return {
      subject: course,
      score: Math.round(avgScore),
      exams: courseResults.length,
      completed: completedCourseResults.length,
      missed: missedCourseResults.length
    };
  });

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200';
      case 'A':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200';
      case 'B+':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200';
      case 'B':
        return 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-800 border border-indigo-200';
      case 'C+':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border border-yellow-200';
      case 'C':
        return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200';
      case 'D':
        return 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border border-orange-200';
      case 'F':
        return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border border-gray-200';
    }
  };

  const filteredResults = results.filter(result => {
    const matchesSearch = result.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = subjectFilter === 'all' || result.subject === subjectFilter;
    return matchesSearch && matchesCourse;
  });

  // Pagination helper functions
  const getPaginatedResults = () => {
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    return filteredResults.slice(startIndex, endIndex);
  };

  const getTotalPages = () => {
    return Math.ceil(filteredResults.length / resultsPerPage);
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType: 'search' | 'subject', value: string) => {
    setCurrentPage(1);
    if (filterType === 'search') {
      setSearchTerm(value);
    } else {
      setSubjectFilter(value);
    }
  };

  // Handle results per page change
  const handleResultsPerPageChange = (newResultsPerPage: number) => {
    setResultsPerPage(newResultsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  const stats = [
    {
      name: 'Total Exams',
      value: totalExams.toString(),
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      subtitle: `${completedExams} completed, ${missedExams} missed`
    },
    {
      name: 'Average Score',
      value: `${Math.round(averageScore)}%`,
      icon: BarChart3,
      color: 'from-teal-500 to-teal-600'
    },
    {
      name: 'Highest Score',
      value: `${highestScore}%`,
      icon: Trophy,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Grade A+/A',
      value: completedResults.filter(r => r.grade === 'A+' || r.grade === 'A').length.toString(),
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    }
  ];



  // PDF Download Function
  const downloadPDFReport = async () => {
    try {
      const loadingToast = toast.loading('Generating PDF report...');

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
      pdf.text('Student Performance Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Student info and date
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generated on: ${currentDate}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;

      // Performance Summary Section
      checkPageBreak(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Performance Summary', 20, yPosition);
      yPosition += 10;

      // Stats in a grid format
      const statsData = [
        ['Total Exams Taken', totalExams.toString()],
        ['Average Score', `${Math.round(averageScore)}%`],
        ['Highest Score', `${highestScore}%`],
        ['Grade A+/A Count', results.filter(r => r.grade === 'A+' || r.grade === 'A').length.toString()],
        ['Total Subjects', courses.length.toString()],
        ['Overall Grade', calculateGrade(averageScore)]
      ];

      pdf.setFontSize(11);
      statsData.forEach(([label, value], index) => {
        const x = 20 + (index % 2) * 90;
        const y = yPosition + Math.floor(index / 2) * 8;
        pdf.setTextColor(60, 60, 60);
        pdf.text(`${label}:`, x, y);
        pdf.setTextColor(0, 0, 0);
        pdf.text(value, x + 50, y);
      });
      yPosition += Math.ceil(statsData.length / 2) * 8 + 15;

      // Subject Performance Section
      checkPageBreak(30 + coursePerformance.length * 6);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Subject Performance', 20, yPosition);
      yPosition += 15;

      // Subject performance table
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Subject', 20, yPosition);
      pdf.text('Avg Score', 80, yPosition);
      pdf.text('Exams Taken', 120, yPosition);
      pdf.text('Grade', 160, yPosition);
      yPosition += 8;

      // Draw line under headers
      pdf.setDrawColor(200, 200, 200);
      pdf.line(20, yPosition - 2, 180, yPosition - 2);

      coursePerformance.forEach((course) => {
        checkPageBreak(8);
        pdf.setTextColor(0, 0, 0);
        pdf.text(course.subject, 20, yPosition);
        pdf.text(`${course.score}%`, 80, yPosition);
        pdf.text(course.exams.toString(), 120, yPosition);
        pdf.text(calculateGrade(course.score), 160, yPosition);
        yPosition += 6;
      });
      yPosition += 15;

      // Recent Exam Results Section
      checkPageBreak(30);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Recent Exam Results', 20, yPosition);
      yPosition += 15;

      // Table headers
      pdf.setFontSize(9);
      pdf.setTextColor(60, 60, 60);
      pdf.text('Exam Title', 20, yPosition);
      pdf.text('Score', 90, yPosition);
      pdf.text('Grade', 115, yPosition);
      pdf.text('Time', 135, yPosition);
      pdf.text('Date', 160, yPosition);
      yPosition += 8;

      // Draw line under headers
      pdf.line(20, yPosition - 2, 180, yPosition - 2);

      // Show last 10 results
      const recentResults = results.slice(0, 10);
      recentResults.forEach((result) => {
        checkPageBreak(8);
        pdf.setTextColor(0, 0, 0);

        // Truncate long exam titles
        const examTitle = result.examTitle.length > 25
          ? result.examTitle.substring(0, 25) + '...'
          : result.examTitle;

        pdf.text(examTitle, 20, yPosition);
        pdf.text(`${result.score}/${result.totalMarks}`, 90, yPosition);
        pdf.text(result.grade, 115, yPosition);
        pdf.text(formatTimeSpent(result.timeSpent), 135, yPosition);
        pdf.text(new Date(result.completedAt).toLocaleDateString(), 160, yPosition);
        yPosition += 6;
      });

      // Performance Analysis Section
      yPosition += 15;
      checkPageBreak(40);
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Performance Analysis', 20, yPosition);
      yPosition += 15;

      pdf.setFontSize(11);
      pdf.setTextColor(60, 60, 60);

      // Calculate insights
      const passedExams = results.filter(r => r.percentage >= 60).length;
      const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;
      const averageTimeEfficiency = results.length > 0
        ? Math.round((results.reduce((sum, r) => sum + (r.timeSpent / r.duration), 0) / results.length) * 100)
        : 0;

      const insights = [
        `• Pass Rate: ${passRate}% (${passedExams}/${totalExams} exams passed)`,
        `• Time Efficiency: ${averageTimeEfficiency}% of allocated time used on average`,
        `• Strongest Subject: ${coursePerformance.length > 0 ? coursePerformance.reduce((a, b) => a.score > b.score ? a : b).subject : 'N/A'}`,
        `• Most Active Subject: ${coursePerformance.length > 0 ? coursePerformance.reduce((a, b) => a.exams > b.exams ? a : b).subject : 'N/A'}`,
        `• Grade Distribution: ${results.filter(r => ['A+', 'A'].includes(r.grade)).length} A-grades, ${results.filter(r => ['B+', 'B'].includes(r.grade)).length} B-grades, ${results.filter(r => ['C+', 'C'].includes(r.grade)).length} C-grades`
      ];

      insights.forEach((insight) => {
        checkPageBreak(8);
        pdf.text(insight, 20, yPosition);
        yPosition += 6;
      });

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('This report was generated automatically by ExamWizards System', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Save the PDF
      pdf.save(`Student_Performance_Report_${new Date().toISOString().split('T')[0]}.pdf`);

      toast.success('PDF report downloaded successfully!', { id: loadingToast });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report. Please try again.');
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Enhanced Header with Beautiful Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 rounded-3xl p-8 text-white shadow-2xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-white/30 to-transparent rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-gradient-to-r from-white/25 to-transparent rounded-full -translate-x-12 -translate-y-12 animate-pulse delay-500"></div>
            <div className="absolute top-1/4 right-1/4 w-16 h-16 bg-gradient-to-bl from-white/15 to-transparent rounded-full animate-pulse delay-700"></div>
          </div>

          {/* Decorative Grid Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-20" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
              backgroundSize: '20px 20px'
            }}></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white tracking-tight">My Results</h1>
              </div>
              <p className="text-purple-100 text-md font-medium">Track your exam performance and academic progress</p>
              <div className="flex items-center space-x-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/90">Live Data</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Calendar className="h-4 w-4 text-white/80" />
                  <span className="text-sm text-white/90">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={downloadPDFReport}
              className="group bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-white/20"
            >
              <Download className="h-5 w-5 mr-2 group-hover:animate-bounce" />
              Download Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">{stat.name}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                  {stat.subtitle && (
                    <p className="text-xs text-white/70 mt-1 font-medium">{stat.subtitle}</p>
                  )}
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Beautiful Subject Performance Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100/50 hover:shadow-3xl transition-all duration-500 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Subject Performance</h3>
              </div>
              <p className="text-gray-600 font-medium">Your average scores across different subjects</p>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-indigo-50 px-4 py-3 rounded-2xl border border-purple-100 shadow-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-700">Live Analytics</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-100/50 shadow-inner">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={coursePerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1} />
                    <stop offset="50%" stopColor="#A855F7" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#C084FC" stopOpacity={0.6} />
                  </linearGradient>
                  <linearGradient id="barGradientHover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity={1} />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis
                  dataKey="subject"
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#475569', fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={10}
                />
                <Tooltip
                  formatter={(value, name, props) => {
                    const data = props.payload;
                    return [
                      `${value}%`,
                      'Average Score',
                      `Completed: ${data.completed}`,
                      `Missed: ${data.missed}`,
                      `Total: ${data.exams}`
                    ];
                  }}
                  labelFormatter={(label) => `Subject: ${label}`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    fontSize: '14px',
                    fontWeight: '500',
                    padding: '12px 16px'
                  }}
                  cursor={{ fill: 'rgba(139, 92, 246, 0.05)', radius: 8 }}
                />
                <Bar
                  dataKey="score"
                  fill="url(#barGradient)"
                  radius={[12, 12, 4, 4]}
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  className="hover:fill-url(#barGradientHover) transition-all duration-300"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Beautiful Enhanced Filters */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm hover:shadow-md"
                  placeholder="Search exams, instructors..."
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            <div className="md:w-56">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                </div>
                <select
                  value={subjectFilter}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 bg-gray-50/50 focus:bg-white shadow-sm hover:shadow-md appearance-none cursor-pointer"
                >
                  <option value="all">All Courses</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Header */}
        {filteredResults.length > 0 && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/50 mb-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Exam Results</h3>
                  <p className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, filteredResults.length)} of {filteredResults.length} results
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                {getTotalPages() > 1 && (
                  <span className="text-sm font-semibold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Page {currentPage} of {getTotalPages()}
                  </span>
                )}

                {/* Results per page selector */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-700">Show:</span>
                  <select
                    value={resultsPerPage}
                    onChange={(e) => handleResultsPerPageChange(Number(e.target.value))}
                    className="text-sm font-semibold bg-white border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                  </select>
                  <span className="text-sm font-semibold text-gray-700">per page</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Beautiful Enhanced Results Table */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 overflow-hidden backdrop-blur-sm">
          <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Exam Results</h3>
                  <p className="text-sm text-gray-600 font-medium">
                    {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                    ({completedResults.filter(r => filteredResults.includes(r)).length} completed, {missedResults.filter(r => filteredResults.includes(r)).length} missed)
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-blue-700">Updated</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Exam Details</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Score</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Trophy className="h-4 w-4" />
                      <span>Grade</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Time</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Date</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {getPaginatedResults().map((result, index) => (
                  <tr
                    key={result.id}
                    className={`group transition-all duration-300 border-b border-gray-100/50 ${result.status === 'missed'
                      ? 'hover:bg-gradient-to-r hover:from-red-50/50 hover:to-pink-50/50 bg-red-50/20'
                      : 'hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50'
                      }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${result.status === 'missed'
                          ? 'bg-gradient-to-br from-red-100 to-pink-100'
                          : 'bg-gradient-to-br from-purple-100 to-indigo-100'
                          }`}>
                          <FileText className={`h-6 w-6 ${result.status === 'missed' ? 'text-red-600' : 'text-purple-600'}`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                              {result.examTitle}
                            </div>
                            {result.status === 'missed' && (
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold border border-red-200">
                                MISSED
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 font-medium mt-1">
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {result.subject}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-2">
                        <div className={`text-lg font-bold ${result.status === 'missed' ? 'text-red-600' : 'text-gray-900'}`}>
                          {result.status === 'missed' ? 'Not Attempted' : (
                            <>
                              {result.score}<span className="text-gray-400">/{result.totalMarks}</span>
                            </>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 ${result.status === 'missed'
                                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                                }`}
                              style={{ width: `${result.percentage}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-semibold ${result.status === 'missed' ? 'text-red-600' : 'text-gray-600'}`}>
                            {result.percentage}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <span className={`inline-flex px-3 py-2 text-sm font-bold rounded-2xl shadow-sm ${getGradeColor(result.grade)} group-hover:scale-105 transition-transform duration-300`}>
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1">
                        <div className={`text-sm font-semibold flex items-center space-x-2 ${result.status === 'missed' ? 'text-red-600' : 'text-gray-900'
                          }`}>
                          <svg className={`h-4 w-4 ${result.status === 'missed' ? 'text-red-500' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{result.status === 'missed' ? 'Expired' : formatTimeSpent(result.timeSpent)}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                          {result.duration > 0 ? `of ${result.duration} min allocated` : 'Duration not set'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {new Date(result.completedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(result.completedAt).getFullYear()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      {result.status === 'completed' ? (
                        <Link
                          to={`/student/exam-result/${result.examId}`}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 text-red-700 text-sm font-semibold rounded-2xl border border-red-200">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          Missed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredResults.length > 0 && getTotalPages() > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 px-8 py-6 border-t border-gray-100">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600 font-medium">
                Showing {((currentPage - 1) * resultsPerPage) + 1} to {Math.min(currentPage * resultsPerPage, filteredResults.length)} of {filteredResults.length} results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:scale-105'
                    }`}
                >
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {/* Smart pagination - show ellipsis for large page counts */}
                  {(() => {
                    const totalPages = getTotalPages();
                    const pages = [];

                    if (totalPages <= 7) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Smart pagination with ellipsis
                      if (currentPage <= 4) {
                        // Show first 5 pages + ellipsis + last page
                        pages.push(1, 2, 3, 4, 5, '...', totalPages);
                      } else if (currentPage >= totalPages - 3) {
                        // Show first page + ellipsis + last 5 pages
                        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                      } else {
                        // Show first + ellipsis + current-1, current, current+1 + ellipsis + last
                        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                      }
                    }

                    return pages.map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-400 font-bold">
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page as number)}
                          className={`w-10 h-10 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === page
                            ? 'bg-indigo-600 text-white shadow-lg transform scale-110'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 hover:shadow-md'
                            }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                  disabled={currentPage === getTotalPages()}
                  className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-200 ${currentPage === getTotalPages()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md transform hover:scale-105'
                    }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {filteredResults.length === 0 && (
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100/50 p-16 backdrop-blur-sm">
            <div className="text-center space-y-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto flex items-center justify-center shadow-lg">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center shadow-lg">
                  <Search className="h-4 w-4 text-white" />
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900">
                  {searchTerm || subjectFilter !== 'all' ? 'No matching results' : 'No exam results yet'}
                </h3>
                <p className="text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                  {searchTerm || subjectFilter !== 'all'
                    ? 'Try adjusting your search terms or filter criteria to find what you\'re looking for.'
                    : 'Start taking exams to see your performance results and track your academic progress here.'
                  }
                </p>
              </div>

              {searchTerm || subjectFilter !== 'all' ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSubjectFilter('all');
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Clear All Filters
                  </button>
                  <Link
                    to="/student/exams"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Browse Exams
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/student/exams"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-2xl hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Take Your First Exam
                  </Link>
                  <Link
                    to="/student/courses"
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold rounded-2xl hover:from-emerald-600 hover:to-green-600 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    <Trophy className="h-5 w-5 mr-2" />
                    Explore Courses
                  </Link>
                </div>
              )}

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full opacity-50 animate-pulse"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full opacity-50 animate-pulse delay-1000"></div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyResults;