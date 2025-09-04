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

// 質問テンプレート用のモーダルコンポーネント
type HelpModalProps = {
    isOpen: boolean;
    isClosing: boolean;
    onClose: () => void;
    onSelectQuestion: (question: string) => void;
};

const HelpModal = ({ isOpen, isClosing, onClose, onSelectQuestion }: HelpModalProps) => {
    if (!isOpen) return null;
    
    const questionTemplates = [
        "消費税についてどう思う？",
        "子育て支援について教えて",
        "日本の防衛について",
        "年金制度の将来は？",
        "環境問題への取り組みは？"
    ];

    return (
        <div className="help-modal-backdrop" onClick={onClose}>
            <div className={`help-modal-content ${isClosing ? 'is-closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                <h3 className="help-modal-title">こんな質問をしてみよう</h3>
                <div className="question-templates-list">
                    {questionTemplates.map((q, i) => (
                        <button key={i} className="question-template-button" onClick={() => onSelectQuestion(q)}>
                            {q}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};



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
  const lastEnterPress = useRef(0);
  
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isHelpModalClosing, setIsHelpModalClosing] = useState(false); // ★追加

  // チャット履歴が更新されたら、一番下までスクロールする
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
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentTime = new Date().getTime();
      const timeSinceLastPress = currentTime - lastEnterPress.current;
      
      if (timeSinceLastPress < 300) {
        handleSubmit();
        lastEnterPress.current = 0;
      } else {
        lastEnterPress.current = currentTime;
      }
    }
  };
  

  // ヘルプモーダルを閉じる処理
  const handleCloseHelpModal = () => {
      setIsHelpModalClosing(true);
      setTimeout(() => {
          setIsHelpModalOpen(false);
          setIsHelpModalClosing(false);
      }, 400);
  };
  
  // テンプレートが選択された時の処理
  const handleSelectQuestion = (question: string) => {
    handleCloseHelpModal();
    setInputValue(question);
    setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
        }
    }, 10);
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
            placeholder="ここに質問を入力してください"
            className="question-input"
            rows={1}
          />
          <button className="submit-button" onClick={handleSubmit} aria-label="送信">
            <SendIcon />
          </button>
        </div>
        <button className="chat-footer-note footer-button" onClick={() => setIsHelpModalOpen(true)}>
          質問内容に困ったら？
        </button>
      </footer>
      

      <HelpModal 
        isOpen={isHelpModalOpen}
        isClosing={isHelpModalClosing}
        onClose={handleCloseHelpModal}
        onSelectQuestion={handleSelectQuestion}
      />
    </div>
  );
}

