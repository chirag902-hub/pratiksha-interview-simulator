'use client';

import { useState } from 'react';
import type { Score } from '@/lib/types';

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

interface FeedbackPanelProps {
  hiringManagerFeedback: string;
  recruiterFeedback: string;
  coachFeedback: string;
  strongerVersion: string;
  score: Score;
}

const SCORE_CONFIG: Record<Score, { label: string; dot: string; bg: string; text: string }> = {
  weak: { label: 'Needs work', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  developing: { label: 'Developing', dot: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700' },
  strong: { label: 'Strong', dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
};

type Tab = 'manager' | 'recruiter' | 'coach';

export default function FeedbackPanel({
  hiringManagerFeedback,
  recruiterFeedback,
  coachFeedback,
  strongerVersion,
  score,
}: FeedbackPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>('manager');
  const scoreConf = SCORE_CONFIG[score];

  const tabs: { id: Tab; label: string; color: string; activeColor: string }[] = [
    { id: 'manager', label: 'Hiring Manager', color: 'text-slate-500', activeColor: 'text-[#1e3a5f] border-[#1e3a5f]' },
    { id: 'recruiter', label: 'Recruiter', color: 'text-slate-500', activeColor: 'text-[#d97706] border-[#d97706]' },
    { id: 'coach', label: 'Career Coach', color: 'text-slate-500', activeColor: 'text-[#059669] border-[#059669]' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
      {/* Score badge */}
      <div className={`flex items-center gap-2 px-5 py-3 ${scoreConf.bg} border-b border-slate-100`}>
        <div className={`w-2 h-2 rounded-full ${scoreConf.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-wide ${scoreConf.text}`}>
          {scoreConf.label}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-all ${
              activeTab === tab.id
                ? tab.activeColor
                : 'border-transparent ' + tab.color + ' hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {activeTab === 'manager' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#1e3a5f] flex items-center justify-center">
                <span className="text-white text-xs font-bold">L</span>
              </div>
              <span className="text-xs font-semibold text-[#1e3a5f]">Lyndi Carson</span>
            </div>
            <div
              className="text-sm text-slate-700 leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(hiringManagerFeedback) }}
            />
          </div>
        )}

        {activeTab === 'recruiter' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">R</span>
              </div>
              <span className="text-xs font-semibold text-amber-600">Recruiter · Toni Andell</span>
            </div>
            <div
              className="text-sm text-slate-700 leading-relaxed [&_strong]:font-semibold [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(recruiterFeedback) }}
            />
          </div>
        )}

        {activeTab === 'coach' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">C</span>
              </div>
              <span className="text-xs font-semibold text-emerald-600">Career Coach</span>
            </div>
            <div
              className="text-sm text-slate-700 leading-relaxed space-y-2 [&_strong]:font-semibold [&_strong]:text-slate-900"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(coachFeedback.replace(/\*\*Stronger version:\*\*[\s\S]*/i, '')),
              }}
            />
            {strongerVersion && (
              <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Stronger version</p>
                <p className="text-sm text-slate-700 leading-relaxed">{strongerVersion}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
