import Link from "next/link";
import type { Article } from "@/lib/notion";
import { formatDate } from "@/lib/site";
import Thumbnail from "./Thumbnail";

// 글 목록의 카드 한 장. 마우스를 올리면 떠오르고 사진이 살짝 확대됩니다 (globals.css의 .card).
export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/article/${article.id}`} className="card flex flex-col overflow-hidden rounded-3xl bg-white text-[#1D1D1F]">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#E8E8ED]">
        <Thumbnail article={article} variant="card" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px" />
        <div className="shade absolute inset-0" aria-hidden="true" />
        <span className="glass-chip absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold text-[#1D1D1F]">
          {article.category}
        </span>
      </div>
      <div className="flex flex-col gap-2 px-7 pb-7 pt-6">
        <h3 className="text-[21px] font-semibold leading-snug">{article.title}</h3>
        {article.summary && (
          <p className="line-clamp-2 text-[15px] leading-relaxed text-[#6E6E73]">{article.summary}</p>
        )}
        <span className="mt-2 text-[13px] text-[#6E6E73]">{formatDate(article.date)}</span>
      </div>
    </Link>
  );
}
