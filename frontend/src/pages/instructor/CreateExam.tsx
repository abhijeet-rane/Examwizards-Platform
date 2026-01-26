import React, { useState, useEffect } from 'react';
import Autocomplete, { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Save, Clock, Users, FileText } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

interface Question {
  id: string;
  question: string;
  type: 'mcq' | 'multiple';
  options: { option: string }[];
  correctOptions: number[]; // Indices of correct options
  marks: number;
}

interface ExamFormData {
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  instructions: string;
  isactive?: boolean; // optional, set true by default
}


import { useNavigate, useSearchParams } from 'react-router-dom';

const CreateExam = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    question: '',
    type: 'mcq',
    options: [{ option: '' }], // Start with one option
    correctOptions: [],
    marks: 1
  });
  const [isActive, setIsActive] = useState(true); // UI toggle for exam active status
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<string>('');
  const [courses, setCourses] = useState<any[]>([]);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ExamFormData>();

  // Watch form values for validation
  const watchedStartDate = watch('startDate');
  const watchedStartTime = watch('startTime');
  const watchedEndDate = watch('endDate');
  const watchedEndTime = watch('endTime');

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

    // Check if start date/time is in the past
    if (startDateTime < now) {
      return 'Start date and time cannot be in the past';
    }

    // Check if end date/time is in the past
    if (endDateTime < now) {
      return 'End date and time cannot be in the past';
    }

    // Check if start is before end
    if (startDateTime >= endDateTime) {
      return 'End date and time must be after start date and time';
    }

    return true;
  };

  const checkDuplicateQuestion = (questionText: string) => {
    return questions.some(q => q.question.toLowerCase().trim() === questionText.toLowerCase().trim());
  };

  const setScheduleToNow = () => {
    const duration = watch('duration');

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

    setValue('startDate', currentDate);
    setValue('startTime', startTimeStr);

    // Set end time based on duration field (in minutes)
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const endDate = endTime.toISOString().split('T')[0];
    const endTimeStr = endTime.toTimeString().slice(0, 5);

    setValue('endDate', endDate);
    setValue('endTime', endTimeStr);

    toast.success(`Schedule set to start in 1 minute with ${duration} minutes duration`);
  };

  const addQuestion = () => {
    if (!currentQuestion.question || !currentQuestion.type) {
      toast.error('Please fill in all required fields for the question');
      return;
    }

    // Check for duplicate questions
    if (checkDuplicateQuestion(currentQuestion.question)) {
      toast.error('This question already exists. Please enter a different question.', { duration: 6000 });
      return;
    }

    if (!currentQuestion.options || currentQuestion.options.length < 2) {
      toast.error('Please provide at least two options');
      return;
    }
    if (currentQuestion.options.some(opt => !opt.option.trim())) {
      toast.error('Options cannot be empty');
      return;
    }
    if (!currentQuestion.correctOptions || currentQuestion.correctOptions.length === 0) {
      toast.error('Please select at least one correct answer');
      return;
    }
    if (currentQuestion.type === 'mcq' && currentQuestion.correctOptions.length !== 1) {
      toast.error('Please select exactly one correct answer for MCQ');
      return;
    }
    const newQuestion: Question = {
      id: Date.now().toString(),
      question: currentQuestion.question!,
      type: currentQuestion.type!,
      options: currentQuestion.options!,
      correctOptions: currentQuestion.correctOptions!,
      marks: currentQuestion.marks || 1
    };
    setQuestions([...questions, newQuestion]);
    setCurrentQuestion({
      question: '',
      type: 'mcq',
      options: [{ option: '' }],
      correctOptions: [],
      marks: 1
    });
    toast.success('Question added successfully');
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success('Question removed');
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(currentQuestion.options || [{ option: '' }, { option: '' }, { option: '' }, { option: '' }])];
    newOptions[index] = { option: value };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  useEffect(() => {
    // Fetch instructor's courses for dropdown
    const fetchCourses = async () => {
      try {
        console.log('Fetching courses for instructor...');
        const res = await apiService.getCoursesForInstructor();
        console.log('Courses response:', res);

        // If the response is an AxiosResponse, use res.data; otherwise, use res directly
        if (res && Array.isArray(res)) {
          console.log('Setting courses (direct array):', res);
          setCourses(res);
        } else if (res && Array.isArray(res.data)) {
          console.log('Setting courses (from data property):', res.data);
          setCourses(res.data);
        } else {
          console.log('No valid courses array found, setting empty array');
          setCourses([]);
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        toast.error('Failed to load courses');
        setCourses([]);
      }
    };
    fetchCourses();
  }, []);

  // Handle courseId from URL parameters
  useEffect(() => {
    const courseIdFromUrl = searchParams.get('courseId');
    if (courseIdFromUrl) {
      console.log('Pre-selecting course from URL:', courseIdFromUrl);
      setCourseId(courseIdFromUrl);
      toast.success('Course pre-selected from dashboard', { duration: 3000 });
    }
  }, [searchParams]);

  const onSubmit = async (data: ExamFormData) => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    if (!courseId) {
      toast.error('Please select a course');
      return;
    }

    // Validate date and time
    const dateTimeValidation = validateDateTime(data.startDate, data.startTime, data.endDate, data.endTime);
    if (dateTimeValidation !== true) {
      toast.error(dateTimeValidation, { duration: 6000 });
      return;
    }
    setLoading(true);
    try {
      // Map correctOptions to correct_options for all questions for backend
      const mappedQuestions = questions.map(q => ({
        ...q,
        correct_options: q.correctOptions,
        // Remove correctOptions from payload
        correctOptions: undefined
      }));
      const examPayload = {
        ...data,
        questions: mappedQuestions,
        isactive: isActive,
        totalMarks: mappedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0),
        course: { id: Number(courseId) },
      };
      await apiService.createExam(examPayload);
      toast.success('Exam created successfully!');
      navigate('/instructor/exams');
    } catch (err: any) {
      console.log('Create exam error:', err);

      let errorMessage = 'Failed to create exam';

      // Handle different error response formats
      if (err?.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData?.error) {
          errorMessage = errorData.error;
        } else if (errorData?.message) {
          errorMessage = errorData.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      toast.error(errorMessage, { duration: 6000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-cyan-50">
        <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 bg-clip-text text-transparent">
              <h1 className="text-4xl font-bold mb-3">Create New Exam</h1>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Set up a comprehensive exam with questions, timing, and detailed settings for your students</p>
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 shadow-xl border border-violet-100 mb-6">
            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 h-1 rounded-full mb-6"></div>
            <label className="block mb-3 font-bold text-gray-800 flex items-center">
              <div className="bg-gradient-to-r from-violet-500 to-purple-500 p-2 rounded-xl mr-3">
                <Users className="text-white h-5 w-5" />
              </div>
              Select Course
            </label>
            <Autocomplete
              options={courses}
              getOptionLabel={(option: any) => option.name || ''}
              value={courses.find((c: any) => String(c.id) === String(courseId)) || null}
              onChange={(_event, newValue) => setCourseId(newValue ? String(newValue.id) : '')}
              isOptionEqualToValue={(option, value) => String(option.id) === String(value.id)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Course"
                  variant="outlined"
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      '&:hover fieldset': {
                        borderColor: '#8b5cf6',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#8b5cf6',
                        borderWidth: '2px',
                      },
                    },
                  }}
                />
              )}
              renderOption={(props, option) => (
                <li
                  {...props}
                  key={option.id}
                  className="hover:bg-violet-50 py-3 px-2">
                  <div>
                    <span className="font-semibold text-gray-800">{option.name}</span>
                    {option.instructor?.fullName && (
                      <span className="ml-2 text-xs text-gray-500">({option.instructor.fullName})</span>
                    )}
                  </div>
                </li>
              )}
              sx={{ mb: 2 }}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Exam Activation Toggle */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-500 h-1 rounded-full mb-6"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl mr-3">
                    <span className="text-white font-bold text-sm">ON</span>
                  </div>
                  <div>
                    <label htmlFor="isactive-toggle" className="text-lg font-bold text-gray-800">
                      Exam Status
                    </label>
                    <p className="text-sm text-gray-600">
                      {isActive ? '✅ Students can attempt this exam' : '❌ Exam is inactive (hidden from students)'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isActive}
                  aria-label="Toggle exam active status"
                  tabIndex={0}
                  onClick={() => setIsActive(v => !v)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setIsActive(v => !v); }}
                  className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-purple-200 shadow-lg ${isActive ? 'bg-gradient-to-r from-purple-600 to-teal-500' : 'bg-gray-400'}`}
                >
                  <span
                    className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isActive ? 'translate-x-8' : 'translate-x-0.5'}`}
                  />
                </button>
              </div>
            </div>
            {/* Basic Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-xl border border-blue-100">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1 rounded-full mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl mr-3">
                  <FileText className="text-white h-5 w-5" />
                </div>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📝 Exam Title
                  </label>
                  <input
                    {...register('title', { required: 'Title is required' })}
                    type="text"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter exam title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.title.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📄 Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter exam description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ⏱️ Duration (minutes)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-blue-500" />
                    </div>
                    <input
                      {...register('duration', {
                        required: 'Duration is required',
                        min: { value: 1, message: 'Duration must be at least 1 minute' }
                      })}
                      type="number"
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                      placeholder="60"
                    />
                  </div>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.duration.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🎯 Total Marks
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={questions.reduce((sum, q) => sum + q.marks, 0)}
                      readOnly
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 text-gray-700 font-bold shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-blue-500 font-bold">pts</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl border border-green-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full mb-6"></div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl mr-3">
                    <Clock className="text-white h-5 w-5" />
                  </div>
                  Schedule
                </h3>
                <button
                  type="button"
                  onClick={setScheduleToNow}
                  className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center text-sm transform hover:scale-105"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Start Now
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 Start Date
                  </label>
                  <input
                    {...register('startDate', {
                      required: 'Start date is required',
                      validate: (value) => {
                        const today = new Date().toISOString().split('T')[0];
                        if (value < today) {
                          return 'Start date cannot be in the past';
                        }
                        return true;
                      }
                    })}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🕐 Start Time
                  </label>
                  <input
                    {...register('startTime', {
                      required: 'Start time is required',
                      validate: (value) => {
                        if (!watchedStartDate || !value) return true;
                        const today = new Date().toISOString().split('T')[0];
                        if (watchedStartDate === today) {
                          const now = new Date();
                          const currentTime = now.toTimeString().slice(0, 5);
                          if (value < currentTime) {
                            return 'Start time cannot be in the past';
                          }
                        }
                        return true;
                      }
                    })}
                    type="time"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                  />
                  {errors.startTime && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    📅 End Date
                  </label>
                  <input
                    {...register('endDate', {
                      required: 'End date is required',
                      validate: (value) => {
                        const today = new Date().toISOString().split('T')[0];
                        if (value < today) {
                          return 'End date cannot be in the past';
                        }
                        if (watchedStartDate && value < watchedStartDate) {
                          return 'End date must be on or after start date';
                        }
                        return true;
                      }
                    })}
                    type="date"
                    min={watchedStartDate || new Date().toISOString().split('T')[0]}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.endDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🕐 End Time
                  </label>
                  <input
                    {...register('endTime', {
                      required: 'End time is required',
                      validate: (value) => {
                        if (!watchedEndDate || !value || !watchedStartDate || !watchedStartTime) return true;

                        const today = new Date().toISOString().split('T')[0];
                        if (watchedEndDate === today) {
                          const now = new Date();
                          const currentTime = now.toTimeString().slice(0, 5);
                          if (value < currentTime) {
                            return 'End time cannot be in the past';
                          }
                        }

                        // Check if end is after start when dates are the same
                        if (watchedStartDate === watchedEndDate && value <= watchedStartTime) {
                          return 'End time must be after start time';
                        }

                        return true;
                      }
                    })}
                    type="time"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.endTime.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Add Question */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow-xl border border-orange-100">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 h-1 rounded-full mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl mr-3">
                  <Plus className="text-white h-5 w-5" />
                </div>
                Add Question
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    🎯 Question Type
                  </label>
                  <select
                    value={currentQuestion.type}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, type: e.target.value as any })}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                  >
                    <option value="mcq">🔘 Single Correct (MCQ)</option>
                    <option value="multiple">☑️ Multiple Correct</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ❓ Question
                  </label>
                  <textarea
                    value={currentQuestion.question}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                    rows={3}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none bg-white shadow-sm hover:shadow-md"
                    placeholder="Enter your question here..."
                  />
                </div>

                {['mcq', 'multiple'].includes(currentQuestion.type || '') && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      📝 Options
                    </label>
                    <div className="space-y-3">
                      {currentQuestion.options?.map((option, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <input
                            type="text"
                            value={option.option}
                            onChange={(e) => updateOption(index, e.target.value)}
                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                            placeholder={`Option ${index + 1}`}
                          />
                          {currentQuestion.options && currentQuestion.options.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newOptions = [...currentQuestion.options!];
                                newOptions.splice(index, 1);
                                setCurrentQuestion({ ...currentQuestion, options: newOptions });
                              }}
                              className="bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 p-2 rounded-xl transition-all duration-300 transform hover:scale-110"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentQuestion({ ...currentQuestion, options: [...(currentQuestion.options || []), { option: '' }] })}
                        className="mt-3 bg-gradient-to-r from-orange-600 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 flex items-center transform hover:scale-105"
                      >
                        <Plus className="h-5 w-5 mr-2" /> Add Option
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      ✅ Correct Answer(s)
                    </label>
                    {currentQuestion.type === 'mcq' && (
                      <select
                        value={currentQuestion.correctOptions && currentQuestion.correctOptions.length > 0 ? currentQuestion.correctOptions[0] : ''}
                        onChange={e => setCurrentQuestion({
                          ...currentQuestion,
                          correctOptions: [parseInt(e.target.value, 10)]
                        })}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                      >
                        <option value="">Select correct option</option>
                        {currentQuestion.options?.map((option, index) => (
                          <option key={index} value={index}>
                            {option.option || `Option ${index + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                    {currentQuestion.type === 'multiple' && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentQuestion.options?.map((option, index) => {
                          const selected = currentQuestion.correctOptions?.includes(index);
                          return (
                            <button
                              key={index}
                              type="button"
                              className={`px-4 py-2 rounded-full border font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transform hover:scale-105 ${selected ? 'bg-gradient-to-r from-orange-600 to-red-500 text-white border-transparent shadow-lg' : 'bg-white border-gray-300 text-gray-700 hover:bg-orange-50 hover:border-orange-300'}`}
                              onClick={() => {
                                let newCorrect = currentQuestion.correctOptions ? [...currentQuestion.correctOptions] : [];
                                if (selected) {
                                  newCorrect = newCorrect.filter(i => i !== index);
                                } else {
                                  newCorrect.push(index);
                                }
                                setCurrentQuestion({ ...currentQuestion, correctOptions: newCorrect });
                              }}
                            >
                              {option.option || `Option ${index + 1}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🎯 Marks
                    </label>
                    <input
                      type="number"
                      value={currentQuestion.marks}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, marks: parseInt(e.target.value) || 1 })}
                      min="1"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 bg-white shadow-sm hover:shadow-md font-medium"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-gradient-to-r from-orange-600 to-red-500 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300 flex items-center transform hover:scale-105"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Question
                </button>
              </div>
            </div>

            {/* Questions List */}
            {questions.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl p-6 shadow-xl border border-teal-100">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 h-1 rounded-full mb-6"></div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-500 p-2 rounded-xl mr-3">
                    <FileText className="text-white h-5 w-5" />
                  </div>
                  📋 Questions ({questions.length})
                </h3>
                <div className="space-y-4">
                  {questions.map((question, index) => {
                    const correctIndices: number[] = question.correctOptions || [];
                    return (
                      <div key={question.id} className="p-6 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-white to-gray-50 hover:shadow-lg transition-all duration-300">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <span className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Q{index + 1}
                              </span>
                              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-medium">
                                {question.type === 'mcq' ? '🔘 Single Correct' : '☑️ Multiple Correct'}
                              </span>
                              <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-bold">
                                {question.marks} pts
                              </span>
                            </div>
                            <div className="mb-3 text-gray-900 font-bold text-lg">{question.question}</div>
                            <div className="mb-3 text-sm text-gray-700">
                              <span className="font-bold text-blue-600">📝 Options:</span> {question.options && question.options.map((opt: { option: string }) => opt.option).join(', ')}
                            </div>
                            <div className="mb-2 text-sm">
                              <span className="font-bold text-green-600">✅ Correct:</span> {correctIndices.length > 0
                                ? correctIndices.map((idx: number) => question.options && question.options[idx] ? question.options[idx].option : '').filter(Boolean).join(', ')
                                : <span className="text-red-500 font-bold">❌ None selected</span>}
                            </div>
                          </div>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="ml-4 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 p-2 rounded-xl transition-all duration-300 transform hover:scale-110"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-xl border border-indigo-100">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full mb-6"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-xl mr-3">
                  <FileText className="text-white h-5 w-5" />
                </div>
                Instructions
              </h3>
              <textarea
                {...register('instructions')}
                rows={4}
                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 resize-none bg-white shadow-sm hover:shadow-md"
                placeholder="Enter detailed exam instructions for students..."
              />
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-r from-purple-50 to-teal-50 rounded-2xl p-6 shadow-xl border border-purple-100">
              <div className="bg-gradient-to-r from-purple-500 to-teal-500 h-1 rounded-full mb-6"></div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading || questions.length === 0}
                  className="bg-gradient-to-r from-purple-600 to-teal-500 text-white px-12 py-4 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-lg transform hover:scale-105"
                >
                  <Save className="h-6 w-6 mr-3" />
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Creating Exam...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Create Exam
                    </div>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateExam;