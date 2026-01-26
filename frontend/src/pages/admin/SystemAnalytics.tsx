import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, FileText, Activity, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';

const SystemAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalUsers: 0,
      totalExams: 0,
      totalAttempts: 0,
      averageScore: 0
    },
    userGrowth: [],
    examPerformance: [],
    topPerformers: [],
    systemUsage: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const data = await apiService.getDashboardData();
      setAnalyticsData(mockAnalyticsData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setAnalyticsData(mockAnalyticsData);
    } finally {
      setLoading(false);
    }
  };

  const mockAnalyticsData = {
    overview: {
      totalUsers: 1250,
      totalExams: 89,
      totalAttempts: 3420,
      averageScore: 78.5
    },
    userGrowth: [
      { month: 'Jan', users: 100 },
      { month: 'Feb', users: 180 },
      { month: 'Mar', users: 250 },
      { month: 'Apr', users: 400 },
      { month: 'May', users: 650 },
      { month: 'Jun', users: 850 },
      { month: 'Jul', users: 1250 }
    ],
    examPerformance: [
      { subject: 'Mathematics', avgScore: 82, attempts: 450 },
      { subject: 'Physics', avgScore: 75, attempts: 380 },
      { subject: 'Chemistry', avgScore: 78, attempts: 420 },
      { subject: 'Biology', avgScore: 85, attempts: 390 },
      { subject: 'English', avgScore: 79, attempts: 360 }
    ],
    topPerformers: [
      { name: 'Alice Johnson', score: 95, exams: 12 },
      { name: 'Bob Smith', score: 92, exams: 10 },
      { name: 'Carol Davis', score: 89, exams: 11 },
      { name: 'David Wilson', score: 87, exams: 9 },
      { name: 'Eva Brown', score: 85, exams: 8 }
    ],
    systemUsage: [
      { name: 'Active Users', value: 850, color: '#8B5CF6' },
      { name: 'Inactive Users', value: 400, color: '#E5E7EB' }
    ]
  };

  const stats = [
    {
      name: 'Total Users',
      value: analyticsData.overview.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12%',
      changeType: 'positive',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Total Exams',
      value: analyticsData.overview.totalExams.toString(),
      icon: FileText,
      change: '+8%',
      changeType: 'positive',
      color: 'from-teal-500 to-teal-600'
    },
    {
      name: 'Exam Attempts',
      value: analyticsData.overview.totalAttempts.toLocaleString(),
      icon: Activity,
      change: '+23%',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Average Score',
      value: `${analyticsData.overview.averageScore}%`,
      icon: BarChart3,
      change: '+5%',
      changeType: 'positive',
      color: 'from-green-500 to-green-600'
    }
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
            <p className="text-gray-600">Comprehensive system performance and usage analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Export Report
            </button>
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
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">from last period</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* System Usage Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">System Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.systemUsage}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.systemUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {analyticsData.systemUsage.map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Performance Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Exam Performance by Subject</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.examPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgScore" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performers</h3>
          <div className="space-y-4">
            {analyticsData.topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {performer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{performer.name}</h4>
                    <p className="text-sm text-gray-600">{performer.exams} exams completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{performer.score}%</div>
                  <div className="text-sm text-gray-500">Average Score</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SystemAnalytics;