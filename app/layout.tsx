import './globals.css'
import type { Metadata } from 'next'
import { Yomogi } from 'next/font/google'

const yomogi = Yomogi({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ちょいぽりてぃ',
  description: 'チャット形式で各政党の情報がわかるアプリです',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={yomogi.className}>
      <body>{children}</body>
    </html>
  )
}

