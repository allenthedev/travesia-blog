// 사이트 전체에서 같이 쓰는 설정과 작은 도우미 함수들입니다.

// 상단 메뉴에 나오는 카테고리. 노션 '카테고리' 선택지 이름과 똑같아야 합니다.
// intro는 카테고리 페이지 제목 아래 한 줄 소개, thumbnail은 썸네일이 없는 글에 대신 쓰는 그림입니다.
// coverStyle이 true인 카테고리(책)는 세로로 긴 표지가 잘리지 않도록 표지 전체를 가운데 세워 보여줍니다.
export const CATEGORIES = [
  { name: "Travel", intro: "길 위에서 보고 느낀 것들.", thumbnail: "/thumbnails/travel.svg", coverStyle: false },
  { name: "Books", intro: "읽고 생각한 것들.", thumbnail: "/thumbnails/books.svg", coverStyle: true },
  { name: "Investment", intro: "투자에 관한 생각과 기록.", thumbnail: "/thumbnails/investment.svg", coverStyle: false },
] as const;

export function getCategory(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}

export const INSTAGRAM_URL = `https://instagram.com/${process.env.NEXT_PUBLIC_INSTAGRAM_ID || ""}`;

// "2024-11-13" → "2024년 11월 13일"
export function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${y}년 ${m}월 ${d}일`;
}
