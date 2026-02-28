import { NextRequest, NextResponse } from 'next/server';
import { answerQuestionWithWikipedia } from '@/ai/flows/answer-question-with-wikipedia';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { question?: string };
    if (!body.question || !body.question.trim()) {
      return NextResponse.json({ error: 'question is required' }, { status: 400 });
    }

    const result = await answerQuestionWithWikipedia({ question: body.question.trim() });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ answer: 'Failed to process question.', sources: [] }, { status: 500 });
  }
}
