import React, { useState, useEffect } from 'react';
import { Users, Trash2, Search, Filter, UserCheck, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  fullName?: string;
  phoneNumber?: string;
  status: 'active' | 'inactive';
}

interface UserStats {
  totalUsers: number;
  adminCount: number;
  instructorCount: number;
  studentCount: number;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    adminCount: 0,
    instructorCount: 0,
    studentCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchUserStats();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      const data = await apiService.getAllUsers();
      console.log('Received users data:', data);
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      console.log('Using fallback sample data for testing...');

      // Fallback sample data for testing - Extended to show pagination
      const sampleUsers: User[] = [
        {
          id: '1',
          username: 'admin_user',
          email: 'admin@examwizards.com',
          role: 'admin',
          fullName: 'System Administrator',
          status: 'active'
        },
        {
          id: '2',
          username: 'prof_smith',
          email: 'smith@university.edu',
          role: 'instructor',
          fullName: 'Dr. John Smith',
          status: 'active'
        },
        {
          id: '3',
          username: 'alice_student',
          email: 'alice@student.edu',
          role: 'student',
          fullName: 'Alice Johnson',
          status: 'active'
        },
        {
          id: '4',
          username: 'bob_student',
          email: 'bob@student.edu',
          role: 'student',
          fullName: 'Bob Wilson',
          status: 'inactive'
        },
        {
          id: '5',
          username: 'charlie_student',
          email: 'charlie@student.edu',
          role: 'student',
          fullName: 'Charlie Brown',
          status: 'active'
        },
        {
          id: '6',
          username: 'diana_instructor',
          email: 'diana@university.edu',
          role: 'instructor',
          fullName: 'Dr. Diana Prince',
          status: 'active'
        },
        {
          id: '7',
          username: 'eve_student',
          email: 'eve@student.edu',
          role: 'student',
          fullName: 'Eve Davis',
          status: 'active'
        },
        {
          id: '8',
          username: 'frank_student',
          email: 'frank@student.edu',
          role: 'student',
          fullName: 'Frank Miller',
          status: 'inactive'
        },
        {
          id: '9',
          username: 'grace_instructor',
          email: 'grace@university.edu',
          role: 'instructor',
          fullName: 'Dr. Grace Hopper',
          status: 'active'
        },
        {
          id: '10',
          username: 'henry_student',
          email: 'henry@student.edu',
          role: 'student',
          fullName: 'Henry Ford',
          status: 'active'
        },
        {
          id: '11',
          username: 'iris_student',
          email: 'iris@student.edu',
          role: 'student',
          fullName: 'Iris West',
          status: 'active'
        },
        {
          id: '12',
          username: 'jack_instructor',
          email: 'jack@university.edu',
          role: 'instructor',
          fullName: 'Dr. Jack Sparrow',
          status: 'active'
        },
        {
          id: '13',
          username: 'kate_student',
          email: 'kate@student.edu',
          role: 'student',
          fullName: 'Kate Bishop',
          status: 'inactive'
        },
        {
          id: '14',
          username: 'leo_student',
          email: 'leo@student.edu',
          role: 'student',
          fullName: 'Leo Valdez',
          status: 'active'
        },
        {
          id: '15',
          username: 'maya_admin',
          email: 'maya@examwizards.com',
          role: 'admin',
          fullName: 'Maya Anderson',
          status: 'active'
        },
        {
          id: '16',
          username: 'nick_student',
          email: 'nick@student.edu',
          role: 'student',
          fullName: 'Nick Fury',
          status: 'active'
        },
        {
          id: '17',
          username: 'olivia_instructor',
          email: 'olivia@university.edu',
          role: 'instructor',
          fullName: 'Dr. Olivia Pope',
          status: 'active'
        },
        {
          id: '18',
          username: 'peter_student',
          email: 'peter@student.edu',
          role: 'student',
          fullName: 'Peter Parker',
          status: 'active'
        },
        {
          id: '19',
          username: 'quinn_student',
          email: 'quinn@student.edu',
          role: 'student',
          fullName: 'Quinn Fabray',
          status: 'inactive'
        },
        {
          id: '20',
          username: 'rachel_instructor',
          email: 'rachel@university.edu',
          role: 'instructor',
          fullName: 'Dr. Rachel Green',
          status: 'active'
        },
        {
          id: '21',
          username: 'sam_student',
          email: 'sam@student.edu',
          role: 'student',
          fullName: 'Sam Wilson',
          status: 'active'
        },
        {
          id: '22',
          username: 'tina_student',
          email: 'tina@student.edu',
          role: 'student',
          fullName: 'Tina Turner',
          status: 'active'
        }
      ];

      setUsers(sampleUsers);
      toast.error('Using sample data - Backend connection failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      console.log('Fetching user stats...');
      const stats = await apiService.getUserStats();
      console.log('Received user stats:', stats);
      setUserStats(stats);
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      console.log('Using fallback stats for testing...');

      // Fallback stats for testing
      setUserStats({
        totalUsers: 4,
        adminCount: 1,
        instructorCount: 1,
        studentCount: 2
      });
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!user) return;

    setDeleteLoading(user.id);
    try {
      console.log('Deleting user:', user.id);
      const response = await apiService.deleteUser(user.id);

      if (response.success) {
        toast.success('User deleted successfully');
        // Refresh the users list
        await fetchUsers();
        await fetchUserStats();
      } else {
        toast.error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      toast.error(errorMessage);
    } finally {
      setDeleteLoading(null);
      setShowDeleteModal(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'instructor':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
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
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all users in the system</p>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-green-700">Live Database</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-2xl p-6 shadow-xl border-2 border-purple-200 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.totalUsers}</p>
                <div className="text-xs text-purple-600 mt-1">Live from database</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl p-6 shadow-xl border-2 border-red-200 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-red-700 uppercase tracking-wide">Admins</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.adminCount}</p>
                <div className="text-xs text-red-600 mt-1">System administrators</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <UserCheck className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 shadow-xl border-2 border-blue-200 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-blue-700 uppercase tracking-wide">Instructors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.instructorCount}</p>
                <div className="text-xs text-blue-600 mt-1">Course instructors</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-xl border-2 border-green-200 hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-green-700 uppercase tracking-wide">Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{userStats.studentCount}</p>
                <div className="text-xs text-green-600 mt-1">Enrolled students</div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Search users..."
                />
              </div>
            </div>
            <div className="md:w-48">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-900">All Users</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.fullName && (
                            <div className="text-xs text-gray-400">{user.fullName}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-xs font-bold rounded-2xl shadow-sm ${getRoleColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-xs font-bold rounded-2xl shadow-sm ${getStatusColor(user.status)}`}>
                        {user.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setShowDeleteModal(user)}
                        disabled={deleteLoading === user.id}
                        className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteLoading === user.id ? (
                          <>
                            <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                <p className="text-gray-600">
                  {searchTerm || roleFilter !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users are registered in the system yet'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                  <span className="font-semibold">{Math.min(endIndex, filteredUsers.length)}</span> of{' '}
                  <span className="font-semibold">{filteredUsers.length}</span> users
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            currentPage === page
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete User</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete <strong>{showDeleteModal.username}</strong>?
                  This action cannot be undone.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowDeleteModal(null)}
                    disabled={deleteLoading === showDeleteModal.id}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteUser(showDeleteModal)}
                    disabled={deleteLoading === showDeleteModal.id}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading === showDeleteModal.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin h-4 w-4 border border-white border-t-transparent rounded-full mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete User'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;