"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image"; // 파일 맨 위쪽 import 모여있는 곳에 추가

interface BlogLayoutProps {
  articles: any[];
  isCategoryPage?: boolean;
  categoryName?: string;
}

export default function BlogLayout({ articles, isCategoryPage = false, categoryName = "" }: BlogLayoutProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // 💡 페이지네이션 상태 추가
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6; // 한 페이지에 보여줄 글 개수

  const smoothTransition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const };
  const instagramId = process.env.NEXT_PUBLIC_INSTAGRAM_ID || "본인계정";
  const instagramUrl = `https://instagram.com/${instagramId}`;

  useEffect(() => {
    const handleScroll = () => {
      if (!isCategoryPage) setIsScrolled(window.scrollY > 50);
    };
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isCategoryPage]);

  // 검색어나 정렬, 카테고리가 바뀌면 페이지를 다시 1페이지로 돌려줍니다.
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, categoryName]);

  const forceScrolledLayout = isScrolled || isCategoryPage;

  const displayedArticles = articles
    .filter(article => 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.summary.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  // 💡 현재 페이지에 보여줄 글만 잘라내기
  const totalPages = Math.ceil(displayedArticles.length / articlesPerPage);
  const currentArticles = displayedArticles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getNavClass = (navName: string, baseSize: string) => {
    const isActive = categoryName === navName;
    return `${baseSize} font-serif transition-colors ${isActive ? 'text-black font-medium' : 'text-gray-500 hover:text-black'}`;
  };

  return (
    <div className="flex min-h-screen bg-[#FCFBF9] text-gray-900 font-sans overflow-x-hidden">
      
      {/* 1. 최좌측 고정 영역 */}
      {!isMobile && (
        <aside className={`fixed left-0 top-0 h-full w-16 flex flex-col items-center py-8 z-40 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          forceScrolledLayout ? '-translate-x-full' : 'translate-x-0'
        } bg-[#FCFBF9] border-r border-gray-200/60`}>
          <Link href="/" className="w-8 h-8 bg-black rounded-sm flex items-center justify-center text-white font-serif text-xs mb-10 cursor-pointer">
            T
          </Link>
          
          <AnimatePresence>
            {!forceScrolledLayout && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMenuOpen(true)}
                className="text-gray-400 hover:text-black transition-colors"
                aria-label="Open Menu"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
              </motion.button>
            )}
          </AnimatePresence>
        </aside>
      )}

      {/* 2. 숨겨진 슬라이드 메뉴창 */}
      <nav className={`fixed left-0 top-0 h-full w-72 md:w-80 bg-[#FCFBF9]/95 backdrop-blur-2xl border-r border-gray-200/60 z-[60] shadow-2xl transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <button 
          onClick={() => setIsMenuOpen(false)}
          className="absolute top-8 right-8 p-2 text-gray-400 hover:text-black transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="p-12 flex flex-col gap-8 mt-16">
          <Link href="/category/Travel" onClick={() => setIsMenuOpen(false)} className={getNavClass('Travel', 'text-2xl')}>Travel</Link>
          <Link href="/category/Books" onClick={() => setIsMenuOpen(false)} className={getNavClass('Books', 'text-2xl')}>Books</Link>
          <Link href="/category/Investment" onClick={() => setIsMenuOpen(false)} className={getNavClass('Investment', 'text-2xl')}>Investment</Link>
          
          <div className="mt-8 pt-8 border-t border-gray-200/60">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              <span className="text-sm font-sans uppercase tracking-widest">Instagram</span>
            </a>
          </div>
        </div>
      </nav>

      {/* 3. 동적 헤더 */}
      <motion.header 
        layout
        transition={smoothTransition}
        className={`fixed top-0 right-0 z-30 flex flex-col overflow-hidden transition-[width,height,background-color,border-color,box-shadow] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] justify-center ${
          forceScrolledLayout 
            ? 'h-20 bg-[#FCFBF9]/70 backdrop-blur-2xl border-b border-white/50 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] rounded-none' 
            : 'h-64 bg-[#FCFBF9] border-b-transparent shadow-none rounded-none' 
        } ${
          isMobile || forceScrolledLayout ? 'w-full' : 'w-[calc(100%-4rem)]'
        }`}
      >
        <motion.div 
          layout 
          transition={smoothTransition}
          className={`relative flex items-center w-full px-8 md:px-16 ${
            isMobile ? 'justify-center' : (forceScrolledLayout ? 'max-w-7xl mx-auto justify-start' : 'justify-center')
          }`}
        >
          {isMobile && (
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="absolute left-8 text-gray-500 hover:text-black transition-colors"
              aria-label="Open Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
          )}

          <div className="relative flex items-center">
            <Link href="/" className="relative z-10">
              <motion.h1 
                layout
                transition={smoothTransition}
                className={`font-serif font-light tracking-tight text-gray-900 whitespace-nowrap cursor-pointer ${
                  forceScrolledLayout ? 'text-3xl' : 'text-5xl md:text-7xl'
                }`}
              >
                TRAVESIA
              </motion.h1>
            </Link>

            <AnimatePresence>
              {forceScrolledLayout && !isMobile && (
                <motion.nav 
                  initial={{ opacity: 0, filter: "blur(8px)", x: 20 }}
                  animate={{ opacity: 1, filter: "blur(0px)", x: 0, scale: 1 }}
                  exit={{ opacity: 0, filter: "blur(12px)", x: -100, scale: 0.95, transition: { duration: 0.4, ease: "easeIn" } }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="absolute left-[calc(100%+3rem)] flex items-center gap-8 whitespace-nowrap z-0"
                >
                  <Link href="/category/Travel" className={getNavClass('Travel', 'text-sm')}>Travel</Link>
                  <Link href="/category/Books" className={getNavClass('Books', 'text-sm')}>Books</Link>
                  <Link href="/category/Investment" className={getNavClass('Investment', 'text-sm')}>Investment</Link>
                  
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black transition-colors ml-4 border-l border-gray-300 pl-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                </motion.nav>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.header>

      {/* 4. 메인 컨텐츠 영역 */}
      <main className={`flex-1 flex flex-col items-center pb-12 transition-[margin-top] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] px-8 md:px-16 ${
        isMobile ? 'w-full ml-0' : 'w-[calc(100%-4rem)] ml-16'
      } ${forceScrolledLayout ? 'mt-32' : 'mt-64'}`}>
        
        {isCategoryPage && (
          <div className="w-full max-w-7xl mb-8 flex justify-end items-center gap-4 border-b border-gray-200/60 pb-4 mt-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input 
                  type="text" 
                  placeholder="Search articles..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-200/60 bg-transparent text-xs font-sans focus:outline-none focus:border-gray-400 transition-colors w-full sm:w-64 rounded-none"
                />
              </div>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 border border-gray-200/60 bg-transparent text-xs font-sans focus:outline-none focus:border-gray-400 transition-colors cursor-pointer rounded-none"
              >
                <option value="desc">최신순 (Newest)</option>
                <option value="asc">오래된순 (Oldest)</option>
              </select>
            </div>
          </div>
        )}

        {/* 아카이브 그리드 (displayedArticles 대신 currentArticles 사용) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20 max-w-7xl w-full">
          {currentArticles.map((article) => (
             <Link href={`/article/${article.id}`} key={article.id} className="group cursor-pointer block">
               <article>
                 <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F4F0] mb-6 rounded-sm">
                 <Image
  src={article.thumbnail}
  alt={article.title}
  fill // 부모 div의 꽉 찬 크기에 맞춤
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
/>
                   <div className="absolute top-4 left-4">
                     <span className="bg-[#FCFBF9]/90 backdrop-blur-sm px-2 py-1 text-[10px] tracking-widest uppercase font-medium rounded-sm shadow-sm">
                       {article.category}
                     </span>
                   </div>
                 </div>
                 <h2 className="text-2xl font-serif font-medium leading-tight mb-3 group-hover:text-gray-500 transition-colors">
                   {article.title}
                 </h2>
                 <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                   {article.summary}
                 </p>
                 <div className="mt-4 pt-4 border-t border-gray-200/60 flex justify-between items-center">
                   <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                     {article.date}
                   </span>
                   <span className="text-xs font-serif italic text-gray-400 group-hover:text-black transition-colors">
                     Read more —
                   </span>
                 </div>
               </article>
             </Link>
          ))}
          
          {currentArticles.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-400 font-serif">
              검색된 글이 없습니다.
            </div>
          )}
        </section>

        {/* 💡 페이지네이션 (글이 많을 때만 나타납니다) */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-8 mt-24 w-full max-w-7xl font-sans text-xs tracking-widest uppercase">
            <button 
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
              ← Prev
            </button>
            <div className="flex gap-4 font-serif text-sm">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => handlePageChange(i + 1)}
                  className={`transition-colors ${currentPage === i + 1 ? 'text-black font-medium' : 'text-gray-400 hover:text-black'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* 💡 하단 푸터 (Footer) */}
        <footer className="w-full max-w-7xl border-t border-gray-200/60 mt-24 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-sans uppercase tracking-widest">
          <p>© {new Date().getFullYear()} TRAVESIA. All rights reserved.</p>
          <div className="flex gap-8">
            {/* 이메일 주소는 본인 이메일로 수정하세요! */}
            <a href="mailto:your@email.com" className="hover:text-black transition-colors">Contact</a>
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">Instagram</a>
          </div>
        </footer>

      </main>
    </div>
  );
}