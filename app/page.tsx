"use client";

import { useRef, useState } from "react";
import Image from 'next/image';
import logoIcon from './assets/icon.png';


// アイコンのSVGコンポーネント群
const SendIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
  </svg>
);
const MenuIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// モーダルのPropsを拡張
type PartyAnswerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partyName: string;
  answer: string;
  isLoading: boolean;
  error: string | null;
  modalView: 'initial' | 'future' | 'past';
  onFutureClick: () => void;
  onPastClick: () => void;
  onBackClick: () => void;
  isTransitioning: boolean;
  hasTransitioned: boolean;
};

// ポップアップ（モーダル）のコンポーネント
const PartyAnswerModal = ({ 
  isOpen, onClose, partyName, answer, isLoading, error, 
  modalView, onFutureClick, onPastClick, onBackClick, 
  isTransitioning, hasTransitioned
}: PartyAnswerModalProps) => {
  if (!isOpen) return null;

  const handleReferenceClick = () => console.log(`「${partyName}」の参考情報を表示`);
  const title = modalView === 'initial' ? partyName : modalView === 'future' ? '未来' : '過去';

  const animationClass = isTransitioning 
    ? 'content-exit' 
    : (hasTransitioned ? 'content-enter' : '');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className={`modal-content ${animationClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrapper">
            <h2 className="modal-title">{title}</h2>
            {modalView === 'initial' && (
              <button onClick={handleReferenceClick} className="reference-button">参考情報</button>
            )}
          </div>
          <button onClick={onClose} className="modal-close-button" aria-label="閉じる">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-body-content">
            {isLoading ? <div className="loading-spinner"></div> : error ? <p className="error-message">{error}</p> : <p>{answer}</p>}
          </div>
        </div>
        <div className="modal-footer">
          {modalView === 'initial' ? (
            <>
              <button onClick={onFutureClick} className="modal-action-button">未来を見てみる</button>
              <button onClick={onPastClick} className="modal-action-button">過去を見てみる</button>
            </>
          ) : (
            <button onClick={onBackClick} className="modal-back-button">戻る</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [submittedQuestion, setSubmittedQuestion] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastEnterPress = useRef(0);

  // モーダル関連のState
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState("");
  const [partyAnswer, setPartyAnswer] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalView, setModalView] = useState<'initial' | 'future' | 'past'>('initial');
  const [initialPartyAnswer, setInitialPartyAnswer] = useState("");
  const [isModalTransitioning, setIsModalTransitioning] = useState(false);
  // 一度でも未来/過去ボタンが押されたかを管理する
  const [hasTransitioned, setHasTransitioned] = useState(false);

  const politicalParties = [
    "自民党", "民主党", "維新", "公明党",
    "国民民主", "共産党", "れいわ", "社民党",
    "参政党", "みんな", "みらい"
  ];

  const getAiAnswer = async (question: string, partyName: string) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, partyName }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'サーバーからの応答がありません');
    }
    const data = await response.json();
    return data.answer;
  };
  
  const handlePartyClick = async (partyName: string) => {
    setSelectedParty(partyName);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setModalError(null);
    setPartyAnswer("");
    setModalView('initial');
    setHasTransitioned(false); // モーダルが開くたびにリセット

    try {
      const answer = await getAiAnswer(submittedQuestion, partyName);
      setPartyAnswer(answer);
      setInitialPartyAnswer(answer);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setModalError(`回答の取得に失敗しました: ${errorMessage}`);
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleFutureRequest = async () => {
    setHasTransitioned(true); // 遷移開始をマーク
    setIsModalTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsModalLoading(true);
    setModalError(null);
    setModalView('future');
    const futurePrompt = `「${selectedParty}」の今後の動向について、未来を予測してください。`;

    try {
      const answer = await getAiAnswer(futurePrompt, selectedParty);
      setPartyAnswer(answer);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setModalError(`予測の取得に失敗しました: ${errorMessage}`);
    } finally {
      setIsModalLoading(false);
      requestAnimationFrame(() => setIsModalTransitioning(false));
    }
  };
  
  const handlePastRequest = async () => {
    setHasTransitioned(true); // 遷移開始をマーク
    setIsModalTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setIsModalLoading(true);
    setModalError(null);
    setModalView('past');
    const pastPrompt = `「${selectedParty}」の過去の重要な政策や出来事について教えてください。`;

    try {
      const answer = await getAiAnswer(pastPrompt, selectedParty);
      setPartyAnswer(answer);
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      setModalError(`過去の情報の取得に失敗しました: ${errorMessage}`);
    } finally {
      setIsModalLoading(false);
      requestAnimationFrame(() => setIsModalTransitioning(false));
    }
  };
  
  const handleBackToInitial = async () => {
    setHasTransitioned(true); // 遷移開始をマーク
    setIsModalTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    setPartyAnswer(initialPartyAnswer);
    setModalView('initial');
    setModalError(null);

    requestAnimationFrame(() => setIsModalTransitioning(false));
  };

  const closeModal = () => setIsModalOpen(false);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = () => {
    if (!inputValue.trim()) return;
    setSubmittedQuestion(inputValue);
    setShowResults(true);
    setIsGenerating(true);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setTimeout(() => setIsGenerating(false), 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
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

  return (
    <div className="container">
      {/* ヘッダー */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <Image src={logoIcon} alt="ちょいぽりてぃ ロゴ" width={56} height={56} />
          </div>
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
                      <button 
                        key={index} 
                        className="party-answer-button"
                        onClick={() => handlePartyClick(party)}
                      >
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

      {/* ポップアップ（モーダル）の表示 */}
      <PartyAnswerModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        partyName={selectedParty}
        answer={partyAnswer}
        isLoading={isModalLoading}
        error={modalError}
        modalView={modalView}
        onFutureClick={handleFutureRequest}
        onPastClick={handlePastRequest}
        onBackClick={handleBackToInitial}
        isTransitioning={isModalTransitioning}
        hasTransitioned={hasTransitioned} // ★追加
      />
    </div>
  );
}
