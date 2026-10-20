"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/notion";
import { CATEGORIES } from "@/lib/site";
import ArticleCard from "./ArticleCard";
import { SearchIcon } from "./Icons";

const PAGE_SIZE = 9; // 처음 보여줄 글 수, '더 보기'를 누를 때마다 이만큼 추가

type Phase = "in" | "out" | "pre";

interface ArticleListProps {
  articles: Article[];
  mode: "home" | "category";
  categoryName?: string; // mode가 category일 때 검색창 안내 문구에 사용
}

// 흐려지며 사라졌다가 아래에서 올라오는 전환 효과.
// 바꿀 내용을 apply로 넘기면, 사라지는 동안 기다렸다가 적용합니다.
function useFadeSwitch() {
  const [phase, setPhase] = useState<Phase>("in");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const run = (apply: () => void) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (timer.current) clearTimeout(timer.current);
    if (reduce) {
      apply();
      return;
    }
    setPhase("out");
    timer.current = setTimeout(() => {
      apply();
      setPhase("pre");
      requestAnimationFrame(() => requestAnimationFrame(() => setPhase("in")));
    }, 220);
  };

  return { phase, run };
}

function SegmentedControl({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-full bg-[rgba(118,118,128,0.12)] p-1">
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(o.value)}
            className={`min-h-9 cursor-pointer rounded-full px-4 text-sm transition-colors md:px-[18px] ${
              selected
                ? "bg-white font-semibold text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                : "font-medium text-[#424245] hover:text-[#1D1D1F]"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ArticleList({ articles, mode, categoryName = "" }: ArticleListProps) {
  // 화면에 적용된 값
  const [category, setCategory] = useState("전체");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  // 버튼에 바로 표시할 값 (전환 효과가 끝나기 전에도 선택이 즉시 보이도록)
  const [pendingCategory, setPendingCategory] = useState("전체");
  const [pendingSort, setPendingSort] = useState<"desc" | "asc">("desc");

  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const { phase, run } = useFadeSwitch();

  const changeCategory = (next: string) => {
    if (next === pendingCategory) return;
    setPendingCategory(next);
    run(() => {
      setCategory(next);
      setVisibleCount(PAGE_SIZE);
    });
  };

  const changeSort = (next: string) => {
    const value = next as "desc" | "asc";
    if (value === pendingSort) return;
    setPendingSort(value);
    run(() => setSortOrder(value));
  };

  const term = searchTerm.trim().toLowerCase();
  const filtered = articles
    .filter((a) => category === "전체" || a.category === category)
    .filter((a) => !term || a.title.toLowerCase().includes(term) || a.summary.toLowerCase().includes(term))
    .sort((a, b) => {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortOrder === "desc" ? -diff : diff;
    });
  const shown = filtered.slice(0, visibleCount);

  const fadeClass = `fade fade-${phase}`;
  const heading = category === "전체" ? "모든 글" : category;
  const emptyCategory = mode === "category" ? categoryName : category === "전체" ? "" : category;

  return (
    <section className={`mx-auto max-w-[1200px] px-[22px] ${mode === "home" ? "pt-24" : ""}`}>
      <div
        className={`mb-8 flex flex-wrap items-end justify-between gap-5 ${
          mode === "category" ? "items-center border-t border-[#D2D2D7] pt-4" : ""
        }`}
      >
        {mode === "home" ? (
          <h2 className={`${fadeClass} text-[32px] font-bold leading-tight tracking-[-0.01em] md:text-5xl`}>
            {heading}
          </h2>
        ) : (
          <span className="text-[15px] text-[#6E6E73]">
            {articles.length > 0 ? `글 ${articles.length}편` : "글 없음"}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {mode === "home" ? (
            <SegmentedControl
              label="카테고리 필터"
              value={pendingCategory}
              onChange={changeCategory}
              options={[{ value: "전체", label: "전체" }, ...CATEGORIES.map((c) => ({ value: c.name, label: c.name }))]}
            />
          ) : (
            <SegmentedControl
              label="정렬"
              value={pendingSort}
              onChange={changeSort}
              options={[
                { value: "desc", label: "최신순" },
                { value: "asc", label: "오래된순" },
              ]}
            />
          )}

          <label className="flex min-h-11 items-center gap-2 rounded-full border border-[#D2D2D7] bg-white px-4 text-[#6E6E73] focus-within:border-[#0066CC]">
            <SearchIcon />
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              placeholder={mode === "category" ? `${categoryName}에서 검색` : "글 검색"}
              aria-label="글 검색"
              className="w-40 bg-transparent text-sm text-[#1D1D1F] outline-none placeholder:text-[#86868B] md:w-44"
            />
          </label>
        </div>
      </div>

      <div className={`${fadeClass} fade-grid grid grid-cols-[repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-6`}>
        {shown.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}

        {shown.length === 0 && (
          <div className="col-span-full flex flex-col items-center gap-2 rounded-3xl bg-white px-6 py-20 text-center">
            {term ? (
              <>
                <p className="text-[21px] font-semibold">‘{searchTerm.trim()}’에 맞는 글이 없어요.</p>
                <p className="text-[15px] text-[#6E6E73]">다른 단어로 검색해 보세요.</p>
              </>
            ) : (
              <>
                <p className="text-[21px] font-semibold">아직 {emptyCategory ? `${emptyCategory} ` : ""}글이 없어요.</p>
                <p className="text-[15px] text-[#6E6E73]">첫 글이 올라오면 여기에 표시됩니다.</p>
                {mode === "category" && (
                  <Link href="/" className="mt-3 text-[15px] font-medium text-[#0066CC] hover:underline">
                    모든 글 보기
                  </Link>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {filtered.length > visibleCount && (
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="min-h-11 cursor-pointer rounded-full bg-white px-6 text-[15px] font-medium text-[#1D1D1F] shadow-[0_1px_4px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#E8E8ED]"
          >
            더 보기
          </button>
        </div>
      )}
    </section>
  );
}
