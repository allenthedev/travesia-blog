import ArticleHeader from "./ArticleHeader"; // 방금 만든 멋진 헤더 부품을 불러옵니다.

async function getArticleBlocks(blockId: string) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
    cache: 'no-store'
  });

  const data = await res.json();
  if (!res.ok) return [];
  return data.results;
}

async function getArticleDetails(pageId: string) {
  const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
    cache: 'no-store'
  });

  const data = await res.json();
  if (!res.ok) return null;
  
  const props = data.properties;
  return {
    title: props['제목']?.title[0]?.plain_text || '제목 없음',
    category: props['카테고리']?.select?.name || 'Uncategorized',
    date: props['작성일']?.date?.start || '',
    thumbnail: props['썸네일']?.files[0]?.file?.url || props['썸네일']?.files[0]?.external?.url || '',
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const pageId = resolvedParams.id;

  const [details, blocks] = await Promise.all([
    getArticleDetails(pageId),
    getArticleBlocks(pageId)
  ]);

  if (!details) return <div className="p-20 text-center">글을 불러올 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-gray-900 font-sans pb-32">
      
      {/* 💡 기존의 딱딱했던 header를 지우고, 방금 만든 ArticleHeader로 교체했습니다. */}
      <ArticleHeader />

      {/* 썸네일과 제목 (헤더 높이인 h-20만큼 마진을 주어 겹치지 않게 수정: mt-20) */}
      <div className="w-full h-[60vh] relative mt-20 bg-gray-100">
        {details.thumbnail && (
          <img 
            src={details.thumbnail} 
            alt={details.title} 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-4xl mx-auto w-full">
            <span className="text-white/80 text-xs tracking-widest uppercase font-medium mb-4 block">
              {details.category} • {details.date}
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight">
              {details.title}
            </h1>
          </div>
        </div>
      </div>

      {/* 본문 텍스트 렌더링 영역 */}
      <article className="max-w-3xl mx-auto mt-20 px-8 text-lg leading-relaxed text-gray-700 font-serif">
        {blocks.map((block: any) => {
          const type = block.type;
          
          if (type === 'paragraph') {
            const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
            if (!text) return <br key={block.id} />; 
            return <p key={block.id} className="mb-6">{text}</p>;
          }
          
          if (type === 'heading_1') {
            const text = block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
            return <h1 key={block.id} className="text-4xl font-serif text-black mt-16 mb-8">{text}</h1>;
          }
          
          if (type === 'heading_2') {
            const text = block.heading_2.rich_text.map((t: any) => t.plain_text).join('');
            return <h2 key={block.id} className="text-2xl font-serif text-black mt-12 mb-6">{text}</h2>;
          }

          if (type === 'heading_3') {
            const text = block.heading_3.rich_text.map((t: any) => t.plain_text).join('');
            return <h3 key={block.id} className="text-xl font-serif text-black mt-8 mb-4">{text}</h3>;
          }
          
          if (type === 'image') {
            const url = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
            return <img key={block.id} src={url} alt="content image" className="w-full my-12 rounded-sm" />;
          }

          return null; 
        })}
      </article>
    </div>
  );
}