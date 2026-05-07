import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "상상우리 — 시니어 일자리 매칭",
  description: "시니어와 일자리를 자동으로 연결합니다",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="border-b bg-white">
          <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-8">
            <span className="text-2xl font-bold text-primary">상상우리</span>
            <Link
              href="/register"
              className="text-xl font-medium text-slate-700 hover:text-primary transition-colors"
            >
              프로필 등록
            </Link>
            <Link
              href="/recommendations"
              className="text-xl font-medium text-slate-700 hover:text-primary transition-colors"
            >
              추천 목록
            </Link>
            <Link
              href="/admin"
              className="text-xl font-medium text-slate-700 hover:text-primary transition-colors"
            >
              담당자 대시보드
            </Link>
          </nav>
        </header>
        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
          {children}
        </main>
        <footer className="border-t bg-white py-6 text-center text-lg text-slate-500">
          © 2026 상상우리
        </footer>
      </body>
    </html>
  );
}
