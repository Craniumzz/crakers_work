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
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div
        style={{
          maxWidth: '82%',
          padding: 12,
          borderRadius: 10,
          border: '1px solid #e5e7eb',
          background: isUser ? '#eff6ff' : '#ffffff',
        }}
      >
        <div style={{ whiteSpace: 'pre-wrap' }}>{message.content}</div>

        {!isUser && message.sources && message.sources.length > 0 && (
          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 18 }}>
            {message.sources.map((source) => (
              <li key={source}>
                <a href={source} target="_blank" rel="noreferrer">
                  {source}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
