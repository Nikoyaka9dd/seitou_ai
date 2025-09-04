// app/page.tsx (Next.js 13以降のApp Routerを想定)

import { Menu } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6">
      {/* ヘッダー */}
      <header className="w-full flex justify-between items-center mb-6">
        <div className="text-xl font-bold border rounded-full px-4 py-1">
          ロゴ
        </div>
        <button aria-label="menu">
          <Menu size={28} />
        </button>
      </header>

      {/* メインコンテンツ */}
      <main className="flex flex-col items-center w-full max-w-md flex-grow">
        <h1 className="text-lg font-semibold mb-2">ようこそ ○○ へ</h1>
        <p className="mb-6">こんな機能がありまっせ</p>

        {/* 機能ボタンのグリッド */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg h-16 flex items-center justify-center"
            >
              機能{i + 1}
            </div>
          ))}
        </div>

        {/* 質問欄 */}
        <p className="mb-2">質問してみよう ↓</p>
        <button className="w-full bg-blue-500 text-white rounded-lg py-3 mb-4">
          質問らん
        </button>
      </main>

      {/* フッター */}
      <footer className="w-full text-sm text-center">
        質問内容に困ったら{" "}
        <button className="text-blue-600 underline">help</button>
      </footer>
    </div>
  );
}
