import BlogLayout from "../../BlogLayout"; // 파일 경로에 맞춰 수정했습니다. (app 바로 아래 있다면 이 경로가 맞습니다)

// 카테고리별로 필터링해서 데이터를 가져오는 함수
async function getCategoryArticles(categoryName: string) {
  const res = await fetch(`https://api.notion.com/v1/databases/${process.env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: '카테고리',
        select: {
          equals: categoryName
        }
      },
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

// 💡 수정된 부분: params를 Promise로 받고, 안에서 await로 풀어줍니다.
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  // 1. 넘어온 파라미터 보따리를 먼저 풉니다.
  const resolvedParams = await params; 
  
  // 2. 그 안에서 slug를 꺼내 해독합니다.
  const categoryName = decodeURIComponent(resolvedParams.slug); 
  
  const articles = await getCategoryArticles(categoryName);
  
  return <BlogLayout articles={articles} isCategoryPage={true} categoryName={categoryName} />;
}