import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Trophy, BarChart3, Users, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SubmissionResult {
    success: boolean;
    result_id: number;
    exam_id: number;
    exam_title: string;
    score: number;
    total_marks: number;
    percentage: number;
    passed: boolean;
    total_questions: number;
    answered_questions: number;
    completion_percentage: number;
    time_taken: number;
    feedback: string;
    submitted_at: string;
}

const ExamSubmissionSuccess = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState(10);
    const [autoRedirect, setAutoRedirect] = useState(true);

    const submissionResult: SubmissionResult = location.state?.submittedResult;

    useEffect(() => {
        if (!submissionResult) {
            navigate('/student/exams');
        }
    }, [submissionResult, navigate]);

    // Auto-redirect countdown to leaderboard
    useEffect(() => {
        if (!submissionResult || !autoRedirect) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Navigate to leaderboard with exam ID and submission flag
                    navigate(`/leaderboard?examId=${submissionResult.exam_id}&submitted=true`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [submissionResult, navigate, autoRedirect]);

    const handleViewLeaderboard = () => {
        setAutoRedirect(false);
        navigate(`/leaderboard?examId=${submissionResult.exam_id}&submitted=true`);
    };

    const handleCancelAutoRedirect = () => {
        setAutoRedirect(false);
        setCountdown(0);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (!submissionResult) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <h2 className="text-2xl font-bold text-gray-900">Loading...</h2>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 p-6">
            <div className="max-w-7xl mx-auto h-full">
                <div className="bg-white rounded-3xl shadow-2xl p-8 h-full min-h-[calc(100vh-3rem)]">
                    
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="h-16 w-16 text-green-600" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-3">
                            Exam Submitted Successfully! 🎉
                        </h1>
                        <p className="text-xl text-gray-600">
                            Your answers have been saved and your results are ready.
                        </p>
                    </div>

                    {/* Grid Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                        {/* Left: Exam Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-2xl p-6 h-full">
                                <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                                    {submissionResult.exam_title}
                                </h2>

                                <div className="text-center mb-6">
                                    <div className="flex items-center justify-center mb-3">
                                        <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
                                        <span className="text-2xl font-semibold text-gray-700">Your Score</span>
                                    </div>
                                    <div className="text-5xl font-bold text-purple-600 mb-2">
                                        {submissionResult.score}/{submissionResult.total_marks}
                                    </div>
                                    <div className="text-2xl text-gray-600 mb-4">
                                        {submissionResult.percentage}%
                                    </div>
                                    <div className={`inline-flex px-4 py-2 rounded-full text-lg font-semibold ${submissionResult.passed
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                        }`}>
                                        {submissionResult.passed ? 'PASSED ✓' : 'FAILED ✗'}
                                    </div>
                                </div>

                                {submissionResult.feedback && (
                                    <div className="p-4 bg-blue-50 rounded-xl">
                                        <h3 className="font-semibold text-blue-900 mb-2 text-lg">Feedback:</h3>
                                        <p className="text-blue-800">{submissionResult.feedback}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Middle: Statistics */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-purple-50 to-teal-50 rounded-2xl p-6 h-full">
                                <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Exam Statistics</h3>

                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between">
                                        <span className="text-lg text-gray-600">Questions Answered:</span>
                                        <span className="text-xl font-semibold text-purple-600">
                                            {submissionResult.answered_questions}/{submissionResult.total_questions}
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between">
                                        <span className="text-lg text-gray-600">Completion Rate:</span>
                                        <span className="text-xl font-semibold text-teal-600">
                                            {submissionResult.completion_percentage}%
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between">
                                        <span className="text-lg text-gray-600">Time Taken:</span>
                                        <span className="text-xl font-semibold text-blue-600">
                                            {formatTime(submissionResult.time_taken)}
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between">
                                        <span className="text-lg text-gray-600">Submitted At:</span>
                                        <span className="text-lg font-semibold text-gray-700">
                                            {formatDate(submissionResult.submitted_at)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl p-6 h-full flex flex-col justify-center">
                                {/* Auto-redirect notification */}
                                {autoRedirect && countdown > 0 && (
                                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center">
                                        <div className="flex items-center justify-center mb-2">
                                            <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                            <span className="text-blue-800 font-medium">Auto-redirecting to leaderboard</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-600 mb-2">{countdown}s</div>
                                        <button
                                            onClick={handleCancelAutoRedirect}
                                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                                        >
                                            Cancel auto-redirect
                                        </button>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <button
                                        onClick={handleViewLeaderboard}
                                        className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center text-lg"
                                    >
                                        <Users className="h-6 w-6 mr-3" />
                                        View Leaderboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/student/results')}
                                        className="w-full bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center text-lg"
                                    >
                                        <BarChart3 className="h-6 w-6 mr-3" />
                                        View All Results
                                    </button>
                                    <button
                                        onClick={() => navigate('/student/exams')}
                                        className="w-full bg-white text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-gray-200 text-lg"
                                    >
                                        Take Another Exam
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExamSubmissionSuccess;
