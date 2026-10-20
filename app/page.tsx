import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";
import FeaturedTile from "./components/FeaturedTile";
import ArticleList from "./components/ArticleList";
import { getPublishedArticles } from "@/lib/notion";

// 홈: 소개 문구 → 대표 글 배너 → 전체 글 목록(카테고리 필터)
export default async function Home() {
  const articles = await getPublishedArticles();
  // 노션에서 '대표글'에 체크한 글. 없으면 가장 최근 글이 배너에 올라갑니다.
  const featured = articles.find((a) => a.featured) ?? articles[0];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteHeader />

      <section className="mx-auto max-w-[1024px] px-[22px] pb-14 pt-24 text-center">
        <h1 className="text-[48px] font-bold leading-[1.05] tracking-[-0.015em] md:text-[80px]">TRAVESIA</h1>
        <p className="mt-4 text-xl font-medium leading-snug text-[#6E6E73] md:text-[28px]">여행, 책, 투자에 관한 기록.</p>
      </section>

      {featured && <FeaturedTile article={featured} />}

      <ArticleList articles={articles} mode="home" />

      <SiteFooter />
    </div>
  );
}
