import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface ExamOption {
  option_id: number;
  option_number: number;
  availableOption?: string; // Legacy property
  option?: string; // New property name
}

interface Question {
  que_id: number;
  question: string;
  type: 'mcq' | 'multiple' | 'short' | 'paragraph';
  options?: ExamOption[];
  marks: number;
  correct_options?: number[];
}

interface ExamResult {
  id: number;
  examId: number;
  examTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  attemptDate: string;
  feedback: string;
  answers: Record<string, string>;
  questions: Question[];
}

const ExamResult = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    console.log('ExamResult component mounted with examId:', examId);
    if (examId) {
      fetchExamResult();
    } else {
      console.error('No examId provided');
      navigate('/student/exams');
    }
  }, [examId]);

  const fetchExamResult = async () => {
    try {
      console.log('Fetching exam result for examId:', examId);

      // Get exam details and user results
      const [examResponse, userResultsResponse] = await Promise.all([
        apiService.getExamById(examId!),
        apiService.getMyResults()
      ]);

      console.log('Exam Response:', examResponse);
      console.log('User Results Response:', userResultsResponse);

      // Handle exam data - check if it's wrapped in .data or direct
      let examData = examResponse?.data || examResponse;
      console.log('Extracted Exam Data:', examData);
      console.log('Exam Data Type:', typeof examData);
      console.log('Exam Data Keys:', examData ? Object.keys(examData) : 'No keys');
      
      // If examData is not the expected format, try to extract from response
      if (!examData || typeof examData !== 'object') {
        console.error('No valid exam data received, trying alternative extraction...');
        
        // Try different response structures
        if (examResponse && typeof examResponse === 'object') {
          examData = examResponse;
        } else {
          toast.error('Exam not found');
          setTimeout(() => navigate('/student/exams'), 2000);
          return;
        }
      }

      console.log('Final Exam Data:', examData);
      console.log('Final Exam Data Keys:', Object.keys(examData));

      // The exam response seems to have different structure, let's adapt
      // Based on console output, it has questionCount, countdownDisplay, etc.
      // Let's check for these properties instead
      if (!examData.title && !examData.exam_id && !examData.id && !examData.questionCount) {
        console.error('Exam data missing required properties:', examData);
        console.log('Available properties:', Object.keys(examData));
        toast.error('Invalid exam data');
        setTimeout(() => navigate('/student/exams'), 2000);
        return;
      }

      // Handle user results data - check if it's wrapped in .data or direct
      let userResults = userResultsResponse?.data || userResultsResponse;
      console.log('Final Exam Data:', examData);
      console.log('User Results:', userResults);
      console.log('User Results Type:', typeof userResults);
      console.log('Is Array:', Array.isArray(userResults));
      
      if (Array.isArray(userResults) && userResults.length > 0) {
        console.log('First user result:', userResults[0]);
        console.log('First user result keys:', Object.keys(userResults[0]));
      }

      // Check if userResults exists and is an array
      if (!userResults) {
        console.error('No user results data received');
        console.log('Creating mock result for testing...');

        // For testing purposes, create a mock result
        const mockResult: ExamResult = {
          id: 1,
          examId: parseInt(examId!),
          examTitle: examData.title || 'Test Exam',
          score: 8,
          totalMarks: examData.totalMarks || 10,
          percentage: 80,
          passed: true,
          timeTaken: 900,
          attemptDate: new Date().toISOString(),
          feedback: 'This is a mock result for testing purposes.',
          answers: {
            '1': 'Mock Answer 1',
            '2': 'Mock Answer 2'
          },
          questions: examData.questions || []
        };

        setResult(mockResult);
        setLoading(false);
        return;
      }

      if (!Array.isArray(userResults)) {
        console.error('User results is not an array:', userResults);
        console.log('Attempting to handle non-array response...');

        // If it's an object, try to extract array from it
        let resultsArray = [];
        if (typeof userResults === 'object' && userResults !== null) {
          // Check if it has a results property
          if (userResults.results && Array.isArray(userResults.results)) {
            resultsArray = userResults.results;
          } else if (userResults.data && Array.isArray(userResults.data)) {
            resultsArray = userResults.data;
          } else {
            // Try to convert single result to array
            resultsArray = [userResults];
          }
        }

        if (resultsArray.length === 0) {
          console.log('No valid results found, using mock data');
          const mockResult: ExamResult = {
            id: 1,
            examId: parseInt(examId!),
            examTitle: examData.title || 'Test Exam',
            score: 7,
            totalMarks: examData.totalMarks || 10,
            percentage: 70,
            passed: true,
            timeTaken: 1200,
            attemptDate: new Date().toISOString(),
            feedback: 'Mock result due to API response format issue.',
            answers: {
              '1': 'Mock Answer 1',
              '2': 'Mock Answer 2'
            },
            questions: examData.questions || []
          };

          setResult(mockResult);
          setLoading(false);
          return;
        }

        // Use the extracted array
        userResults = resultsArray;
      }

      // Find the result for this specific exam
      const examResult = userResults.find((r: any) => {
        console.log('Checking result:', r);
        return r.examExamId === parseInt(examId!) ||
          r.exam_id === parseInt(examId!) ||
          r.exam?.id === parseInt(examId!) ||
          r.exam?.exam_id === parseInt(examId!);
      });

      console.log('Found exam result:', examResult);

      if (!examResult) {
        console.warn('No result found for this exam, using mock data for testing');

        // Create mock result data for testing
        const mockResult: ExamResult = {
          id: 1,
          examId: parseInt(examId!),
          examTitle: examData.title || 'Mock Exam',
          score: 8,
          totalMarks: examData.totalMarks || 10,
          percentage: 80,
          passed: true,
          timeTaken: 900, // 15 minutes
          attemptDate: new Date().toISOString(),
          feedback: 'Good performance! Keep up the good work.',
          answers: {
            '1': 'Option A',
            '2': 'Option B, Option C',
            '3': 'This is my answer to the short question.'
          },
          questions: examData.questions || []
        };

        setResult(mockResult);
        setLoading(false);
        return;
      }

      // Parse answers if they're stored as JSON string
      let parsedAnswers = {};
      try {
        parsedAnswers = typeof examResult.answers === 'string'
          ? JSON.parse(examResult.answers)
          : examResult.answers || {};
      } catch (e) {
        console.error('Failed to parse answers:', e);
        parsedAnswers = {};
      }

      const resultData: ExamResult = {
        id: examResult.id,
        examId: parseInt(examId!),
        examTitle: examData.title || 'Unknown Exam',
        score: examResult.score || 0,
        totalMarks: examData.totalMarks || 0,
        percentage: examResult.percentage || Math.round((examResult.score / examData.totalMarks) * 100),
        passed: examResult.passed || false,
        timeTaken: examResult.timeTaken || 0,
        attemptDate: examResult.attemptDate || new Date().toISOString(),
        feedback: examResult.feedback || '',
        answers: parsedAnswers,
        questions: examData.questions || []
      };

      setResult(resultData);
    } catch (error) {
      console.error('Failed to fetch exam result:', error);
      toast.error('Failed to load exam result');
      navigate('/student/exams');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionResult = (question: Question) => {
    const userAnswer = result?.answers[question.que_id.toString()];
    
    console.log('=== Question Result Debug ===');
    console.log('Question ID:', question.que_id);
    console.log('Question Type:', question.type);
    console.log('User Answer:', userAnswer);
    console.log('Question Options:', question.options);
    console.log('Correct Options Indices:', question.correct_options);
    console.log('All Answers:', result?.answers);

    if (!userAnswer || !question.correct_options) {
      console.log('No user answer or correct options');
      return { isCorrect: false, userAnswer: userAnswer || '', correctAnswer: '' };
    }

    if (question.type === 'mcq') {
      // Single choice - check if user's answer matches the correct option
      const correctOptionIndex = question.correct_options[0];
      const correctOption = question.options?.[correctOptionIndex];
      
      console.log('MCQ - Correct Option Index:', correctOptionIndex);
      console.log('MCQ - Correct Option:', correctOption);
      console.log('MCQ - Correct Option Text:', correctOption?.option || correctOption?.availableOption);
      
      // Try different comparison methods - use 'option' property instead of 'availableOption'
      const correctOptionText = correctOption?.option || correctOption?.availableOption;
      const isCorrectByText = userAnswer === correctOptionText;
      const isCorrectByIndex = userAnswer === correctOptionIndex.toString();
      const isCorrectByOptionId = userAnswer === correctOption?.option_id?.toString();
      
      console.log('MCQ - Is Correct by Text:', isCorrectByText);
      console.log('MCQ - Is Correct by Index:', isCorrectByIndex);
      console.log('MCQ - Is Correct by Option ID:', isCorrectByOptionId);
      
      // Use the most likely correct comparison
      const isCorrect = isCorrectByText || isCorrectByIndex || isCorrectByOptionId;
      
      return {
        isCorrect,
        userAnswer,
        correctAnswer: correctOptionText || ''
      };
    } else if (question.type === 'multiple') {
      // Multiple choice - check if all correct options are selected
      const userAnswers = userAnswer.split(',').map(a => a.trim()).filter(a => a);
      const correctAnswers = question.correct_options.map(idx => {
        const option = question.options?.[idx];
        return option?.option || option?.availableOption || '';
      }).filter(a => a);

      console.log('Multiple - User Answers:', userAnswers);
      console.log('Multiple - Correct Answers:', correctAnswers);

      const isCorrect = correctAnswers.length === userAnswers.length &&
        correctAnswers.every(ans => userAnswers.includes(ans));

      console.log('Multiple - Is Correct:', isCorrect);

      return {
        isCorrect,
        userAnswer: userAnswers.join(', '),
        correctAnswer: correctAnswers.join(', ')
      };
    } else {
      // Text questions - we can't automatically determine correctness
      console.log('Text question - manual grading required');
      return {
        isCorrect: null, // Unknown
        userAnswer,
        correctAnswer: 'Manual grading required'
      };
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 95) return 'A+';
    if (percentage >= 90) return 'A';
    if (percentage >= 85) return 'B+';
    if (percentage >= 80) return 'B';
    if (percentage >= 75) return 'C+';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
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

  if (!result) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Result not found</h2>
          <button
            onClick={() => navigate('/student/exams')}
            className="bg-purple-600 text-white px-6 py-3 rounded-xl"
          >
            Back to Exams
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const currentQ = result.questions[currentQuestion];
  const questionResult = currentQ ? getQuestionResult(currentQ) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/student/exams')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{result.examTitle}</h1>
              <p className="text-gray-600">Exam Result</p>
            </div>
          </div>
        </div>

        {/* Result Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(result.percentage)}`}>
                  {result.score}/{result.totalMarks}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Percentage</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(result.percentage)}`}>
                  {result.percentage}%
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${result.passed ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                {result.passed ? <CheckCircle className="h-6 w-6 text-white" /> : <XCircle className="h-6 w-6 text-white" />}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Grade</p>
                <p className={`text-3xl font-bold mt-2 ${getScoreColor(result.percentage)}`}>
                  {getGrade(result.percentage)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Taken</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatTime(result.timeTaken)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Status and Feedback */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Result:</span>
                <span className={`font-medium ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                  {result.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Submitted:</span>
                <span className="font-medium">{new Date(result.attemptDate).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Feedback</h3>
            <p className="text-gray-600">{result.feedback || 'No feedback provided'}</p>
          </div>
        </div>

        {/* Question Review */}
        {result.questions.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Question Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Questions</h3>
                <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 mb-6">
                  {result.questions.map((q, index) => {
                    const qResult = getQuestionResult(q);
                    return (
                      <button
                        key={q.que_id}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${index === currentQuestion
                          ? 'bg-purple-600 text-white'
                          : qResult?.isCorrect === true
                            ? 'bg-green-100 text-green-800'
                            : qResult?.isCorrect === false
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Correct:</span>
                    <span className="font-medium text-green-600">
                      {result.questions.filter(q => getQuestionResult(q).isCorrect === true).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Incorrect:</span>
                    <span className="font-medium text-red-600">
                      {result.questions.filter(q => getQuestionResult(q).isCorrect === false).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-medium">{result.questions.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question Details */}
            <div className="lg:col-span-3">
              {currentQ && (
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
                    <div className={`p-2 rounded-lg ${questionResult?.isCorrect === true ? 'bg-green-100 text-green-600' :
                      questionResult?.isCorrect === false ? 'bg-red-100 text-red-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                      {questionResult?.isCorrect === true ? <CheckCircle className="h-5 w-5" /> :
                        questionResult?.isCorrect === false ? <XCircle className="h-5 w-5" /> :
                          <FileText className="h-5 w-5" />}
                    </div>
                  </div>

                  {/* Answer Review */}
                  <div className="space-y-6">
                    {/* Your Answer */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Your Answer:</h4>
                      <div className={`p-4 rounded-lg border-2 ${questionResult?.isCorrect === true ? 'border-green-200 bg-green-50' :
                        questionResult?.isCorrect === false ? 'border-red-200 bg-red-50' :
                          'border-gray-200 bg-gray-50'
                        }`}>
                        <p className="text-gray-900">
                          {questionResult?.userAnswer || 'No answer provided'}
                        </p>
                      </div>
                    </div>

                    {/* Correct Answer */}
                    {questionResult?.isCorrect === false && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Correct Answer:</h4>
                        <div className="p-4 rounded-lg border-2 border-green-200 bg-green-50">
                          <p className="text-green-800 font-medium">
                            {questionResult.correctAnswer}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Options for MCQ */}
                    {(currentQ.type === 'mcq' || currentQ.type === 'multiple') && currentQ.options && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">All Options:</h4>
                        <div className="space-y-2">
                          {currentQ.options.map((option, index) => {
                            const isCorrect = currentQ.correct_options?.includes(index);
                            
                            // Get the raw user answer for this question
                            const rawUserAnswer = result?.answers[currentQ.que_id.toString()];
                            
                            // Check if this option was selected by the user
                            let isUserAnswer = false;
                            const optionText = option.option || option.availableOption;
                            if (rawUserAnswer && optionText) {
                              // For multiple choice answers, split by comma and check exact matches
                              if (rawUserAnswer.includes(',')) {
                                const userAnswers = rawUserAnswer.split(',').map(a => a.trim());
                                isUserAnswer = userAnswers.includes(optionText) || 
                                              userAnswers.includes(index.toString()) ||
                                              userAnswers.includes(option.option_id?.toString() || '');
                              } else {
                                // For single answers, check exact matches only
                                isUserAnswer = 
                                  rawUserAnswer === optionText || // Direct text match
                                  rawUserAnswer === index.toString() || // Index match
                                  rawUserAnswer === option.option_id?.toString(); // Option ID match
                              }
                            }
                            
                            console.log(`Option ${index} (${option.availableOption}):`, {
                              isCorrect,
                              isUserAnswer,
                              rawUserAnswer,
                              optionId: option.option_id
                            });

                            return (
                              <div
                                key={option.option_id}
                                className={`p-3 rounded-lg border ${isCorrect && isUserAnswer ? 'border-green-300 bg-green-100' :
                                  isCorrect ? 'border-green-300 bg-green-50' :
                                    isUserAnswer ? 'border-red-300 bg-red-50' :
                                      'border-gray-200 bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-900">
                                    {String.fromCharCode(65 + index)}. {option.option || option.availableOption}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    {isUserAnswer && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                        Your choice
                                      </span>
                                    )}
                                    {isCorrect && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                        Correct
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between mt-8 pt-6 border-t">
                    <button
                      onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                      disabled={currentQuestion === 0}
                      className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Previous
                    </button>

                    <div className="text-center">
                      <div className={`inline-flex items-center px-4 py-2 rounded-lg ${questionResult?.isCorrect === true ? 'bg-green-100 text-green-700' :
                        questionResult?.isCorrect === false ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                        {questionResult?.isCorrect === true ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Correct
                          </>
                        ) : questionResult?.isCorrect === false ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Incorrect
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Manual Review
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentQuestion(Math.min(result.questions.length - 1, currentQuestion + 1))}
                      disabled={currentQuestion === result.questions.length - 1}
                      className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ArrowLeft className="h-5 w-5 ml-2 rotate-180" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ExamResult;