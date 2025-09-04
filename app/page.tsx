"use client"; // クライアントコンポーネントとして動作させる宣言

import { useState, useRef, KeyboardEvent } from "react";

// lucide-reactの代わりにSVGを直接使用
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

// 送信ボタン用のアイコン
const SendIcon = () => (
  <svg
    xmlns="http://www.w.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [showResults, setShowResults] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const politicalParties = [
    "自民党", "民主党", "維新", "公明党",
    "国民民主", "共産党", "れいわ", "社民党",
    "参政党", "みんな", "みらい"
  ];

  const handleSubmit = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      setSubmittedQuestion(trimmedInput);
      setShowResults(true);
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <div className="logo">ロゴ</div>
          <button className="menu-button" aria-label="menu">
            <MenuIcon />
          </button>
        </div>
      </header>

      <div className="container">
        <main className="main-content">
          <div className="w-full flex flex-col items-center">
            { !showResults ? (
              <>
                <h1 className="welcome-title">
                  ようこそ <span className="highlight">ちょいぽりてぃ</span> へ
                </h1>
                <p className="welcome-subtitle">こんな機能がありまっせ</p>
                <div className="features-grid">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="feature-item">
                      機能{i + 1}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* ★変更：質問を右寄せにするためのラッパーを追加 */}
                <div className="submitted-question-wrapper">
                  <div className="submitted-question">{submittedQuestion}</div>
                </div>
                <div className="party-answers-grid">
                  {politicalParties.map((party, index) => (
                    <button key={index} className="party-answer-button">
                      {party}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="w-full">
            {/* ★変更：!showResultsの時だけ表示するようにする */}
            { !showResults && <p className="question-prompt">質問してみよう ↓</p> }
            <div className="question-area">
              <textarea
                ref={textareaRef}
                className="question-input"
                placeholder="ここに質問を入力してください"
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                }}
              ></textarea>
              <button
                className="submit-button"
                aria-label="質問を送信"
                onClick={handleSubmit}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </main>

        <footer className="footer">
          質問内容に困ったら{" "}
          <button className="help-link">help</button>
        </footer>
      </div>
    </>
  );
}
