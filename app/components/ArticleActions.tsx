"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShareIcon } from "./Icons";

// 휴대폰에서는 기본 공유 창, 컴퓨터에서는 링크 복사
async function shareCurrentPage(title: string): Promise<"shared" | "copied" | "failed"> {
  const url = window.location.href;
  try {
    if (navigator.share) {
      await navigator.share({ title, url });
      return "shared";
    }
    await navigator.clipboard.writeText(url);
    return "copied";
  } catch {
    return "failed";
  }
}

function useCopiedToast() {
  const [copied, setCopied] = useState(false);
  const share = async (title: string) => {
    if ((await shareCurrentPage(title)) === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };
  return { copied, share };
}

// 제목 카드 오른쪽 위의 공유 아이콘
export function ShareIconButton({ title }: { title: string }) {
  const { copied, share } = useCopiedToast();
  return (
    <button
      type="button"
      aria-label={copied ? "링크 복사됨" : "공유"}
      title={copied ? "링크가 복사됐어요" : "공유"}
      onClick={() => share(title)}
      className="icon-btn absolute right-5 top-5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/[0.06] bg-white/70 text-[#1D1D1F] md:right-6 md:top-6"
    >
      {copied ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <ShareIcon />
      )}
    </button>
  );
}

// 스크롤이 제목 배너를 지나면 아래에서 올라오는 버튼 바
export function FloatingBar({ title, showAfter = 480 }: { title: string; showAfter?: number }) {
  const [visible, setVisible] = useState(false);
  const { copied, share } = useCopiedToast();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      className={`floating-bar pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-[22px] ${
        visible ? "is-visible" : ""
      }`}
      aria-hidden={!visible}
    >
      <div className="glass-light pointer-events-auto flex items-center gap-1 rounded-full p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
        <Link href="/" tabIndex={visible ? 0 : -1} className="bar-btn flex min-h-11 items-center rounded-full px-[18px] text-sm font-medium text-[#1D1D1F]">
          목록으로
        </Link>
        <button type="button" tabIndex={visible ? 0 : -1} onClick={toTop} className="bar-btn flex min-h-11 cursor-pointer items-center rounded-full px-[18px] text-sm font-medium text-[#1D1D1F]">
          맨 위로
        </button>
        <button
          type="button"
          tabIndex={visible ? 0 : -1}
          onClick={() => share(title)}
          className="flex min-h-11 cursor-pointer items-center rounded-full bg-[#0066CC] px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[#0058B0]"
        >
          {copied ? "복사됨" : "공유"}
        </button>
      </div>
    </div>
  );
}
