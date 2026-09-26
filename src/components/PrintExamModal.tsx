import React, { useState } from 'react';
import { Quiz } from '../types/quiz';
import { Printer, Download, X, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

interface PrintExamModalProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintExamModal: React.FC<PrintExamModalProps> = ({ quiz, isOpen, onClose }) => {
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeOMR, setIncludeOMR] = useState(true);
  const [candidateName, setCandidateName] = useState('');

  if (!isOpen) return null;

  const allQuestions = quiz.sections.flatMap(s => s.questions);
  const totalMarks = allQuestions.length * (quiz.marksPerQuestion || 1);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      {/* Modal Card */}
      <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden my-6">
        {/* Controls Toolbar (hidden during print) */}
        <div className="no-print p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">
                Print Examination Paper & OMR Bubble Sheet
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate an official examination booklet ready for paper tests or offline study.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeOMR}
                onChange={(e) => setIncludeOMR(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>OMR Bubble Sheet</span>
            </label>

            <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Answer Key & Explanations</span>
            </label>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-white font-serif text-slate-900 space-y-8">
          {/* Official Exam Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
            <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-slate-600">
              VANTAGE STANDARDIZED ASSESSMENT INSTITUTE
            </div>
            <h1 className="text-2xl font-bold tracking-tight uppercase text-slate-950">
              {quiz.title}
            </h1>
            <p className="text-xs text-slate-600 max-w-xl mx-auto italic font-sans">
              {quiz.description}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-3 font-sans text-xs font-semibold text-slate-700">
              <span>Time Allowed: {quiz.durationMinutes} Minutes</span>
              <span>·</span>
              <span>Maximum Marks: {totalMarks}</span>
              <span>·</span>
              <span>Negative Marking: {quiz.negativeMarking > 0 ? `-${quiz.negativeMarking} per incorrect` : 'None'}</span>
              <span>·</span>
              <span>Passing: {quiz.passPercentage}%</span>
            </div>

            {/* Candidate Fill Blanks */}
            <div className="grid grid-cols-2 gap-6 pt-6 font-sans text-xs text-left max-w-xl mx-auto border-t border-slate-300 mt-4">
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-bold">Candidate Name:</span> {candidateName || '_______________________'}
              </div>
              <div className="border-b border-dotted border-slate-400 pb-1">
                <span className="font-bold">Roll / Seat No:</span> ___________________
              </div>
            </div>
          </div>

          {/* General Instructions */}
          <div className="p-4 bg-slate-50 border border-slate-300 rounded font-sans text-xs space-y-1 text-slate-800">
            <div className="font-bold uppercase tracking-wider text-[11px] text-slate-900">
              Instructions to Candidates:
            </div>
            <ol className="list-decimal pl-4 space-y-1">
              <li>This examination paper contains {allQuestions.length} questions distributed across {quiz.sections.length} section(s).</li>
              <li>Each question carries {quiz.marksPerQuestion || 1} mark. {quiz.negativeMarking > 0 ? `A deduction of ${quiz.negativeMarking} mark applies for each wrong response.` : 'No negative marking is applied.'}</li>
              <li>Fill in the bubbles corresponding to your chosen option completely using a dark pen or 2B pencil on the OMR sheet.</li>
              <li>Rough work must only be carried out in the blank spaces provided at the end of the question booklet.</li>
            </ol>
          </div>

          {/* Questions by Section */}
          <div className="space-y-8 font-sans">
            {quiz.sections.map((section, sIdx) => (
              <div key={section.id} className="space-y-6">
                <div className="border-b border-slate-400 pb-2">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-950">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-xs text-slate-600 italic">{section.description}</p>
                  )}
                </div>

                <div className="space-y-6">
                  {section.questions.map((q, qIdx) => {
                    const globalIdx = allQuestions.findIndex(item => item.id === q.id);

                    return (
                      <div key={q.id} className="print-avoid-break space-y-2 text-xs">
                        <div className="flex items-start gap-2">
                          <span className="font-bold font-mono text-slate-950">
                            {globalIdx + 1}.
                          </span>
                          <div className="flex-1 font-medium text-slate-900 leading-relaxed">
                            {q.text}
                          </div>
                        </div>

                        {q.assertion && q.reason && (
                          <div className="ml-6 p-2 bg-slate-50 border border-slate-200 text-[11px] space-y-1">
                            <div><span className="font-bold">Assertion (A):</span> {q.assertion}</div>
                            <div><span className="font-bold">Reason (R):</span> {q.reason}</div>
                          </div>
                        )}

                        {q.codeSnippet && (
                          <div className="ml-6 p-2 bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-900 rounded">
                            <pre><code>{q.codeSnippet}</code></pre>
                          </div>
                        )}

                        <div className="ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="flex items-start gap-2 text-slate-800">
                              <span className="font-bold font-mono text-slate-900">
                                ({String.fromCharCode(65 + optIdx)})
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* OMR Bubble Sheet */}
          {includeOMR && (
            <div className="print-page border-t-2 border-slate-900 pt-8 space-y-4 font-sans">
              <div className="text-center pb-2 border-b border-slate-300">
                <h3 className="text-base font-bold uppercase tracking-wider text-slate-950">
                  OMR Optical Response Sheet
                </h3>
                <p className="text-xs text-slate-600">
                  Darken the appropriate bubble completely: e.g. ⬤ [B] [C] [D]
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                {allQuestions.map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-1.5 border border-slate-200 rounded text-xs font-mono">
                    <span className="w-6 font-bold text-slate-900">{idx + 1}.</span>
                    <div className="flex items-center gap-1.5">
                      {['A', 'B', 'C', 'D'].map(letter => (
                        <div
                          key={letter}
                          className="w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-700"
                        >
                          {letter}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Key & Solution Explanations (Optional) */}
          {includeAnswers && (
            <div className="print-page border-t-2 border-slate-900 pt-8 space-y-6 font-sans">
              <div className="border-b border-slate-400 pb-2">
                <h3 className="text-base font-bold uppercase tracking-wider text-slate-950">
                  Official Answer Key & Conceptual Solutions
                </h3>
                <p className="text-xs text-slate-500">
                  Detachable scoring key with authoritative distractor rationale.
                </p>
              </div>

              <div className="space-y-4">
                {allQuestions.map((q, idx) => (
                  <div key={q.id} className="print-avoid-break p-3 border border-slate-200 rounded text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">
                        Question {idx + 1}: ({String.fromCharCode(65 + q.correctIndex)}) {q.options[q.correctIndex]}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{q.topic}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed pt-1">
                      <span className="font-bold">Rationale:</span> {q.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
