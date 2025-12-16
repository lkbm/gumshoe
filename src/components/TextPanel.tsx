import { useRef, useEffect } from 'preact/hooks';

interface TextPanelProps {
  messages: string[];
}

export function TextPanel({ messages }: TextPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div class="text-panel" ref={panelRef}>
      {messages.map((message, idx) => (
        <p key={idx} class="message">
          {message}
        </p>
      ))}
      <span class="prompt">&gt;_</span>
    </div>
  );
}
