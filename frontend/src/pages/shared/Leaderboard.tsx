import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Filter, Search, BookOpen, Clock, Users, Star } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';

interface LeaderboardEntry {
  id: number;
  rank: number;
  name: string;
  email: string;
  score: number;
  totalMarks: number;
  percentage: number;
  examTitle: string;
  courseTitle?: string;
  courseFee?: number;
  completedAt: string;
  timeTaken?: number;
  avatar: string;
  grade?: string;
  isCurrentUser?: boolean;
}

interface Exam {
  id: number;
  exam_id: number;
  title: string;
  endDate: string;
  endTime: string;
  isExpired: boolean;
  totalMarks: number;
  duration: number;
  courseId?: number;
  courseTitle?: string;
  courseFee?: number;
}

interface Course {
  id: number;
  title: string;
  fee: number;
  enrollmentCount?: number;
}

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [autoSelectedExam, setAutoSelectedExam] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeComponent();
  }, []);

  useEffect(() => {
    if (selectedExam && selectedExam !== '') {
      fetchLeaderboardData(selectedExam);
    } else {
      setLeaderboardData([]);
    }
  }, [selectedExam]);

  // Check for URL parameters to auto-select exam (both after submission and from instructor view results)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const examId = urlParams.get('examId');
    const justSubmitted = urlParams.get('submitted');
    const courseId = urlParams.get('courseId');

    if (examId) {
      console.log('🎯 Auto-selecting exam from URL:', examId);
      setAutoSelectedExam(examId);
      setSelectedExam(examId);

      // If courseId is provided, also pre-select the course
      if (courseId) {
        console.log('🎯 Auto-selecting course from URL:', courseId);
        setSelectedCourse(courseId);
      }

      // Clean up URL parameters only if it was a submission redirect
      if (justSubmitted === 'true') {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  const initializeComponent = async () => {
    try {
      // First fetch current user, then fetch courses and exams based on user role
      await fetchCurrentUser();
    } catch (error) {
      console.error('Failed to initialize leaderboard:', error);
    }
  };

  // Fetch courses and exams after currentUser is set
  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchAvailableCourses(),
        fetchAvailableExams()
      ]).catch(error => {
        console.error('Failed to fetch courses and exams:', error);
      });
    }
  }, [currentUser]);

  // Set up real-time updates for leaderboard
  useEffect(() => {
    if (selectedExam) {
      // Clear any existing interval
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }

      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        console.log('🔄 Auto-refreshing leaderboard data...');
        fetchLeaderboardData(selectedExam);
        fetchAvailableExams(); // Also refresh available exams in case new submissions
      }, 30000); // 30 seconds

      setRefreshInterval(interval);

      // Cleanup on unmount or when selectedExam changes
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear interval when no exam is selected
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
  }, [selectedExam]);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to fetch current user:', error);
    }
  };

  const fetchAvailableCourses = async () => {
    if (!currentUser) return;

    try {
      let courses: Course[] = [];

      if (currentUser.role === 'INSTRUCTOR') {
        // For instructors, get courses they created
        const instructorCourses = await apiService.getInstructorCourses();
        courses = instructorCourses || [];
      } else if (currentUser.role === 'STUDENT') {
        // For students, get enrolled courses
        const enrolledCourses = await apiService.getEnrolledCourses();
        courses = enrolledCourses || [];
      }

      console.log('🔍 Raw courses data:', courses);

      // If no courses found, try alternative approach
      if (!courses || courses.length === 0) {
        console.log('⚠️ No courses found with role-based API, trying general courses API...');
        try {
          const publicCourses = await apiService.getPublicCourses();
          courses = publicCourses || [];
          console.log('🔍 Public courses data:', courses);
        } catch (error) {
          console.error('Failed to fetch public courses:', error);
        }
      }

      // Transform courses to match our interface
      const transformedCourses = courses.map((course: any) => ({
        id: course.id,
        title: course.title || course.name || 'Untitled Course',
        fee: course.fee || course.price || 0,
        enrollmentCount: course.enrollmentCount || 0
      }));

      console.log('🎯 Final available courses:', transformedCourses.length, 'courses');
      console.log('📋 Course titles:', transformedCourses.map(c => c.title));
      setAvailableCourses(transformedCourses);
    } catch (error) {
      console.error('❌ Failed to fetch courses:', error);
      setAvailableCourses([]);
    }
  };

  const fetchAvailableExams = async () => {
    if (!currentUser) return;

    try {
      let data: any[] = [];

      if (currentUser.role === 'INSTRUCTOR') {
        // For instructors, get exams they created
        data = await apiService.getInstructorExams();
      } else if (currentUser.role === 'STUDENT') {
        // For students, get exams from enrolled courses
        data = await apiService.getExamsForEnrolledCourses();
      }

      console.log('🔍 All exams data for user:', data);
      console.log('🔍 Current user role:', currentUser.role);

      // If no exams found, try alternative approach
      if (!data || data.length === 0) {
        console.log('⚠️ No exams found with role-based API, trying general exam API...');
        try {
          data = await apiService.getExams();
          console.log('🔍 General exams data:', data);
        } catch (error) {
          console.error('Failed to fetch general exams:', error);
        }
      }

      // Transform and filter exams that either:
      // 1. Have passed their due date and time (expired), OR
      // 2. Have at least one submission (completed by someone)
      const availableExamsForLeaderboard = [];

      for (const examRaw of data) {
        // Safely transform exam data
        const exam = {
          id: examRaw.id || examRaw.exam_id || 0,
          exam_id: examRaw.exam_id || examRaw.id || 0,
          title: examRaw.title || 'Untitled Exam',
          endDate: examRaw.endDate || '',
          endTime: examRaw.endTime || '',
          isExpired: false,
          totalMarks: examRaw.totalMarks || 0,
          duration: examRaw.duration || 0,
          courseId: examRaw.courseId || examRaw.course?.id,
          courseTitle: examRaw.courseTitle || examRaw.course?.title || examRaw.course?.name,
          courseFee: examRaw.courseFee || examRaw.course?.fee || examRaw.course?.price || 0
        };

        const now = new Date();
        const examEndDateTime = new Date(`${exam.endDate} ${exam.endTime}`);
        const isExpired = now > examEndDateTime;

        // Check if exam has any submissions - try multiple ID formats
        let hasSubmissions = false;
        const examIdToCheck = exam.exam_id || exam.id;

        // Skip if no valid ID
        if (!examIdToCheck) {
          console.log(`⚠️ Skipping exam "${exam.title}" - No valid ID found`);
          continue;
        }

        try {
          console.log(`🔍 Checking submissions for exam ID: ${examIdToCheck}, Title: ${exam.title}`);
          const examResults = await apiService.getExamResults(examIdToCheck);
          hasSubmissions = examResults && Array.isArray(examResults) && examResults.length > 0;
          console.log(`� Exiam "${exam.title}" - Results found:`, examResults?.length || 0, 'submissions');

          // Log first result for debugging
          if (examResults && examResults.length > 0) {
            console.log('📋 Sample result:', examResults[0]);
          }
        } catch (error) {
          console.log(`❌ No results found for exam ${exam.title} (ID: ${examIdToCheck}):`, error);
          hasSubmissions = false;
        }

        // Include exam if it's expired OR has submissions
        if (isExpired || hasSubmissions) {
          console.log(`✅ INCLUDED - Exam: "${exam.title}", Expired: ${isExpired}, Has Submissions: ${hasSubmissions}`);
          availableExamsForLeaderboard.push(exam);
        } else {
          console.log(`❌ EXCLUDED - Exam: "${exam.title}", Expired: ${isExpired}, Has Submissions: ${hasSubmissions}`);
        }
      }

      console.log('🎯 Final available exams for leaderboard:', availableExamsForLeaderboard.length, 'exams');
      console.log('📋 Exam titles:', availableExamsForLeaderboard.map(e => e.title));
      setAvailableExams(availableExamsForLeaderboard);
    } catch (error) {
      console.error('❌ Failed to fetch exams:', error);
      setAvailableExams([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboardData = async (examId: string) => {
    if (!examId) return;

    setLoading(true);
    try {
      const data = await apiService.getExamResults(examId);

      console.log('Raw leaderboard data for exam:', examId, data);

      // Only process data if we have valid results
      if (!data || !Array.isArray(data) || data.length === 0) {
        console.log('No valid data found for exam:', examId);
        setLeaderboardData([]);
        return;
      }

      // Find the selected exam details for course information
      const selectedExamDetails = availableExams.find(exam => {
        const examIdStr = exam.exam_id?.toString() || '';
        const idStr = exam.id?.toString() || '';
        return examIdStr === examId || idStr === examId;
      });

      // Transform the data to leaderboard format - only include valid entries
      const leaderboard = data
        .filter((result: any) => {
          const isValid = result && result.user && result.score !== undefined;
          console.log('Result validation:', result, 'Valid:', isValid);
          return isValid;
        })
        .map((result: any, index: number) => {
          const percentage = result.percentage || 0;
          const grade = calculateGrade(percentage);
          const isCurrentUser = currentUser && result.user.email === currentUser.email;

          return {
            id: result.id || index + 1,
            rank: index + 1,
            name: result.user.fullName || result.user.username,
            email: result.user.email,
            score: result.score,
            totalMarks: result.exam?.totalMarks || 0,
            percentage: percentage,
            examTitle: result.exam?.title || '',
            courseTitle: selectedExamDetails?.courseTitle,
            courseFee: selectedExamDetails?.courseFee,
            completedAt: result.attemptDate ? new Date(result.attemptDate).toLocaleDateString() : '',
            timeTaken: result.timeTaken || 0,
            avatar: (result.user.fullName || result.user.username).substring(0, 2).toUpperCase(),
            grade: grade,
            isCurrentUser: isCurrentUser
          };
        })
        .sort((a: LeaderboardEntry, b: LeaderboardEntry) => {
          // Primary sort by percentage (descending)
          if (b.percentage !== a.percentage) {
            return b.percentage - a.percentage;
          }
          // Secondary sort by time taken (ascending - faster is better)
          return a.timeTaken! - b.timeTaken!;
        })
        .map((entry: LeaderboardEntry, index: number) => ({
          ...entry,
          rank: index + 1
        }));

      console.log('Processed leaderboard:', leaderboard);
      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard data:', error);
      setLeaderboardData([]);
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

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default:
        return 'bg-gradient-to-r from-purple-500 to-teal-500';
    }
  };

  const filteredData = leaderboardData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              🏆 Leaderboard
            </h1>
            <p className="text-gray-700 font-medium">Top performers across all exams and courses</p>
          </div>
          {autoSelectedExam && (
            <div className="mt-4 md:mt-0">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl px-4 py-2 shadow-sm">
                <p className="text-emerald-800 text-sm font-semibold">
                  ✅ Viewing leaderboard...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {selectedExam && leaderboardData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-blue-700">Total Participants</p>
                  <p className="text-2xl font-bold text-blue-900">{leaderboardData.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-yellow-100 rounded-xl p-4 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-amber-500 to-yellow-600 p-2 rounded-lg">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-amber-700">Average Score</p>
                  <p className="text-2xl font-bold text-amber-900">
                    {Math.round(leaderboardData.reduce((sum, entry) => sum + entry.percentage, 0) / leaderboardData.length)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl p-4 shadow-lg border border-emerald-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-2 rounded-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-emerald-700">Pass Rate</p>
                  <p className="text-2xl font-bold text-emerald-900">
                    {Math.round((leaderboardData.filter(entry => entry.percentage >= 60).length / leaderboardData.length) * 100)}%
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 shadow-lg border border-purple-200 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center">
                <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-2 rounded-lg">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-semibold text-purple-700">Avg Time</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {formatTime(Math.round(leaderboardData.reduce((sum, entry) => sum + (entry.timeTaken || 0), 0) / leaderboardData.length))}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-indigo-500" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white shadow-sm"
                  placeholder="Search by name or email..."
                />
              </div>
            </div>

            {/* Course Filter */}
            <div className="lg:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-emerald-500" />
                </div>
                <select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    setSelectedExam(''); // Reset exam selection when course changes
                  }}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="">All Courses</option>
                  {availableCourses.map((course) => (
                    <option key={course.id} value={course.id.toString()}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Filter */}
            <div className="lg:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-purple-500" />
                </div>
                <select
                  value={selectedExam}
                  onChange={(e) => setSelectedExam(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white shadow-sm"
                >
                  <option value="">Select an Exam</option>
                  {availableExams
                    .filter(exam => !selectedCourse || exam.courseId?.toString() === selectedCourse)
                    .map((exam) => (
                      <option key={exam.id} value={exam.exam_id?.toString() || exam.id.toString()}>
                        {exam.title} {exam.courseTitle && `(${exam.courseTitle})`}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Manual Refresh Button */}
            <div className="lg:w-auto">
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchAvailableExams();
                  if (selectedExam) {
                    fetchLeaderboardData(selectedExam);
                  }
                }}
                disabled={loading}
                className="w-full lg:w-auto bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    <Clock className="h-5 w-5 mr-2" />
                    Refresh
                  </>
                )}
              </button>
            </div>


          </div>

          {availableExams.length === 0 && !loading && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm">
              <p className="text-blue-800 text-sm font-medium">
                No completed exams available. Leaderboards are shown for exams that have submissions or have passed their due date.
              </p>
              <p className="text-blue-600 text-xs mt-2 font-medium">
                💡 Tip: Try clicking the "Refresh" button above to check for newly submitted exams.
              </p>
            </div>
          )}
        </div>

        {/* Show content only when exam is selected and has data */}
        {selectedExam && filteredData.length > 0 && !loading && (
          <>
            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredData.slice(0, 3).map((student, index) => (
                <div
                  key={student.id}
                  className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl border-2 ${index === 0 ? 'border-gray-300 md:order-2 transform md:scale-105 shadow-gray-200/50' :
                    index === 1 ? 'border-gray-300 md:order-1 shadow-gray-200/50' :
                      'border-gray-300 md:order-3 shadow-gray-200/50'
                    } text-center hover:shadow-2xl transition-all duration-300`}
                >
                  <div className={`w-20 h-20 ${getRankBadgeColor(student.rank)} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    <span className="text-2xl font-bold text-white">{student.avatar}</span>
                  </div>
                  <div className="flex justify-center mb-2">
                    {getRankIcon(student.rank)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{student.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{student.email}</p>
                  <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-indigo-200">
                    <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-1">
                      {student.percentage}%
                    </div>
                    <div className="text-sm text-gray-700 font-medium">
                      {student.score}/{student.totalMarks} marks
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Full Leaderboard Table */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Complete Rankings</h3>
                {leaderboardData.some(entry => entry.courseTitle) && (
                  <div className="text-sm text-indigo-100">
                    Course: <span className="font-semibold text-white">{leaderboardData[0]?.courseTitle}</span>
                    {leaderboardData[0]?.courseFee && leaderboardData[0]?.courseFee > 0 && (
                      <span className="ml-2 px-3 py-1 bg-gradient-to-r from-emerald-400 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
                        ₹{leaderboardData[0].courseFee}
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-slate-100 to-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Exam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((student) => (
                      <tr
                        key={student.id}
                        className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${student.isCurrentUser ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm' : ''
                          }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getRankIcon(student.rank)}
                            {student.isCurrentUser && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                You
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`w-10 h-10 ${student.isCurrentUser
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                              : 'bg-gradient-to-r from-purple-500 to-teal-500'
                              } rounded-full flex items-center justify-center mr-3`}>
                              <span className="text-white font-medium">{student.avatar}</span>
                            </div>
                            <div>
                              <div className={`text-sm font-medium ${student.isCurrentUser ? 'text-blue-900' : 'text-gray-900'
                                }`}>
                                {student.name}
                                {student.isCurrentUser && (
                                  <span className="ml-2 text-blue-600 text-xs">(You)</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.examTitle}</div>
                          {student.courseTitle && (
                            <div className="text-xs text-gray-500 mt-1">
                              📚 {student.courseTitle}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {student.score}/{student.totalMarks}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.percentage.toFixed(1)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${student.percentage >= 90 ? 'bg-green-100 text-green-800' :
                            student.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                              student.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                student.percentage >= 60 ? 'bg-orange-100 text-orange-800' :
                                  'bg-red-100 text-red-800'
                            }`}>
                            {student.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatTime(student.timeTaken || 0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {student.timeTaken && student.timeTaken < 300 ? '⚡ Fast' :
                              student.timeTaken && student.timeTaken > 1800 ? '🐌 Slow' : '⏱️ Normal'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.completedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Current User Highlight */}
              {leaderboardData.some(entry => entry.isCurrentUser) && (
                <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
                  <div className="flex items-center text-sm text-blue-800 font-semibold">
                    <Trophy className="h-4 w-4 mr-2 text-blue-600" />
                    Your rank: #{leaderboardData.find(entry => entry.isCurrentUser)?.rank} out of {leaderboardData.length} participants
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Show message when exam is selected but no data */}
        {selectedExam && filteredData.length === 0 && !loading && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-12 shadow-xl border-2 border-gray-200 text-center">
            <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4 rounded-full w-fit mx-auto mb-4">
              <Trophy className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Results Available</h3>
            <p className="text-gray-600 font-medium">
              No student has completed this exam yet, or results are not available.
            </p>
          </div>
        )}

        {/* Show message when no exam is selected */}
        {!selectedExam && availableExams.length > 0 && !loading && (
          <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl p-12 shadow-xl border-2 border-indigo-200 text-center">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-full w-fit mx-auto mb-4">
              <Filter className="h-16 w-16 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Select an Exam</h3>
            <p className="text-gray-600 font-medium">
              Please select a completed exam from the dropdown above to view its leaderboard.
            </p>
          </div>
        )}

        {/* Loading state when fetching leaderboard data */}
        {selectedExam && loading && (
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-12 shadow-xl border-2 border-purple-200 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Loading Results...</h3>
            <p className="text-gray-600 font-medium">
              Fetching leaderboard data for the selected exam.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Leaderboard;