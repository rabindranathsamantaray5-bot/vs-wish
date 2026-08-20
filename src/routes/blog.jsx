import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, BookOpenText, CalendarDays, Clock3, Heart, Lightbulb, Palette, ShieldCheck } from "lucide-react";
import { ContentSection, PublicPage } from "@/components/site/PublicPage";

const posts = [
  { icon: Heart, category: "Inspiration", title: "How to write a birthday message they’ll remember", summary: "A simple framework for turning shared memories and honest emotion into a message that sounds like you.", date: "August 18, 2026", time: "6 min read", gradient: "from-pink-500 to-rose-500" },
  { icon: Palette, category: "Design", title: "Choosing the right visual mood for every occasion", summary: "Match color, typography, photographs and motion to the feeling you want the recipient to experience.", date: "August 12, 2026", time: "5 min read", gradient: "from-purple-600 to-fuchsia-500" },
  { icon: ShieldCheck, category: "Privacy", title: "When and why to password-protect a digital wish", summary: "A practical guide to sharing personal celebrations with the right people and the right level of privacy.", date: "August 4, 2026", time: "4 min read", gradient: "from-sky-500 to-indigo-600" },
  { icon: Lightbulb, category: "Ideas", title: "Seven small details that make a digital gift feel premium", summary: "Thoughtful sequencing, meaningful captions and a considered ending can transform the whole experience.", date: "July 28, 2026", time: "7 min read", gradient: "from-amber-500 to-orange-500" },
];

function BlogPage() {
  return (
    <PublicPage eyebrow="Ideas worth sharing" icon={BookOpenText} title="Stories, craft and inspiration for" accent="meaningful moments." description="Practical advice for writing better messages, choosing beautiful designs and sharing personal celebrations with confidence." testId="blog-page">
      <ContentSection eyebrow="Latest journal" title="Fresh thinking from our studio">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.title} className="group overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_22px_65px_-38px_rgba(76,29,149,.55)] dark:border-slate-800 dark:bg-slate-900">
              <div className={`relative h-48 bg-gradient-to-br ${post.gradient} p-7 text-white`}><div className="absolute -right-12 -top-12 h-44 w-44 rounded-full border-[28px] border-white/10" /><post.icon className="h-10 w-10" /><div className="mt-12 text-xs font-extrabold uppercase tracking-[0.2em] text-white/75">{post.category}</div></div>
              <div className="p-7"><h2 className="font-display text-2xl font-bold leading-tight">{post.title}</h2><p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{post.summary}</p><div className="mt-5 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" />{post.date}</span><span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" />{post.time}</span><span className="ml-auto inline-flex items-center gap-1 text-[#6d4aff]">Article coming soon <ArrowUpRight className="h-4 w-4" /></span></div></div>
            </article>
          ))}
        </div>
      </ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/blog")({ component: BlogPage });
