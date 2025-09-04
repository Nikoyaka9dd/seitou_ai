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
    xmlns="http://www.w3.org/2000/svg"
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
  const [showResults, setShowResults] = useState(false); // ★追加: 回答表示用のstate
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ★追加: 政党のリスト
  const politicalParties = [
    "自由民主党", "立憲民主党", "日本維新の会", "公明党",
    "国民民主党", "日本共産党", "れいわ新選組", "社会民主党",
    "NHK党", "参政党", "みんなでつくる党", "新党大地",
    "沖縄社会大衆党", "地域政党あたらす会", "新しい学校をつくる党",
    "教育無償化を実現する会", "つばさの党"
  ];

  // 送信処理を行う関数
  const handleSubmit = () => {
    const trimmedInput = inputValue.trim();
    if (trimmedInput) {
      setSubmittedQuestion(trimmedInput); // ★追加: 送信された質問を保存
      setShowResults(true); // ★追加: 回答表示モードに切り替え
      setInputValue("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Enterキーでの送信をハンドルする関数
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
          {/* 上部コンテンツ：showResultsの値で表示を切り替え */}
          <div className="w-full flex flex-col items-center">
            { !showResults ? (
              // ★★★ 初期表示画面 ★★★
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
              // ★★★ 質問回答画面 ★★★
              <>
                <div className="submitted-question">{submittedQuestion}</div>
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

          {/* 下部コンテンツ（質問セクション） */}
          <div className="w-full">
            <p className="question-prompt">質問してみよう ↓</p>
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
