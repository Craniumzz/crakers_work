'use client';

import { FormEvent, useState } from 'react';
import { ChatMessage, Message } from './chat-message';

const SUGGESTIONS = [
  'Who discovered penicillin?',
  'What is quantum entanglement?',
  'Who is Narendra Modi?',
  'When did World War II end?',
];

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const askQuestion = async (rawQuestion: string) => {
    const userContent = rawQuestion.trim();
    if (!userContent || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: userContent,
      },
    ]);

    setQuestion('');
    setLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userContent }),
      });

      const payload = (await response.json()) as { answer?: string; sources?: string[]; error?: string };
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: payload.answer ?? payload.error ?? 'Sorry, something went wrong.',
          sources: payload.sources ?? [],
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Request failed. Please try again.',
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await askQuestion(question);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur-sm">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">WikiAgent</h1>
            <p className="mt-1 text-sm text-slate-600">Ask factual questions and get concise Wikipedia-backed answers.</p>
          </div>
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">AI + Wikipedia</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => askQuestion(suggestion)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:bg-slate-100"
              disabled={loading}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mb-5 flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Who is Modi?"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-blue-500 transition focus:ring-2"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {loading ? 'Thinking…' : 'Ask'}
          </button>
        </form>

        <section aria-live="polite" className="max-h-[60vh] space-y-1 overflow-y-auto rounded-xl bg-slate-50 p-3">
          {messages.length === 0 ? (
            <p className="p-3 text-sm text-slate-500">Start by asking any factual question.</p>
          ) : (
            messages.map((m) => <ChatMessage key={m.id} message={m} />)
          )}
        </section>
      </section>
    </main>
  );
}
