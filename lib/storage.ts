import type { SavedSession } from './types';

const KEY = 'interview-sessions';

export function getSessions(): SavedSession[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveSession(session: SavedSession): void {
  const sessions = getSessions();
  // Replace if same id exists, otherwise prepend
  const idx = sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) {
    sessions[idx] = session;
  } else {
    sessions.unshift(session);
  }
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function deleteSession(id: string): void {
  const sessions = getSessions().filter((s) => s.id !== id);
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function deleteTurnFromSession(sessionId: string, turnIndex: number): void {
  const sessions = getSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) return;
  session.turns = session.turns.filter((_, i) => i !== turnIndex);
  const strongCount = session.turns.filter((t) => t.score === 'strong').length;
  session.strongPct = session.turns.length > 0
    ? Math.round((strongCount / session.turns.length) * 100)
    : 0;
  localStorage.setItem(KEY, JSON.stringify(sessions));
}
