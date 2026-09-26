import React, { useState } from 'react';
import { X, RotateCcw, Calculator as CalcIcon, Trash2 } from 'lucide-react';

interface ScientificCalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [formula, setFormula] = useState('');
  const [isRad, setIsRad] = useState(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  if (!isOpen) return null;

  const handleNumber = (digit: string) => {
    setDisplay(prev => (prev === '0' || prev === 'Error' ? digit : prev + digit));
  };

  const handleDecimal = () => {
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setFormula('');
  };

  const handleBackspace = () => {
    setDisplay(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  };

  const handleOperator = (op: string) => {
    setFormula(`${display} ${op} `);
    setDisplay('0');
  };

  const handleScientific = (fn: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (fn) {
        case 'sin':
          res = isRad ? Math.sin(val) : Math.sin((val * Math.PI) / 180);
          break;
        case 'cos':
          res = isRad ? Math.cos(val) : Math.cos((val * Math.PI) / 180);
          break;
        case 'tan':
          res = isRad ? Math.tan(val) : Math.tan((val * Math.PI) / 180);
          break;
        case 'sqrt':
          if (val < 0) throw new Error('Invalid');
          res = Math.sqrt(val);
          break;
        case 'sqr':
          res = Math.pow(val, 2);
          break;
        case 'log':
          if (val <= 0) throw new Error('Invalid');
          res = Math.log10(val);
          break;
        case 'ln':
          if (val <= 0) throw new Error('Invalid');
          res = Math.log(val);
          break;
        case 'inv':
          if (val === 0) throw new Error('Div/0');
          res = 1 / val;
          break;
        case 'neg':
          res = -val;
          break;
        case 'pi':
          res = Math.PI;
          break;
        case 'e':
          res = Math.E;
          break;
        default:
          return;
      }
      const formatted = parseFloat(res.toFixed(8)).toString();
      setDisplay(formatted);
      setHistory(prev => [`${fn}(${val}) = ${formatted}`, ...prev.slice(0, 15)]);
    } catch {
      setDisplay('Error');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpr = `${formula}${display}`
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**');

      // Safe arithmetic evaluator
      if (!/^[0-9+\-*/().\s%]+$/.test(fullExpr)) {
        throw new Error('Invalid input');
      }

      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpr})`)();
      const formatted = parseFloat(Number(result).toFixed(8)).toString();

      setHistory(prev => [`${formula}${display} = ${formatted}`, ...prev.slice(0, 15)]);
      setDisplay(formatted);
      setFormula('');
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 overflow-hidden font-sans backdrop-blur-lg animate-in fade-in slide-in-from-bottom-5 duration-200">
      {/* Title Bar */}
      <div className="px-4 py-2.5 bg-slate-950 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <CalcIcon className="w-4 h-4 text-emerald-400" />
          <span>Standardized CBT Calculator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-2 py-0.5 text-[10px] rounded font-mono transition-colors ${
              showHistory ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-800'
            }`}
          >
            History
          </button>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800/80 text-right">
        <div className="h-4 text-[11px] text-slate-400 font-mono tracking-wider overflow-hidden truncate">
          {formula || '\u00A0'}
        </div>
        <div className="text-2xl font-mono font-bold tracking-tight text-emerald-400 overflow-x-auto truncate">
          {display}
        </div>
        <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 border-t border-slate-800/60 mt-2 font-mono">
          <button
            onClick={() => setIsRad(!isRad)}
            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
          <span>MEM: {memory}</span>
        </div>
      </div>

      {/* History Tape Overlay */}
      {showHistory && (
        <div className="max-h-40 overflow-y-auto p-3 bg-slate-950/95 border-b border-slate-800 text-xs font-mono space-y-1">
          <div className="flex items-center justify-between pb-1 text-[10px] text-slate-400 border-b border-slate-800">
            <span>Audit Tape</span>
            <button
              onClick={() => setHistory([])}
              className="text-red-400 hover:text-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>
          {history.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-2 text-center">No calculations yet</p>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="text-slate-300 text-right truncate">
                {item}
              </div>
            ))
          )}
        </div>
      )}

      {/* Keypad Grid */}
      <div className="p-3 bg-slate-900 grid grid-cols-5 gap-1.5 text-xs font-mono select-none">
        {/* Row 1: Sci functions */}
        <button onClick={() => handleScientific('sin')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">sin</button>
        <button onClick={() => handleScientific('cos')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">cos</button>
        <button onClick={() => handleScientific('tan')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">tan</button>
        <button onClick={handleClear} className="p-2 rounded bg-amber-900/60 hover:bg-amber-800/70 text-amber-200 font-bold">C</button>
        <button onClick={handleBackspace} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">⌫</button>

        {/* Row 2 */}
        <button onClick={() => handleScientific('sqrt')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">√x</button>
        <button onClick={() => handleScientific('sqr')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">x²</button>
        <button onClick={() => handleScientific('inv')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">1/x</button>
        <button onClick={() => handleOperator('/')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold">÷</button>
        <button onClick={() => handleOperator('*')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold">×</button>

        {/* Row 3 */}
        <button onClick={() => handleScientific('log')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">log</button>
        <button onClick={() => handleNumber('7')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">7</button>
        <button onClick={() => handleNumber('8')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">8</button>
        <button onClick={() => handleNumber('9')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">9</button>
        <button onClick={() => handleOperator('-')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold">-</button>

        {/* Row 4 */}
        <button onClick={() => handleScientific('ln')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">ln</button>
        <button onClick={() => handleNumber('4')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">4</button>
        <button onClick={() => handleNumber('5')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">5</button>
        <button onClick={() => handleNumber('6')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">6</button>
        <button onClick={() => handleOperator('+')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold">+</button>

        {/* Row 5 */}
        <button onClick={() => handleScientific('pi')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">π</button>
        <button onClick={() => handleNumber('1')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">1</button>
        <button onClick={() => handleNumber('2')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">2</button>
        <button onClick={() => handleNumber('3')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">3</button>
        <button onClick={handleCalculate} className="row-span-2 p-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center text-base">=</button>

        {/* Row 6 */}
        <button onClick={() => handleScientific('e')} className="p-2 rounded bg-slate-800/80 hover:bg-slate-750 text-indigo-300">e</button>
        <button onClick={() => handleScientific('neg')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">±</button>
        <button onClick={() => handleNumber('0')} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">0</button>
        <button onClick={handleDecimal} className="p-2 rounded bg-slate-800 hover:bg-slate-700 text-white font-bold">.</button>
      </div>
    </div>
  );
};
