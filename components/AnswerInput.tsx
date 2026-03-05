'use client';

import { useEffect, useRef, useState } from 'react';

interface AnswerInputProps {
  value: string;
  onChange: (val: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function AnswerInput({
  value,
  onChange,
  isRecording,
  onToggleRecording,
  onSubmit,
  isLoading,
}: AnswerInputProps) {
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    setSpeechSupported(supported);
    // Detect iOS for voice-not-available note
    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent) && !supported);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);

  const canSubmit = value.trim().length > 0 && !isLoading;

  return (
    <div className="space-y-3">
      {/* iOS: voice not available */}
      {isIOS && (
        <p className="text-xs text-center text-slate-400 bg-slate-100 rounded-lg py-2 px-3">
          Voice input isn't available in Safari — type your answer below
        </p>
      )}

      {/* Mic button */}
      {speechSupported && (
        <div className="flex justify-center">
          <button
            onClick={onToggleRecording}
            disabled={isLoading}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
              isRecording
                ? 'bg-red-500 shadow-lg shadow-red-500/40 scale-110'
                : 'bg-white border-2 border-slate-200 hover:border-slate-300 hover:shadow-md'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
            )}
            <svg
              className={`w-6 h-6 ${isRecording ? 'text-white' : 'text-slate-600'}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
          </button>
          {isRecording && (
            <p className="absolute mt-20 text-xs text-red-500 font-medium animate-pulse">
              Listening...
            </p>
          )}
        </div>
      )}

      {/* Text area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type your answer here, or use the mic above..."
          disabled={isLoading}
          rows={4}
          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/30 focus:border-[#1e3a5f] transition-all disabled:opacity-50 disabled:bg-slate-50 text-base leading-relaxed"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
              onSubmit();
            }
          }}
        />
        {value.trim().length > 0 && (
          <span className="absolute bottom-3 right-3 text-xs text-slate-400">
            {value.trim().split(/\s+/).length} words
          </span>
        )}
      </div>

      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className="w-full py-3.5 bg-[#1e3a5f] text-white rounded-xl font-semibold text-sm hover:bg-[#16304f] active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Getting feedback...
          </>
        ) : (
          <>
            Submit Answer
            <span className="text-xs opacity-60 ml-1 hidden sm:inline">⌘↵</span>
          </>
        )}
      </button>
    </div>
  );
}
