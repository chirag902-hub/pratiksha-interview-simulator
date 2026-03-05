'use client';

import { useState } from 'react';

interface InterviewHeaderProps {
  turnCount: number;
  onEnd: () => void;
  onReset: () => void;
}

export default function InterviewHeader({ turnCount, onEnd, onReset }: InterviewHeaderProps) {
  const [confirmingReset, setConfirmingReset] = useState(false);

  function handleReset() {
    setConfirmingReset(false);
    onReset();
  }

  return (
    <div className="bg-white border-b border-slate-100 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">All That Housing</p>
            <p className="text-xs text-slate-500">Administrative Assistant Interview</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {turnCount > 0 && (
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {turnCount} {turnCount === 1 ? 'answer' : 'answers'}
            </span>
          )}

          {confirmingReset ? (
            <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2.5 py-1.5 border border-red-100">
              <span className="text-xs text-red-600">Discard {turnCount} {turnCount === 1 ? 'answer' : 'answers'}?</span>
              <button
                onClick={handleReset}
                className="text-xs text-red-600 font-semibold hover:text-red-700"
              >
                Yes
              </button>
              <button
                onClick={() => setConfirmingReset(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => turnCount > 0 ? setConfirmingReset(true) : onReset()}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors font-medium flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
              <button
                onClick={onEnd}
                className="text-xs text-slate-500 hover:text-red-500 transition-colors font-medium"
              >
                End session
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
