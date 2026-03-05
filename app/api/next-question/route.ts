import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { HIRING_MANAGER_SYSTEM_PROMPT } from '@/lib/personas';
import type { Turn, NextQuestionResponse } from '@/lib/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { conversationHistory, currentQuestion, currentAnswer } = await request.json() as {
      conversationHistory: Turn[];
      currentQuestion: string;
      currentAnswer: string;
    };

    const historyText = conversationHistory.length > 0
      ? conversationHistory.map((t, i) =>
          `Turn ${i + 1}:\nQ: ${t.question}\nA: ${t.answer}\nScore: ${t.score}`
        ).join('\n\n')
      : 'This is the first answer.';

    const userMessage = `Conversation history so far:
${historyText}

Current question: ${currentQuestion}
Candidate's answer: ${currentAnswer}

Evaluate this answer and generate the next question. Remember to respond ONLY as valid JSON.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: HIRING_MANAGER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed: NextQuestionResponse = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('next-question error:', error);
    return NextResponse.json(
      { error: 'Failed to generate next question' },
      { status: 500 }
    );
  }
}
