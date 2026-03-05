export type Score = 'weak' | 'developing' | 'strong';

export type Turn = {
  question: string;
  answer: string;
  hiringManagerFeedback: string;
  recruiterFeedback: string;
  coachFeedback: string;
  strongerVersion: string;
  score: Score;
};

export type Phase = 'welcome' | 'interview' | 'summary';

export type SessionState = {
  phase: Phase;
  turns: Turn[];
  currentQuestion: string;
  isRecording: boolean;
  isLoading: boolean;
  currentAnswer: string;
};

export type NextQuestionResponse = {
  feedback: string;
  score: Score;
  nextQuestion: string;
};

export type FeedbackResponse = {
  feedback: string;
  strongerVersion?: string;
};

export type SavedSession = {
  id: string;
  date: string; // ISO string
  turns: Turn[];
  summaryText: string;
  strongPct: number;
};
