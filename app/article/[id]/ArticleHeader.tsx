"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ArticleHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 리사이징 감지를 통한 모바일 상태 업데이트
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 환경 변수에서 인스타그램 아이디를 불러와 URL 생성
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID || "본인계정";
  const instagramUrl = `https://instagram.com/${instagramId}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-20 bg-[#FCFBF9]/70 backdrop-blur-2xl border-b border-white/50 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] flex items-center justify-between px-8 md:px-16 w-full">
        
        {/* 1. 좌측: 동적 뒤로가기 버튼 */}
        <div className="w-1/2 md:w-1/3 flex justify-start">
          <button 
            onClick={() => router.back()} 
            className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-serif group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span> 
            Return to List
          </button>
        </div>

        {/* 2. 중앙: 로고 (리사이징 시 부드럽게 페이드인/아웃) */}
        <div className="w-1/3 flex justify-center">
          <AnimatePresence>
            {!isMobile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Link href="/">
                  <h1 className="font-serif font-light tracking-tight text-gray-900 text-3xl cursor-pointer">
                    TRAVESIA
                  </h1>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. 우측: 데스크탑 상단 메뉴 & 모바일 햄버거 버튼 */}
        <div className="w-1/2 md:w-1/3 flex justify-end items-center relative h-full">
          <AnimatePresence mode="wait">
            {!isMobile ? (
              <motion.nav 
                key="desktop-nav"
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(4px)", transition: { duration: 0.2 } }}
                className="flex items-center gap-8 whitespace-nowrap absolute right-0"
              >
                <Link href="/category/Travel" className="text-sm font-serif text-gray-500 hover:text-black transition-colors">Travel</Link>
                <Link href="/category/Books" className="text-sm font-serif text-gray-500 hover:text-black transition-colors">Books</Link>
                <Link href="/category/Investment" className="text-sm font-serif text-gray-500 hover:text-black transition-colors">Investment</Link>
                
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors ml-4 border-l border-gray-300 pl-8">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              </motion.nav>
            ) : (
              <motion.button 
                key="mobile-nav"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-500 hover:text-black transition-colors absolute right-0"
                aria-label="Open Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 4. 숨겨진 슬라이드 메뉴창 (오른쪽에서 왼쪽으로 슬라이드) */}
      <nav className={`fixed right-0 top-0 h-full w-72 md:w-80 bg-[#FCFBF9]/95 backdrop-blur-2xl border-l border-gray-200/60 z-[60] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* X 버튼을 왼쪽으로 이동 */}
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-8 left-8 p-2 text-gray-400 hover:text-black transition-colors"
          aria-label="Close Menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* 텍스트 우측 정렬 적용 */}
        <div className="p-12 flex flex-col gap-8 mt-16 text-right">
          <Link href="/category/Travel" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-gray-500 hover:text-black transition-colors">Travel</Link>
          <Link href="/category/Books" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-gray-500 hover:text-black transition-colors">Books</Link>
          <Link href="/category/Investment" onClick={() => setIsMenuOpen(false)} className="text-2xl font-serif text-gray-500 hover:text-black transition-colors">Investment</Link>
          
          <div className="mt-8 pt-8 border-t border-gray-200/60 flex justify-end">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors flex items-center gap-3">
              <span className="text-sm font-sans uppercase tracking-widest">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}