import React from 'react';
import { QuizAttempt } from '../types/quiz';
import { History, Trophy, Clock, CheckCircle2, XCircle, ArrowRight, Trash2, Award } from 'lucide-react';

interface HistoryViewProps {
  attempts: QuizAttempt[];
  onReviewAttempt: (attempt: QuizAttempt) => void;
  onClearHistory: () => void;
  onExploreExams: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  attempts,
  onReviewAttempt,
  onClearHistory,
  onExploreExams
}) => {
  if (attempts.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-white border border-slate-200 rounded-2xl p-8 space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
          <History className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Assessment History Yet</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Complete a mock test in Timed CBT or Practice mode to generate personalized psychometric analytics and review past attempts.
        </p>
        <button
          onClick={onExploreExams}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <span>Start a Mock Exam</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Aggregate stats
  const totalCompleted = attempts.length;
  const avgAccuracy = Math.round(
    attempts.reduce((sum, a) => sum + a.percentage, 0) / totalCompleted
  );
  const totalPassed = attempts.filter(a => a.passed).length;
  const passRate = Math.round((totalPassed / totalCompleted) * 100);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Top Banner and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Performance History & Score Log
          </h2>
          <p className="text-xs text-slate-500">
            Track your score progression and review past test solutions
          </p>
        </div>

        <button
          onClick={onClearHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Aggregate Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Total Tests Completed
          </div>
          <div className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
            {totalCompleted}
          </div>
          <div className="text-[11px] text-slate-400">
            Across {new Set(attempts.map(a => a.category)).size} categories
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Average Accuracy
          </div>
          <div className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
            {avgAccuracy}%
          </div>
          <div className="text-[11px] text-slate-400">
            Mean percentage score
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-1">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Exam Qualification Rate
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
            {passRate}%
          </div>
          <div className="text-[11px] text-slate-400">
            {totalPassed} of {totalCompleted} tests passed
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attempt Records
          </h3>
          <span className="text-xs text-slate-400 font-mono tabular-nums">
            {attempts.length} Total
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {attempts.map(att => (
            <div 
              key={att.id}
              className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    att.passed 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {att.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">·</span>
                  <span className="text-xs text-slate-600 font-medium">{att.category}</span>
                  <span className="text-xs text-slate-400 font-medium">·</span>
                  <span className="text-xs text-slate-500 capitalize">{att.mode} Mode</span>
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug">
                  {att.quizTitle}
                </h4>

                <div className="flex items-center gap-3 text-xs text-slate-500 font-mono tabular-nums">
                  <span>Score: {att.score}/{att.maxScore}</span>
                  <span aria-hidden="true">·</span>
                  <span>Accuracy: {att.percentage}%</span>
                  <span aria-hidden="true">·</span>
                  <span>Time: {formatSeconds(att.timeTakenSeconds)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(att.completedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onReviewAttempt(att)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors shadow-xs"
                >
                  <span>Review Solution</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
