import Image from "next/image";
import type { Article } from "@/lib/notion";
import { getCategory } from "@/lib/site";

interface ThumbnailProps {
  article: Article;
  sizes: string;
  variant: "card" | "tile" | "hero";
  priority?: boolean;
}

// 표지를 세울 때 여백. 홈 배너(tile)는 왼쪽 아래 글 패널을 피해 휴대폰에선 위쪽, 컴퓨터에선 오른쪽에 세우고,
// 글 상세(hero)는 위쪽 메뉴바와 아래쪽 제목 카드를 피해서 둡니다.
const COVER_PADDING = {
  card: "p-6",
  tile: "px-6 pb-64 pt-8 md:py-12 md:pl-[600px] md:pr-12",
  hero: "px-6 pb-36 pt-28 md:pb-44 md:pt-20",
};

// 글 썸네일을 상자에 꽉 채워 보여줍니다.
// - 썸네일이 없으면 카테고리 기본 그림
// - 책처럼 세로로 긴 표지는 흐린 표지를 배경으로 깔고, 그 위에 표지 전체를 가운데 세움
// 바깥 div에 붙은 art 클래스 덕분에 카드에 마우스를 올리면 함께 확대됩니다.
export default function Thumbnail({ article, sizes, variant, priority = false }: ThumbnailProps) {
  const category = getCategory(article.category);

  if (!article.thumbnail) {
    if (!category) return null;
    return (
      <div className="art absolute inset-0">
        <Image src={category.thumbnail} alt="" fill unoptimized priority={priority} className="object-cover" />
      </div>
    );
  }

  if (category?.coverStyle) {
    return (
      <div className="art absolute inset-0 overflow-hidden bg-[#E4DCCF]">
        <Image
          src={article.thumbnail}
          alt=""
          fill
          sizes="400px"
          aria-hidden="true"
          className="scale-125 object-cover opacity-70 blur-2xl"
        />
        <div className="absolute inset-0 bg-white/25" aria-hidden="true" />
        <div className={`absolute inset-0 ${COVER_PADDING[variant]}`}>
          <div className="relative h-full w-full">
            <Image
              src={article.thumbnail}
              alt=""
              fill
              sizes={variant === "card" ? "300px" : "480px"}
              priority={priority}
              className="object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.28)]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="art absolute inset-0">
      <Image src={article.thumbnail} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
    </div>
  );
}
