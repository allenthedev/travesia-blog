import Link from "next/link";
import type { Article } from "@/lib/notion";
import Thumbnail from "./Thumbnail";

// 홈 상단의 대표 글 배너. 사진 위에 반투명 패널로 제목과 요약을 띄웁니다.
export default function FeaturedTile({ article }: { article: Article }) {
  return (
    <section className="mx-auto max-w-[1200px] px-[22px]">
      <Link
        href={`/article/${article.id}`}
        className="tile relative block h-[460px] overflow-hidden rounded-[28px] bg-[#33475A] text-white md:h-[560px]"
      >
        <Thumbnail article={article} variant="tile" priority sizes="(max-width: 1200px) 100vw, 1200px" />
        <div className="shade absolute inset-0" aria-hidden="true" />

        <div className="glass-dark absolute inset-x-4 bottom-4 flex max-w-[540px] flex-col gap-2.5 rounded-[22px] px-7 py-6 md:inset-x-6 md:bottom-6 md:px-8 md:py-7">
          <span className="text-sm font-semibold text-white/90">{article.category}</span>
          <h2 className="text-[28px] font-bold leading-tight tracking-[-0.01em] md:text-[40px]">{article.title}</h2>
          {article.summary && (
            <p className="line-clamp-3 text-[17px] leading-relaxed text-white/90">{article.summary}</p>
          )}
          <span className="pill mt-2 self-start rounded-full bg-white px-5 py-2.5 text-[15px] font-semibold text-[#1D1D1F]">
            읽어보기
          </span>
        </div>
      </Link>
    </section>
  );
}
