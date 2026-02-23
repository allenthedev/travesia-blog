import BlogLayout from "./BlogLayout"; // 방금 만든 UI 컴포넌트 불러오기

// 노션 데이터 페칭 (이전과 동일)
async function getArticles() {
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sorts: [{ property: '작성일', direction: 'descending' }],
    }),
    cache: 'no-store'
  });

  const data = await res.json();
  if (!res.ok) return [];

  return data.results.map((page: any) => {
    const props = page.properties;
    return {
      id: page.id,
      title: props['제목']?.title[0]?.plain_text || '제목 없음',
      category: props['카테고리']?.select?.name || 'Uncategorized',
      date: props['작성일']?.date?.start || '',
      summary: props['요약']?.rich_text[0]?.plain_text || '',
      thumbnail: props['썸네일']?.files[0]?.file?.url || props['썸네일']?.files[0]?.external?.url || 'https://via.placeholder.com/400x200',
    };
  });
}

// 메인 페이지 구성
export default async function Home() {
  const articles = await getArticles();
  
  // 데이터를 BlogLayout으로 토스!
  return <BlogLayout articles={articles} />;
}