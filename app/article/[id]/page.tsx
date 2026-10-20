import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import NotionBlocks from "../../components/NotionBlocks";
import Thumbnail from "../../components/Thumbnail";
import { FloatingBar, ShareIconButton } from "../../components/ArticleActions";
import { getPublishedArticle, getBlockTree } from "@/lib/notion";
import { formatDate } from "@/lib/site";

type Props = { params: Promise<{ id: string }> };

// 검색엔진과 카카오톡·슬랙 공유 미리보기에 쓰이는 제목/요약/썸네일
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getPublishedArticle(id);
  if (!article) return {};
  return {
    title: `${article.title} | TRAVESIA`,
    description: article.summary || undefined,
    openGraph: {
      title: article.title,
      description: article.summary || undefined,
      images: article.thumbnail ? [article.thumbnail] : undefined,
      type: "article",
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { id } = await params;

  // 공개 여부를 먼저 확인한 뒤 본문을 가져옵니다. (초안은 본문 요청 자체를 하지 않음)
  const article = await getPublishedArticle(id);
  if (!article) notFound();

  const blocks = await getBlockTree(id);

  return (
    <div className="min-h-screen bg-white text-[#1D1D1F]">
      {/* 대표 사진 + 그 위에 떠 있는 메뉴바 */}
      <div className="relative h-[420px] overflow-hidden bg-[#E8E8ED] md:h-[560px]">
        <Thumbnail article={article} variant="hero" priority sizes="100vw" />
        <SiteHeader overlay active={article.category} />
      </div>

      {/* 제목 카드: 사진 아래쪽 경계에 걸쳐 놓고, 본문과 같은 폭·같은 왼쪽 선에 맞춥니다 */}
      <div className="relative z-10 -mt-24 px-[22px] md:-mt-32">
        <div className="glass-title relative mx-auto flex max-w-[900px] flex-col gap-3 rounded-3xl py-7 pl-7 pr-20 md:py-9 md:pl-10 md:pr-24">
          <Link href={`/category/${article.category}`} className="self-start text-[15px] font-semibold text-[#0066CC] hover:underline">
            {article.category}
          </Link>
          <h1 className="text-[30px] font-bold leading-[1.12] tracking-[-0.015em] md:text-5xl">{article.title}</h1>
          <span className="text-sm text-[#424245]">{formatDate(article.date)}</span>
          <ShareIconButton title={article.title} />
        </div>
      </div>

      {/* 본문 폭: 900px */}
      <article className="mx-auto max-w-[944px] px-[22px] pb-10 pt-14 md:pt-16">
        <NotionBlocks blocks={blocks} />
      </article>

      <FloatingBar title={article.title} />
      <SiteFooter />
    </div>
  );
}
