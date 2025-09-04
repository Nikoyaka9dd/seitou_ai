"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import logoIcon from '../../assets/icon.png';

// アイコンのSVGコンポーネント
const SendIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
  </svg>
);
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);


type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatPageProps = {
  params: {
    partyName: string;
  };
};

export default function ChatPage({ params }: ChatPageProps) {
  const partyName = decodeURIComponent(params.partyName);
  const router = useRouter();

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastEnterPress = useRef(0); // Enterキーの最終押下時間を記録

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: inputValue }];
    setMessages(newMessages);
    const question = inputValue;
    setInputValue("");
    setIsLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, partyName }),
      });

      if (!response.ok) {
        throw new Error('サーバーエラー');
      }
      const data = await response.json();
      setMessages([...newMessages, { role: 'assistant', content: data.answer }]);

    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: 'assistant', content: 'エラーが発生しました。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      return; // Shift + Enter で改行を許可
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentTime = new Date().getTime();
      const timeSinceLastPress = currentTime - lastEnterPress.current;
      
      if (timeSinceLastPress < 300) { // 300ミリ秒以内に再度Enterが押されたら送信
        handleSubmit();
        lastEnterPress.current = 0;
      } else {
        lastEnterPress.current = currentTime;
      }
    }
  };


  return (

    <div className="container page-transition-wrapper">
      <header className="chat-header">
        <button onClick={() => router.back()} className="back-button">
          <BackIcon />
        </button>
        <div className="chat-header-title">
          <span>{partyName}</span>
        </div>
        <div style={{ width: 40 }}></div>
      </header>

      <main className="chat-history">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user' : 'assistant'}`}>
            <div className="chat-bubble">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble-wrapper assistant">
            <div className="loading-bubble">
              <span className="dot"></span><span className="dot"></span><span className="dot"></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      <footer className="chat-footer">
        <div className="question-area">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="質問を入力..."
            className="question-input"
            rows={1}
          />
          <button className="submit-button" onClick={handleSubmit} aria-label="送信">
            <SendIcon />
          </button>
        </div>
        <p className="chat-footer-note">
          質問内容に困ったら <a href="#" className="help-link">help</a>
        </p>
      </footer>
    </div>
  );
}

