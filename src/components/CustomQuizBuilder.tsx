import React, { useState } from 'react';
import { Quiz, Question, QuizSection } from '../types/quiz';
import { Plus, Trash2, Save, FileEdit, Check, ArrowLeft, Download, Upload, AlertCircle } from 'lucide-react';

interface CustomQuizBuilderProps {
  onSaveQuiz: (quiz: Quiz) => void;
  onCancel: () => void;
}

export const CustomQuizBuilder: React.FC<CustomQuizBuilderProps> = ({
  onSaveQuiz,
  onCancel
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Comprehensive'>('Intermediate');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [negativeMarking, setNegativeMarking] = useState(0.25);
  const [passPercentage, setPassPercentage] = useState(65);
  const [error, setError] = useState<string | null>(null);

  // Question builder state
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: `custom-q-${Date.now()}-1`,
      text: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      type: 'single_choice',
      explanation: '',
      topic: 'Core Concept',
      difficulty: 'medium',
      hint: ''
    }
  ]);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        id: `custom-q-${Date.now()}-${prev.length + 1}`,
        text: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        type: 'single_choice',
        explanation: '',
        topic: 'Core Concept',
        difficulty: 'medium',
        hint: ''
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      setError('A test must contain at least one question.');
      return;
    }
    setQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  const updateQuestionText = (index: number, text: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index].text = text;
      return copy;
    });
  };

  const updateOptionText = (qIndex: number, optIndex: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      const opts = [...copy[qIndex].options];
      opts[optIndex] = val;
      copy[qIndex].options = opts;
      return copy;
    });
  };

  const setCorrectOption = (qIndex: number, optIndex: number) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[qIndex].correctIndex = optIndex;
      return copy;
    });
  };

  const updateExplanation = (index: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index].explanation = val;
      return copy;
    });
  };

  const updateTopic = (index: number, val: string) => {
    setQuestions(prev => {
      const copy = [...prev];
      copy[index].topic = val;
      return copy;
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Please provide a title for the examination.');
      return;
    }

    // Validate that questions have non-empty text and options
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text.trim()) {
        setError(`Question ${i + 1} has empty text.`);
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          setError(`Option ${String.fromCharCode(65 + j)} in Question ${i + 1} is empty.`);
          return;
        }
      }
    }

    setError(null);

    const quizId = `custom-builder-${Date.now()}`;
    const newQuiz: Quiz = {
      id: quizId,
      title: title.trim(),
      description: description.trim() || `Custom mock assessment on ${title}.`,
      category,
      difficulty,
      durationMinutes: Number(durationMinutes) || 15,
      negativeMarking: Number(negativeMarking) || 0,
      marksPerQuestion: 1,
      passPercentage: Number(passPercentage) || 60,
      isCustom: true,
      createdAt: new Date().toISOString().split('T')[0],
      sections: [
        {
          id: `sec-${quizId}-1`,
          title: 'Section 1: General Assessment',
          description: 'Core evaluation',
          questions
        }
      ]
    };

    onSaveQuiz(newQuiz);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${title || 'quiz'}_questions.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Publish Quiz</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Meta Configuration Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-indigo-600" />
          <span>Exam Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Exam Title *
            </label>
            <input
              type="text"
              placeholder="e.g. AWS Solutions Architect Practice Drill"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="Brief description of what is tested"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Medical Science">Medical Science</option>
              <option value="Quantitative Reasoning">Quantitative Reasoning</option>
              <option value="Business & Finance">Business & Finance</option>
              <option value="General Aptitude">General Aptitude</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-slate-900"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Comprehensive">Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min="5"
              max="180"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Negative Marking (e.g. 0.25)
            </label>
            <input
              type="number"
              step="0.05"
              min="0"
              max="1"
              value={negativeMarking}
              onChange={(e) => setNegativeMarking(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 font-mono text-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Questions ({questions.length})
          </h3>

          <button
            onClick={addQuestion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Question</span>
          </button>
        </div>

        {questions.map((q, qIdx) => (
          <div
            key={q.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-sm text-slate-900 font-mono">
                Question {qIdx + 1}
              </span>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Sub-topic name"
                  value={q.topic}
                  onChange={(e) => updateTopic(qIdx, e.target.value)}
                  className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />

                <button
                  onClick={() => removeQuestion(qIdx)}
                  title="Delete question"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Question Prompt *
              </label>
              <textarea
                rows={2}
                placeholder="Enter the full question text..."
                value={q.text}
                onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 resize-none"
              />
            </div>

            {/* 4 Options */}
            <div className="space-y-2.5">
              <label className="block text-xs font-semibold text-slate-700">
                Options (Click the radio to mark the correct answer) *
              </label>
              {q.options.map((opt, optIdx) => {
                const isCorrect = q.correctIndex === optIdx;
                const letter = String.fromCharCode(65 + optIdx);

                return (
                  <div key={optIdx} className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setCorrectOption(qIdx, optIdx)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                        isCorrect
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={isCorrect ? 'Correct option' : 'Click to set as correct option'}
                    >
                      {letter}
                    </button>
                    <input
                      type="text"
                      placeholder={`Option ${letter}`}
                      value={opt}
                      onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                      className={`flex-1 px-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-colors ${
                        isCorrect ? 'border-emerald-300 bg-emerald-50/40 font-medium' : 'border-slate-200 bg-slate-50'
                      }`}
                    />
                    {isCorrect && (
                      <span className="text-xs text-emerald-700 font-semibold px-2">
                        Correct Key
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Solution Explanation & Rationale
              </label>
              <textarea
                rows={2}
                placeholder="Explain why the selected option is correct and why others fail..."
                value={q.explanation}
                onChange={(e) => updateExplanation(qIdx, e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 resize-none"
              />
            </div>
          </div>
        ))}

        <button
          onClick={addQuestion}
          className="w-full py-3 border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors bg-white hover:bg-indigo-50/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Question</span>
        </button>
      </div>
    </div>
  );
};
