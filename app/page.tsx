'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import InterviewHeader from '@/components/InterviewHeader';
import QuestionDisplay from '@/components/QuestionDisplay';
import AnswerInput from '@/components/AnswerInput';
import FeedbackPanel from '@/components/FeedbackPanel';
import RetryOrAdvance from '@/components/RetryOrAdvance';
import SessionSummary from '@/components/SessionSummary';
import SessionsDrawer from '@/components/SessionsDrawer';
import { getFirstQuestion } from '@/lib/seedQuestions';
import { getSessions, saveSession } from '@/lib/storage';
import type { SessionState, Turn, SavedSession } from '@/lib/types';

type FeedbackState = {
  hiringManagerFeedback: string;
  recruiterFeedback: string;
  coachFeedback: string;
  strongerVersion: string;
  score: 'weak' | 'developing' | 'strong';
  nextQuestion: string;
} | null;

export default function Home() {
  const [session, setSession] = useState<SessionState>({
    phase: 'welcome',
    turns: [],
    currentQuestion: '',
    isRecording: false,
    isLoading: false,
    currentAnswer: '',
  });

  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const currentSessionId = useRef<string>('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const feedbackRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage on mount
  useEffect(() => {
    setSavedSessions(getSessions());
  }, []);

  const refreshSessions = useCallback(() => {
    setSavedSessions(getSessions());
  }, []);

  const startInterview = useCallback(() => {
    currentSessionId.current = Date.now().toString();
    setSession((s) => ({
      ...s,
      phase: 'interview',
      currentQuestion: getFirstQuestion(),
      turns: [],
      currentAnswer: '',
    }));
    setFeedback(null);
  }, []);

  const handleReset = useCallback(() => {
    recognitionRef.current?.stop();
    currentSessionId.current = Date.now().toString();
    setSession({
      phase: 'interview',
      turns: [],
      currentQuestion: getFirstQuestion(),
      isRecording: false,
      isLoading: false,
      currentAnswer: '',
    });
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!session.currentAnswer.trim() || session.isLoading) return;

    setSession((s) => ({ ...s, isLoading: true }));

    try {
      const [managerRes, recruiterRes, coachRes] = await Promise.all([
        fetch('/api/next-question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationHistory: session.turns,
            currentQuestion: session.currentQuestion,
            currentAnswer: session.currentAnswer,
          }),
        }),
        fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: session.currentQuestion,
            answer: session.currentAnswer,
            persona: 'recruiter',
          }),
        }),
        fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: session.currentQuestion,
            answer: session.currentAnswer,
            persona: 'coach',
          }),
        }),
      ]);

      const [managerData, recruiterData, coachData] = await Promise.all([
        managerRes.json(),
        recruiterRes.json(),
        coachRes.json(),
      ]);

      setFeedback({
        hiringManagerFeedback: managerData.feedback || '',
        recruiterFeedback: recruiterData.feedback || '',
        coachFeedback: coachData.feedback || '',
        strongerVersion: coachData.strongerVersion || '',
        score: managerData.score || 'developing',
        nextQuestion: managerData.nextQuestion || '',
      });

      setTimeout(() => {
        feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSession((s) => ({ ...s, isLoading: false }));
    }
  }, [session]);

  const handleRetry = useCallback(() => {
    setFeedback(null);
    setSession((s) => ({ ...s, currentAnswer: '' }));
  }, []);

  const handleAdvance = useCallback(() => {
    if (!feedback) return;

    const newTurn: Turn = {
      question: session.currentQuestion,
      answer: session.currentAnswer,
      hiringManagerFeedback: feedback.hiringManagerFeedback,
      recruiterFeedback: feedback.recruiterFeedback,
      coachFeedback: feedback.coachFeedback,
      strongerVersion: feedback.strongerVersion,
      score: feedback.score,
    };

    const newTurns = [...session.turns, newTurn];

    if (newTurns.length >= 10) {
      setSession((s) => ({ ...s, phase: 'summary', turns: newTurns }));
      return;
    }

    setSession((s) => ({
      ...s,
      turns: newTurns,
      currentQuestion: feedback.nextQuestion,
      currentAnswer: '',
    }));
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [feedback, session]);

  const handleEndSession = useCallback(() => {
    if (session.turns.length === 0 && !feedback) {
      setSession((s) => ({ ...s, phase: 'welcome' }));
      return;
    }

    if (feedback) {
      const newTurn: Turn = {
        question: session.currentQuestion,
        answer: session.currentAnswer,
        hiringManagerFeedback: feedback.hiringManagerFeedback,
        recruiterFeedback: feedback.recruiterFeedback,
        coachFeedback: feedback.coachFeedback,
        strongerVersion: feedback.strongerVersion,
        score: feedback.score,
      };
      setSession((s) => ({ ...s, phase: 'summary', turns: [...s.turns, newTurn] }));
    } else {
      setSession((s) => ({ ...s, phase: 'summary' }));
    }
  }, [session, feedback]);

  const handleSummaryReady = useCallback((summaryText: string) => {
    const turns = session.turns;
    const strongCount = turns.filter((t) => t.score === 'strong').length;
    const strongPct = turns.length > 0 ? Math.round((strongCount / turns.length) * 100) : 0;

    const saved: SavedSession = {
      id: currentSessionId.current || Date.now().toString(),
      date: new Date().toISOString(),
      turns,
      summaryText,
      strongPct,
    };
    saveSession(saved);
    refreshSessions();
  }, [session.turns, refreshSessions]);

  const handleRestart = useCallback(() => {
    setSession({
      phase: 'welcome',
      turns: [],
      currentQuestion: '',
      isRecording: false,
      isLoading: false,
      currentAnswer: '',
    });
    setFeedback(null);
  }, []);

  const toggleRecording = useCallback(() => {
    if (session.isRecording) {
      recognitionRef.current?.stop();
      setSession((s) => ({ ...s, isRecording: false }));
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = session.currentAnswer ? session.currentAnswer + ' ' : '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t + ' ';
        } else {
          interimTranscript += t;
        }
      }
      setSession((s) => ({ ...s, currentAnswer: finalTranscript + interimTranscript }));
    };

    recognition.onend = () => setSession((s) => ({ ...s, isRecording: false }));
    recognition.onerror = () => setSession((s) => ({ ...s, isRecording: false }));

    recognitionRef.current = recognition;
    recognition.start();
    setSession((s) => ({ ...s, isRecording: true }));
  }, [session.isRecording, session.currentAnswer]);

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // Lock body scroll when drawer is open (iOS fix)
  useEffect(() => {
    if (drawerOpen) {
      document.body.classList.add('drawer-open');
    } else {
      document.body.classList.remove('drawer-open');
    }
    return () => { document.body.classList.remove('drawer-open'); };
  }, [drawerOpen]);

  if (session.phase === 'welcome') {
    return (
      <>
        <WelcomeScreen
          onStart={startInterview}
          onViewSessions={() => setDrawerOpen(true)}
          sessionCount={savedSessions.length}
        />
        {drawerOpen && (
          <SessionsDrawer
            sessions={savedSessions}
            onClose={() => setDrawerOpen(false)}
            onSessionsChange={refreshSessions}
          />
        )}
      </>
    );
  }

  if (session.phase === 'summary') {
    return (
      <>
        <SessionSummary
          turns={session.turns}
          sessionId={currentSessionId.current}
          onRestart={handleRestart}
          onViewSessions={() => setDrawerOpen(true)}
          onSummaryReady={handleSummaryReady}
        />
        {drawerOpen && (
          <SessionsDrawer
            sessions={savedSessions}
            onClose={() => setDrawerOpen(false)}
            onSessionsChange={refreshSessions}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="min-h-dvh bg-slate-50">
        <InterviewHeader
          turnCount={session.turns.length}
          onEnd={handleEndSession}
          onReset={handleReset}
        />

        <main className="max-w-2xl mx-auto px-4 pt-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 24px)' }}>
          <QuestionDisplay
            question={session.currentQuestion}
            questionNumber={session.turns.length + 1}
          />

          {!feedback && (
            <AnswerInput
              value={session.currentAnswer}
              onChange={(val) => setSession((s) => ({ ...s, currentAnswer: val }))}
              isRecording={session.isRecording}
              onToggleRecording={toggleRecording}
              onSubmit={handleSubmit}
              isLoading={session.isLoading}
            />
          )}

          {feedback && (
            <div ref={feedbackRef} className="space-y-4">
              <div className="bg-white rounded-2xl rounded-tr-sm border border-slate-100 p-4">
                <p className="text-xs text-slate-400 mb-1">Your answer</p>
                <p className="text-sm text-slate-700 leading-relaxed">{session.currentAnswer}</p>
              </div>

              <FeedbackPanel
                hiringManagerFeedback={feedback.hiringManagerFeedback}
                recruiterFeedback={feedback.recruiterFeedback}
                coachFeedback={feedback.coachFeedback}
                strongerVersion={feedback.strongerVersion}
                score={feedback.score}
              />

              <RetryOrAdvance
                onRetry={handleRetry}
                onAdvance={handleAdvance}
                nextQuestion={feedback.nextQuestion}
              />
            </div>
          )}
        </main>
      </div>

      {drawerOpen && (
        <SessionsDrawer
          sessions={savedSessions}
          onClose={() => setDrawerOpen(false)}
          onSessionsChange={refreshSessions}
        />
      )}
    </>
  );
}
