// 노션 '북마크' 블록은 API로 주소만 넘어오고 제목·썸네일은 오지 않습니다.
// 그래서 블로그 서버가 그 주소의 페이지를 직접 읽어 미리보기 정보(Open Graph 태그)를 꺼냅니다.
// 결과는 하루 동안 저장해 두고 다시 쓰므로, 방문할 때마다 상대 사이트를 부르지 않습니다.

export interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

// <meta property="og:title" content="..."> 같은 태그들을 { "og:title": "..." } 형태로 모읍니다
function readMetaTags(html: string): Record<string, string> {
  const head = html.slice(0, 200_000);
  const tags: Record<string, string> = {};
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs: Record<string, string> = {};
    for (const m of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      attrs[m[1].toLowerCase()] = m[3] ?? m[4] ?? "";
    }
    const key = (attrs.property || attrs.name || "").toLowerCase();
    if (key && attrs.content && !(key in tags)) tags[key] = decodeEntities(attrs.content);
  }
  const title = head.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (title) tags["<title>"] = decodeEntities(title[1]);
  return tags;
}

// 한국 사이트 중에는 EUC-KR로 된 곳이 있어서 글자 인코딩을 확인한 뒤 해석합니다
function decodeHtml(buf: ArrayBuffer, contentType: string): string {
  const fromHeader = contentType.match(/charset=([\w-]+)/i)?.[1];
  const sniff = new TextDecoder("latin1").decode(buf.slice(0, 4096));
  const fromMeta = sniff.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  const charset = (fromHeader || fromMeta || "utf-8").toLowerCase();
  try {
    return new TextDecoder(charset).decode(buf);
  } catch {
    return new TextDecoder("utf-8").decode(buf);
  }
}

export async function getLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TRAVESIA-LinkPreview/1.0; +https://www.travesia-sj.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      next: { revalidate: 60 * 60 * 24 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok || !(res.headers.get("content-type") || "").includes("html")) return null;

    const html = decodeHtml(await res.arrayBuffer(), res.headers.get("content-type") || "");
    const meta = readMetaTags(html);

    const title = meta["og:title"] || meta["twitter:title"] || meta["<title>"] || "";
    if (!title) return null;

    let image = meta["og:image"] || meta["og:image:url"] || meta["twitter:image"] || "";
    if (image) {
      try {
        image = new URL(image, res.url || url).toString();
      } catch {
        image = "";
      }
    }

    return {
      url,
      title,
      description: meta["og:description"] || meta["description"] || meta["twitter:description"] || "",
      image: image.startsWith("http") ? image : "",
      siteName: meta["og:site_name"] || new URL(url).hostname.replace(/^www\./, ""),
    };
  } catch {
    return null; // 시간 초과, 차단 등으로 못 읽으면 주소만 보여주는 기본 카드로
  }
}
