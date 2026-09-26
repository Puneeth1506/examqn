import React, { useState } from 'react';
import { Quiz, QuizAttempt, Question } from '../types/quiz';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Clock, 
  RotateCcw, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  HelpCircle, 
  BookOpen, 
  Loader2, 
  TrendingUp,
  Brain
} from 'lucide-react';

interface TestResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onRetakeFull: () => void;
  onRetakeMissedOnly: (missedQuestions: Question[]) => void;
  onDrillWeakAreas: (weakTopics: string[]) => void;
  onReturnToHub: () => void;
}

export const TestResults: React.FC<TestResultsProps> = ({
  quiz,
  attempt,
  onRetakeFull,
  onRetakeMissedOnly,
  onDrillWeakAreas,
  onReturnToHub
}) => {
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct' | 'marked'>('all');
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);

  const allQuestions = quiz.sections.flatMap(s => s.questions);

  // Identify missed questions
  const missedQuestions = allQuestions.filter(q => {
    const userAns = attempt.answers[q.id];
    return userAns && userAns.selectedOption !== null && userAns.selectedOption !== q.correctIndex;
  });

  // Calculate weak topics (< 60% accuracy)
  const weakTopics = Object.entries(attempt.topicPerformance)
    .filter(([_, stats]) => stats.total > 0 && (stats.correct / stats.total) < 0.6)
    .map(([topic]) => topic);

  // Filter questions for the review list
  const filteredQuestions = allQuestions.filter(q => {
    const userAns = attempt.answers[q.id];
    const isCorrect = userAns && userAns.selectedOption === q.correctIndex;
    const isIncorrect = userAns && userAns.selectedOption !== null && userAns.selectedOption !== q.correctIndex;
    const isMarked = userAns && (userAns.status === 'marked_for_review' || userAns.status === 'answered_marked_for_review');

    if (reviewFilter === 'incorrect') return isIncorrect;
    if (reviewFilter === 'correct') return isCorrect;
    if (reviewFilter === 'marked') return isMarked;
    return true;
  });

  // Fetch AI deep explanation for a question
  const handleExplainDeeper = async (q: Question) => {
    if (aiExplanations[q.id]) return;

    setLoadingAiId(q.id);
    const userAns = attempt.answers[q.id];

    try {
      const response = await fetch('/api/explain-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          userSelectedIndex: userAns?.selectedOption,
          topic: q.topic,
          explanation: q.explanation
        })
      });

      if (!response.ok) throw new Error('Failed to load AI explanation');
      const data = await response.json();
      setAiExplanations(prev => ({
        ...prev,
        [q.id]: data.deepExplanation || 'Concept review loaded.'
      }));
    } catch (err) {
      console.error(err);
      setAiExplanations(prev => ({
        ...prev,
        [q.id]: 'AI tutor connection failed. Please refer to standard solution.'
      }));
    } finally {
      setLoadingAiId(null);
    }
  };

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReturnToHub}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Exam Library</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onRetakeFull}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake Full Test</span>
          </button>

          {missedQuestions.length > 0 && (
            <button
              onClick={() => onRetakeMissedOnly(missedQuestions)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Drill Missed Only ({missedQuestions.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold ${
                attempt.passed 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {attempt.passed ? 'QUALIFIED / PASSED' : 'NEEDS PRACTICE'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-500 font-medium">
                Pass mark: {quiz.passPercentage}%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Completed on {new Date(attempt.completedAt).toLocaleDateString()} at {new Date(attempt.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-6 sm:text-right">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                Total Score
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tabular-nums">
                {attempt.score} <span className="text-lg text-slate-400 font-medium">/ {attempt.maxScore}</span>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200" />

            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
                Accuracy
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 font-mono tabular-nums">
                {attempt.percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* 4 Performance Metric Panels */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Correct Answers</span>
            </div>
            <div className="text-2xl font-bold text-emerald-950 font-mono tabular-nums">
              {attempt.correctCount}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              +{attempt.correctCount * (quiz.marksPerQuestion || 1)} marks
            </div>
          </div>

          <div className="p-4 bg-red-50/70 border border-red-100 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-red-800 font-semibold mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span>Incorrect Answers</span>
            </div>
            <div className="text-2xl font-bold text-red-950 font-mono tabular-nums">
              {attempt.incorrectCount}
            </div>
            <div className="text-[11px] text-red-700 mt-0.5">
              -{quiz.negativeMarking > 0 ? (attempt.incorrectCount * quiz.negativeMarking).toFixed(2) : 0} penalty
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
              <AlertCircle className="w-4 h-4 text-slate-500" />
              <span>Unanswered</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {attempt.unansweredCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              0 marks impact
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Time Consumed</span>
            </div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {formatSeconds(attempt.timeTakenSeconds)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              of {quiz.durationMinutes}m max
            </div>
          </div>
        </div>

        {/* Weak topic drill recommendation banner */}
        {weakTopics.length > 0 && (
          <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Brain className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950">Targeted Learning Recommendation</h4>
                <p className="text-xs text-indigo-800">
                  Your accuracy was lowest in: <span className="font-semibold">{weakTopics.join(', ')}</span>.
                </p>
              </div>
            </div>
            <button
              onClick={() => onDrillWeakAreas(weakTopics)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Weak-Area Drill</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub-Topic Performance Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Skill & Topic Mastery Analysis</span>
          </h3>
          <span className="text-xs text-slate-500">
            {Object.keys(attempt.topicPerformance).length} Competencies Evaluated
          </span>
        </div>

        <div className="space-y-4 pt-1">
          {Object.entries(attempt.topicPerformance).map(([topic, stats]) => {
            const topicPct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
            const avgTime = stats.total > 0 ? Math.round(stats.timeSpent / stats.total) : 0;

            return (
              <div key={topic} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">{topic}</span>
                  <div className="flex items-center gap-3 text-slate-500 font-mono tabular-nums">
                    <span>{stats.correct}/{stats.total} correct</span>
                    <span aria-hidden="true">·</span>
                    <span>~{avgTime}s / question</span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-bold ${topicPct >= 70 ? 'text-emerald-600' : topicPct >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                      {topicPct}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      topicPct >= 70 ? 'bg-emerald-500' : topicPct >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${topicPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Question-by-Question Solution Review */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Detailed Question Solutions & AI Socratic Review
            </h3>
            <p className="text-xs text-slate-500">
              Review correct options, rationale, common traps, and request personalized AI explanations.
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                reviewFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allQuestions.length})
            </button>
            <button
              onClick={() => setReviewFilter('incorrect')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                reviewFilter === 'incorrect' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Incorrect ({attempt.incorrectCount})
            </button>
            <button
              onClick={() => setReviewFilter('correct')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                reviewFilter === 'correct' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Correct ({attempt.correctCount})
            </button>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {filteredQuestions.map((q, qIdx) => {
            const userAns = attempt.answers[q.id];
            const isCorrect = userAns && userAns.selectedOption === q.correctIndex;
            const isUnanswered = !userAns || userAns.selectedOption === null;
            const originalIndex = allQuestions.findIndex(item => item.id === q.id);

            return (
              <div 
                key={q.id}
                className="p-5 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-4"
              >
                {/* Question header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono tabular-nums">
                      Q{originalIndex + 1}
                    </span>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-slate-600">{q.topic}</span>
                  </div>

                  <div>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct (+{quiz.marksPerQuestion || 1})</span>
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 font-medium text-slate-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Unanswered (0)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-red-700">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect (-{quiz.negativeMarking || 0})</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                  {q.text}
                </p>

                {/* Code Snippet if present */}
                {q.codeSnippet && (
                  <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <pre><code>{q.codeSnippet}</code></pre>
                  </div>
                )}

                {/* Options List with outcome styling */}
                <div className="space-y-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAns?.selectedOption === optIdx;
                    const isRightOption = q.correctIndex === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    let itemClass = 'bg-white border-slate-200 text-slate-700';
                    if (isRightOption) {
                      itemClass = 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium';
                    } else if (isSelected && !isRightOption) {
                      itemClass = 'bg-red-50 border-red-300 text-red-950';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${itemClass}`}
                      >
                        <div className={`w-5 h-5 rounded flex items-center justify-center font-mono font-bold shrink-0 text-[11px] ${
                          isRightOption 
                            ? 'bg-emerald-600 text-white' 
                            : isSelected 
                              ? 'bg-red-600 text-white' 
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          {letter}
                        </div>
                        <span className="flex-1 leading-relaxed pt-0.5">{opt}</span>
                        {isRightOption && (
                          <span className="text-[11px] font-bold text-emerald-700 shrink-0">
                            ✓ Correct Key
                          </span>
                        )}
                        {isSelected && !isRightOption && (
                          <span className="text-[11px] font-bold text-red-600 shrink-0">
                            ✗ Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Standard Explanation */}
                <div className="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-lg text-xs space-y-1">
                  <div className="font-bold text-indigo-950">Official Solution Rationale:</div>
                  <p className="text-indigo-900 leading-relaxed">{q.explanation}</p>
                </div>

                {/* AI Tutor Deeper Explanation */}
                {aiExplanations[q.id] ? (
                  <div className="p-4 bg-slate-900 text-slate-100 rounded-xl border border-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gemini Socratic Tutor Breakdown:</span>
                    </div>
                    <div className="text-slate-300 leading-relaxed whitespace-pre-line font-mono text-[11px]">
                      {aiExplanations[q.id]}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleExplainDeeper(q)}
                    disabled={loadingAiId === q.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors shadow-xs"
                  >
                    {loadingAiId === q.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                        <span>Analyzing concept with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Ask AI to Explain Deeper</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
