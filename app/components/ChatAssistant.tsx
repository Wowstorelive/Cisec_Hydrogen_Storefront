// app/components/ChatAssistant.tsx
import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const fetcher = useFetcher();

  const sendMessage = async () => {
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');

    fetcher.submit(
      { message: input, history: JSON.stringify(updatedMessages) },
      { method: 'post', action: '/api/chat' }
    );
  };

  useEffect(() => {
    if (fetcher.data?.response) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: fetcher.data.response },
      ]);
    }
  }, [fetcher.data]);

  return (
    <>
      <button
        className="chat-button"
        onClick={() => setIsOpen(!isOpen)}
      >
        💬 Chat with us
      </button>

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Wow Store Assistant</h3>
            <button onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`message ${msg.role}`}>
                {msg.content}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}
