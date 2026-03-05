import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { RECRUITER_SYSTEM_PROMPT, COACH_SYSTEM_PROMPT } from '@/lib/personas';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { question, answer, persona } = await request.json() as {
      question: string;
      answer: string;
      persona: 'recruiter' | 'coach';
    };

    const systemPrompt = persona === 'recruiter' ? RECRUITER_SYSTEM_PROMPT : COACH_SYSTEM_PROMPT;

    const userMessage = `Interview question: ${question}

Candidate's answer: ${answer}

${persona === 'recruiter'
  ? 'Evaluate presentation only.'
  : 'Provide your three-section feedback with "What worked", "What to improve", and "Stronger version".'
}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });

    const feedback = response.content[0].type === 'text' ? response.content[0].text : '';

    if (persona === 'coach') {
      // Extract stronger version section
      const strongerMatch = feedback.match(/\*\*Stronger version:\*\*([\s\S]*?)(?=\*\*|$)/i);
      const strongerVersion = strongerMatch ? strongerMatch[1].trim() : '';
      return NextResponse.json({ feedback, strongerVersion });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('feedback error:', error);
    return NextResponse.json(
      { error: 'Failed to generate feedback' },
      { status: 500 }
    );
  }
}
