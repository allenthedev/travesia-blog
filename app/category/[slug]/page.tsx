import BlogLayout from "../../BlogLayout";
import { getPublishedArticles } from "@/lib/notion";

// 카테고리 페이지: 해당 카테고리의 공개된 글만 보여줍니다.
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);

  const articles = await getPublishedArticles(categoryName);

  return <BlogLayout articles={articles} isCategoryPage={true} categoryName={categoryName} />;
}
