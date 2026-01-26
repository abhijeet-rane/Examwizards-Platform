import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Mail,
  User,
  Calendar,
  MoreHorizontal,
  X,
  Send,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../../services/apiService';
import { format } from 'date-fns';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'REPLIED';
  submittedAt: string;
  updatedAt: string;
  adminResponse?: string;
  referenceNumber?: string;
}

interface ContactStats {
  pending: number;
  inProgress: number;
  replied: number;
  recentMessages: ContactMessage[];
}

const ContactRequests: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState('');
  const [referenceFilter, setReferenceFilter] = useState('');
  
  // Dialog states
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [adminResponse, setAdminResponse] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Menu state
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [page, rowsPerPage, searchTerm, statusFilter, emailFilter, referenceFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        size: rowsPerPage,
        sortBy: 'submittedAt',
        sortDir: 'desc',
        ...(searchTerm && { searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(emailFilter && { email: emailFilter }),
        ...(referenceFilter && { referenceNumber: referenceFilter })
      };

      const response = await apiService.getContactMessages(params);
      
      // Handle different response structures
      if (response.success) {
        setMessages(response.messages || []);
        setTotalElements(response.totalElements || 0);
      } else if (response.data && response.data.success) {
        setMessages(response.data.messages || []);
        setTotalElements(response.data.totalElements || 0);
      } else {
        console.error('Unexpected response structure:', response);
        setMessages([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      setMessages([]);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getContactStats();
      if (response.success) {
        setStats(response.stats);
      } else if (response.data && response.data.success) {
        setStats(response.data.stats);
      } else {
        console.error('Unexpected stats response structure:', response);
      }
    } catch (error) {
      console.error('Error fetching contact stats:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedMessage || !newStatus) return;

    try {
      setActionLoading(true);
      const response = await apiService.updateContactMessageStatus(selectedMessage.id, {
        status: newStatus,
        adminResponse: adminResponse.trim() || undefined
      });

      if (response.success || (response.data && response.data.success)) {
        setEditDialogOpen(false);
        setSelectedMessage(null);
        setNewStatus('');
        setAdminResponse('');
        fetchMessages();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating message status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await apiService.deleteContactMessage(id);
      fetchMessages();
      fetchStats();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REPLIED': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-3 h-3" />;
      case 'IN_PROGRESS': return <AlertCircle className="w-3 h-3" />;
      case 'REPLIED': return <CheckCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const openViewDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
    setActiveDropdown(null);
  };

  const openEditDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setNewStatus(message.status);
    setAdminResponse(message.adminResponse || '');
    setEditDialogOpen(true);
    setActiveDropdown(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setEmailFilter('');
    setReferenceFilter('');
    setPage(0);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Requests</h1>
              <p className="text-gray-600">Manage and respond to customer inquiries</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Pending Requests</p>
                  <p className="text-3xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold">{stats.inProgress}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold">{stats.replied}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Total Messages</p>
                  <p className="text-3xl font-bold">{stats.pending + stats.inProgress + stats.replied}</p>
                </div>
                <Mail className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter & Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl p-6 mb-8 border border-purple-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-600" />
              Filter & Search
            </h3>
            <button
              onClick={resetFilters}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REPLIED">Replied</option>
            </select>

            <input
              type="text"
              placeholder="Filter by email..."
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <input
              type="text"
              placeholder="Reference number..."
              value={referenceFilter}
              onChange={(e) => setReferenceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
            />
          </div>
        </motion.div>

        {/* Messages List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl border border-indigo-100 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Contact Messages ({totalElements})
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No contact messages found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold text-gray-900">{message.name}</h4>
                            {message.referenceNumber && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                #{message.referenceNumber}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{message.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(message.status)}`}>
                          {getStatusIcon(message.status)}
                          <span className="ml-1">{message.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="ml-13">
                        <h5 className="font-medium text-gray-900 mb-1">{message.subject}</h5>
                        <p className="text-gray-600 text-sm line-clamp-2">{message.message}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(message.submittedAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === message.id ? null : message.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-600" />
                      </button>

                      {activeDropdown === message.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                          <button
                            onClick={() => openViewDialog(message)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                          <button
                            onClick={() => openEditDialog(message)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Update Status
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalElements > 0 && (
            <div className="px-6 py-4 border-t border-indigo-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-medium text-gray-900">{page * rowsPerPage + 1}</span> to{' '}
                    <span className="font-medium text-gray-900">{Math.min((page + 1) * rowsPerPage, totalElements)}</span> of{' '}
                    <span className="font-medium text-gray-900">{totalElements}</span> results
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value));
                        setPage(0);
                      }}
                      className="px-2 py-1 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPage(0)}
                    disabled={page === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    First
                  </button>
                  
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(totalElements / rowsPerPage)) }, (_, i) => {
                      const totalPages = Math.ceil(totalElements / rowsPerPage);
                      let pageNum;
                      
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (page < 3) {
                        pageNum = i;
                      } else if (page > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 text-sm font-medium border-t border-b border-gray-200 transition-colors ${
                            page === pageNum
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={(page + 1) * rowsPerPage >= totalElements}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border-t border-b border-gray-200 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                  
                  <button
                    onClick={() => setPage(Math.ceil(totalElements / rowsPerPage) - 1)}
                    disabled={(page + 1) * rowsPerPage >= totalElements}
                    className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* View Dialog */}
        {viewDialogOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-100"
            >
              <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="text-xl font-semibold text-gray-900">Message Details</h3>
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Name</label>
                    <p className="mt-1 text-gray-900">{selectedMessage.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-gray-900">{selectedMessage.email}</p>
                  </div>
                </div>

                {selectedMessage.referenceNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Reference Number</label>
                    <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-blue-900 font-mono font-bold text-lg tracking-wider">
                        {selectedMessage.referenceNumber}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-700">Subject</label>
                  <p className="mt-1 text-gray-900">{selectedMessage.subject}</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedMessage.status)}`}>
                        {getStatusIcon(selectedMessage.status)}
                        <span className="ml-1">{selectedMessage.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Submitted</label>
                    <p className="mt-1 text-gray-900">
                      {format(new Date(selectedMessage.submittedAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Message</label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {selectedMessage.adminResponse && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Admin Response</label>
                    <div className="mt-1 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.adminResponse}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <button
                  onClick={() => setViewDialogOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setViewDialogOpen(false);
                    openEditDialog(selectedMessage);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Update Status
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Dialog */}
        {editDialogOpen && selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl max-w-lg w-full border border-indigo-100"
            >
              <div className="flex items-center justify-between p-6 border-b border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-xl font-semibold text-gray-900">Update Message Status</h3>
                <button
                  onClick={() => setEditDialogOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    Updating the status will send an email notification to {selectedMessage.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="REPLIED">Replied</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Response (Optional)
                  </label>
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Add a response that will be included in the email notification..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                <button
                  onClick={() => setEditDialogOpen(false)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={actionLoading || !newStatus}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center disabled:opacity-50"
                >
                  {actionLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Update Status
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Click outside to close dropdown */}
        {activeDropdown && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => setActiveDropdown(null)}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ContactRequests;