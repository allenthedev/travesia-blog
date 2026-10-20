/* eslint-disable @typescript-eslint/no-explicit-any -- 노션 API 응답은 형태가 자유로워서 any로 다룹니다 */
// 노션 본문 블록(JSON)을 화면용 HTML로 바꿔주는 렌더러입니다.
// 노션에서 새로운 블록 종류를 쓰고 싶다면 renderBlock 안에 case를 하나 추가하면 됩니다.
// 처리하지 않는 블록은 화면에 나오지 않습니다.

import { Fragment, type ReactNode } from "react";
import { InfoIcon } from "./Icons";
import { getLinkPreview } from "@/lib/linkPreview";

/* ---------- 글자 서식 (굵게, 기울임, 링크 등) ---------- */

function RichText({ items }: { items: any[] }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((t, i) => {
        const a = t.annotations || {};
        // 노션의 줄바꿈(Shift+Enter)을 그대로 살립니다
        const lines = String(t.plain_text ?? "").split("\n");
        let node: ReactNode = lines.flatMap((line, j) => (j === 0 ? [line] : [<br key={j} />, line]));

        if (a.code) node = <code className="rounded-md bg-[#F5F5F7] px-1.5 py-0.5 font-mono text-[0.88em]">{node}</code>;
        if (a.bold) node = <strong className="font-semibold">{node}</strong>;
        if (a.italic) node = <em>{node}</em>;
        if (a.strikethrough) node = <s>{node}</s>;
        if (a.underline) node = <u>{node}</u>;
        // 노션에서 글자색을 '회색'으로 바꾼 부분은 작은 글씨로 (각주 번호, 덧붙이는 말 등)
        if (a.color === "gray") node = <span className="text-[0.82em] text-[#6E6E73]">{node}</span>;
        if (t.href) {
          node = (
            <a href={t.href} target="_blank" rel="noopener noreferrer" className="text-[#0066CC] underline-offset-2 hover:underline">
              {node}
            </a>
          );
        }
        return <span key={i}>{node}</span>;
      })}
    </>
  );
}

function plain(items: any[]): string {
  return (items || []).map((t) => t.plain_text).join("");
}

/* ---------- 외부 링크 처리 (구글 지도, 유튜브) ---------- */

function isGoogleMap(url: string) {
  return url.includes("google") && url.includes("map");
}

function youtubeEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

function EmbedFrame({ src, title }: { src: string; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-[20px] bg-[#E8E8ED]">
      <iframe
        src={src}
        title={title}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

// 서점처럼 썸네일이 세로로 긴 책 표지인 사이트는 잘리지 않게 전체를 보여줍니다
const COVER_HOSTS = ["aladin.co.kr", "yes24.com", "kyobobook.co.kr", "ridibooks.com", "millie.co.kr"];

// 북마크 카드: 상대 사이트의 제목·설명·썸네일을 읽어와 보여줍니다. 못 읽으면 주소만 보여줍니다.
async function LinkCard({ url }: { url: string }) {
  let host = url;
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {}
  const preview = await getLinkPreview(url);
  const isCover = COVER_HOSTS.some((h) => host.endsWith(h));

  if (!preview) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col gap-1 rounded-[18px] border border-[#D2D2D7] px-6 py-5 transition-colors hover:bg-[#F5F5F7]"
      >
        <span className="text-[15px] font-semibold text-[#1D1D1F]">{host}</span>
        <span className="break-all text-sm text-[#6E6E73]">{url}</span>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-[136px] overflow-hidden rounded-[18px] border border-[#D2D2D7] bg-white transition-colors hover:bg-[#F5F5F7]"
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-5 py-4 md:px-6">
        <span className="line-clamp-2 text-[16px] font-semibold leading-snug text-[#1D1D1F] md:text-[17px]">{preview.title}</span>
        {preview.description && (
          <span className="line-clamp-2 text-sm leading-relaxed text-[#6E6E73]">{preview.description}</span>
        )}
        <span className="mt-1 truncate text-[13px] text-[#86868B]">{preview.siteName}</span>
      </div>
      {preview.image && (
        <div className={`relative w-[104px] flex-none md:w-[148px] ${isCover ? "bg-[#F5F5F7]" : ""}`}>
          {/* 사진 크기가 카드 높이를 늘리지 않도록 상자 안에 겹쳐 놓습니다 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.image}
            alt=""
            loading="lazy"
            className={`absolute h-full w-full ${
              isCover ? "inset-0 box-border object-contain p-3 drop-shadow-[0_6px_12px_rgba(0,0,0,0.18)]" : "inset-0 object-cover"
            }`}
          />
        </div>
      )}
    </a>
  );
}

/* ---------- 블록 하나 ---------- */

// 양쪽 정렬. 휴대폰처럼 폭이 좁을 땐 단어 단위로만 줄을 바꾸면 글자 사이가 크게 벌어지므로
// 음절 단위 줄바꿈을 허용해 간격을 고르게 합니다 (종이책 조판 방식).
const JUSTIFY = "text-justify max-md:[word-break:normal]";
// 본문 기본 글자
const P = `text-[19px] leading-[1.8] ${JUSTIFY}`;

function Children({ block }: { block: any }) {
  if (!block.children?.length) return null;
  return <NotionBlocks blocks={block.children} nested />;
}

function renderBlock(block: any, isFirst: boolean): ReactNode {
  const type = block.type;
  const data = block[type] || {};

  switch (type) {
    case "paragraph": {
      if (!data.rich_text?.length) return <div className="h-2" aria-hidden="true" />;
      // 문단 전체를 회색으로 바꾸면 각주처럼 작은 글씨로 보여줍니다
      if (data.color === "gray") {
        return (
          <p className={`text-[15px] leading-[1.7] text-[#6E6E73] ${JUSTIFY}`}>
            <RichText items={data.rich_text} />
          </p>
        );
      }
      // 글의 첫 문단은 애플 뉴스룸처럼 크고 굵게 (리드 문단)
      const cls = isFirst ? `text-[22px] font-semibold leading-[1.6] tracking-[-0.005em] ${JUSTIFY}` : P;
      return (
        <p className={cls}>
          <RichText items={data.rich_text} />
        </p>
      );
    }

    // 페이지 제목이 h1이라서, 노션 제목 1·2·3은 한 단계씩 내려서 씁니다
    case "heading_1":
      return (
        <h2 className="mt-8 text-[32px] font-bold leading-tight tracking-[-0.01em]">
          <RichText items={data.rich_text} />
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="mt-6 text-[26px] font-bold leading-snug tracking-[-0.01em]">
          <RichText items={data.rich_text} />
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-4 text-[21px] font-semibold leading-snug">
          <RichText items={data.rich_text} />
        </h4>
      );

    case "quote":
      return (
        <blockquote className="my-4 text-center">
          <p className="text-[24px] font-semibold leading-[1.5] tracking-[-0.01em] md:text-[28px]">
            <RichText items={data.rich_text} />
          </p>
          <Children block={block} />
        </blockquote>
      );

    case "callout": {
      const emoji = data.icon?.type === "emoji" ? data.icon.emoji : null;
      return (
        <div className="flex gap-3.5 rounded-[18px] bg-[#F5F5F7] px-6 py-5">
          <span className="mt-0.5 flex-none text-xl leading-7 text-[#6E6E73]">{emoji ?? <InfoIcon />}</span>
          <div className={`flex min-w-0 flex-col gap-3 text-[17px] leading-[1.7] ${JUSTIFY}`}>
            <p>
              <RichText items={data.rich_text} />
            </p>
            <Children block={block} />
          </div>
        </div>
      );
    }

    case "divider":
      return <hr className="my-6 border-0 border-t border-[#D2D2D7]" />;

    case "to_do":
      return (
        <div className={`flex items-start gap-3 ${P}`}>
          <input type="checkbox" checked={!!data.checked} readOnly disabled className="mt-[0.55em] h-4 w-4 accent-[#0066CC]" />
          <span className={data.checked ? "text-[#86868B] line-through" : ""}>
            <RichText items={data.rich_text} />
          </span>
        </div>
      );

    case "toggle":
      return (
        <details className="group rounded-[18px] bg-[#F5F5F7] px-6 py-4">
          <summary className={`cursor-pointer font-semibold ${P}`}>
            <RichText items={data.rich_text} />
          </summary>
          <div className="mt-3">
            <Children block={block} />
          </div>
        </details>
      );

    case "code":
      return (
        <pre className="overflow-x-auto rounded-[18px] bg-[#1D1D1F] px-6 py-5 text-sm leading-relaxed text-[#F5F5F7]">
          <code>{plain(data.rich_text)}</code>
        </pre>
      );

    case "image": {
      const url = data.type === "external" ? data.external?.url : data.file?.url;
      if (!url) return null;
      const caption = data.caption?.length ? data.caption : null;
      return (
        <figure className="my-4 flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={caption ? plain(caption) : ""} loading="lazy" className="w-full rounded-[20px]" />
          {caption && (
            <figcaption className="text-center text-sm leading-normal text-[#6E6E73]">
              <RichText items={caption} />
            </figcaption>
          )}
        </figure>
      );
    }

    case "video": {
      const url = data.type === "external" ? data.external?.url : data.file?.url;
      if (!url) return null;
      const yt = youtubeEmbed(url);
      if (yt) return <EmbedFrame src={yt} title="동영상" />;
      return <video src={url} controls className="w-full rounded-[20px]" />;
    }

    case "embed":
    case "bookmark":
    case "link_preview": {
      const url: string | undefined = data.url;
      if (!url) return null;
      // 구글 지도는 '지도 퍼가기'의 src 주소를 넣어야 화면에 지도가 뜹니다
      if (isGoogleMap(url)) return <EmbedFrame src={url} title="지도" />;
      const yt = youtubeEmbed(url);
      if (yt) return <EmbedFrame src={yt} title="동영상" />;
      return <LinkCard url={url} />;
    }

    case "column_list":
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-flow-col md:auto-cols-fr">
          {(block.children || []).map((col: any) => (
            <div key={col.id} className="flex min-w-0 flex-col gap-6">
              <Children block={col} />
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

/* ---------- 블록 목록 (연속된 목록 항목은 하나의 ul/ol로 묶음) ---------- */

export default function NotionBlocks({ blocks, nested = false }: { blocks: any[]; nested?: boolean }) {
  const out: ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
      const listType = block.type;
      const items: any[] = [];
      while (i < blocks.length && blocks[i].type === listType) items.push(blocks[i++]);

      const Tag = listType === "bulleted_list_item" ? "ul" : "ol";
      out.push(
        <Tag
          key={items[0].id}
          className={`flex flex-col gap-1.5 pl-6 ${P} ${Tag === "ul" ? "list-disc" : "list-decimal"} marker:text-[#86868B]`}
        >
          {items.map((item) => (
            <li key={item.id} className="pl-1">
              <RichText items={item[listType].rich_text} />
              {item.children?.length > 0 && (
                <div className="mt-1.5">
                  <NotionBlocks blocks={item.children} nested />
                </div>
              )}
            </li>
          ))}
        </Tag>
      );
      continue;
    }

    const rendered = renderBlock(block, !nested && i === 0);
    if (rendered) out.push(<Fragment key={block.id}>{rendered}</Fragment>);
    i++;
  }

  return <div className={`flex flex-col ${nested ? "gap-3" : "gap-7"}`}>{out}</div>;
}
