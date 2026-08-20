import { createFileRoute } from "@tanstack/react-router";
import { Code2, Globe2, HeartHandshake, Laptop2, Mail, Palette, Sparkles, UsersRound } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage } from "@/components/site/PublicPage";
import { SITE } from "@/lib/site-config";

function CareersPage() {
  return (
    <PublicPage eyebrow="Build with heart" icon={UsersRound} title="Help us make digital connection feel" accent="more personal." description="We are building a thoughtful product at the intersection of design, storytelling and celebration—and we value people who care about the details." ctaTitle="Don’t see the perfect role?" ctaText="Send a concise introduction, portfolio or GitHub profile and explain the experience you would love to improve." ctaHref={`mailto:${SITE.email}?subject=${encodeURIComponent("Careers at WishFly")}`} ctaLabel="Introduce yourself" testId="careers-page">
      <ContentSection eyebrow="How we work" title="Small team energy, meaningful product decisions">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard icon={HeartHandshake} title="Care deeply">We optimize for the recipient’s emotion, not vanity metrics or unnecessary complexity.</PremiumCard>
          <PremiumCard icon={Laptop2} title="Own the outcome">Everyone is encouraged to understand the problem, question assumptions and carry work through verification.</PremiumCard>
          <PremiumCard icon={Globe2} title="Work flexibly">We are India-based and digital-first, with collaboration shaped around clarity and accountability.</PremiumCard>
        </div>
      </ContentSection>
      <ContentSection eyebrow="Open conversations" title="Profiles we would love to meet">
        <div className="grid gap-5 md:grid-cols-2">
          <PremiumCard icon={Code2} title="Full-stack product engineer">React, TypeScript, Supabase, secure server flows and a strong instinct for polished user experience.</PremiumCard>
          <PremiumCard icon={Palette} title="Product and motion designer">Visual systems, responsive interfaces and motion that supports emotion instead of distracting from it.</PremiumCard>
          <PremiumCard icon={Sparkles} title="Content and celebration curator">Template concepts, culturally thoughtful occasion content and concise, warm product writing.</PremiumCard>
          <PremiumCard icon={Mail} title="Partnerships and growth">Creator relationships, event partnerships and responsible growth rooted in customer value.</PremiumCard>
        </div>
        <p className="mt-6 text-sm text-slate-500">Current roles are exploratory and may not represent immediate salaried vacancies. Contact {SITE.founder} at <a className="font-semibold text-[#6d4aff]" href={`mailto:${SITE.email}`}>{SITE.email}</a> for current availability.</p>
      </ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/careers")({ component: CareersPage });
