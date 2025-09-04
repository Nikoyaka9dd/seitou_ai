import type { Metadata } from 'next';
import { Yomogi } from 'next/font/google';
import './globals.css';

// 日本語に対応したYomogiフォントを読み込みます
const yomogi = Yomogi({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
});

// アプリのメタデータ（ブラウザのタブに表示される情報など）
export const metadata: Metadata = {
  title: 'ちょいぽりてぃ',
  description: 'チャット形式で各政党の情報がわかるアプリです',
};

// 全てのページの親となるルートレイアウト
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={yomogi.className}>
      <body>{children}</body>
    </html>
  );
}
