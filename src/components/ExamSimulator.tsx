import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Quiz, Question, QuestionStatus, UserAnswerState, QuizAttempt } from '../types/quiz';
import { ScientificCalculator } from './ScientificCalculator';
import { 
  Clock, 
  HelpCircle, 
  Flag, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Bookmark, 
  PenTool, 
  Eye, 
  AlertTriangle,
  Lightbulb,
  X,
  FileText,
  Calculator as CalcIcon,
  Scissors,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

interface ExamSimulatorProps {
  quiz: Quiz;
  mode: 'simulation' | 'practice';
  onComplete: (attempt: QuizAttempt) => void;
  onExit: () => void;
}

export const ExamSimulator: React.FC<ExamSimulatorProps> = ({
  quiz,
  mode,
  onComplete,
  onExit
}) => {
  // Flatten all questions across sections while keeping section indices
  const allQuestions = useMemo(() => {
    return quiz.sections.flatMap(section => section.questions);
  }, [quiz]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswerState>>(() => {
    const initial: Record<string, UserAnswerState> = {};
    allQuestions.forEach((q, idx) => {
      initial[q.id] = {
        selectedOption: null,
        selectedOptions: [],
        status: idx === 0 ? 'not_answered' : 'not_visited',
        timeSpentSeconds: 0
      };
    });
    return initial;
  });

  // Time remaining in seconds
  const [timeRemaining, setTimeRemaining] = useState<number>(quiz.durationMinutes * 60);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'unanswered' | 'marked'>('all');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [scratchpadNotes, setScratchpadNotes] = useState<string>('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<Record<string, number[]>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [showPracticeHint, setShowPracticeHint] = useState<boolean>(false);
  const [showPracticeInstantFeedback, setShowPracticeInstantFeedback] = useState<boolean>(false);

  const startTimeRef = useRef<number>(Date.now());
  const questionStartRef = useRef<number>(Date.now());

  const currentQuestion = allQuestions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.id] || {
    selectedOption: null,
    selectedOptions: [],
    status: 'not_answered',
    timeSpentSeconds: 0
  };

  // Find active section for current question
  const currentSection = useMemo(() => {
    let accumulated = 0;
    for (const section of quiz.sections) {
      if (currentQuestionIndex < accumulated + section.questions.length) {
        return section;
      }
      accumulated += section.questions.length;
    }
    return quiz.sections[0];
  }, [quiz, currentQuestionIndex]);

  // Main Exam Timer
  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });

      // Increment time spent on current question
      setAnswers(prev => {
        const curr = prev[currentQuestion.id];
        if (!curr) return prev;
        return {
          ...prev,
          [currentQuestion.id]: {
            ...curr,
            timeSpentSeconds: curr.timeSpentSeconds + 1
          }
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused, currentQuestion.id]);

  // Mark visited status when navigating
  const navigateToQuestion = (index: number) => {
    if (index < 0 || index >= allQuestions.length) return;

    // Reset instant practice hints
    setShowPracticeHint(false);
    setShowPracticeInstantFeedback(false);

    setAnswers(prev => {
      const targetQ = allQuestions[index];
      const targetState = prev[targetQ.id];
      if (targetState && targetState.status === 'not_visited') {
        return {
          ...prev,
          [targetQ.id]: {
            ...targetState,
            status: 'not_answered'
          }
        };
      }
      return prev;
    });

    setCurrentQuestionIndex(index);
    questionStartRef.current = Date.now();
  };

  // Option selection handler
  const handleSelectOption = (optionIndex: number) => {
    setAnswers(prev => {
      const curr = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          selectedOption: optionIndex
        }
      };
    });
  };

  // Option eliminator / strikethrough handler
  const handleToggleEliminateOption = (e: React.MouseEvent, optionIndex: number) => {
    e.stopPropagation();
    setEliminatedOptions(prev => {
      const currentList = prev[currentQuestion.id] || [];
      const updated = currentList.includes(optionIndex)
        ? currentList.filter(idx => idx !== optionIndex)
        : [...currentList, optionIndex];
      return { ...prev, [currentQuestion.id]: updated };
    });
  };

  // 50/50 Strategy Eliminator (Strikes out two incorrect distractor options)
  const handleFiftyFifty = () => {
    const wrongIndices = currentQuestion.options
      .map((_, idx) => idx)
      .filter(idx => idx !== currentQuestion.correctIndex);

    // Pick first 2 wrong options to eliminate
    const toEliminate = wrongIndices.slice(0, 2);
    setEliminatedOptions(prev => ({
      ...prev,
      [currentQuestion.id]: toEliminate
    }));
  };

  // Keyboard shortcut listener (1,2,3,4 or A,B,C,D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScratchpadOpen || isSubmitModalOpen) return;

      const key = e.key.toUpperCase();
      if (['1', '2', '3', '4'].includes(key)) {
        const optIdx = parseInt(key, 10) - 1;
        if (optIdx < currentQuestion.options.length) {
          handleSelectOption(optIdx);
        }
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        const optIdx = key.charCodeAt(0) - 65;
        if (optIdx < currentQuestion.options.length) {
          handleSelectOption(optIdx);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleSaveAndNext();
      } else if (e.key === 'ArrowLeft') {
        if (currentQuestionIndex > 0) navigateToQuestion(currentQuestionIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, currentQuestionIndex, isScratchpadOpen, isSubmitModalOpen]);

  // Save & Next
  const handleSaveAndNext = () => {
    setAnswers(prev => {
      const curr = prev[currentQuestion.id];
      const hasAnswer = curr.selectedOption !== null;
      let newStatus: QuestionStatus = curr.status;

      if (hasAnswer) {
        newStatus = 'answered';
      } else if (curr.status !== 'marked_for_review') {
        newStatus = 'not_answered';
      }

      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          status: newStatus
        }
      };
    });

    if (currentQuestionIndex < allQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    setAnswers(prev => {
      const curr = prev[currentQuestion.id];
      const hasAnswer = curr.selectedOption !== null;
      const newStatus: QuestionStatus = hasAnswer 
        ? 'answered_marked_for_review' 
        : 'marked_for_review';

      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          status: newStatus
        }
      };
    });

    if (currentQuestionIndex < allQuestions.length - 1) {
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  // Clear Response
  const handleClearResponse = () => {
    setAnswers(prev => {
      const curr = prev[currentQuestion.id];
      return {
        ...prev,
        [currentQuestion.id]: {
          ...curr,
          selectedOption: null,
          status: curr.status === 'answered_marked_for_review' ? 'marked_for_review' : 'not_answered'
        }
      };
    });
    setShowPracticeInstantFeedback(false);
  };

  // Calculate palette status counts
  const paletteStats = useMemo(() => {
    let answered = 0;
    let notAnswered = 0;
    let marked = 0;
    let answeredMarked = 0;
    let notVisited = 0;

    Object.values(answers).forEach(ans => {
      if (ans.status === 'answered') answered++;
      else if (ans.status === 'not_answered') notAnswered++;
      else if (ans.status === 'marked_for_review') marked++;
      else if (ans.status === 'answered_marked_for_review') answeredMarked++;
      else notVisited++;
    });

    return { answered, notAnswered, marked, answeredMarked, notVisited };
  }, [answers]);

  // Submit and compute results
  const handleSubmitExam = () => {
    setIsSubmitModalOpen(false);

    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;
    const topicStats: Record<string, { total: number; correct: number; timeSpent: number }> = {};

    allQuestions.forEach(q => {
      const userAns = answers[q.id];
      const topic = q.topic || 'General';

      if (!topicStats[topic]) {
        topicStats[topic] = { total: 0, correct: 0, timeSpent: 0 };
      }
      topicStats[topic].total += 1;
      topicStats[topic].timeSpent += userAns?.timeSpentSeconds || 0;

      if (userAns && userAns.selectedOption !== null) {
        if (userAns.selectedOption === q.correctIndex) {
          correctCount++;
          topicStats[topic].correct += 1;
        } else {
          incorrectCount++;
        }
      } else {
        unansweredCount++;
      }
    });

    // Score calculation with negative marking
    const marksPerQ = quiz.marksPerQuestion || 1;
    const negMarksPerWrong = quiz.negativeMarking || 0;
    const rawScore = (correctCount * marksPerQ) - (incorrectCount * negMarksPerWrong);
    const score = Math.max(0, parseFloat(rawScore.toFixed(2)));
    const maxScore = allQuestions.length * marksPerQ;
    const percentage = Math.round((score / maxScore) * 100);
    const passed = percentage >= quiz.passPercentage;
    const timeTakenSeconds = (quiz.durationMinutes * 60) - timeRemaining;

    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quiz.id,
      quizTitle: quiz.title,
      category: quiz.category,
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      totalQuestions: allQuestions.length,
      answeredCount: correctCount + incorrectCount,
      correctCount,
      incorrectCount,
      unansweredCount,
      score,
      maxScore,
      percentage,
      passed,
      timeTakenSeconds,
      answers,
      topicPerformance: topicStats,
      mode
    };

    onComplete(attempt);
  };

  // Format time remaining
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 180; // less than 3 minutes

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Standardized Exam Navigation Bar */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3 truncate">
            <span className="font-bold text-base tracking-tight text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {quiz.title}
            </span>
            <span className="hidden md:inline text-xs text-slate-400">
              · {mode === 'simulation' ? 'Timed CBT Exam' : 'Practice Tutor Mode'}
            </span>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Live Countdown Timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-sm font-bold tabular-nums transition-colors ${
              isLowTime ? 'bg-red-950 text-red-400 border border-red-800 animate-pulse' : 'bg-slate-800 text-indigo-300'
            }`}>
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{formatTime(timeRemaining)}</span>
              {mode === 'practice' && (
                <button
                  onClick={() => setIsTimerPaused(!isTimerPaused)}
                  className="ml-1 text-[10px] text-slate-400 hover:text-white underline"
                >
                  {isTimerPaused ? 'Resume' : 'Pause'}
                </button>
              )}
            </div>

            {/* Scientific Calculator Button */}
            <button
              onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
              title="Open Scientific Calculator"
              className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded transition-colors ${
                isCalculatorOpen 
                  ? 'bg-emerald-600 text-white font-bold' 
                  : 'text-slate-300 bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <CalcIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Calculator</span>
            </button>

            {/* Accessibility Font Size Toggle */}
            <button
              onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
              title="Toggle font size"
              className="hidden sm:inline-flex px-2 py-1 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              {fontSize === 'normal' ? 'A+' : 'A-'}
            </button>

            {/* Scratchpad Button */}
            <button
              onClick={() => setIsScratchpadOpen(true)}
              title="Open Scratchpad"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scratchpad</span>
            </button>

            {/* Submit Exam Button */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
            >
              Submit Exam
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        {quiz.sections.length > 1 && (
          <div className="bg-slate-950 border-t border-slate-800/80 px-4 sm:px-6 py-1.5 flex items-center gap-4 overflow-x-auto text-xs">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Sections:</span>
            {quiz.sections.map((sec, sIdx) => {
              // Calculate start index of this section
              let secStart = 0;
              for (let i = 0; i < sIdx; i++) {
                secStart += quiz.sections[i].questions.length;
              }
              const isSecActive = currentSection.id === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => navigateToQuestion(secStart)}
                  className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${
                    isSecActive 
                      ? 'bg-indigo-600 text-white font-semibold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sec.title} ({sec.questions.length}Q)
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Examination Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Main Question Stage (8 cols on lg) */}
        <main className="lg:col-span-8 flex flex-col justify-between bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden min-h-[580px]">
          {/* Question Meta Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm text-slate-900 font-mono tabular-nums">
                Question {currentQuestionIndex + 1} of {allQuestions.length}
              </span>
              <span className="text-slate-300">|</span>
              <span className="text-xs text-slate-600 font-medium">
                {currentQuestion.topic}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums">
              <span className="text-emerald-700 font-medium">+{quiz.marksPerQuestion || 1} mark</span>
              {quiz.negativeMarking > 0 && (
                <span className="text-red-600 font-medium">-{quiz.negativeMarking} neg</span>
              )}
            </div>
          </div>

          {/* Question Body */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-6">
            {/* Assertion & Reason Special Layout */}
            {currentQuestion.assertion && currentQuestion.reason ? (
              <div className="space-y-4">
                <p className={`${fontSize === 'large' ? 'text-lg' : 'text-base'} font-semibold text-slate-900 leading-relaxed`}>
                  {currentQuestion.text}
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">Assertion (A):</span>{' '}
                    <span className="text-slate-700">{currentQuestion.assertion}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Reason (R):</span>{' '}
                    <span className="text-slate-700">{currentQuestion.reason}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className={`${fontSize === 'large' ? 'text-lg' : 'text-base'} font-semibold text-slate-900 leading-relaxed`}>
                {currentQuestion.text}
              </p>
            )}

            {/* Code Snippet Box (if provided) */}
            {currentQuestion.codeSnippet && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto shadow-inner">
                <pre><code>{currentQuestion.codeSnippet}</code></pre>
              </div>
            )}

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((option, optIdx) => {
                const isSelected = currentAnswer.selectedOption === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-600 shadow-sm text-slate-950 font-medium'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {letter}
                    </div>
                    <span className={`${fontSize === 'large' ? 'text-base' : 'text-sm'} leading-relaxed pt-0.5`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Practice Mode Socratic Hint Drawer */}
            {mode === 'practice' && currentQuestion.hint && (
              <div className="pt-2">
                <button
                  onClick={() => setShowPracticeHint(!showPracticeHint)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span>{showPracticeHint ? 'Hide Socratic Hint' : 'Need a hint? (Practice Mode)'}</span>
                </button>
                {showPracticeHint && (
                  <div className="mt-2 p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
                    <span className="font-semibold">Tutor Hint:</span> {currentQuestion.hint}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Action Control Bar */}
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleClearResponse}
                disabled={currentAnswer.selectedOption === null}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMarkForReviewAndNext}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-600" />
                <span>Mark for Review & Next</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndNext}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                <span>Save & Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        {/* Right / Question Palette & Status Sidebar (4 cols on lg) */}
        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
            {/* Palette Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Question Palette
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {paletteStats.answered + paletteStats.answeredMarked} / {allQuestions.length} Done
              </span>
            </div>

            {/* Standardized CBT Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">
                  {paletteStats.answered}
                </span>
                <span>Answered</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-mono flex items-center justify-center text-[10px] font-bold">
                  {paletteStats.notAnswered}
                </span>
                <span>Not Answered</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-600 text-white font-mono flex items-center justify-center text-[10px] font-bold">
                  {paletteStats.marked}
                </span>
                <span>Marked</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-purple-700 text-white font-mono flex items-center justify-center text-[10px] font-bold border-2 border-emerald-400">
                  {paletteStats.answeredMarked}
                </span>
                <span>Ans & Marked</span>
              </div>

              <div className="flex items-center gap-2 col-span-2 pt-1 border-t border-slate-100">
                <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-600 font-mono flex items-center justify-center text-[10px]">
                  {paletteStats.notVisited}
                </span>
                <span>Not Visited</span>
              </div>
            </div>

            {/* Filter Tabs for Palette */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setPaletteFilter('all')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  paletteFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({allQuestions.length})
              </button>
              <button
                type="button"
                onClick={() => setPaletteFilter('unanswered')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  paletteFilter === 'unanswered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Unanswered ({paletteStats.notAnswered + paletteStats.notVisited})
              </button>
              <button
                type="button"
                onClick={() => setPaletteFilter('marked')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  paletteFilter === 'marked' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Marked ({paletteStats.marked + paletteStats.answeredMarked})
              </button>
            </div>

            {/* Question Buttons Matrix */}
            <div className="grid grid-cols-5 gap-2 max-h-[280px] overflow-y-auto p-1">
              {allQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const isCurrent = currentQuestionIndex === idx;

                // Filter logic
                if (paletteFilter === 'unanswered' && (ans.status === 'answered' || ans.status === 'answered_marked_for_review')) {
                  return null;
                }
                if (paletteFilter === 'marked' && (ans.status !== 'marked_for_review' && ans.status !== 'answered_marked_for_review')) {
                  return null;
                }

                // Determine styling based on CBT question status
                let statusClasses = 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200';
                if (ans.status === 'answered') {
                  statusClasses = 'bg-emerald-600 text-white border-emerald-700 shadow-xs';
                } else if (ans.status === 'not_answered') {
                  statusClasses = 'bg-amber-500 text-white border-amber-600 shadow-xs';
                } else if (ans.status === 'marked_for_review') {
                  statusClasses = 'bg-purple-600 text-white border-purple-700 shadow-xs';
                } else if (ans.status === 'answered_marked_for_review') {
                  statusClasses = 'bg-purple-700 text-white border-2 border-emerald-400 shadow-xs';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => navigateToQuestion(idx)}
                    className={`h-9 rounded-lg font-mono text-xs font-bold transition-all relative flex items-center justify-center ${statusClasses} ${
                      isCurrent ? 'ring-2 ring-indigo-600 ring-offset-2 scale-105 z-10' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Quick Summary Box */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Section: {currentSection.title.split(':')[0]}</span>
              <button
                onClick={() => setIsSubmitModalOpen(true)}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Finish & Score →
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* Persistent Scratchpad Drawer */}
      {isScratchpadOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <PenTool className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Exam Scratchpad</h3>
            </div>
            <button
              onClick={() => setIsScratchpadOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-700 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <p className="text-[11px] text-slate-500 mb-2">
              Use this area for calculations, scratch logic, or code brainstorming during your test.
            </p>
            <textarea
              value={scratchpadNotes}
              onChange={(e) => setScratchpadNotes(e.target.value)}
              placeholder="e.g. Q4 calculations:
P(A|B) = P(B|A)*P(A) / P(B)
99/5094 ≈ 0.0194..."
              className="flex-1 w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
            />
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-6 animate-in zoom-in-95 duration-150 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Submit Assessment?</h3>
                <p className="text-xs text-slate-500">Review your question summary before finalizing.</p>
              </div>
            </div>

            {/* Summary metrics */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Total Questions:</span>
                <span className="font-bold text-slate-900 font-mono tabular-nums">{allQuestions.length}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>Answered Questions:</span>
                <span className="font-bold font-mono tabular-nums">{paletteStats.answered + paletteStats.answeredMarked}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Unanswered / Not Visited:</span>
                <span className="font-bold font-mono tabular-nums">{paletteStats.notAnswered + paletteStats.notVisited}</span>
              </div>
              <div className="flex justify-between text-purple-700">
                <span>Marked for Review:</span>
                <span className="font-bold font-mono tabular-nums">{paletteStats.marked + paletteStats.answeredMarked}</span>
              </div>
              <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                <span>Time Remaining:</span>
                <span className="font-mono tabular-nums font-semibold">{formatTime(timeRemaining)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Return to Exam
              </button>
              <button
                type="button"
                onClick={handleSubmitExam}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
              >
                Confirm & View Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
