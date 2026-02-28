'use client';

import { FormEvent, useState } from 'react';
import { ChatMessage, Message } from './chat-message';

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || loading) return;

    const userContent = question.trim();
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: userContent,
    };

    setMessages((prev) => [...prev, userMessage]);
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

  return (
    <main style={{ maxWidth: 880, margin: '0 auto', padding: 24 }}>
      <h1 style={{ marginBottom: 8 }}>WikiAgent</h1>
      <p style={{ marginTop: 0, color: '#4b5563' }}>Ask factual questions and get Wikipedia-backed answers.</p>

      <form onSubmit={onSubmit} style={{ display: 'flex', gap: 8, marginTop: 16, marginBottom: 16 }}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Who discovered penicillin?"
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #2563eb',
            background: '#2563eb',
            color: 'white',
          }}
        >
          {loading ? 'Thinking…' : 'Ask'}
        </button>
      </form>

      <section aria-live="polite">
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
      </section>
    </main>
  );
}
