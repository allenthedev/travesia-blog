import BlogLayout from "./BlogLayout";
import { getPublishedArticles } from "@/lib/notion";

// 메인 페이지: 공개된 글 전체를 최신순으로 보여줍니다.
export default async function Home() {
  const articles = await getPublishedArticles();
  return <BlogLayout articles={articles} />;
}
