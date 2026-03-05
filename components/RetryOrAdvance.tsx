'use client';

interface RetryOrAdvanceProps {
  onRetry: () => void;
  onAdvance: () => void;
  nextQuestion: string;
}

export default function RetryOrAdvance({ onRetry, onAdvance, nextQuestion }: RetryOrAdvanceProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onAdvance}
        className="w-full py-3.5 bg-[#1e3a5f] text-white rounded-xl font-semibold text-sm hover:bg-[#16304f] active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
      >
        Next question
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <button
        onClick={onRetry}
        className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition-all duration-150"
      >
        Try again
      </button>
      {nextQuestion && (
        <p className="text-xs text-slate-400 text-center px-4">
          Next: <span className="text-slate-500 italic">"{nextQuestion.slice(0, 60)}{nextQuestion.length > 60 ? '...' : ''}"</span>
        </p>
      )}
    </div>
  );
}
