import { notFound } from "next/navigation";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ArticleList from "../../components/ArticleList";
import { getPublishedArticles } from "@/lib/notion";
import { getCategory } from "@/lib/site";

// 카테고리 페이지: 큰 카테고리 이름과 소개 → 해당 카테고리 글 목록(정렬·검색)
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(decodeURIComponent(slug));
  if (!category) notFound();

  const articles = await getPublishedArticles(category.name);

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F]">
      <SiteHeader active={category.name} />

      {/* key가 바뀌면 새로 그려지면서 등장 효과가 다시 재생됩니다 */}
      <div key={category.name} className="page-enter">
        <section className="mx-auto max-w-[1200px] px-[22px] pb-12 pt-22">
          <h1 className="text-[56px] font-bold leading-[1.02] tracking-[-0.02em] md:text-[96px]">{category.name}</h1>
          <p className="mt-4 text-xl font-medium leading-snug text-[#6E6E73] md:text-[26px]">{category.intro}</p>
        </section>

        <ArticleList articles={articles} mode="category" categoryName={category.name} />
      </div>

      <SiteFooter />
    </div>
  );
}
