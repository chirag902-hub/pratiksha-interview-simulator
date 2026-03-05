'use client';

import { useState } from 'react';
import type { SavedSession, Turn, Score } from '@/lib/types';
import { deleteSession, deleteTurnFromSession } from '@/lib/storage';

interface SessionsDrawerProps {
  sessions: SavedSession[];
  onClose: () => void;
  onSessionsChange: () => void; // triggers re-read from localStorage
}

const SCORE_DOT: Record<Score, string> = {
  strong: 'bg-green-500',
  developing: 'bg-yellow-400',
  weak: 'bg-red-500',
};

const SCORE_BADGE: Record<Score, { bg: string; text: string; label: string }> = {
  strong:     { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Strong' },
  developing: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Developing' },
  weak:       { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Needs work' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function TurnCard({
  turn,
  index,
  sessionId,
  onDelete,
}: {
  turn: Turn;
  index: number;
  sessionId: string;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'manager' | 'recruiter' | 'coach'>('coach');
  const [confirming, setConfirming] = useState(false);

  const badge = SCORE_BADGE[turn.score];

  function handleDelete() {
    deleteTurnFromSession(sessionId, index);
    onDelete();
  }

  function renderMarkdown(text: string) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden">
      {/* Turn header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-3 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <span className={`mt-0.5 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
        <p className="text-sm text-slate-700 flex-1 line-clamp-2">{turn.question}</p>
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 p-3 space-y-3">
          {/* Answer */}
          <div>
            <p className="text-xs text-slate-400 mb-1">Answer</p>
            <p className="text-sm text-slate-700 leading-relaxed bg-white rounded-lg p-3 border border-slate-100">
              {turn.answer}
            </p>
          </div>

          {/* Feedback tabs */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="flex border-b border-slate-100">
              {([
                { id: 'manager' as const, label: 'HM', color: 'text-[#1e3a5f] border-[#1e3a5f]' },
                { id: 'recruiter' as const, label: 'Recruiter', color: 'text-[#d97706] border-[#d97706]' },
                { id: 'coach' as const, label: 'Coach', color: 'text-[#059669] border-[#059669]' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === tab.id ? tab.color : 'border-transparent text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-3">
              {activeTab === 'manager' && (
                <div
                  className="text-xs text-slate-600 leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-800"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(turn.hiringManagerFeedback) }}
                />
              )}
              {activeTab === 'recruiter' && (
                <div
                  className="text-xs text-slate-600 leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-800"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(turn.recruiterFeedback) }}
                />
              )}
              {activeTab === 'coach' && (
                <div className="space-y-2">
                  <div
                    className="text-xs text-slate-600 leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-800"
                    dangerouslySetInnerHTML={{
                      __html: renderMarkdown(turn.coachFeedback.replace(/\*\*Stronger version:\*\*[\s\S]*/i, '')),
                    }}
                  />
                  {turn.strongerVersion && (
                    <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Stronger version</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{turn.strongerVersion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Delete turn */}
          <div className="flex justify-end">
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Remove this answer?</span>
                <button
                  onClick={handleDelete}
                  className="text-xs text-red-600 font-semibold hover:text-red-700"
                >
                  Yes, remove
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Remove answer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
  onTurnDelete,
}: {
  session: SavedSession;
  onDelete: () => void;
  onTurnDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function handleDelete() {
    deleteSession(session.id);
    onDelete();
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Session header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-slate-400">{formatDate(session.date)}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {session.turns.length} {session.turns.length === 1 ? 'question' : 'questions'} · {session.strongPct}% strong
            </p>
          </div>
          <div className="flex items-center gap-2">
            {confirming ? (
              <div className="flex items-center gap-2">
                <button onClick={handleDelete} className="text-xs text-red-600 font-semibold">Delete</button>
                <button onClick={() => setConfirming(false)} className="text-xs text-slate-400">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Score dots */}
        <div className="flex items-center gap-1.5 mb-3">
          {session.turns.map((t, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${SCORE_DOT[t.score]}`} title={t.score} />
          ))}
        </div>

        {/* Summary snippet */}
        {session.summaryText && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{session.summaryText}</p>
        )}

        {/* Expand button */}
        {session.turns.length > 0 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-3 flex items-center gap-1 text-xs text-[#1e3a5f] font-semibold hover:text-[#16304f] transition-colors"
          >
            {expanded ? 'Hide answers' : `View ${session.turns.length} answers`}
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Turns */}
      {expanded && (
        <div className="border-t border-slate-100 p-4 space-y-2">
          {session.turns.map((turn, i) => (
            <TurnCard
              key={i}
              turn={turn}
              index={i}
              sessionId={session.id}
              onDelete={onTurnDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SessionsDrawer({ sessions, onClose, onSessionsChange }: SessionsDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 animate-in"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Drawer — max-h uses dvh so iOS address bar doesn't clip it */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-slate-50 rounded-t-3xl max-h-[90dvh] flex flex-col"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Past Sessions</h2>
            <p className="text-xs text-slate-500">{sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} saved</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content — overscroll-contain prevents scroll chaining on iOS */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch', paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
        >
          {sessions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-slate-600">No sessions yet</p>
              <p className="text-xs text-slate-400 mt-1">Complete an interview to see it here</p>
            </div>
          ) : (
            sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                onDelete={onSessionsChange}
                onTurnDelete={onSessionsChange}
              />
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
      `}</style>
    </>
  );
}
