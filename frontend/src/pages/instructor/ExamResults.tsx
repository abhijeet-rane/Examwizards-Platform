import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, Download, Users, Award, TrendingUp, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';

const ExamResults = () => {
  const { examId } = useParams();
  const [resultsData, setResultsData] = useState({
    exam: null,
    results: [],
    analytics: {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0
    },
    scoreDistribution: [],
    questionAnalysis: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      fetchExamResults();
    }
  }, [examId]);

  const fetchExamResults = async () => {
    try {
      const data = await apiService.getExamResults(examId!);
      setResultsData(data);
    } catch (error) {
      console.error('Failed to fetch exam results:', error);
      setResultsData(mockResultsData);
    } finally {
      setLoading(false);
    }
  };

  const mockResultsData = {
    exam: {
      id: examId,
      title: 'Mathematics Final Exam',
      totalMarks: 100,
      duration: 120,
      questionsCount: 25
    },
    results: [
      {
        id: '1',
        studentName: 'Abhijeet',
        email: 'abhijeet@example.com',
        score: 95,
        percentage: 95,
        timeSpent: 110,
        submittedAt: '2025-07-15 10:30:00',
        status: 'completed'
      },
      {
        id: '2',
        studentName: 'Suryank',
        email: 'suryank@example.com',
        score: 82,
        percentage: 82,
        timeSpent: 115,
        submittedAt: '2025-07-15 10:25:00',
        status: 'completed'
      },
      {
        id: '3',
        studentName: 'Manoj',
        email: 'manoj@example.com',
        score: 78,
        percentage: 78,
        timeSpent: 120,
        submittedAt: '2025-07-15 10:35:00',
        status: 'completed'
      }
    ],
    analytics: {
      totalAttempts: 45,
      averageScore: 78.5,
      highestScore: 95,
      lowestScore: 45,
      passRate: 82.2
    },
    scoreDistribution: [
      { range: '90-100', count: 8 },
      { range: '80-89', count: 12 },
      { range: '70-79', count: 15 },
      { range: '60-69', count: 7 },
      { range: '50-59', count: 2 },
      { range: '0-49', count: 1 }
    ],
    questionAnalysis: [
      { question: 'Q1', correctAnswers: 42, incorrectAnswers: 3, difficulty: 0.93 },
      { question: 'Q2', correctAnswers: 38, incorrectAnswers: 7, difficulty: 0.84 },
      { question: 'Q3', correctAnswers: 25, incorrectAnswers: 20, difficulty: 0.56 }
    ]
  };

  const stats = [
    {
      name: 'Total Attempts',
      value: resultsData.analytics.totalAttempts.toString(),
      icon: Users,
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Average Score',
      value: `${resultsData.analytics.averageScore}%`,
      icon: BarChart3,
      color: 'from-teal-500 to-teal-600'
    },
    {
      name: 'Highest Score',
      value: `${resultsData.analytics.highestScore}%`,
      icon: Award,
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Pass Rate',
      value: `${resultsData.analytics.passRate}%`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600'
    }
  ];

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{resultsData.exam?.title}</h1>
            <p className="text-gray-600">Exam results and analytics</p>
          </div>
          <button className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export Results
          </button>
        </div>

        {/* Exam Info */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{resultsData.exam?.totalMarks}</div>
              <div className="text-sm text-gray-600">Total Marks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{resultsData.exam?.duration}</div>
              <div className="text-sm text-gray-600">Duration (min)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{resultsData.exam?.questionsCount}</div>
              <div className="text-sm text-gray-600">Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{resultsData.results.length}</div>
              <div className="text-sm text-gray-600">Submissions</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Score Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resultsData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Question Analysis */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Question Analysis</h3>
            <div className="space-y-4">
              {resultsData.questionAnalysis.map((question, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{question.question}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      question.difficulty > 0.8 ? 'bg-green-100 text-green-800' :
                      question.difficulty > 0.6 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {(question.difficulty * 100).toFixed(0)}% correct
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>✓ {question.correctAnswers} correct</span>
                    <span>✗ {question.incorrectAnswers} incorrect</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">Student Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {resultsData.results.map((result) => (
                  <tr key={result.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-medium">
                            {result.studentName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                          <div className="text-sm text-gray-500">{result.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {result.score}/{resultsData.exam?.totalMarks} ({result.percentage}%)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getGradeColor(result.percentage)}`}>
                        {getGrade(result.percentage)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.timeSpent} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(result.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-purple-600 hover:text-purple-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamResults;