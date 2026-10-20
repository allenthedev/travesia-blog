import Link from "next/link";
import { CATEGORIES, INSTAGRAM_URL } from "@/lib/site";
import { ChevronLeftIcon, InstagramIcon } from "./Icons";

interface SiteHeaderProps {
  active?: string; // 지금 보고 있는 카테고리 (굵게 표시)
  overlay?: boolean; // 글 상세처럼 대표 사진 위에 겹쳐 띄울 때
}

// 모든 페이지 상단의 반투명 메뉴바
export default function SiteHeader({ active, overlay = false }: SiteHeaderProps) {
  return (
    <header
      className={
        overlay
          ? "glass-overlay absolute inset-x-0 top-0 z-40"
          : "glass-bar sticky top-0 z-40"
      }
    >
      <div className="mx-auto flex min-h-12 max-w-[1024px] flex-wrap items-center justify-between gap-x-8 px-[22px]">
        {overlay && (
          <Link href="/" className="flex min-h-11 items-center gap-1.5 text-sm text-[#1D1D1F]">
            <ChevronLeftIcon />
            목록
          </Link>
        )}

        <Link href="/" className="text-[19px] font-semibold tracking-[0.04em] text-[#1D1D1F]">
          TRAVESIA
        </Link>

        {/* 휴대폰에서는 카테고리 메뉴가 두 번째 줄로 내려갑니다 */}
        <nav aria-label="카테고리" className="order-last -mx-3 flex w-[calc(100%+1.5rem)] gap-2 text-[13px] md:order-none md:mx-0 md:w-auto">
          {CATEGORIES.map(({ name }) => {
            const isActive = active === name;
            return (
              <Link
                key={name}
                href={`/category/${name}`}
                aria-current={isActive ? "page" : undefined}
                className={`nav-link flex min-h-11 items-center px-3 text-[#1D1D1F] ${
                  isActive ? "font-semibold" : "opacity-75"
                }`}
              >
                {name}
              </Link>
            );
          })}
        </nav>

        {!overlay && (
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="nav-link flex h-11 w-11 items-center justify-center text-[#1D1D1F] opacity-75"
          >
            <InstagramIcon />
          </a>
        )}
      </div>
    </header>
  );
}
