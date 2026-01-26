import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  TextField,
  Typography,
  Box,
  Paper,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputAdornment,
  Alert,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { IndianRupee } from 'lucide-react';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AnimatedContainer } from '../../components/ui/AnimatedContainer';
import { ModernButton } from '../../components/ui/ModernButton';
import { ModernCard } from '../../components/ui/ModernCard';
import { motion } from 'framer-motion';
import { apiService } from '../../services/apiService';
import toast from 'react-hot-toast';

const EditCourse: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    visibility: 'PRIVATE',
    pricing: 'FREE',
    price: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [currentAllowedEmails, setCurrentAllowedEmails] = useState<string[]>([]);
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [unenrollLoading, setUnenrollLoading] = useState(false);
  const [pendingUnenrollAll, setPendingUnenrollAll] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
      fetchEnrollments();
    }
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setCourseLoading(true);
      const course = await apiService.getCourse(parseInt(courseId!));

      setFormData({
        name: course.name || '',
        description: course.description || '',
        visibility: course.visibility || 'PRIVATE',
        pricing: course.pricing || 'FREE',
        price: course.price ? course.price.toString() : '',
      });

      if (course.allowedEmails) {
        setCurrentAllowedEmails(course.allowedEmails);
        setStudentCount(course.allowedEmails.length);
      }

    } catch (error: any) {
      toast.error('Failed to load course data');
      console.error('Error fetching course:', error);
      navigate('/instructor');
    } finally {
      setCourseLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const enrollments = await apiService.getCourseEnrollments(parseInt(courseId!), { page: 0, size: 100 });
      console.log('Enrollments API response:', enrollments);
      console.log('Enrollments content:', enrollments.enrollments);
      console.log('Total items:', enrollments.totalItems);
      setEnrolledStudents(enrollments.enrollments || []);
      setEnrollmentCount(enrollments.totalItems || 0);
    } catch (error: any) {
      console.error('Error fetching enrollments:', error);
      // Don't show error toast as this is not critical
    }
  };

  const handleMarkUnenrollAll = () => {
    if (enrollmentCount === 0) {
      toast.error('No students are currently enrolled in this course');
      return;
    }

    const confirmMessage = `Mark all ${enrollmentCount} students for unenrollment? This will take effect when you click "Update Course".`;

    if (window.confirm(confirmMessage)) {
      setPendingUnenrollAll(true);
      toast.success(`Marked ${enrollmentCount} students for unenrollment. Click "Update Course" to apply changes.`, { duration: 4000 });
    }
  };

  const handleCancelUnenrollAll = () => {
    setPendingUnenrollAll(false);
    toast.success('Cancelled unenrollment of all students');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = (selectedFile: File) => {
    setFile(selectedFile);
    setErrors(prev => ({ ...prev, file: '' }));

    // Process CSV file to count students
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content
        .split(/\r\n|\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const headerRemoved =
        lines.length > 1 && lines[0].includes('@') === false
          ? lines.slice(1)
          : lines;

      setStudentCount(headerRemoved.length);
    };
    reader.readAsText(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        handleFileChange(droppedFile);
      } else {
        setErrors(prev => ({ ...prev, file: 'Please upload a CSV file' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }

    if (formData.pricing === 'PAID') {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0 for paid courses';
      }
    }

    if (formData.visibility === 'PRIVATE' && formData.pricing === 'PAID') {
      newErrors.pricing = 'Private courses cannot be paid courses';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      // First, update the course
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('visibility', formData.visibility);
      submitData.append('pricing', formData.pricing);

      if (formData.pricing === 'PAID' && formData.price) {
        submitData.append('price', formData.price);
      }

      if (file && formData.visibility === 'PRIVATE') {
        submitData.append('file', file);
      }

      const response = await apiService.updateCourse(parseInt(courseId!), submitData);

      toast.success('Course updated successfully!');

      // Show auto-enrollment message if applicable
      if (response.newAutoEnrolledStudents && response.newAutoEnrolledStudents > 0) {
        toast.success(`${response.enrollmentMessage}`, { duration: 5000 });
      }

      // Only after successful course update, handle unenrollment if pending
      if (pendingUnenrollAll) {
        try {
          const unenrollResponse = await apiService.unenrollAllStudents(parseInt(courseId!));
          toast.success(`Successfully unenrolled ${unenrollResponse.unenrolledCount} students from the course`, { duration: 4000 });
          setPendingUnenrollAll(false);
          setEnrollmentCount(0);
          setEnrolledStudents([]);
        } catch (unenrollError: any) {
          let errorMessage = 'Failed to unenroll students';
          if (unenrollError?.response?.data) {
            const errorData = unenrollError.response.data;
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (errorData?.error) {
              errorMessage = errorData.error;
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            }
          }
          toast.error(errorMessage, { duration: 6000 });
          console.error('Error unenrolling students:', unenrollError);
          // Don't return here - course was updated successfully
        }
      }

      // Navigate back to dashboard - this should trigger a refresh of the dashboard data
      navigate('/instructor', { replace: true });

    } catch (err: any) {
      // Better error message extraction for course update failures
      let errorMessage = 'Failed to update course';

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
      }

      toast.error(errorMessage, { duration: 6000 });
      setErrors({ submit: errorMessage });
      console.error('Error updating course:', err);
    } finally {
      setLoading(false);
    }
  };

  if (courseLoading) {
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <AnimatedContainer variant="fadeIn" className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate('/instructor')}
                className="bg-white border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 py-2 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-200"
              >
                <ArrowBackIcon className="mr-2" />
                Back to Dashboard
              </button>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent">
                <Typography variant="h3" className="font-bold mb-3">
                  Edit Course
                </Typography>
              </div>
              <Typography variant="h6" className="text-gray-600 max-w-2xl mx-auto">
                Update your course settings, manage student access, and modify course details
              </Typography>
            </div>
          </motion.div>

          <ModernCard variant="elevated" className="overflow-hidden bg-white/80 backdrop-blur-sm border border-white/20 shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 h-2"></div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Course Basic Information */}
              <AnimatedContainer variant="slideUp" delay={0.1}>
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <Typography variant="h6" className="flex items-center font-bold text-gray-800 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-xl mr-3">
                      <DescriptionIcon className="text-white" />
                    </div>
                    Course Information
                  </Typography>
                  <Box className="space-y-6 mt-4">

                    {/* Course Name */}
                    <TextField
                      label="Course Name"
                      placeholder="Enter an engaging course title"
                      variant="outlined"
                      fullWidth
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      error={!!errors.name}
                      helperText={errors.name}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px',
                          },
                        },
                      }}
                    />

                    {/* Course Description */}
                    <TextField
                      label="Course Description"
                      placeholder="Describe what students will learn in this course"
                      variant="outlined"
                      fullWidth
                      multiline
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      error={!!errors.description}
                      helperText={errors.description}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          '&:hover fieldset': {
                            borderColor: '#6366f1',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: '2px',
                          },
                        },
                      }}
                    />
                  </Box>
                </div>
              </AnimatedContainer>

              <Divider className="my-8 border-gray-200" />

              {/* Course Visibility */}
              <AnimatedContainer variant="slideUp" delay={0.2}>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <Typography variant="h6" className="flex items-center font-bold text-gray-800 mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-xl mr-3">
                      <VisibilityIcon className="text-white" />
                    </div>
                    Course Visibility
                  </Typography>
                  <Box className="space-y-4 mt-4">

                    <FormControl component="fieldset" error={!!errors.visibility}>
                      <RadioGroup
                        value={formData.visibility}
                        onChange={(e) => {
                          handleInputChange('visibility', e.target.value);
                          // Reset pricing to FREE if switching to PRIVATE
                          if (e.target.value === 'PRIVATE') {
                            handleInputChange('pricing', 'FREE');
                            handleInputChange('price', '');
                          }
                        }}
                        className="space-y-3"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`border-2 rounded-xl p-4 transition-all duration-300 ${formData.visibility === 'PRIVATE'
                            ? 'border-purple-400 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                            }`}
                        >
                          <FormControlLabel
                            value="PRIVATE"
                            control={<Radio color="primary" />}
                            label={
                              <Box>
                                <Typography variant="subtitle1" className="font-semibold text-gray-800">
                                  🔒 Private Course
                                </Typography>
                                <Typography variant="body2" className="text-gray-600">
                                  Only students with emails in your CSV file can access this course
                                </Typography>
                              </Box>
                            }
                          />
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`border-2 rounded-xl p-4 transition-all duration-300 ${formData.visibility === 'PUBLIC'
                            ? 'border-purple-400 bg-purple-50 shadow-lg'
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:shadow-md'
                            }`}
                        >
                          <FormControlLabel
                            value="PUBLIC"
                            control={<Radio color="primary" />}
                            label={
                              <Box>
                                <Typography variant="subtitle1" className="font-semibold text-gray-800">
                                  🌐 Public Course
                                </Typography>
                                <Typography variant="body2" className="text-gray-600">
                                  Visible to all registered students in the portal
                                </Typography>
                              </Box>
                            }
                          />
                        </motion.div>
                      </RadioGroup>
                    </FormControl>
                  </Box>
                </div>
              </AnimatedContainer>

              {/* Course Pricing - Only show for PUBLIC courses */}
              <AnimatedContainer variant="slideUp" delay={0.3}>
                {formData.visibility === 'PUBLIC' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                      <Typography variant="h6" className="flex items-center font-bold text-gray-800 mb-6">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-xl mr-3">
                          <IndianRupee className="text-white h-6 w-6" />
                        </div>
                        Course Pricing
                      </Typography>
                      <Box className="space-y-4  mt-4">

                        <FormControl component="fieldset" error={!!errors.pricing}>
                          <RadioGroup
                            value={formData.pricing}
                            onChange={(e) => {
                              handleInputChange('pricing', e.target.value);
                              if (e.target.value === 'FREE') {
                                handleInputChange('price', '');
                              }
                            }}
                            className="space-y-3"
                          >
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`border-2 rounded-xl p-4 transition-all duration-300 ${formData.pricing === 'FREE'
                                ? 'border-green-400 bg-green-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                              <FormControlLabel
                                value="FREE"
                                control={<Radio color="primary" />}
                                label={
                                  <Box className="flex items-center">
                                    <Box className="flex-1">
                                      <Typography variant="subtitle1" className="font-semibold text-gray-800">
                                        🆓 Free Course
                                      </Typography>
                                      <Typography variant="body2" className="text-gray-600">
                                        Students can enroll and access content without payment
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label="Free"
                                      sx={{
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                      size="small"
                                    />
                                  </Box>
                                }
                              />
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`border-2 rounded-xl p-4 transition-all duration-300 ${formData.pricing === 'PAID'
                                ? 'border-green-400 bg-green-50 shadow-lg'
                                : 'border-gray-200 bg-white hover:border-green-300 hover:shadow-md'
                                }`}
                            >
                              <FormControlLabel
                                value="PAID"
                                control={<Radio color="primary" />}
                                label={
                                  <Box className="flex items-center">
                                    <Box className="flex-1">
                                      <Typography variant="subtitle1" className="font-semibold text-gray-800">
                                        💰 Paid Course
                                      </Typography>
                                      <Typography variant="body2" className="text-gray-600">
                                        Students must purchase the course to access content
                                      </Typography>
                                    </Box>
                                    <Chip
                                      label="Premium"
                                      sx={{
                                        backgroundColor: '#f59e0b',
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                      size="small"
                                    />
                                  </Box>
                                }
                              />
                            </motion.div>
                          </RadioGroup>
                        </FormControl>

                        {/* Price Input - Only show for PAID courses */}
                        {formData.pricing === 'PAID' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4"
                          >
                            <TextField
                              label="Course Price"
                              placeholder="Enter price in INR"
                              variant="outlined"
                              type="number"
                              value={formData.price}
                              onChange={(e) => handleInputChange('price', e.target.value)}
                              error={!!errors.price}
                              helperText={errors.price || 'Price will be charged in Indian Rupees (₹)'}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              sx={{
                                maxWidth: 300,
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'white',
                                  borderRadius: '12px',
                                  '&:hover fieldset': {
                                    borderColor: '#10b981',
                                  },
                                  '&.Mui-focused fieldset': {
                                    borderColor: '#10b981',
                                    borderWidth: '2px',
                                  },
                                },
                              }}
                            />
                          </motion.div>
                        )}
                      </Box>
                    </div>
                  </motion.div>
                )}
              </AnimatedContainer>

              {/* File Upload - Only show for PRIVATE courses */}
              <AnimatedContainer variant="slideUp" delay={0.4}>
                {formData.visibility === 'PRIVATE' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                      <Typography variant="h6" className="flex items-center font-bold text-gray-800 mb-6">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-2 rounded-xl mr-3">
                          <CloudUploadIcon className="text-white" />
                        </div>
                        Student Email List
                      </Typography>
                      <Box className="space-y-4 mt-4">

                        {/* Current Allowed Emails Display */}
                        {currentAllowedEmails.length > 0 && !file && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-md"
                          >
                            <Typography variant="body2" className="font-bold text-blue-800 mb-2 flex items-center">
                              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">📧</span>
                              Current allowed emails: {currentAllowedEmails.length} students
                            </Typography>
                            <Typography variant="body2" className="text-blue-700 ml-8">
                              Upload a new CSV file to update the student list, or keep the current list unchanged.
                            </Typography>
                          </motion.div>
                        )}

                        {/* Drag and Drop Area */}
                        <motion.div
                          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${dragActive
                            ? 'border-cyan-400 bg-cyan-50 shadow-lg'
                            : errors.file
                              ? 'border-red-300 bg-red-50'
                              : 'border-gray-300 hover:border-cyan-300 hover:bg-white hover:shadow-md'
                            }`}
                          onDragEnter={handleDrag}
                          onDragLeave={handleDrag}
                          onDragOver={handleDrag}
                          onDrop={handleDrop}
                          whileHover={{ scale: 1.01 }}
                        >
                          <div className="bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <CloudUploadIcon className="h-10 w-10 text-cyan-600" />
                          </div>
                          <Typography variant="h6" className="mb-2 font-bold text-gray-800">
                            {dragActive ? '📁 Drop your CSV file here' : '📤 Update Student Emails (Optional)'}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600 mb-6">
                            Upload a new CSV file to update the student list, or leave empty to keep current emails
                          </Typography>

                          <button
                            type="button"
                            onClick={() => document.getElementById('file-input')?.click()}
                            className="bg-white border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50 py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-200"
                          >
                            <CloudUploadIcon className="mr-2 h-5 w-5" />
                            Choose New CSV File
                          </button>

                          <input
                            id="file-input"
                            type="file"
                            accept=".csv"
                            hidden
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleFileChange(e.target.files[0]);
                              }
                            }}
                          />
                        </motion.div>

                        {/* File Info */}
                        {file && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 shadow-md"
                          >
                            <Typography variant="body2" className="font-bold text-green-800 flex items-center">
                              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">✓</span>
                              New file selected: {file.name}
                            </Typography>
                            {studentCount !== null && (
                              <Typography variant="body2" className="text-green-700 mt-2 ml-8">
                                🎓 {studentCount} student{studentCount !== 1 ? 's' : ''} found in new CSV
                              </Typography>
                            )}
                          </motion.div>
                        )}

                        {errors.file && (
                          <Alert severity="error" className="mt-2 rounded-xl">
                            {errors.file}
                          </Alert>
                        )}
                      </Box>
                    </div>
                  </motion.div>
                )}
              </AnimatedContainer>

              {/* Enrollment Management Section */}
              <AnimatedContainer variant="slideUp" delay={0.5}>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                  <Typography variant="h6" className="flex items-center font-bold text-gray-800 mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-xl mr-3">
                      <DescriptionIcon className="text-white" />
                    </div>
                    Enrollment Management
                  </Typography>

                  <div className="bg-white rounded-xl p-6 shadow-md border border-orange-200 mt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Typography variant="subtitle1" className="font-bold text-gray-900 mb-1">
                          Currently Enrolled Students
                        </Typography>
                        <Typography variant="body2" className="text-gray-600">
                          {enrollmentCount === 0
                            ? '👥 No students are currently enrolled in this course'
                            : `👥 ${enrollmentCount} student${enrollmentCount !== 1 ? 's' : ''} enrolled in this course`
                          }
                        </Typography>
                      </div>

                      {enrollmentCount > 0 && !pendingUnenrollAll && (
                        <button
                          onClick={handleMarkUnenrollAll}
                          className="bg-red-50 border-2 border-red-300 text-red-700 hover:bg-red-100 py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-200"
                        >
                          Mark for Unenrollment ({enrollmentCount})
                        </button>
                      )}

                      {pendingUnenrollAll && (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleCancelUnenrollAll}
                            className="bg-gray-50 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-2 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
                          >
                            Cancel
                          </button>
                          <Chip
                            label={`${enrollmentCount} students marked for unenrollment`}
                            sx={{
                              backgroundColor: '#f59e0b',
                              color: 'white',
                              fontWeight: 'bold',
                              border: '2px solid #f59e0b'
                            }}
                            variant="outlined"
                          />
                        </div>
                      )}
                    </div>

                    {enrollmentCount > 0 && !pendingUnenrollAll && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl">
                        <Typography variant="body2" className="text-yellow-800">
                          <strong>⚠️ Note:</strong> Marking students for unenrollment will prepare them to be removed when you click "Update Course".
                          This action cannot be undone and is useful when you need to delete the course or reset enrollments.
                        </Typography>
                      </div>
                    )}

                    {pendingUnenrollAll && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl">
                        <Typography variant="body2" className="text-orange-800">
                          <strong>🔄 Pending Action:</strong> All {enrollmentCount} students are marked for unenrollment.
                          Click "Update Course" to apply this change, or "Cancel" to keep them enrolled.
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </AnimatedContainer>

              {/* Error Display */}
              {errors.submit && (
                <Alert severity="error" className="mt-4 rounded-xl border-l-4 border-red-500">
                  {errors.submit}
                </Alert>
              )}

              {/* Submit Button */}
              <AnimatedContainer variant="slideUp" delay={0.6}>
                <div className="pt-8 bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 -mx-2">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => navigate('/instructor')}
                      disabled={loading}
                      className="flex-1 bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50 py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-teal-500 text-white py-4 px-6 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-200"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Updating Course...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <span className="mr-2">🔄</span>
                          Update Course
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              </AnimatedContainer>
            </form>
          </ModernCard>
        </AnimatedContainer>
      </div>
    </DashboardLayout>
  );
};

export default EditCourse;