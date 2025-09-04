"use client";

import { useRef, useState } from "react";
import Image from 'next/image';
import logoIcon from './assets/icon.png';
import { useRouter } from 'next/navigation';


// アイコンのSVGコンポーネント群
const SendIcon = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor" />
  </svg>
);
const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

// 各政党のプロフィール情報の型を定義
type PartyProfile = {
  name: string;
  description: string;
  url: string;
};
type PartyProfiles = {
  [key: string]: PartyProfile;
};

// ヘルプモーダル用のコンポーネント
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
        // 閉じる時のアニメーションクラスを適用
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

// ハンバーガーメニュー用のモーダルコンポーネント
type MenuModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPartySelect: (partyName: string) => void;
  politicalParties: string[];
};

const MenuModal = ({ isOpen, onClose, onPartySelect, politicalParties }: MenuModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="menu-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
           <h2 className="modal-title">各政党へ飛ぶ</h2>
          <button onClick={onClose} className="modal-close-button" aria-label="閉じる">
            <CloseIcon />
          </button>
        </div>
        <div className="modal-body">
            <div className="party-select-grid">
                {politicalParties.map((party, index) => (
                    <button key={index} className="party-select-button" onClick={() => onPartySelect(party)}>
                        {party}
                    </button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};


// 政党プロフィール用のモーダルコンポーネント
type PartyProfileModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    partyData: PartyProfile | null;
};

const PartyProfileModal = ({ isOpen, onClose, onBack, partyData }: PartyProfileModalProps) => {
    const router = useRouter();
    if (!isOpen || !partyData) return null;

    const handleChatClick = () => {
        router.push(`/chat/${encodeURIComponent(partyData.name)}`);
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <button onClick={onBack} className="modal-close-button" aria-label="戻る">
                        <CloseIcon />
                    </button>
                </div>
                <div className="profile-modal-body">
                    <h2 className="profile-title">{partyData.name}</h2>
                    <div className="word-cloud-placeholder">word cloud</div>
                    <p className="profile-description">{partyData.description}</p>
                    <a href={partyData.url} target="_blank" rel="noopener noreferrer" className="profile-hp-link">公式HP</a>
                </div>
                <div className="profile-modal-footer">
                    <button onClick={handleChatClick} className="profile-chat-button">
                        AIエージェントと話す
                    </button>
                </div>
            </div>
        </div>
    );
};


// 政党回答のモーダルコンポーネント
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

  const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState("");
  const [partyAnswer, setPartyAnswer] = useState("");
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalView, setModalView] = useState<'initial' | 'future' | 'past'>('initial');
  const [initialPartyAnswer, setInitialPartyAnswer] = useState("");
  const [isModalTransitioning, setIsModalTransitioning] = useState(false);
  const [hasTransitioned, setHasTransitioned] = useState(false);

  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedPartyForProfile, setSelectedPartyForProfile] = useState("");
  
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isHelpModalClosing, setIsHelpModalClosing] = useState(false); // ★追加

  const politicalParties = [
    "自民党", "民主党", "維新", "公明党",
    "国民民主", "共産党", "れいわ", "社民党",
    "参政党", "みんな", "みらい"
  ];
  
  const partyProfiles: PartyProfiles = {
    "自民党": { name: "自民党", description: "自由民主党の概要です。ここに政党の基本的な情報や理念などが表示されます。", url: "https://www.jimin.jp/" },
    "民主党": { name: "民主党", description: "民主党の概要です。", url: "#" },
    "維新": { name: "維新", description: "維新の概要です。", url: "#" },
    "公明党": { name: "公明党", description: "公明党の概要です。", url: "#" },
    "国民民主": { name: "国民民主", description: "国民民主の概要です。", url: "#" },
    "共産党": { name: "共産党", description: "共産党の概要です。", url: "#" },
    "れいわ": { name: "れいわ", description: "れいわの概要です。", url: "#" },
    "社民党": { name: "社民党", description: "社民党の概要です。", url: "#" },
    "参政党": { name: "参政党", description: "参政党の概要です。", url: "#" },
    "みんな": { name: "みんな", description: "みんなの概要です。", url: "#" },
    "みらい": { name: "みらい", description: "みらいの概要です。", url: "#" },
  };

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
    setIsAnswerModalOpen(true);
    setIsModalLoading(true);
    setModalError(null);
    setPartyAnswer("");
    setModalView('initial');
    setHasTransitioned(false);

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
  
  const handlePartySelectFromMenu = (partyName: string) => {
    setIsMenuModalOpen(false);
    setSelectedPartyForProfile(partyName);
    setIsProfileModalOpen(true);
  };

  const handleFutureRequest = async () => {
    setHasTransitioned(true);
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
    setHasTransitioned(true);
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
    setHasTransitioned(true);
    setIsModalTransitioning(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setPartyAnswer(initialPartyAnswer);
    setModalView('initial');
    setModalError(null);
    requestAnimationFrame(() => setIsModalTransitioning(false));
  };
  
  const closeAnswerModal = () => setIsAnswerModalOpen(false);
  
  const handleMenuToggle = () => {
    if (isMenuModalOpen || isProfileModalOpen) {
      setIsMenuModalOpen(false);
      setIsProfileModalOpen(false);
    } else {
      setIsMenuModalOpen(true);
    }
  };
  
  const handleBackToMenu = () => {
    setIsProfileModalOpen(false);
    setIsMenuModalOpen(true);
  };
  
  const closeProfileModal = () => {
      setIsProfileModalOpen(false);
      setIsMenuModalOpen(false);
  };

  // ★追加：ヘルプモーダルを閉じる処理
  const handleCloseHelpModal = () => {
      setIsHelpModalClosing(true);
      setTimeout(() => {
          setIsHelpModalOpen(false);
          setIsHelpModalClosing(false);
      }, 400); // アニメーションの時間に合わせる
  };
  
  // ★追加：テンプレートが選択された時の処理
  const handleSelectQuestion = (question: string) => {
      handleCloseHelpModal();
      setInputValue(question);
      setTimeout(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
            textareaRef.current.focus();
        }
    }, 10); // モーダルが閉じてからフォーカス
  };

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
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <Image src={logoIcon} alt="ちょいぽりてぃ ロゴ" width={100} height={100} />
          </div>
          <button 
            onClick={handleMenuToggle} 
            aria-label="menu" 
            className={`menu-button ${isMenuModalOpen || isProfileModalOpen ? "is-open" : ""}`}
          >
            <div className="menu-icon-bars">
                <span></span>
                <span></span>
                <span></span>
            </div>
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="flex-grow w-full flex flex-col items-center">
          {!showResults ? (
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
      
      <footer className="footer">
        <button className="footer-button" onClick={() => setIsHelpModalOpen(true)}>
            質問内容に困ったら？
        </button>
      </footer>

      <PartyAnswerModal 
        isOpen={isAnswerModalOpen}
        onClose={closeAnswerModal}
        partyName={selectedParty}
        answer={partyAnswer}
        isLoading={isModalLoading}
        error={modalError}
        modalView={modalView}
        onFutureClick={handleFutureRequest}
        onPastClick={handlePastRequest}
        onBackClick={handleBackToInitial}
        isTransitioning={isModalTransitioning}
        hasTransitioned={hasTransitioned}
      />
      
      <MenuModal 
        isOpen={isMenuModalOpen}
        onClose={handleMenuToggle} 
        politicalParties={politicalParties}
        onPartySelect={handlePartySelectFromMenu}
      />
      
      <PartyProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        onBack={handleBackToMenu}
        partyData={partyProfiles[selectedPartyForProfile]}
      />
      
      {/* ★追加：ヘルプモーダル */}
      <HelpModal 
        isOpen={isHelpModalOpen}
        isClosing={isHelpModalClosing}
        onClose={handleCloseHelpModal}
        onSelectQuestion={handleSelectQuestion}
      />
    </div>
  );
}

