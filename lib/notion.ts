// 노션 API 호출을 한곳에 모아둔 모듈입니다.
// 페이지마다 같은 fetch 코드를 복사하지 않고, 여기 함수만 가져다 씁니다.

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

export interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  summary: string;
  thumbnail: string; // 썸네일이 없으면 빈 문자열
}

function notionHeaders() {
  return {
    Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

// 노션 '파일' 속성에서 업로드 이미지/외부 링크 URL을 꺼냅니다.
function getFileUrl(file: any): string {
  return file?.file?.url || file?.external?.url || "";
}

// 노션 페이지 원시 데이터를 블로그용 Article 객체로 변환합니다.
function toArticle(page: any): Article {
  const props = page.properties;
  return {
    id: page.id,
    title: props["제목"]?.title?.[0]?.plain_text || "제목 없음",
    category: props["카테고리"]?.select?.name || "Uncategorized",
    date: props["작성일"]?.date?.start || "",
    summary: props["요약"]?.rich_text?.[0]?.plain_text || "",
    thumbnail: getFileUrl(props["썸네일"]?.files?.[0]),
  };
}

function isPublished(page: any): boolean {
  return page?.properties?.["Published"]?.checkbox === true;
}

// 노션은 한 번에 최대 100개까지만 돌려주므로, next_cursor를 따라 끝까지 가져옵니다.
async function queryDatabase(filter: object): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const res: Response = await fetch(
      `${NOTION_API}/databases/${process.env.NOTION_DATABASE_ID}/query`,
      {
        method: "POST",
        headers: notionHeaders(),
        body: JSON.stringify({
          filter,
          sorts: [{ property: "작성일", direction: "descending" }],
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
        cache: "no-store",
      }
    );
    if (!res.ok) break;

    const data = await res.json();
    results.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return results;
}

// 공개(Published ✔️)된 글 목록. category를 넘기면 해당 카테고리만 가져옵니다.
export async function getPublishedArticles(category?: string): Promise<Article[]> {
  const publishedFilter = { property: "Published", checkbox: { equals: true } };
  const filter = category
    ? {
        and: [
          publishedFilter,
          { property: "카테고리", select: { equals: category } },
        ],
      }
    : publishedFilter;

  const pages = await queryDatabase(filter);
  return pages.map(toArticle);
}

// 글 한 편의 정보. 존재하지 않거나 Published가 꺼져 있으면 null을 돌려줍니다.
export async function getPublishedArticle(pageId: string): Promise<Article | null> {
  const res = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: "GET",
    headers: notionHeaders(),
    cache: "no-store",
  });
  if (!res.ok) return null;

  const page = await res.json();
  if (!isPublished(page)) return null;
  return toArticle(page);
}

// 본문 블록 전체. 100개 단위로 끊겨 오므로 끝까지 이어서 가져옵니다.
export async function getAllBlocks(blockId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined = undefined;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("start_cursor", cursor);

    const res: Response = await fetch(
      `${NOTION_API}/blocks/${blockId}/children?${params}`,
      { method: "GET", headers: notionHeaders(), cache: "no-store" }
    );
    if (!res.ok) break;

    const data = await res.json();
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);

  return blocks;
}
