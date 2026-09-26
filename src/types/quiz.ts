export type QuestionType = 'single_choice' | 'multiple_choice' | 'assertion_reason' | 'numerical';

export type QuestionStatus = 
  | 'not_visited' 
  | 'not_answered' 
  | 'answered' 
  | 'marked_for_review' 
  | 'answered_marked_for_review';

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  multipleCorrectIndices?: number[];
  type: QuestionType;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
  codeSnippet?: string;
  assertion?: string;
  reason?: string;
}

export interface QuizSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Comprehensive';
  durationMinutes: number;
  negativeMarking: number; // e.g. 0.25, 0.5, 0
  marksPerQuestion: number; // e.g. 1 or 2
  passPercentage: number;
  sections: QuizSection[];
  createdAt: string;
  imageKey?: string;
  isCustom?: boolean;
}

export interface UserAnswerState {
  selectedOption: number | null;
  selectedOptions: number[];
  status: QuestionStatus;
  timeSpentSeconds: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  category: string;
  startedAt: string;
  completedAt: string;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  timeTakenSeconds: number;
  answers: Record<string, UserAnswerState>;
  topicPerformance: Record<string, { total: number; correct: number; timeSpent: number }>;
  mode: 'simulation' | 'practice';
}

export interface QuizGenerationConfig {
  topic: string;
  customNotes?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Comprehensive';
  questionCount: number;
  durationMinutes: number;
  negativeMarking: number;
  questionTypes: QuestionType[];
  mode: 'simulation' | 'practice';
}
