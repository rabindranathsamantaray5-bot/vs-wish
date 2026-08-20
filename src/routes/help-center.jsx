import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BookOpen, CreditCard, KeyRound, Search, Settings2, Share2, UserRound } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage } from "@/components/site/PublicPage";

const help = [
  { icon: BookOpen, title: "Create your first wish", text: "Choose a design, complete the guided editor, preview and publish.", href: "/how-it-works" },
  { icon: UserRound, title: "Account and profile", text: "Sign in, update your name and manage wishes from your account dashboard.", href: "/account" },
  { icon: Settings2, title: "Customize a design", text: "Change message, recipient, photos, cover, theme, music and privacy.", href: "/templates" },
  { icon: Share2, title: "Publish and share", text: "Copy the unique wish link and send it through your preferred channel.", href: "/how-it-works" },
  { icon: KeyRound, title: "Privacy and passwords", text: "Protect private wishes and understand who can access shared content.", href: "/privacy-policy" },
  { icon: CreditCard, title: "Pricing and coupons", text: "Understand free templates, customer prices and coupon calculations.", href: "/pricing" },
];

function HelpCenterPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => help.filter((item) => `${item.title} ${item.text}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <PublicPage eyebrow="Support, without the wait" icon={BookOpen} title="Find your answer and keep" accent="creating beautifully." description="Explore quick guidance for the most common account, template, privacy, pricing and sharing questions." testId="help-center-page">
      <div className="mx-auto -mt-4 max-w-3xl rounded-full border border-slate-200 bg-white p-2 shadow-2xl shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900">
        <label className="flex h-13 items-center gap-3 px-4"><Search className="h-5 w-5 text-[#6d4aff]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search help topics…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>
      </div>
      <ContentSection eyebrow="Knowledge base" title="Popular help topics">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" data-testid="help-results">
          {filtered.map((item) => <PremiumCard key={item.title} icon={item.icon} title={item.title} href={item.href} label="Open guide">{item.text}</PremiumCard>)}
        </div>
        {filtered.length === 0 && <div className="rounded-3xl border border-dashed border-purple-300 p-12 text-center text-sm text-slate-500">No matching guide. Try a shorter phrase or contact support.</div>}
      </ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/help-center")({ component: HelpCenterPage });
