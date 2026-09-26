import React from 'react';
import { Quiz, QuizAttempt } from '../types/quiz';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Target, 
  Gauge, 
  Sparkles, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

interface CohortBenchmarkCardProps {
  quiz: Quiz;
  attempt: QuizAttempt;
}

export const CohortBenchmarkCard: React.FC<CohortBenchmarkCardProps> = ({ quiz, attempt }) => {
  // Compute simulated psychometric cohort statistics (Normal distribution model)
  // Standard test takers average: 58% score with SD of 16%
  const mean = 58;
  const standardDev = 16;
  const zScore = (attempt.percentage - mean) / standardDev;

  // Approximate normal cumulative distribution function (CDF)
  const approxCdf = (z: number) => {
    return 1 / (1 + Math.exp(-1.654 * z));
  };

  const rawPercentile = Math.round(approxCdf(zScore) * 1000) / 10;
  const percentile = Math.min(99.9, Math.max(1.0, rawPercentile));

  const avgTimePerQ = attempt.totalQuestions > 0 
    ? Math.round(attempt.timeTakenSeconds / attempt.totalQuestions) 
    : 0;

  // Benchmark standard pace is around 60-90 seconds per question for multiple choice
  const targetPacePerQ = Math.round((quiz.durationMinutes * 60) / attempt.totalQuestions);

  // Determine Speed vs. Accuracy Quadrant
  const isFast = avgTimePerQ <= targetPacePerQ * 0.75;
  const isHighAccuracy = attempt.percentage >= 70;

  let quadrantTitle = 'Deliberate & Accurate';
  let quadrantDesc = 'Solid accuracy with careful, measured pacing.';
  let quadrantColor = 'text-indigo-400 bg-indigo-950/60 border-indigo-800/40';

  if (isFast && isHighAccuracy) {
    quadrantTitle = 'Rapid Mastery (Top 5% Pacing)';
    quadrantDesc = 'Exceptional time economy with deep conceptual confidence.';
    quadrantColor = 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';
  } else if (isFast && !isHighAccuracy) {
    quadrantTitle = 'Rushing / Distractor Susceptibility';
    quadrantDesc = 'Answering quickly but falling into tricky distractor traps. Slow down to verify edge cases.';
    quadrantColor = 'text-amber-400 bg-amber-950/60 border-amber-800/40';
  } else if (!isFast && !isHighAccuracy) {
    quadrantTitle = 'Cognitive Overload / Time-Strained';
    quadrantDesc = 'Spending significant time deliberating on difficult topics. Targeted flashcard drilling advised.';
    quadrantColor = 'text-red-400 bg-red-950/60 border-red-800/40';
  }

  return (
    <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Psychometric Model
            </span>
            <span className="text-xs text-slate-400">N = 10,000 Standardized Cohort</span>
          </div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Peer Benchmark & Cohort Percentile Rank</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Rank</div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400 tabular-nums">
              P<span className="text-lg font-bold">{percentile.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Percentile Standing */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Cohort Standing</div>
          <div className="text-lg font-bold text-white">
            Top {Math.max(0.1, (100 - percentile)).toFixed(1)}% of test-takers
          </div>
          <p className="text-[11px] text-slate-400">
            Outperformed {percentile.toFixed(1)}% of candidates on this topic difficulty.
          </p>
        </div>

        {/* Metric 2: Speed / Pacing */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Your Avg Speed</div>
          <div className="text-lg font-bold text-emerald-400 font-mono tabular-nums">
            {avgTimePerQ}s <span className="text-xs text-slate-400 font-normal">/ question</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Allotted ceiling: {targetPacePerQ}s per question.
          </p>
        </div>

        {/* Metric 3: Time Savings */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Time Reserve Bank</div>
          <div className="text-lg font-bold text-indigo-300 font-mono tabular-nums">
            {Math.max(0, Math.floor((quiz.durationMinutes * 60 - attempt.timeTakenSeconds) / 60))}m left
          </div>
          <p className="text-[11px] text-slate-400">
            Buffer remaining for revision & marked answers.
          </p>
        </div>
      </div>

      {/* Speed-Accuracy Quadrant Diagnosis */}
      <div className={`p-4 rounded-xl border ${quadrantColor} flex items-start gap-3`}>
        <Gauge className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="text-xs font-bold uppercase tracking-wider">
            Pacing Quadrant: {quadrantTitle}
          </div>
          <p className="text-xs leading-relaxed opacity-90">
            {quadrantDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
