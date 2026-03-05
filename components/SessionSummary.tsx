'use client';

import { useEffect, useRef, useState } from 'react';
import type { Turn } from '@/lib/types';

interface SessionSummaryProps {
  turns: Turn[];
  sessionId: string;
  onRestart: () => void;
  onViewSessions: () => void;
  onSummaryReady: (summaryText: string) => void;
}

export default function SessionSummary({
  turns,
  onRestart,
  onViewSessions,
  onSummaryReady,
}: SessionSummaryProps) {
  const [summaryText, setSummaryText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const savedRef = useRef(false);

  const strongCount = turns.filter((t) => t.score === 'strong').length;
  const weakCount = turns.filter((t) => t.score === 'weak').length;
  const pct = turns.length > 0 ? Math.round((strongCount / turns.length) * 100) : 0;

  useEffect(() => {
    async function generateSummary() {
      try {
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ turns }),
        });
        const data = await res.json();
        const text = data.summary || '';
        setSummaryText(text);
        if (!savedRef.current) {
          savedRef.current = true;
          onSummaryReady(text);
        }
      } catch {
        const fallback = 'Session complete. Review your feedback above to keep improving.';
        setSummaryText(fallback);
        if (!savedRef.current) {
          savedRef.current = true;
          onSummaryReady(fallback);
        }
      } finally {
        setIsLoading(false);
      }
    }
    generateSummary();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center px-4 pt-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Session Complete</h1>
          <p className="text-slate-500 text-sm">Here's how you did</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">{turns.length}</p>
            <p className="text-xs text-slate-500 mt-1">Questions</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
            <p className="text-2xl font-bold text-green-500">{pct}%</p>
            <p className="text-xs text-slate-500 mt-1">Strong answers</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center border border-slate-100 shadow-sm">
            <p className="text-2xl font-bold text-slate-700">{strongCount}</p>
            <p className="text-xs text-slate-500 mt-1">Nailed it</p>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Score breakdown</p>
          <div className="space-y-2">
            {[
              { label: 'Strong', count: strongCount, color: 'bg-green-500' },
              { label: 'Developing', count: turns.filter((t) => t.score === 'developing').length, color: 'bg-yellow-500' },
              { label: 'Needs work', count: weakCount, color: 'bg-red-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-sm text-slate-600 flex-1">{label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all`}
                      style={{ width: turns.length > 0 ? `${(count / turns.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-4 text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI summary */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Coach's growth summary</span>
            </div>
            {!isLoading && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded animate-pulse w-full" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-5/6" />
              <div className="h-3 bg-slate-100 rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-sm text-slate-700 leading-relaxed">{summaryText}</p>
          )}
        </div>

        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-[#1e3a5f] text-white rounded-xl font-semibold text-sm hover:bg-[#16304f] active:scale-[0.99] transition-all duration-150"
          >
            Practice again
          </button>
          <button
            onClick={onViewSessions}
            className="w-full py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View all sessions
          </button>
        </div>
      </div>
    </div>
  );
}
