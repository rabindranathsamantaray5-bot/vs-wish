import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Grid2X2, Heart, Loader2, Sparkles } from "lucide-react";
import { ContentSection, PublicPage } from "@/components/site/PublicPage";

function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/public/categories", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setCategories(data.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicPage
      active="/categories"
      eyebrow="Every occasion, beautifully covered"
      icon={Grid2X2}
      title="Find the perfect feeling for"
      accent="every moment."
      description="From intimate milestones to vibrant festivals, explore collections shaped to help your message feel personal, polished and memorable."
      testId="categories-page"
    >
      <ContentSection
        eyebrow="Live collections"
        title="Designed around the moments people remember"
        description="These collections are controlled directly from Admin Categories. Order, icon, background and visibility update here automatically."
      >
        {loading ? (
          <div className="grid min-h-64 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#6d4aff]" /></div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="public-category-list">
            {categories.map((category, index) => (
              <a
                key={category.id || category.name}
                href={`/templates?category=${encodeURIComponent(category.name)}`}
                className="group relative min-h-64 overflow-hidden rounded-[2rem] border border-white/80 bg-white p-6 shadow-[0_22px_60px_-35px_rgba(76,29,149,.55)] transition duration-300 hover:-translate-y-2 dark:border-slate-800 dark:bg-slate-900"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${category.bg || "from-purple-100 to-pink-100"} opacity-80 dark:opacity-20`}
                />
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/50 blur-xl dark:bg-white/5" />
                <div className="relative flex h-full flex-col">
                  <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl bg-white/80 text-3xl shadow-lg backdrop-blur dark:bg-slate-900/80">
                    {String(category.img || "✨").startsWith("http") ? (
                      <img src={category.img} alt="" className="h-full w-full object-cover" />
                    ) : category.img || "✨"}
                  </div>
                  <div className="mt-auto pt-16">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Collection {String(index + 1).padStart(2, "0")}</div>
                    <h2 className="mt-2 font-display text-2xl font-bold">{category.name}</h2>
                    <div className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#6d4aff]">
                      Explore designs <Sparkles className="h-4 w-4 transition group-hover:rotate-12" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </ContentSection>
      <ContentSection className="text-center">
        <div className="rounded-[2rem] border border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 p-8 dark:border-purple-900/40 dark:from-purple-950/40 dark:to-pink-950/30">
          <Heart className="mx-auto h-7 w-7 fill-pink-500 text-pink-500" />
          <h2 className="mt-4 font-display text-2xl font-bold">Can’t find your occasion?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">Start with any template and personalize the title, story, colors, cover and gallery until it feels completely yours.</p>
        </div>
      </ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/categories")({ component: CategoriesPage });
