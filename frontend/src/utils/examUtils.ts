/**
 * Utility functions for exam management
 */

export interface Question {
  question: string;
  type: 'mcq' | 'multiple';
  options: { option: string }[];
  correctOptions: number[];
  marks: number;
}

export interface ExamData {
  exam_id?: number;
  title: string;
  description: string;
  duration: number;
  totalMarks: number;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  status: string;
  instructions?: string;
  isactive?: boolean;
  course?: any;
  questions: Question[];
}

/**
 * Validates a question object
 */
export function validateQuestion(question: Question): string[] {
  const errors: string[] = [];
  
  if (!question || typeof question !== 'object') {
    errors.push('Invalid question object');
    return errors;
  }
  
  if (!question.question || !question.question.trim()) {
    errors.push('Question text is required');
  }
  
  if (!question.options || !Array.isArray(question.options)) {
    errors.push('Question options are required');
    return errors;
  }
  
  if (question.options.length < 2) {
    errors.push('At least 2 options are required');
  }
  
  if (question.options.some(opt => !opt || !opt.option || !opt.option.trim())) {
    errors.push('All options must have text');
  }
  
  if (!question.correctOptions || !Array.isArray(question.correctOptions) || question.correctOptions.length === 0) {
    errors.push('At least one correct option must be selected');
  }
  
  if (question.type === 'mcq' && question.correctOptions && question.correctOptions.length > 1) {
    errors.push('MCQ questions can only have one correct option');
  }
  
  if (!question.marks || question.marks < 1) {
    errors.push('Question must have at least 1 mark');
  }
  
  return errors;
}

/**
 * Validates an entire exam
 */
export function validateExam(exam: ExamData): string[] {
  const errors: string[] = [];
  
  if (!exam || typeof exam !== 'object') {
    errors.push('Invalid exam data');
    return errors;
  }
  
  if (!exam.title || !exam.title.trim()) {
    errors.push('Exam title is required');
  }
  
  if (!exam.description || !exam.description.trim()) {
    errors.push('Exam description is required');
  }
  
  if (!exam.duration || exam.duration < 1) {
    errors.push('Exam duration must be at least 1 minute');
  }
  
  if (!exam.questions || !Array.isArray(exam.questions)) {
    errors.push('Exam questions are required');
    return errors;
  }
  
  if (exam.questions.length === 0) {
    errors.push('Exam must have at least one question');
  }
  
  // Validate each question
  exam.questions.forEach((question, index) => {
    const questionErrors = validateQuestion(question);
    questionErrors.forEach(error => {
      errors.push(`Question ${index + 1}: ${error}`);
    });
  });
  
  // Check if total marks match
  const calculatedMarks = exam.questions.reduce((sum, q) => sum + (q?.marks || 0), 0);
  if (exam.totalMarks && calculatedMarks !== exam.totalMarks) {
    errors.push(`Total marks mismatch: Expected ${exam.totalMarks}, but questions total ${calculatedMarks}`);
  }
  
  return errors;
}

/**
 * Creates a new empty question
 */
export function createEmptyQuestion(): Question {
  return {
    question: '',
    type: 'mcq',
    options: [
      { option: 'Option A' },
      { option: 'Option B' },
      { option: 'Option C' },
      { option: 'Option D' }
    ],
    correctOptions: [],
    marks: 1
  };
}

/**
 * Duplicates a question with a modified title
 */
export function duplicateQuestion(question: Question): Question {
  return {
    ...question,
    question: `${question.question} (Copy)`,
    options: question.options.map(opt => ({ ...opt })),
    correctOptions: [...question.correctOptions]
  };
}

/**
 * Calculates total marks for an exam
 */
export function calculateTotalMarks(questions: Question[]): number {
  if (!questions || !Array.isArray(questions)) {
    return 0;
  }
  return questions.reduce((sum, question) => sum + (question?.marks || 0), 0);
}

/**
 * Formats question type for display
 */
export function formatQuestionType(type: string): string {
  switch (type) {
    case 'mcq':
      return 'Single Choice';
    case 'multiple':
      return 'Multiple Choice';
    default:
      return type;
  }
}

/**
 * Exports exam data to JSON for backup
 */
export function exportExamToJSON(exam: ExamData): string {
  return JSON.stringify(exam, null, 2);
}

/**
 * Imports exam data from JSON
 */
export function importExamFromJSON(jsonString: string): ExamData {
  try {
    const data = JSON.parse(jsonString);
    // Validate the structure
    if (!data.title || !data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid exam data structure');
    }
    return data;
  } catch (error) {
    throw new Error('Failed to parse exam data: ' + (error as Error).message);
  }
}