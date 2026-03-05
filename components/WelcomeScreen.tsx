'use client';

interface WelcomeScreenProps {
  onStart: () => void;
  onViewSessions: () => void;
  sessionCount: number;
}

export default function WelcomeScreen({ onStart, onViewSessions, sessionCount }: WelcomeScreenProps) {
  return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center px-4 pt-4" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1e3a5f] mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Interview Simulator
          </h1>
          <p className="text-slate-500 text-sm">All That Housing · Administrative Assistant</p>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex items-start gap-4 mb-5 pb-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
              <span className="text-slate-600 font-semibold text-sm">P</span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Pratiksha Bharat Kumar</p>
              <p className="text-sm text-slate-500">6+ years Administrative Experience · Dallas, TX</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-5">
            This simulator runs a live adaptive interview. Three AI personas evaluate every answer in parallel — giving you hiring manager feedback, presentation coaching, and a rewritten stronger version.
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#1e3a5f]" />
              <span className="text-sm text-slate-600"><strong className="text-slate-800">Lyndi Carson</strong> — Hiring Manager, adapts questions to your answers</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#d97706]" />
              <span className="text-sm text-slate-600"><strong className="text-slate-800">Recruiter</strong> — Presentation feedback only</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#059669]" />
              <span className="text-sm text-slate-600"><strong className="text-slate-800">Career Coach</strong> — Rewrites your answer in STAR format</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">Before you start</p>
          <ul className="text-sm text-amber-800 space-y-1">
            <li>• Use Chrome or Edge for voice input</li>
            <li>• Answer each question as if it's a real interview</li>
            <li>• You can retry any question before advancing</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={onStart}
            className="w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#16304f] active:scale-[0.98] transition-all duration-150 shadow-lg shadow-[#1e3a5f]/20"
          >
            Start Interview
          </button>

          <button
            onClick={onViewSessions}
            className="w-full bg-white border border-slate-200 text-slate-600 py-3.5 rounded-xl font-medium text-sm hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Past Sessions
            {sessionCount > 0 && (
              <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {sessionCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
