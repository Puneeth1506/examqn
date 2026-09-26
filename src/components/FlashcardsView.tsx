import React, { useState, useMemo } from 'react';
import { Quiz } from '../types/quiz';
import { Flashcard, FlashcardDeck, CardConfidence } from '../types/flashcard';
import { 
  Layers, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ArrowLeft,
  Flame,
  BrainCircuit,
  Eye,
  BookOpen
} from 'lucide-react';

interface FlashcardsViewProps {
  quizzes: Quiz[];
  onBackToHub: () => void;
  initialQuizId?: string;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({
  quizzes,
  onBackToHub,
  initialQuizId
}) => {
  // Convert quizzes into flashcard decks
  const decks: FlashcardDeck[] = useMemo(() => {
    return quizzes.map(quiz => {
      const allQ = quiz.sections.flatMap(s => s.questions);
      const cards: Flashcard[] = allQ.map(q => ({
        id: `card-${q.id}`,
        questionId: q.id,
        frontQuestion: q.text,
        codeSnippet: q.codeSnippet,
        topic: q.topic,
        backAnswer: q.options[q.correctIndex],
        explanation: q.explanation,
        confidence: 'unrated',
        reviewCount: 0
      }));

      return {
        id: `deck-${quiz.id}`,
        quizId: quiz.id,
        title: quiz.title,
        category: quiz.category,
        cards,
        createdAt: quiz.createdAt
      };
    });
  }, [quizzes]);

  const [selectedDeckId, setSelectedDeckId] = useState<string>(
    initialQuizId ? `deck-${initialQuizId}` : decks[0]?.id || ''
  );

  const activeDeck = useMemo(() => {
    return decks.find(d => d.id === selectedDeckId) || decks[0];
  }, [decks, selectedDeckId]);

  // Card deck local state with persistent ratings
  const [cardsState, setCardsState] = useState<Record<string, CardConfidence>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);

  // Deck cards with rating applied
  const currentCards = useMemo(() => {
    if (!activeDeck) return [];
    let list = activeDeck.cards.map(c => ({
      ...c,
      confidence: cardsState[c.id] || 'unrated'
    }));

    if (isShuffled) {
      // Deterministic clone
      list = [...list].sort(() => 0.5 - Math.random());
    }
    return list;
  }, [activeDeck, cardsState, isShuffled]);

  const currentCard = currentCards[currentIndex];

  const handleRate = (confidence: CardConfidence) => {
    if (!currentCard) return;
    setCardsState(prev => ({
      ...prev,
      [currentCard.id]: confidence
    }));

    // Advance to next card if available
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < currentCards.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }, 200);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < currentCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Stats for the active deck
  const stats = useMemo(() => {
    if (!activeDeck) return { mastered: 0, good: 0, hard: 0, unrated: 0, pct: 0 };
    let mastered = 0;
    let good = 0;
    let hard = 0;
    let unrated = 0;

    activeDeck.cards.forEach(c => {
      const status = cardsState[c.id] || 'unrated';
      if (status === 'mastered') mastered++;
      else if (status === 'good') good++;
      else if (status === 'hard') hard++;
      else unrated++;
    });

    const total = activeDeck.cards.length;
    const pct = total > 0 ? Math.round(((mastered + good * 0.5) / total) * 100) : 0;
    return { mastered, good, hard, unrated, pct };
  }, [activeDeck, cardsState]);

  if (!activeDeck || currentCards.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto">
        <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white">No Flashcard Decks Available</h3>
        <p className="text-xs text-slate-400 mt-1 mb-6">Create or generate an exam first to drill with flashcards.</p>
        <button
          onClick={onBackToHub}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500"
        >
          Return to Exam Library
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHub}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        {/* Deck Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Active Deck:</span>
          <select
            value={selectedDeckId}
            onChange={(e) => {
              setSelectedDeckId(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {decks.map(d => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.cards.length} cards)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deck Progress Bar */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              Active Recall SRS
            </span>
            <span className="text-xs text-slate-400 font-medium">· {activeDeck.category}</span>
          </div>
          <h2 className="text-base font-bold text-white truncate max-w-md">
            {activeDeck.title}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Mastery</div>
            <div className="text-xl font-bold font-mono text-emerald-400">{stats.pct}%</div>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-400 font-bold font-mono">{stats.mastered} Mastered</span>
            <span className="text-slate-600">·</span>
            <span className="text-amber-400 font-bold font-mono">{stats.good} Good</span>
            <span className="text-slate-600">·</span>
            <span className="text-red-400 font-bold font-mono">{stats.hard} Hard</span>
          </div>
        </div>
      </div>

      {/* Main Flashcard 3D Interactive Card */}
      <div className="perspective-1000 w-full min-h-[360px] sm:min-h-[420px] select-none">
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-full min-h-[360px] sm:min-h-[420px] rounded-3xl transition-transform duration-500 transform-style-3d cursor-pointer shadow-xl border ${
            isFlipped ? 'rotate-y-180 border-indigo-500/50 bg-slate-900' : 'border-slate-800 bg-slate-900/90'
          }`}
        >
          {/* FRONT FACE (Question) */}
          <div className="absolute inset-0 backface-hidden p-6 sm:p-10 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800/80">
                <span className="font-mono font-bold text-indigo-400">
                  Card {currentIndex + 1} of {currentCards.length}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                  {currentCard?.topic}
                </span>
              </div>

              <div className="pt-6 sm:pt-8 space-y-4">
                <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                  {currentCard?.frontQuestion}
                </p>

                {currentCard?.codeSnippet && (
                  <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                    <pre><code>{currentCard.codeSnippet}</code></pre>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
              <span className="flex items-center gap-1.5 text-indigo-400 font-medium">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click card to reveal answer & rationale</span>
              </span>
              <span className="font-mono text-slate-500">Spacebar or Click</span>
            </div>
          </div>

          {/* BACK FACE (Answer & Solution) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 p-6 sm:p-10 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-4 border-b border-slate-800/80">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Correct Key & Conceptual Rationale</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 font-mono">
                  {currentCard?.topic}
                </span>
              </div>

              <div className="pt-6 space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
                  <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Authoritative Answer:</div>
                  <div className="text-base font-bold text-white">{currentCard?.backAnswer}</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
                  <span className="font-bold text-indigo-300">Explanation: </span>
                  {currentCard?.explanation}
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60">
              <span className="text-slate-400">Rate your recall below to advance</span>
              <span className="flex items-center gap-1 text-slate-400">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to flip back</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Controls: Navigation + SRS Recall Rating */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono text-slate-400 px-2">
            {currentIndex + 1} / {currentCards.length}
          </span>
          <button
            onClick={handleNext}
            disabled={currentIndex === currentCards.length - 1}
            className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2.5 rounded-xl border transition-colors ${
              isShuffled ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Shuffle deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Recall Rating Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => handleRate('hard')}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-red-300 bg-red-950/60 border border-red-800/50 hover:bg-red-900/60 rounded-xl transition-all"
          >
            Needs Review
          </button>

          <button
            onClick={() => handleRate('good')}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 hover:bg-amber-900/60 rounded-xl transition-all"
          >
            Good Recall
          </button>

          <button
            onClick={() => handleRate('mastered')}
            className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/50 hover:bg-emerald-900/60 rounded-xl transition-all shadow-xs"
          >
            Mastered ★
          </button>
        </div>
      </div>
    </div>
  );
};
