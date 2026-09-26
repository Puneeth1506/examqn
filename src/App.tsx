/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Quiz, QuizAttempt, Question } from './types/quiz';
import { PREBUILT_QUIZZES } from './data/mockQuizzes';
import { Navbar } from './components/Navbar';
import { ExamHub } from './components/ExamHub';
import { AIGeneratorModal } from './components/AIGeneratorModal';
import { ExamSimulator } from './components/ExamSimulator';
import { TestResults } from './components/TestResults';
import { CustomQuizBuilder } from './components/CustomQuizBuilder';
import { HistoryView } from './components/HistoryView';

export default function App() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_custom_quizzes');
      if (saved) {
        const parsed: Quiz[] = JSON.parse(saved);
        return [...parsed, ...PREBUILT_QUIZZES];
      }
    } catch (e) {
      console.error('Failed to load custom quizzes from localStorage', e);
    }
    return PREBUILT_QUIZZES;
  });

  const [attempts, setAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_attempts');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load attempts from localStorage', e);
    }
    return [];
  });

  const [currentTab, setCurrentTab] = useState<'hub' | 'generator' | 'builder' | 'history'>('hub');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeMode, setActiveMode] = useState<'simulation' | 'practice'>('simulation');
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState(false);
  const [isTakingExam, setIsTakingExam] = useState(false);
  const [isViewingResults, setIsViewingResults] = useState(false);

  // Save custom quizzes to localStorage
  useEffect(() => {
    try {
      const customOnly = quizzes.filter(q => q.isCustom);
      localStorage.setItem('vantage_custom_quizzes', JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to save custom quizzes', e);
    }
  }, [quizzes]);

  // Save attempts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('vantage_attempts', JSON.stringify(attempts));
    } catch (e) {
      console.error('Failed to save attempts', e);
    }
  }, [attempts]);

  // Start exam handler
  const handleStartQuiz = (quiz: Quiz, mode: 'simulation' | 'practice') => {
    setActiveQuiz(quiz);
    setActiveMode(mode);
    setIsTakingExam(true);
    setIsViewingResults(false);
    setActiveAttempt(null);
  };

  // Complete exam handler
  const handleCompleteExam = (attempt: QuizAttempt) => {
    setAttempts(prev => [attempt, ...prev]);
    setActiveAttempt(attempt);
    setIsTakingExam(false);
    setIsViewingResults(true);
  };

  // Retake full exam
  const handleRetakeFull = () => {
    if (activeQuiz) {
      handleStartQuiz(activeQuiz, activeMode);
    }
  };

  // Retake missed questions only
  const handleRetakeMissedOnly = (missedQuestions: Question[]) => {
    if (!activeQuiz || missedQuestions.length === 0) return;

    const drillQuiz: Quiz = {
      id: `drill-missed-${Date.now()}`,
      title: `${activeQuiz.title} (Correction Drill)`,
      description: `Targeted review drill focused strictly on the ${missedQuestions.length} missed questions.`,
      category: activeQuiz.category,
      difficulty: activeQuiz.difficulty,
      durationMinutes: Math.max(5, Math.ceil(missedQuestions.length * 1.5)),
      negativeMarking: activeQuiz.negativeMarking,
      marksPerQuestion: activeQuiz.marksPerQuestion,
      passPercentage: activeQuiz.passPercentage,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
      sections: [
        {
          id: `sec-drill-missed-1`,
          title: 'Review: Missed Questions Correction',
          description: 'Focus review on previously incorrect questions',
          questions: missedQuestions
        }
      ]
    };

    handleStartQuiz(drillQuiz, 'practice');
  };

  // Drill weak areas via AI generator
  const handleDrillWeakAreas = (weakTopics: string[]) => {
    setIsGeneratorModalOpen(true);
  };

  // Return to hub
  const handleReturnToHub = () => {
    setIsTakingExam(false);
    setIsViewingResults(false);
    setActiveQuiz(null);
    setActiveAttempt(null);
    setCurrentTab('hub');
  };

  // Save newly built custom quiz
  const handleSaveCustomQuiz = (newQuiz: Quiz) => {
    setQuizzes(prev => [newQuiz, ...prev]);
    setCurrentTab('hub');
  };

  // Delete custom quiz
  const handleDeleteCustomQuiz = (quizId: string) => {
    setQuizzes(prev => prev.filter(q => q.id !== quizId));
  };

  // Review a past attempt from history
  const handleReviewPastAttempt = (attempt: QuizAttempt) => {
    const matchedQuiz = quizzes.find(q => q.id === attempt.quizId);
    if (matchedQuiz) {
      setActiveQuiz(matchedQuiz);
    } else {
      // Create minimal synthetic quiz for review if original was removed
      const syntheticQuiz: Quiz = {
        id: attempt.quizId,
        title: attempt.quizTitle,
        description: 'Past assessment record',
        category: attempt.category,
        difficulty: 'Intermediate',
        durationMinutes: 15,
        negativeMarking: 0.25,
        marksPerQuestion: 1,
        passPercentage: 65,
        createdAt: attempt.completedAt.split('T')[0],
        sections: [
          {
            id: 'sec-past',
            title: 'Assessment Review',
            questions: []
          }
        ]
      };
      setActiveQuiz(syntheticQuiz);
    }
    setActiveAttempt(attempt);
    setIsViewingResults(true);
  };

  // Clear all past attempts
  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire assessment score history?')) {
      setAttempts([]);
    }
  };

  // If user is actively taking an exam
  if (isTakingExam && activeQuiz) {
    return (
      <ExamSimulator
        quiz={activeQuiz}
        mode={activeMode}
        onComplete={handleCompleteExam}
        onExit={handleReturnToHub}
      />
    );
  }

  // If user is reviewing test results
  if (isViewingResults && activeQuiz && activeAttempt) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setIsViewingResults(false);
            setCurrentTab(tab);
          }}
          onOpenGenerator={() => setIsGeneratorModalOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TestResults
            quiz={activeQuiz}
            attempt={activeAttempt}
            onRetakeFull={handleRetakeFull}
            onRetakeMissedOnly={handleRetakeMissedOnly}
            onDrillWeakAreas={handleDrillWeakAreas}
            onReturnToHub={handleReturnToHub}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenGenerator={() => setIsGeneratorModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'hub' && (
          <ExamHub
            quizzes={quizzes}
            onStartQuiz={handleStartQuiz}
            onOpenGenerator={() => setIsGeneratorModalOpen(true)}
            onOpenBuilder={() => setCurrentTab('builder')}
            onDeleteCustomQuiz={handleDeleteCustomQuiz}
          />
        )}

        {currentTab === 'generator' && (
          <div className="py-6">
            <div className="max-w-2xl mx-auto bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">AI Dynamic Assessment Studio</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Generate high-yield, psychometrically balanced mock tests from any custom topic, textbook syllabus, or notes.
              </p>
              <button
                onClick={() => setIsGeneratorModalOpen(true)}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Open Exam Generator
              </button>
            </div>
          </div>
        )}

        {currentTab === 'builder' && (
          <CustomQuizBuilder
            onSaveQuiz={handleSaveCustomQuiz}
            onCancel={() => setCurrentTab('hub')}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            attempts={attempts}
            onReviewAttempt={handleReviewPastAttempt}
            onClearHistory={handleClearHistory}
            onExploreExams={() => setCurrentTab('hub')}
          />
        )}
      </main>

      {/* AI Generator Modal */}
      <AIGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onQuizGenerated={(newQuiz, mode) => {
          setQuizzes(prev => [newQuiz, ...prev]);
          handleStartQuiz(newQuiz, mode);
        }}
      />
    </div>
  );
}
