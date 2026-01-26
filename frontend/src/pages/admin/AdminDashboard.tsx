import React, { useState, useEffect } from 'react';
import { Users, FileText, BarChart3, TrendingUp, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';

const AdminDashboard = () => {
  interface UserRoleStat {
    name: string;
    value: number;
    color: string;
  }


  interface DashboardStats {
    totalExams: number;
    completedExams: number;
    averageScore: number;
    rank: number;
  }
  interface DashboardData {
    stats: DashboardStats;
    totalUsers: number;

    usersByRole: UserRoleStat[];

    upcomingExams: any[];
    recentResults: any[];
    performanceData: any[];
  }

  const [dashboardData, setDashboardData] = useState<DashboardData>({
    stats: { totalExams: 0, completedExams: 0, averageScore: 0, rank: 0 },
    totalUsers: 0,

    usersByRole: [],

    upcomingExams: [],
    recentResults: [],
    performanceData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching admin dashboard data...');
      const data: DashboardData = await apiService.getAdminDashboardData();
      console.log('Received admin dashboard data:', data);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Try to get some basic data if the main endpoint fails
      try {
        console.log('Trying fallback data...');
        // Use mock data as fallback
        setDashboardData({
          stats: { totalExams: 0, completedExams: 0, averageScore: 0, rank: 0 },
          totalUsers: 0,
          usersByRole: [
            { name: 'Students', value: 0, color: '#8B5CF6' },
            { name: 'Instructors', value: 0, color: '#06B6D4' },
            { name: 'Admins', value: 0, color: '#10B981' }
          ],
          upcomingExams: [],
          recentResults: [],
          performanceData: []
        });
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Users',
      value: dashboardData.totalUsers?.toLocaleString() || '0',
      icon: Users,
      change: '+12%',
      changeType: 'positive',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Total Exams',
      value: dashboardData.stats?.totalExams?.toString() || '0',
      icon: FileText,
      change: '+8%',
      changeType: 'positive',
      color: 'from-teal-500 to-teal-600'
    },
    {
      name: 'Exam Attempts',
      value: dashboardData.stats?.completedExams?.toLocaleString() || '0',
      icon: BarChart3,
      change: '+23%',
      changeType: 'positive',
      color: 'from-blue-500 to-blue-600'
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor system performance and user activity</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats && stats.map((stat, index) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-2xl p-6 shadow-xl border-2 transform hover:scale-105 transition-all duration-300 ${index === 0 ? 'bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200' :
                index === 1 ? 'bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-200' :
                  index === 2 ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200' :
                    'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-700">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Users by Role</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.usersByRole}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(dashboardData.usersByRole ?? []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {(dashboardData.usersByRole ?? []).map((entry, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>


        </div>


      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;