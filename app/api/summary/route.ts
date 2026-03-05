import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import type { Turn } from '@/lib/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { turns } = await request.json() as { turns: Turn[] };

    if (!turns || turns.length === 0) {
      return NextResponse.json({ summary: 'No answers to summarize.' });
    }

    const turnSummaries = turns.map((t, i) =>
      `Turn ${i + 1} (${t.score}): Q: "${t.question.slice(0, 80)}..." — Coach noted: "${t.coachFeedback.slice(0, 150)}..."`
    ).join('\n');

    const strongCount = turns.filter((t) => t.score === 'strong').length;
    const weakCount = turns.filter((t) => t.score === 'weak').length;

    const message = `Pratiksha completed a mock interview with ${turns.length} questions. ${strongCount} were scored "strong" and ${weakCount} were "weak".

Turn-by-turn summary:
${turnSummaries}

Write a concise growth arc summary (3-4 sentences):
1. What improved across the session (be specific — reference actual topics like calendar coordination, document systems, etc.)
2. Top 1-2 things still to work on
3. A genuine encouraging close tailored to her performance level

Keep it warm, honest, and specific to Pratiksha's interview for the Administrative Assistant role at All That Housing.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{ role: 'user', content: message }],
    });

    const summary = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('summary error:', error);
    return NextResponse.json({ summary: 'Session complete. Review your feedback above to keep improving.' });
  }
}
