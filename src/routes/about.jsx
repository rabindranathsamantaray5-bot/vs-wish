import { createFileRoute } from "@tanstack/react-router";
import { HeartHandshake, Lightbulb, ShieldCheck, Sparkles, Target, UserRound } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage, RichText } from "@/components/site/PublicPage";
import { SITE } from "@/lib/site-config";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

function AboutPage() {
  const { site } = usePublicSettings();
  return (
    <PublicPage
      eyebrow="Our story"
      icon={HeartHandshake}
      title="Technology should make affection feel"
      accent="more human."
      description={`${site.siteName} exists to turn birthdays, anniversaries, festivals and everyday gratitude into beautiful digital experiences people genuinely remember.`}
      testId="about-page"
    >
      <ContentSection eyebrow="Founder" title="Built with care in India">
        <div className="grid items-stretch gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#6d4aff] via-[#a43cff] to-[#ff5fa2] p-8 text-white shadow-2xl">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[32px] border-white/10" />
            <div className="relative grid h-20 w-20 place-items-center rounded-3xl bg-white/15 backdrop-blur"><UserRound className="h-9 w-9" /></div>
            <div className="relative mt-16 text-xs font-bold uppercase tracking-[0.2em] text-white/70">Founder & Creator</div>
            <h2 className="relative mt-2 font-display text-3xl font-bold">{SITE.founder}</h2>
            <a href={`mailto:${SITE.email}`} className="relative mt-4 block text-sm text-white/85 hover:text-white">{SITE.email}</a>
            <a href={`tel:${SITE.phoneHref}`} className="relative mt-1 block text-sm text-white/85 hover:text-white">{SITE.phone}</a>
          </div>
          <RichText>
            <p className="text-xl font-semibold leading-9 text-slate-900 dark:text-white">“The best digital products disappear behind the emotion they help you express.”</p>
            <p className="mt-6">{SITE.founder} created {site.siteName} with a simple belief: meaningful celebration should be easy to create, beautiful to experience and personal enough to feel handcrafted.</p>
            <p className="mt-4">The platform combines expressive design, thoughtful customization and privacy-first sharing so that anyone can create something memorable without needing technical or design expertise.</p>
          </RichText>
        </div>
      </ContentSection>
      <ContentSection eyebrow="What guides us" title="A small set of principles, applied everywhere">
        <div className="grid gap-5 md:grid-cols-3">
          <PremiumCard icon={Target} title="Emotion before features">Every choice should make the sender’s intention clearer and the recipient’s experience warmer.</PremiumCard>
          <PremiumCard icon={Lightbulb} title="Elegant simplicity">Powerful personalization should feel intuitive, calm and welcoming on the first use.</PremiumCard>
          <PremiumCard icon={ShieldCheck} title="Trust by default">Private wishes, user data and purchases deserve transparent controls and responsible engineering.</PremiumCard>
        </div>
      </ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/about")({ component: AboutPage });
