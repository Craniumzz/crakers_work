export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  sources?: string[];
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <article
        className={`max-w-[85%] rounded-2xl border px-4 py-3 shadow-sm ${
          isUser ? 'border-blue-200 bg-blue-50 text-slate-900' : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {isUser ? 'You' : 'WikiAgent'}
        </div>
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs">
            {message.sources.map((source) => (
              <li key={source}>
                <a
                  href={source}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block rounded-md bg-slate-100 px-2 py-1 text-blue-700 hover:bg-slate-200"
                >
                  {source}
                </a>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
