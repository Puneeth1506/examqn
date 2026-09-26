import React, { useState } from 'react';
import { Quiz } from '../types/quiz';
import { ASSET_IMAGES } from '../data/mockQuizzes';
import { Clock, HelpCircle, ArrowRight, BookOpen, Sparkles, Plus, Search, Trash2 } from 'lucide-react';

interface ExamHubProps {
  quizzes: Quiz[];
  onStartQuiz: (quiz: Quiz, mode: 'simulation' | 'practice') => void;
  onOpenGenerator: () => void;
  onOpenBuilder: () => void;
  onDeleteCustomQuiz?: (quizId: string) => void;
}

export const ExamHub: React.FC<ExamHubProps> = ({
  quizzes,
  onStartQuiz,
  onOpenGenerator,
  onOpenBuilder,
  onDeleteCustomQuiz
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All Exams' },
    { id: 'Computer Science', label: 'Computer Science' },
    { id: 'Medical Science', label: 'Medical Science' },
    { id: 'Quantitative Reasoning', label: 'Quantitative & Logic' },
    { id: 'custom', label: 'Custom & AI Generated' }
  ];

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesCategory = 
      selectedCategory === 'all' 
        ? true 
        : selectedCategory === 'custom' 
          ? quiz.isCustom 
          : quiz.category === selectedCategory;

    const matchesSearch = 
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const getImageForQuiz = (quiz: Quiz) => {
    if (quiz.imageKey === 'tech') return ASSET_IMAGES.tech;
    if (quiz.imageKey === 'science') return ASSET_IMAGES.science;
    if (quiz.imageKey === 'quant') return ASSET_IMAGES.quant;
    if (quiz.category === 'Computer Science') return ASSET_IMAGES.tech;
    if (quiz.category === 'Medical Science') return ASSET_IMAGES.science;
    if (quiz.category === 'Quantitative Reasoning') return ASSET_IMAGES.quant;
    return ASSET_IMAGES.hero;
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200/80 bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <img 
            src={ASSET_IMAGES.hero} 
            alt="Exam simulation study desk" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-900/40" />
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-14 max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-3">
            Standardized Assessment & CBT Simulation Engine
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 text-balance">
            Dynamic Mock Test & Exam Simulator
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
            Experience realistic CBT exam environments with standardized question status palettes, strict countdown timers, negative marking calculations, and deep Socratic AI explanations.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenGenerator}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Custom AI Test</span>
            </button>
            <button
              onClick={onOpenBuilder}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-800 hover:text-white border border-slate-700/80 rounded-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Quiz</span>
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <span>Realistic Question Palette</span>
            <span aria-hidden="true">·</span>
            <span>Negative Marking Simulation</span>
            <span aria-hidden="true">·</span>
            <span>Section-Wise Navigation</span>
            <span aria-hidden="true">·</span>
            <span>Topic Mastery Analytics</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-xl overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests, topics, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredQuizzes.map((quiz) => {
          const totalQuestions = quiz.sections.reduce((acc, sec) => acc + sec.questions.length, 0);

          return (
            <div 
              key={quiz.id}
              className="bg-white border border-slate-200/90 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Visual Thumbnail */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                  <img
                    src={getImageForQuiz(quiz)}
                    alt={quiz.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Category and Custom Tag inside header */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                    <span className="font-semibold text-slate-100 bg-slate-900/60 backdrop-blur px-2.5 py-1 rounded">
                      {quiz.category}
                    </span>
                    {quiz.isCustom && (
                      <span className="text-indigo-200 bg-indigo-950/80 px-2.5 py-1 rounded font-medium">
                        Custom Drill
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 text-xs text-slate-200 flex items-center gap-2">
                    <span>{quiz.sections.length} Section{quiz.sections.length > 1 ? 's' : ''}</span>
                    <span aria-hidden="true">·</span>
                    <span>Pass: {quiz.passPercentage}%</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span className="font-medium text-slate-700">{quiz.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{totalQuestions} Questions</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{quiz.durationMinutes} Minutes</span>
                    <span aria-hidden="true">·</span>
                    <span>-{quiz.negativeMarking} Neg</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug">
                    {quiz.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {quiz.description}
                  </p>

                  {/* Section overview preview */}
                  <div className="text-[11px] text-slate-500 space-y-1 mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {quiz.sections.map((sec, i) => (
                      <div key={sec.id} className="truncate">
                        <span className="font-semibold text-slate-700">{i + 1}.</span> {sec.title} ({sec.questions.length}Q)
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={() => onStartQuiz(quiz, 'simulation')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  >
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Timed Exam</span>
                  </button>

                  <button
                    onClick={() => onStartQuiz(quiz, 'practice')}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Practice Mode</span>
                  </button>
                </div>

                {quiz.isCustom && onDeleteCustomQuiz && (
                  <button
                    onClick={() => onDeleteCustomQuiz(quiz.id)}
                    title="Delete custom quiz"
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">No examinations match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Try adjusting your search query or generate an instant custom assessment using Gemini AI.
          </p>
          <button
            onClick={onOpenGenerator}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate New Assessment</span>
          </button>
        </div>
      )}
    </div>
  );
};
