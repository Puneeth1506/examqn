import React, { useState } from 'react';
import { Quiz, QuizGenerationConfig } from '../types/quiz';
import { Sparkles, X, BookOpen, AlertCircle, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface AIGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuizGenerated: (quiz: Quiz, startMode: 'simulation' | 'practice') => void;
}

export const AIGeneratorModal: React.FC<AIGeneratorModalProps> = ({
  isOpen,
  onClose,
  onQuizGenerated
}) => {
  const [topic, setTopic] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Comprehensive'>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [durationMinutes, setDurationMinutes] = useState<number>(15);
  const [negativeMarking, setNegativeMarking] = useState<number>(0.25);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('');

  if (!isOpen) return null;

  const quickTopics = [
    { title: 'AWS Cloud Solutions Architect', category: 'Computer Science' },
    { title: 'React 19 & Modern Web Performance', category: 'Computer Science' },
    { title: 'USMLE Clinical Biochemistry', category: 'Medical Science' },
    { title: 'GRE Quantitative & Probability', category: 'Quantitative Reasoning' },
    { title: 'Machine Learning & Transformer Models', category: 'Computer Science' },
    { title: 'Cardiology & ECG Arrhythmias', category: 'Medical Science' }
  ];

  const handleQuickTopic = (item: { title: string; category: string }) => {
    setTopic(item.title);
    setCategory(item.category);
  };

  const handleGenerate = async (startMode: 'simulation' | 'practice') => {
    if (!topic.trim() && !customNotes.trim()) {
      setError('Please provide an exam subject/topic or paste source notes.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep('Connecting to Gemini assessment engine...');

    const stepTimer1 = setTimeout(() => {
      setLoadingStep('Formulating psychometric questions & distractor options...');
    }, 1500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('Authoring deep conceptual explanations and socratic hints...');
    }, 3500);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          customNotes: customNotes.trim(),
          category,
          difficulty,
          questionCount: Number(questionCount),
          durationMinutes: Number(durationMinutes),
          negativeMarking: Number(negativeMarking)
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.ok) {
        throw new Error('Failed to generate mock test. Please retry.');
      }

      const data = await response.json();
      if (!data.quiz) {
        throw new Error('Invalid test structure received from server.');
      }

      onQuizGenerated(data.quiz, startMode);
      onClose();
    } catch (err: any) {
      console.error('Error generating quiz:', err);
      setError(err.message || 'An unexpected error occurred while generating the mock test.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Dynamic AI Exam Generator</h2>
              <p className="text-xs text-slate-500">Generate targeted mock tests on any topic or syllabus</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Preset Topics */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Quick Subject Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTopics.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickTopic(item)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all text-left ${
                    topic === item.title
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Main Topic Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Subject or Core Topic *
            </label>
            <input
              type="text"
              placeholder="e.g. Distributed Database Consistency, Advanced React Runtimes, USMLE Cardiology..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900"
            />
          </div>

          {/* Custom Notes / Syllabus Paste */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Optional: Paste Syllabus, Study Notes, or Lecture Transcripts
              </label>
              <span className="text-[11px] text-slate-400">Derives questions strictly from source</span>
            </div>
            <textarea
              rows={3}
              placeholder="Paste specific textbook notes, articles, or documentation paragraphs here to generate an exam strictly focused on this material..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900 resize-none font-mono"
            />
          </div>

          {/* Configurations Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900"
              >
                <option value="Computer Science">Computer Science & Tech</option>
                <option value="Medical Science">Medical & Health Sciences</option>
                <option value="Quantitative Reasoning">Quantitative Reasoning & Math</option>
                <option value="Business & Finance">Business & Finance</option>
                <option value="General Aptitude">General Aptitude & Reasoning</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                disabled={isLoading}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-slate-900"
              >
                <option value="Beginner">Beginner (Foundations)</option>
                <option value="Intermediate">Intermediate (Standard)</option>
                <option value="Advanced">Advanced (Challenging)</option>
                <option value="Comprehensive">Comprehensive (Full Exam Simulation)</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Count: <span className="font-mono tabular-nums text-indigo-600 font-bold">{questionCount}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    disabled={isLoading}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      questionCount === cnt
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {cnt} Questions
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Minutes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Duration: <span className="font-mono tabular-nums text-indigo-600 font-bold">{durationMinutes} min</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[10, 15, 20].map(mins => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setDurationMinutes(mins)}
                    disabled={isLoading}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      durationMinutes === mins
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {mins} Mins
                  </button>
                ))}
              </div>
            </div>

            {/* Negative Marking */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Negative Marking Scheme
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'None (0)', val: 0 },
                  { label: '-0.25 (1/4)', val: 0.25 },
                  { label: '-0.33 (1/3)', val: 0.33 },
                  { label: '-0.50 (1/2)', val: 0.50 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setNegativeMarking(opt.val)}
                    disabled={isLoading}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      negativeMarking === opt.val
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading status visual */}
          {isLoading && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-3 text-xs text-indigo-900">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600 shrink-0" />
              <div>
                <p className="font-semibold">{loadingStep || 'Generating exam questions...'}</p>
                <p className="text-indigo-600 text-[11px]">Validating answer keys and distractor plausibility</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => handleGenerate('practice')}
            disabled={isLoading || (!topic.trim() && !customNotes.trim())}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-600" />
            <span>Generate & Practice</span>
          </button>

          <button
            type="button"
            onClick={() => handleGenerate('simulation')}
            disabled={isLoading || (!topic.trim() && !customNotes.trim())}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Timed Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
