"use client";

import { useRef, useState } from "react";

// page.tsxをクライアントコンポーネントとして設定し、useStateとuseRefフックをインポートします。

// 送信アイコンのSVGコンポーネント
const SendIcon = () => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z"
      fill="currentColor"
    />
  </svg>
);

// メニューアイコンのSVGコンポーネント
const MenuIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Enterキーの最終押下時刻を記録するためのref
  const lastEnterPress = useRef(0);

  const politicalParties = [
    "自民党", "民主党", "維新", "公明党",
    "国民民主", "共産党", "れいわ", "社民党",
    "参政党", "みんな", "みらい"
  ];

  // テキストエリアの入力内容に応じて高さを自動調整する関数
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // 質問を送信する関数
  const handleSubmit = () => {
    if (!inputValue.trim()) return; // 空の場合は送信しない
    
    setSubmittedQuestion(inputValue);
    setShowResults(true);
    setIsGenerating(true);
    setInputValue(""); // テキストエリアをクリア

    // テキストエリアの高さをリセット
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // 1.5秒後にローディングを終了し、結果を表示
    setTimeout(() => {
      setIsGenerating(false);
    }, 1500);
  };
  
  // キーが押された時の処理をハンドリングする関数
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Shift + Enter の場合はデフォルトの改行動作を許可
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }

    // Enterキーが単体で押された場合
    if (e.key === 'Enter') {
      e.preventDefault(); // デフォルトの改行動作をキャンセル

      const currentTime = new Date().getTime();
      const timeSinceLastPress = currentTime - lastEnterPress.current;
      
      // 300ミリ秒以内に再度Enterが押されたら送信（ダブルクリック相当）
      if (timeSinceLastPress < 300) {
        handleSubmit();
        lastEnterPress.current = 0; // 送信後はリセット
      } else {
        // 1回目の押下時刻を記録
        lastEnterPress.current = currentTime;
      }
    }
  };


  return (
    <div className="container">
      {/* ヘッダー */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">ロゴ</div>
          <button aria-label="menu" className="menu-button">
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="main-content">
        <div className="flex-grow w-full flex flex-col items-center">
          {!showResults ? (
            <>
              {/* 初期表示画面 */}
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
              {/* 結果表示画面 */}
              <div className="submitted-question-wrapper">
                <div className="submitted-question">{submittedQuestion}</div>
              </div>
              
              {isGenerating ? (
                <div className="answer-bubble-wrapper">
                   <div className="loading-bubble">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </div>
                </div>
              ) : (
                <div className="results-wrapper">
                  <div className="answer-bubble-wrapper">
                    <div className="submitted-question">回答やで〜</div>
                  </div>
                  <div className="party-answers-grid">
                    {politicalParties.map((party, index) => (
                      <button key={index} className="party-answer-button">
                        {party}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 下部の質問入力エリア */}
        <div className="w-full">
          {!showResults && (
            <p className="question-prompt">質問してみよう ↓</p>
          )}
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
            <button className="submit-button" onClick={handleSubmit} aria-label="質問を送信">
              <SendIcon />
            </button>
          </div>
        </div>
      </main>
      
      {/* フッター */}
      <footer className="footer">
        質問内容に困ったら{" "}
        <button className="help-link">help</button>
      </footer>
    </div>
  );
}

