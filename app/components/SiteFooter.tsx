import { INSTAGRAM_URL } from "@/lib/site";

export default function SiteFooter() {
  return (
    <footer className="mx-auto mt-30 max-w-[1200px] px-[22px] pb-10 text-xs text-[#6E6E73]">
      <div className="flex flex-wrap justify-between gap-3 border-t border-[#D2D2D7] pt-5">
        <span>© {new Date().getFullYear()} TRAVESIA</span>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-[#424245] hover:text-[#1D1D1F]">
          Instagram
        </a>
      </div>
    </footer>
  );
}
