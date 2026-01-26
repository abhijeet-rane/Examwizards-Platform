import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight, Flag, Maximize, X } from 'lucide-react';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ExamOption {
  option_id: number;
  option_number: number;
  availableOption: string;
}

interface Question {
  que_id: number;
  question: string;
  type: 'mcq' | 'multiple' | 'short' | 'paragraph';
  options?: ExamOption[];
  marks: number;
  correct_options?: number[];
}

interface ExamData {
  exam_id: number;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  questions: Question[];
  instructions: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  isactive: boolean;

  // Enhanced fields from backend
  questionCount?: number;
  studentCount?: number;
  durationDisplay?: string;
  status?: string;
}

const ExamInterface = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());

  // Fullscreen related state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFullscreenWarning, setShowFullscreenWarning] = useState(false);
  const [examBlocked, setExamBlocked] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (examId) {
      fetchExamData();
    }
  }, [examId]);

  // Fullscreen effect
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isCurrentlyFullscreen);

      if (!isCurrentlyFullscreen && examData && !submitting) {
        // User exited fullscreen
        setShowFullscreenWarning(true);
        setExamBlocked(true);
        toast.error('Please return to fullscreen mode to continue the exam');
      }
    };

    // Add fullscreen change listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Prevent common exit methods
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent F11, Escape, Alt+Tab, Ctrl+Shift+I, F12, etc.
      if (
        e.key === 'F11' ||
        e.key === 'Escape' ||
        (e.altKey && e.key === 'Tab') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'C')
      ) {
        e.preventDefault();
        toast.error('This action is not allowed during the exam');
        return false;
      }
    };

    // Prevent right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled during the exam');
      return false;
    };

    // Prevent tab switching and window focus loss
    const handleVisibilityChange = () => {
      if (document.hidden && examData && !submitting) {
        toast.error('Tab switching is not allowed during the exam');
      }
    };

    const handleWindowBlur = () => {
      if (examData && !submitting) {
        toast.error('Please keep the exam window focused');
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // Cleanup
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examData, submitting]);

  useEffect(() => {
    // Only start timer if exam has started (not showing confirmation)
    if (timeLeft > 0 && !showStartConfirmation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && examData && !showStartConfirmation) {
      handleSubmitExam();
    }
  }, [timeLeft, examData, showStartConfirmation]);

  // Fullscreen functions
  const enterFullscreen = async () => {
    try {
      const element = containerRef.current || document.documentElement;

      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen();
      }

      setShowFullscreenWarning(false);
      setExamBlocked(false);
      toast.success('Fullscreen mode activated');
    } catch (error) {
      console.error('Failed to enter fullscreen:', error);
      toast.error('Failed to enter fullscreen mode');
    }
  };

  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.error('Failed to exit fullscreen:', error);
    }
  };

  const fetchExamData = async () => {
    try {
      console.log('Fetching exam data for ID:', examId);
      const data = await apiService.getExamById(examId!);
      console.log('Raw exam data received:', data);
      console.log('Questions in data:', data.questions);
      console.log('Data keys:', Object.keys(data));
      console.log('Instructor info:', data.instructor, data.instructorName);
      console.log('Course info:', data.course);

      // Check if we have an error response
      if (data.error) {
        console.error('API returned error:', data.error);
        throw new Error(data.error);
      }

      // Check if exam is already submitted
      if (data.hasSubmitted || data.isSubmitted) {
        toast.error('You have already submitted this exam!');
        navigate('/student/exams');
        return;
      }

      // Map the backend response to our interface
      const exam: ExamData = {
        exam_id: data.exam_id ?? data.Exam_id ?? data.id,
        title: data.title || 'Untitled Exam',
        description: data.description || 'No description available',
        duration: data.duration || 60,
        totalMarks: data.totalMarks || 0,
        instructions: data.instructions || 'Read all questions carefully and answer to the best of your ability.',
        isactive: data.isactive ?? true,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        questionCount: data.questionCount,
        studentCount: data.studentCount,
        durationDisplay: data.durationDisplay,
        status: data.status,
        questions: (data.questions || []).map((q: any) => {
          console.log('Processing question:', q.que_id, 'Type:', q.type, 'Raw question:', q);
          return {
            que_id: q.que_id || q.id || q.question_id,
            question: q.question || 'Question text not available',
            type: q.type || 'mcq',
            marks: q.marks || 1,
            options: (q.options || []).map((opt: any) => ({
              option_id: opt.option_id || opt.id,
              option_number: opt.option_number || 0,
              availableOption: opt.availableOption || opt.option || opt.text || ''
            })),
            correct_options: q.correct_options || []
          };
        })
      };

      console.log('Mapped exam data:', exam);
      console.log('Final questions array:', exam.questions);
      console.log('Questions count:', exam.questions.length);

      if (exam.questions.length === 0) {
        console.warn('No questions found in exam data!');
        toast.error('This exam has no questions. Please contact your instructor.');
      }

      setExamData(exam);
      setTimeLeft(exam.duration * 60); // Convert minutes to seconds

      // Show start confirmation instead of auto-entering fullscreen
      setShowStartConfirmation(true);
    } catch (error) {
      console.error('Failed to fetch exam data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please log in again.');
        navigate('/login');
        return;
      }
      
      // Check if it's an access denied error
      if (error.response?.status === 403) {
        toast.error('Access denied. You may not have permission to take this exam.');
        navigate('/student/exams');
        return;
      }
      
      toast.error('Failed to load exam. Using demo data for testing.');

      // Enhanced mock data that matches our backend structure
      const mockData: ExamData = {
        exam_id: parseInt(examId!) || 999,
        title: 'Sample Science Exam',
        description: 'A comprehensive science examination covering basic concepts',
        duration: 45,
        totalMarks: 50,
        instructions: 'Read all questions carefully. Choose the best answer for multiple choice questions. You have 45 minutes to complete this exam.',
        isactive: true,
        questionCount: 10,
        questions: [
          {
            que_id: 1,
            question: 'What is the chemical symbol for water?',
            type: 'mcq',
            marks: 5,
            options: [
              { option_id: 1, option_number: 0, availableOption: 'H2O' },
              { option_id: 2, option_number: 1, availableOption: 'CO2' },
              { option_id: 3, option_number: 2, availableOption: 'NaCl' },
              { option_id: 4, option_number: 3, availableOption: 'O2' }
            ],
            correct_options: [0]
          },
          {
            que_id: 2,
            question: 'What is the speed of light in vacuum?',
            type: 'mcq',
            marks: 5,
            options: [
              { option_id: 5, option_number: 0, availableOption: '3 × 10⁸ m/s' },
              { option_id: 6, option_number: 1, availableOption: '3 × 10⁶ m/s' },
              { option_id: 7, option_number: 2, availableOption: '3 × 10¹⁰ m/s' },
              { option_id: 8, option_number: 3, availableOption: '3 × 10⁴ m/s' }
            ],
            correct_options: [0]
          },
          {
            que_id: 3,
            question: 'Explain the process of photosynthesis.',
            type: 'paragraph',
            marks: 10,
            options: []
          }
        ]
      };

      setExamData(mockData);
      setTimeLeft(mockData.duration * 60);

      // Show start confirmation instead of auto-entering fullscreen
      setShowStartConfirmation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string | number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId.toString()]: answer
    }));
  };

  const handleMultipleAnswerChange = (questionId: string | number, optionValue: string, isChecked: boolean) => {
    const questionIdStr = questionId.toString();
    setAnswers(prev => {
      const currentAnswers = prev[questionIdStr] ? prev[questionIdStr].split(',').filter(a => a.trim()) : [];

      if (isChecked) {
        // Add the option if not already present
        if (!currentAnswers.includes(optionValue)) {
          currentAnswers.push(optionValue);
        }
      } else {
        // Remove the option
        const index = currentAnswers.indexOf(optionValue);
        if (index > -1) {
          currentAnswers.splice(index, 1);
        }
      }

      return {
        ...prev,
        [questionIdStr]: currentAnswers.join(',')
      };
    });
  };

  const handleSubmitExam = async () => {
    if (submitting) return;

    setSubmitting(true);

    // Exit fullscreen before submitting
    await exitFullscreen();

    try {
      // Calculate time taken (exam duration - time left)
      const timeTaken = examData ? (examData.duration * 60) - timeLeft : 0;

      console.log('=== SUBMITTING EXAM ===');
      console.log('Exam ID:', examId);
      console.log('Answers being submitted:', answers);
      console.log('Time taken:', timeTaken);
      console.log('Answer keys:', Object.keys(answers));
      console.log('Answer values:', Object.values(answers));

      const result = await apiService.submitExam(examId!, answers, timeTaken);

      console.log('=== SUBMISSION RESULT ===');
      console.log('Result:', result);

      if (result.success) {
        toast.success(`Exam submitted successfully! Score: ${result.score}/${result.total_marks} (${result.percentage}%)`);

        // Navigate to submission success page with countdown
        navigate('/student/exam-submission-success', {
          state: {
            submittedResult: result,
            fromExam: true
          }
        });
      } else {
        toast.error(result.message || 'Failed to submit exam');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFlag = (questionId: string | number) => {
    const id = questionId.toString();
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key]?.trim()).length;
  };

  const isQuestionAnswered = (questionId: string | number) => {
    const answer = answers[questionId.toString()];
    return answer && answer.trim().length > 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Exam...</h2>
          <p className="text-gray-600">Please wait while we prepare your exam</p>
          <div className="mt-4 text-sm text-gray-500">
            Exam ID: {examId}
          </div>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam not found</h2>
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)} // Go back to previous page
              className="bg-purple-600 text-white px-6 py-3 rounded-xl mr-4"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                console.log('Retrying exam fetch...');
                setLoading(true);
                fetchExamData();
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if exam has no questions
  if (examData.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Questions Available</h2>
          <p className="text-gray-600 mb-6">This exam doesn't have any questions yet.</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate(-1)} // Go back to previous page
              className="bg-purple-600 text-white px-6 py-3 rounded-xl mr-4"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                console.log('Retrying exam fetch...');
                setLoading(true);
                fetchExamData();
              }}
              className="bg-gray-600 text-white px-6 py-3 rounded-xl"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = examData.questions[currentQuestion];

  const handleStartExam = async () => {
    setShowStartConfirmation(false);
    await enterFullscreen();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50">
      {/* Start Confirmation Modal */}
      {showStartConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-lg mx-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Maximize className="h-8 w-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Start Exam?</h2>
              <div className="text-left space-y-3 text-gray-600 mb-6">
                <p className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  The exam will start in fullscreen mode
                </p>
                <p className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Do not try to exit fullscreen during the exam
                </p>
                <p className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Tab switching and right-click are disabled
                </p>
                <p className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  You have {examData?.duration} minutes to complete
                </p>
                <p className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  Total marks: {examData?.totalMarks}
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate(-1)} // Go back to previous page
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartExam}
                className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
              >
                Start Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Warning Modal */}
      {showFullscreenWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Fullscreen Required</h2>
              <p className="text-gray-600">
                Do not try to exit from fullscreen mode. You must return to fullscreen to continue the exam.
              </p>
            </div>
            <button
              onClick={enterFullscreen}
              className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            >
              <Maximize className="h-5 w-5 mr-2" />
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {/* Exam Blocked Overlay */}
      {examBlocked && !showFullscreenWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4 text-center">
            <X className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Exam Access Blocked</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please return to fullscreen mode to continue
            </p>
            <button
              onClick={enterFullscreen}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Enter Fullscreen
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10 ${examBlocked ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{examData.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {examData.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Maximize className={`h-5 w-5 ${isFullscreen ? 'text-green-500' : 'text-red-500'}`} />
                <span className={`text-sm font-medium ${isFullscreen ? 'text-green-600' : 'text-red-600'}`}>
                  {isFullscreen ? 'Fullscreen' : 'Not Fullscreen'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className={`font-mono text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'
                  }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <button
                onClick={handleSubmitExam}
                disabled={submitting || examBlocked}
                className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${examBlocked ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Questions</h3>
              <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                {examData.questions.map((q, index) => (
                  <button
                    key={q.que_id}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors relative ${index === currentQuestion
                      ? 'bg-purple-600 text-white'
                      : isQuestionAnswered(q.que_id)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    {index + 1}
                    {flaggedQuestions.has(q.que_id.toString()) && (
                      <Flag className="h-3 w-3 text-red-500 absolute -top-1 -right-1" />
                    )}
                  </button>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Answered:</span>
                  <span className="font-medium">{getAnsweredCount()}/{examData.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Flagged:</span>
                  <span className="font-medium">{flaggedQuestions.size}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Marks:</span>
                  <span className="font-medium">{examData.totalMarks}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Question Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-sm font-medium text-purple-600">
                      Question {currentQuestion + 1}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {currentQ.type === 'multiple' ? 'MULTIPLE CHOICE' :
                        currentQ.type === 'mcq' ? 'SINGLE CHOICE' :
                          currentQ.type.toUpperCase()}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                      {currentQ.marks} marks
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    {currentQ.question}
                  </h2>
                </div>
                <button
                  onClick={() => toggleFlag(currentQ.que_id)}
                  className={`p-2 rounded-lg transition-colors ${flaggedQuestions.has(currentQ.que_id.toString())
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-400 hover:text-red-600'
                    }`}
                >
                  <Flag className="h-5 w-5" />
                </button>
              </div>

              {/* Answer Input */}
              <div className="mb-8">
                {currentQ.type === 'mcq' && currentQ.options && currentQ.options.length > 0 ? (
                  // Single Choice MCQ - Radio buttons
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-3">Select one option:</div>
                    {currentQ.options.map((option, index) => (
                      <label
                        key={option.option_id}
                        className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name={`question-${currentQ.que_id}`}
                          value={option.availableOption}
                          checked={answers[currentQ.que_id.toString()] === option.availableOption}
                          onChange={(e) => handleAnswerChange(currentQ.que_id, e.target.value)}
                          className="mr-3 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-900">
                          {String.fromCharCode(65 + index)}. {option.availableOption}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : currentQ.type === 'multiple' && currentQ.options && currentQ.options.length > 0 ? (
                  // Multiple Choice MCQ - Checkboxes
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600 mb-3">Select all correct options:</div>
                    {currentQ.options.map((option, index) => {
                      const currentAnswers = answers[currentQ.que_id.toString()] ?
                        answers[currentQ.que_id.toString()].split(',').filter(a => a.trim()) : [];
                      const isChecked = currentAnswers.includes(option.availableOption);

                      return (
                        <label
                          key={option.option_id}
                          className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            value={option.availableOption}
                            checked={isChecked}
                            onChange={(e) => handleMultipleAnswerChange(currentQ.que_id, option.availableOption, e.target.checked)}
                            className="mr-3 text-purple-600 focus:ring-purple-500 rounded"
                          />
                          <span className="text-gray-900">
                            {String.fromCharCode(65 + index)}. {option.availableOption}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : currentQ.type === 'short' ? (
                  <input
                    type="text"
                    value={answers[currentQ.que_id.toString()] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.que_id, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    placeholder="Enter your answer..."
                  />
                ) : (
                  <textarea
                    value={answers[currentQ.que_id.toString()] || ''}
                    onChange={(e) => handleAnswerChange(currentQ.que_id, e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Write your detailed answer..."
                  />
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  {isQuestionAnswered(currentQ.que_id) ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="text-sm text-gray-600">
                    {isQuestionAnswered(currentQ.que_id) ? 'Answered' : 'Not answered'}
                  </span>
                  {currentQ.type === 'multiple' && isQuestionAnswered(currentQ.que_id) && (
                    <span className="text-xs text-purple-600">
                      ({answers[currentQ.que_id.toString()].split(',').filter(a => a.trim()).length} selected)
                    </span>
                  )}
                </div>

                <button
                  onClick={() => setCurrentQuestion(Math.min(examData.questions.length - 1, currentQuestion + 1))}
                  disabled={currentQuestion === examData.questions.length - 1}
                  className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning for low time */}
      {timeLeft < 300 && timeLeft > 0 && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">Less than 5 minutes remaining!</span>
        </div>
      )}

      {/* Fullscreen info notification */}
      {!isFullscreen && !showFullscreenWarning && examData && (
        <div className="fixed bottom-4 left-4 bg-yellow-600 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2">
          <Maximize className="h-5 w-5" />
          <span className="font-medium">Exam will start in fullscreen mode</span>
        </div>
      )}

    </div>
  );
};

export default ExamInterface;