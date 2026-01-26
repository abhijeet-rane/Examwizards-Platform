import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import { Plus, Trash2, Edit, Save, X, ChevronDown, ChevronUp, Copy, Search, Filter, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { apiService } from '../../services/apiService';
import { validateExam, createEmptyQuestion, duplicateQuestion as duplicateQuestionUtil, calculateTotalMarks } from '../../utils/examUtils';
import toast from 'react-hot-toast';

interface ExamEditModalProps {
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
    status: string;
    studentsEnrolled: number;
    questionsCount: number;
    averageScore?: number;
  } | null;
  onSave: (updatedExam: any) => void;
}

const ExamEditModal: React.FC<ExamEditModalProps> = ({ open, onClose, exam, onSave }) => {
  const [form, setForm] = useState<any>(exam || {
    exam_id: '',
    title: '',
    description: '',
    duration: 60,
    totalMarks: 100,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    status: 'draft',
    studentsEnrolled: 0,
    questionsCount: 0,
    averageScore: undefined,
    instructions: '',
    isactive: true,
    course: null,
    questions: [],
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>(exam?.questions || []);
  const [activeTab, setActiveTab] = useState<'details' | 'questions'>('details');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionFilter, setQuestionFilter] = useState<'all' | 'mcq' | 'multiple'>('all');
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Validation functions
  const getCurrentDateTime = () => {
    const now = new Date();
    return now;
  };

  const validateDateTime = (startDate: string, startTime: string, endDate: string, endTime: string) => {
    if (!startDate || !startTime || !endDate || !endTime) return true; // Skip if not all fields filled
    
    const now = getCurrentDateTime();
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const originalStartDateTime = exam ? new Date(`${exam.startDate}T${exam.startTime || '00:00'}`) : null;
    
    // Allow keeping the original start time even if it's in the past
    const isKeepingOriginalStart = originalStartDateTime && 
      Math.abs(startDateTime.getTime() - originalStartDateTime.getTime()) < 60000; // Within 1 minute tolerance
    
    // Only validate start time being in the past if it's been changed from the original
    if (!isKeepingOriginalStart && startDateTime < now) {
      return 'Start date and time cannot be in the past (unless keeping the original schedule)';
    }
    
    // For end time, be more flexible - only check if it's significantly in the past
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (endDateTime < oneHourAgo) {
      return 'End date and time cannot be more than 1 hour in the past';
    }
    
    // Check if start is before end
    if (startDateTime >= endDateTime) {
      return 'End date and time must be after start date and time';
    }
    
    return true;
  };

  const checkDuplicateQuestion = (questions: any[]) => {
    const questionTexts = new Set();
    for (const q of questions) {
      const questionText = q.question.toLowerCase().trim();
      if (questionTexts.has(questionText)) {
        return 'Duplicate questions found. Each question must be unique.';
      }
      questionTexts.add(questionText);
    }
    return null;
  };

  const setScheduleToNow = () => {
    const duration = form.duration;
    
    // Check if duration is filled
    if (!duration || duration <= 0) {
      toast.error('Please enter the exam duration first before setting schedule', { duration: 6000 });
      return;
    }
    
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    
    // Set start to 1 minute from now
    const startTime = new Date(now.getTime() + 1 * 60 * 1000);
    const startTimeStr = startTime.toTimeString().slice(0, 5);
    
    // Set end time based on duration field (in minutes)
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const endDate = endTime.toISOString().split('T')[0];
    const endTimeStr = endTime.toTimeString().slice(0, 5);
    
    setForm(prev => ({
      ...prev,
      startDate: currentDate,
      startTime: startTimeStr,
      endDate: endDate,
      endTime: endTimeStr
    }));
    
    toast.success(`Schedule set to start in 1 minute with ${duration} minutes duration`);
  };

  useEffect(() => {
    if (open && exam) {
      // Fetch full exam details including questions
      fetchExamDetails();
    }
  }, [exam, open]);

  const fetchExamDetails = async () => {
    if (!exam?.exam_id) return;

    setLoading(true);
    try {
      // Fetch exam details - the exam data should include questions
      const examData = await apiService.getExamById(exam.exam_id);
      console.log('Fetched exam data:', examData);

      setForm(examData || exam);

      // Ensure questions have proper structure with correct options
      const normalizedQuestions = (examData?.questions || exam?.questions || []).map((q: any, index: number) => {
        const normalized = {
          ...q,
          options: q.options || [],
          correctOptions: q.correctOptions || q.correct_options || [],
          marks: q.marks || 1,
          type: q.type || 'mcq'
        };

        // Debug log to see the data structure
        console.log(`Question ${index + 1}:`, normalized);

        return normalized;
      });

      setQuestions(normalizedQuestions);
    } catch (error) {
      console.error('Failed to fetch exam details:', error);
      setForm(exam);

      // Fallback with proper question structure
      const fallbackQuestions = (exam?.questions || []).map((q: any) => ({
        ...q,
        options: q.options || [],
        correctOptions: q.correctOptions || q.correct_options || [],
        marks: q.marks || 1,
        type: q.type || 'mcq'
      }));

      setQuestions(fallbackQuestions);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiService.getCoursesForInstructor().then((data) => {
      let courseList = data.data || data;
      setCourses(courseList);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCourseChange = (_: any, value: any) => {
    setForm((prev: any) => ({ ...prev, course: value }));
  };

  // Question editing logic
  const handleQuestionChange = (idx: number, field: string, value: any) => {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const handleOptionChange = (qIdx: number, optIdx: number, value: string) => {
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? {
      ...q,
      options: q.options.map((opt: any, oi: number) => oi === optIdx ? { option: value } : opt)
    } : q));
  };

  const addOption = (qIdx: number) => {
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? {
      ...q,
      options: [...q.options, { option: '' }]
    } : q));
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    setQuestions((prev) => prev.map((q, i) => i === qIdx ? {
      ...q,
      options: q.options.filter((_: any, oi: number) => oi !== optIdx)
    } : q));
  };

  const addQuestion = () => {
    const newQuestion = createEmptyQuestion();
    setQuestions((prev) => [...prev, newQuestion]);
    setExpandedQuestions(prev => new Set([...prev, questions.length]));
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(idx);
      return newSet;
    });
    updateTotalMarks();
  };

  const duplicateQuestion = (idx: number) => {
    const duplicatedQuestion = duplicateQuestionUtil(questions[idx]);
    setQuestions((prev) => [...prev, duplicatedQuestion]);
    updateTotalMarks();
  };

  const updateTotalMarks = () => {
    const totalMarks = calculateTotalMarks(questions);
    setForm(prev => ({ ...prev, totalMarks }));
  };

  const toggleQuestionExpansion = (idx: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  const toggleAllQuestions = () => {
    if (expandedQuestions.size === questions.length) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(questions.map((_, idx) => idx)));
    }
  };

  const bulkDeleteQuestions = () => {
    if (selectedQuestions.size === 0) return;
    setQuestions(prev => prev.filter((_, idx) => !selectedQuestions.has(idx)));
    setSelectedQuestions(new Set());
  };

  const bulkUpdateMarks = (marks: number) => {
    if (selectedQuestions.size === 0) return;
    setQuestions(prev => prev.map((q, idx) =>
      selectedQuestions.has(idx) ? { ...q, marks } : q
    ));
  };

  const filteredQuestions = questions.filter((q, idx) => {
    if (!q || typeof q !== 'object') return false;
    const matchesSearch = (q.question || '').toLowerCase().includes(questionSearch.toLowerCase());
    const matchesFilter = questionFilter === 'all' || q.type === questionFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate date and time
    const dateTimeValidation = validateDateTime(form.startDate, form.startTime, form.endDate, form.endTime);
    if (dateTimeValidation !== true) {
      toast.error(dateTimeValidation, { duration: 6000 });
      setValidationErrors([dateTimeValidation]);
      return;
    }

    // Validate duplicate questions
    const duplicateValidation = checkDuplicateQuestion(questions);
    if (duplicateValidation) {
      toast.error(duplicateValidation, { duration: 6000 });
      setValidationErrors([duplicateValidation]);
      return;
    }

    // Validate the exam
    const examData = { ...form, questions };

    try {
      const errors = validateExam(examData);

      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      setSaving(true);
      setValidationErrors([]);
      
      // Make the actual API call to update the exam
      console.log('Updating exam with data:', examData);
      console.log('Form data:', form);
      console.log('Questions data:', questions);
      
      try {
        // Ensure exam ID is a number
        const examId = typeof examData.exam_id === 'string' ? parseInt(examData.exam_id) : examData.exam_id;
        
        // Call the API service to update the exam
        console.log('Updating exam with ID:', examId, 'and data:', examData);
        const response = await apiService.updateExam(examId, examData);
        console.log('Exam update response:', response);
        
        // Show success message
        toast.success('Exam updated successfully!');
        
        // Call the parent's onSave function to refresh the UI
        await onSave(examData);
        
        // Close the modal
        onClose();
      } catch (apiError: any) {
        console.error('API Error updating exam:', apiError);
        
        let errorMessage = 'Failed to update exam in database. Please try again.';

        // Handle different error response formats
        if (apiError?.response?.data) {
          const errorData = apiError.response.data;
          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData?.error) {
            errorMessage = errorData.error;
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        } else if (typeof apiError === 'string') {
          errorMessage = apiError;
        }

        toast.error(errorMessage, { duration: 6000 });
        setValidationErrors([errorMessage]);
      }
    } catch (error: any) {
      console.error('Failed to save exam:', error);
      
      let errorMessage = 'Failed to save exam. Please try again.';

      // Handle different error response formats
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage, { duration: 6000 });
      setValidationErrors([errorMessage]);
    } finally {
      setSaving(false);
    }
  };

  // Update total marks when questions change
  useEffect(() => {
    const totalMarks = calculateTotalMarks(questions);
    setForm(prev => ({ ...prev, totalMarks }));
  }, [questions]);

  if (!exam) return null;

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
          <div className="flex min-h-full items-start justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all my-8">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-teal-500 px-6 py-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <Dialog.Title as="h3" className="text-2xl font-bold">
                            Edit Exam: {form.title}
                          </Dialog.Title>
                          <p className="text-purple-100 mt-1">
                            {questions.length} questions • {form.duration} minutes • {form.totalMarks} marks
                          </p>
                        </div>
                        <button
                          onClick={onClose}
                          className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>

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
                          onClick={() => setActiveTab('questions')}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'questions'
                            ? 'bg-white text-purple-600'
                            : 'text-purple-100 hover:bg-white hover:bg-opacity-20'
                            }`}
                        >
                          Questions ({questions.length})
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col h-[calc(100vh-200px)]">
                      {/* Validation Errors */}
                      {validationErrors.length > 0 && (
                        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                            <AlertCircle size={16} />
                            Please fix the following errors:
                          </div>
                          <ul className="text-sm text-red-600 space-y-1">
                            {validationErrors.map((error, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-400 mt-1">•</span>
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex-1 overflow-y-auto">
                        {activeTab === 'details' ? (
                          /* Exam Details Tab */
                          <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <TextField
                                label="Exam Title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                fullWidth
                                required
                                variant="outlined"
                              />
                              <Autocomplete
                                options={courses}
                                getOptionLabel={(option) => option?.name || ''}
                                value={form.course}
                                onChange={handleCourseChange}
                                renderInput={(params) => (
                                  <TextField {...params} label="Assign to Course" variant="outlined" fullWidth />
                                )}
                                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                              />
                            </div>

                            <TextField
                              label="Description"
                              name="description"
                              value={form.description}
                              onChange={handleChange}
                              fullWidth
                              required
                              multiline
                              rows={3}
                              variant="outlined"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextField
                                label="Duration (minutes)"
                                name="duration"
                                type="number"
                                value={form.duration}
                                onChange={handleChange}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                                variant="outlined"
                              />
                              <TextField
                                label="Total Marks"
                                name="totalMarks"
                                type="number"
                                value={form.totalMarks}
                                onChange={handleChange}
                                fullWidth
                                required
                                inputProps={{ min: 1 }}
                                variant="outlined"
                              />
                            </div>

                            {/* Schedule Section with Start Now Button */}
                            <div className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900">Schedule</h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    You can keep the original schedule or update to future dates
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={setScheduleToNow}
                                  className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center text-sm"
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Start Now
                                </button>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <TextField
                                  label="Start Date"
                                  name="startDate"
                                  type="date"
                                  value={form.startDate}
                                  onChange={handleChange}
                                  fullWidth
                                  required
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                  helperText="You can keep the original date or set a future date"
                                />
                                <TextField
                                  label="Start Time"
                                  name="startTime"
                                  type="time"
                                  value={form.startTime || ''}
                                  onChange={handleChange}
                                  fullWidth
                                  required
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                  helperText="Original time can be kept"
                                />
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <TextField
                                  label="End Date"
                                  name="endDate"
                                  type="date"
                                  value={form.endDate}
                                  onChange={handleChange}
                                  fullWidth
                                  required
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                  helperText="Must be after start date"
                                />
                                <TextField
                                  label="End Time"
                                  name="endTime"
                                  type="time"
                                  value={form.endTime || ''}
                                  onChange={handleChange}
                                  fullWidth
                                  required
                                  InputLabelProps={{ shrink: true }}
                                  variant="outlined"
                                  helperText="Must be after start time"
                                />
                              </div>
                            </div>

                            <TextField
                              label="Instructions"
                              name="instructions"
                              value={form.instructions || ''}
                              onChange={handleChange}
                              fullWidth
                              multiline
                              rows={4}
                              variant="outlined"
                              placeholder="Enter exam instructions for students..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <TextField
                                label="Status"
                                name="status"
                                select
                                SelectProps={{ native: true }}
                                value={form.status}
                                onChange={handleChange}
                                fullWidth
                                variant="outlined"
                              >
                                <option value="draft">Draft</option>
                                <option value="scheduled">Scheduled</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                              </TextField>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={form.isactive}
                                  onChange={(e) => setForm(prev => ({ ...prev, isactive: e.target.checked }))}
                                />
                                <span className="text-sm text-gray-700">Active Exam</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Questions Tab */
                          <div className="p-6">
                            {/* Question Controls */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex flex-col md:flex-row gap-4 flex-1">
                                  <div className="relative flex-1">
                                    <Search className="absolute left-3 top-3 text-gray-400 h-4 w-4" />
                                    <input
                                      type="text"
                                      value={questionSearch}
                                      onChange={(e) => setQuestionSearch(e.target.value)}
                                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                      placeholder="Search questions..."
                                    />
                                  </div>
                                  <select
                                    value={questionFilter}
                                    onChange={(e) => setQuestionFilter(e.target.value as any)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                  >
                                    <option value="all">All Types</option>
                                    <option value="mcq">MCQ</option>
                                    <option value="multiple">Multiple Choice</option>
                                  </select>
                                </div>

                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={toggleAllQuestions}
                                    className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    {expandedQuestions.size === questions.length ? 'Collapse All' : 'Expand All'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setBulkEditMode(!bulkEditMode)}
                                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${bulkEditMode
                                      ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                      }`}
                                  >
                                    {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit'}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                                  >
                                    <Plus size={16} /> Add Question
                                  </button>
                                </div>
                              </div>

                              {bulkEditMode && selectedQuestions.size > 0 && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-blue-700 font-medium">
                                      {selectedQuestions.size} questions selected
                                    </span>
                                    <div className="flex gap-2">
                                      <input
                                        type="number"
                                        min="1"
                                        placeholder="Marks"
                                        className="w-20 px-2 py-1 text-sm border border-blue-300 rounded"
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            bulkUpdateMarks(Number((e.target as HTMLInputElement).value));
                                          }
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={bulkDeleteQuestions}
                                        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                                      >
                                        Delete Selected
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Questions List */}
                            {filteredQuestions.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                  {questions.length === 0 ? 'No questions added yet' : 'No questions match your search'}
                                </div>
                                {questions.length === 0 && (
                                  <button
                                    type="button"
                                    onClick={addQuestion}
                                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                                  >
                                    Add Your First Question
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {filteredQuestions.map((q, qIdx) => {
                                  const actualIdx = questions.indexOf(q);
                                  const isExpanded = expandedQuestions.has(actualIdx);
                                  const isSelected = selectedQuestions.has(actualIdx);

                                  return (
                                    <div
                                      key={actualIdx}
                                      className={`border rounded-xl bg-white transition-all ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                                        }`}
                                    >
                                      {/* Question Header */}
                                      <div className="p-4 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-3">
                                            {bulkEditMode && (
                                              <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                  const newSelected = new Set(selectedQuestions);
                                                  if (e.target.checked) {
                                                    newSelected.add(actualIdx);
                                                  } else {
                                                    newSelected.delete(actualIdx);
                                                  }
                                                  setSelectedQuestions(newSelected);
                                                }}
                                                className="w-4 h-4 text-blue-600"
                                              />
                                            )}
                                            <span className="font-semibold text-gray-900">
                                              Question {actualIdx + 1}
                                            </span>
                                            <span className={`px-2 py-1 text-xs rounded-full ${q.type === 'mcq'
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-blue-100 text-blue-700'
                                              }`}>
                                              {q.type === 'mcq' ? 'Single Choice' : 'Multiple Choice'}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                              {q.marks} mark{q.marks !== 1 ? 's' : ''}
                                            </span>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            <button
                                              type="button"
                                              onClick={() => duplicateQuestion(actualIdx)}
                                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                              title="Duplicate question"
                                            >
                                              <Copy size={16} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => removeQuestion(actualIdx)}
                                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                              title="Delete question"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => toggleQuestionExpansion(actualIdx)}
                                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                          </div>
                                        </div>

                                        {/* Question Preview */}
                                        <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                                          {q.question || 'No question text'}
                                        </div>
                                      </div>

                                      {/* Question Details (Expandable) */}
                                      {isExpanded && (
                                        <div className="p-4 space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div className="md:col-span-3">
                                              <TextField
                                                label="Question Text"
                                                value={q.question}
                                                onChange={e => handleQuestionChange(actualIdx, 'question', e.target.value)}
                                                fullWidth
                                                required
                                                multiline
                                                rows={2}
                                                variant="outlined"
                                                size="small"
                                              />
                                            </div>
                                            <div className="space-y-2">
                                              <TextField
                                                label="Type"
                                                select
                                                SelectProps={{ native: true }}
                                                value={q.type}
                                                onChange={e => handleQuestionChange(actualIdx, 'type', e.target.value)}
                                                fullWidth
                                                size="small"
                                                variant="outlined"
                                              >
                                                <option value="mcq">Single Choice</option>
                                                <option value="multiple">Multiple Choice</option>
                                              </TextField>
                                              <TextField
                                                label="Marks"
                                                type="number"
                                                value={q.marks}
                                                onChange={e => handleQuestionChange(actualIdx, 'marks', Number(e.target.value))}
                                                inputProps={{ min: 1 }}
                                                size="small"
                                                fullWidth
                                                variant="outlined"
                                              />
                                            </div>
                                          </div>

                                          {/* Options */}
                                          <div>
                                            <div className="flex items-center justify-between mb-3">
                                              <span className="text-sm font-medium text-gray-700">Answer Options</span>
                                              <button
                                                type="button"
                                                onClick={() => addOption(actualIdx)}
                                                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                                              >
                                                <Plus size={14} /> Add Option
                                              </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {q.options.map((opt, optIdx) => {
                                                const isCorrect = (q.correctOptions ?? []).includes(optIdx);
                                                return (
                                                  <div
                                                    key={optIdx}
                                                    className={`flex items-center gap-2 p-3 border rounded-lg transition-colors ${isCorrect
                                                      ? 'border-green-300 bg-green-50'
                                                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                      }`}
                                                  >
                                                    <input
                                                      type={q.type === 'mcq' ? 'radio' : 'checkbox'}
                                                      checked={isCorrect}
                                                      onChange={e => {
                                                        if (q.type === 'mcq') {
                                                          handleQuestionChange(actualIdx, 'correctOptions', [optIdx]);
                                                        } else {
                                                          const newCorrect = e.target.checked
                                                            ? [...(q.correctOptions || []), optIdx]
                                                            : (q.correctOptions || []).filter((idx: number) => idx !== optIdx);
                                                          handleQuestionChange(actualIdx, 'correctOptions', newCorrect);
                                                        }
                                                      }}
                                                      name={`correct-${actualIdx}`}
                                                      className="w-4 h-4 text-green-600"
                                                    />
                                                    <TextField
                                                      value={opt.option}
                                                      onChange={e => handleOptionChange(actualIdx, optIdx, e.target.value)}
                                                      size="small"
                                                      className="flex-1"
                                                      required
                                                      placeholder={`Option ${optIdx + 1}`}
                                                      variant="outlined"
                                                    />
                                                    {isCorrect && (
                                                      <CheckCircle size={16} className="text-green-600" />
                                                    )}
                                                    {q.options.length > 2 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => removeOption(actualIdx, optIdx)}
                                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                                      >
                                                        <Trash2 size={14} />
                                                      </button>
                                                    )}
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="border-t bg-gray-50 px-6 py-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {activeTab === 'questions' && (
                              <span>
                                Total: {questions.length} questions •
                                {questions.reduce((sum, q) => sum + (q.marks || 0), 0)} marks
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={onClose}
                              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={saving}
                              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                              {saving ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save size={16} />
                                  Save Changes
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
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

export default ExamEditModal;
