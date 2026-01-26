import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Calendar, Clock, Users, FileText, CheckCircle, XCircle, Award, Timer } from 'lucide-react';
import { apiService } from '../../services/apiService';

interface CompletedStudent {
  userId: number;
  name: string;
  email: string;
  username: string;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  timeTaken: number;
  attemptDate: string;
  feedback: string;
}

interface ExamViewModalProps {
  open: boolean;
  onClose: () => void;
  exam: {
    exam_id: number;
    title: string;
    description: string;
    duration: number;
    totalMarks: number;
    startDate: string;
    endDate: string;
    startTime?: string;
    endTime?: string;
    status: string;
    studentsEnrolled: number;
    questionsCount: number;
    averageScore?: number;
    completedStudents?: CompletedStudent[];
    completedStudentsCount?: number;
  } | null;
}

const ExamViewModal: React.FC<ExamViewModalProps> = ({ open, onClose, exam }) => {
  const [examDetails, setExamDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'students'>('details');

  useEffect(() => {
    if (open && exam) {
      fetchExamDetails();
    }
  }, [open, exam]);

  const fetchExamDetails = async () => {
    if (!exam?.exam_id) return;

    setLoading(true);
    try {
      const data = await apiService.getExamById(exam.exam_id.toString());
      setExamDetails(data);
    } catch (error) {
      console.error('Failed to fetch exam details:', error);
      setExamDetails(exam);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: string, time?: string) => {
    if (!date) return 'Not set';
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    if (time) {
      const [hours, minutes] = time.split(':');
      const timeObj = new Date();
      timeObj.setHours(parseInt(hours), parseInt(minutes));
      const timeStr = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `${dateStr} at ${timeStr}`;
    }

    return dateStr;
  };

  const formatDuration = (seconds: number) => {
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

  if (!exam) return null;

  const displayExam = examDetails || exam;
  const completedStudents = displayExam.completedStudents || [];

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-60 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-teal-500 px-6 py-4 text-white">
                      <Dialog.Title as="h3" className="text-2xl font-bold">
                        {displayExam.title}
                      </Dialog.Title>
                      <p className="text-purple-100 mt-1">
                        {displayExam.questionsCount || displayExam.questions?.length || 0} questions •
                        {displayExam.duration} minutes •
                        {displayExam.totalMarks} marks
                      </p>

                      {/* Tab Navigation */}
                      <div className="flex mt-4 space-x-1">
                        <button
                          onClick={() => setActiveTab('details')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'details'
                              ? 'bg-white text-purple-600'
                              : 'text-purple-100 hover:bg-white hover:bg-opacity-20'
                            }`}
                        >
                          Exam Details
                        </button>
                        <button
                          onClick={() => setActiveTab('students')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'students'
                              ? 'bg-white text-purple-600'
                              : 'text-purple-100 hover:bg-white hover:bg-opacity-20'
                            }`}
                        >
                          Completed Students ({completedStudents.length})
                        </button>
                      </div>
                    </div>

                    <div className="p-6 max-h-96 overflow-y-auto">
                      {activeTab === 'details' ? (
                        /* Exam Details Tab */
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-600">{displayExam.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Schedule Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <Calendar className="h-5 w-5 mr-2" />
                                Schedule
                              </h4>
                              <div className="space-y-2">
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Start:</span>
                                  <p className="text-sm text-gray-600">
                                    {formatDateTime(displayExam.startDate, displayExam.startTime)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">End:</span>
                                  <p className="text-sm text-gray-600">
                                    {formatDateTime(displayExam.endDate, displayExam.endTime)}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-gray-700">Duration:</span>
                                  <p className="text-sm text-gray-600">{displayExam.duration} minutes</p>
                                </div>
                              </div>
                            </div>

                            {/* Exam Statistics */}
                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <FileText className="h-5 w-5 mr-2" />
                                Statistics
                              </h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Total Questions:</span>
                                  <span className="text-sm font-medium">{displayExam.questionsCount || displayExam.questions?.length || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Total Marks:</span>
                                  <span className="text-sm font-medium">{displayExam.totalMarks}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-600">Completed Students:</span>
                                  <span className="text-sm font-medium">{completedStudents.length}</span>
                                </div>
                                {typeof displayExam.averageScore === 'number' && !isNaN(displayExam.averageScore) && (
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">Average Score:</span>
                                    <span className="text-sm font-medium text-green-600">{displayExam.averageScore}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Status and Instructions */}
                          <div className="space-y-4">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Status:</span>
                              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${displayExam.status === 'active' ? 'bg-green-100 text-green-700' :
                                  displayExam.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                                    displayExam.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                }`}>
                                {displayExam.status}
                              </span>
                            </div>

                            {displayExam.instructions && (
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">Instructions</h4>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                  <p className="text-sm text-blue-800">{displayExam.instructions}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Completed Students Tab */
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                              <Users className="h-5 w-5 mr-2" />
                              Students Who Completed the Exam
                            </h4>
                          </div>

                          {completedStudents.length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500">No students have completed this exam yet.</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {completedStudents.map((student, index) => (
                                <div key={student.userId} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${student.passed ? 'bg-green-500' : 'bg-red-500'
                                        }`}>
                                        {index + 1}
                                      </div>
                                      <div>
                                        <h5 className="font-medium text-gray-900">{student.name}</h5>
                                        <p className="text-sm text-gray-600">{student.email}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                      <div className="text-right">
                                        <div className="flex items-center space-x-2">
                                          <Award className="h-4 w-4 text-yellow-500" />
                                          <span className="font-medium text-gray-900">
                                            {student.score}/{student.totalMarks}
                                          </span>
                                          <span className={`text-sm font-medium ${student.passed ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            ({student.percentage}%)
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2 mt-1">
                                          <Timer className="h-3 w-3 text-gray-400" />
                                          <span className="text-xs text-gray-500">
                                            {formatDuration(student.timeTaken)}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="flex items-center">
                                        {student.passed ? (
                                          <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : (
                                          <XCircle className="h-5 w-5 text-red-500" />
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                      <span>Submitted: {new Date(student.attemptDate).toLocaleString()}</span>
                                      <span className={`px-2 py-1 rounded-full ${student.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {student.passed ? 'Passed' : 'Failed'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t bg-gray-50 px-6 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          onClick={onClose}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ExamViewModal;
