import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Link2, MousePointer2, Palette, Rocket, Share2, WandSparkles } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage } from "@/components/site/PublicPage";

const steps = [
  { icon: MousePointer2, title: "Choose your starting point", text: "Browse live categories and select a free or premium design that matches the occasion." },
  { icon: Palette, title: "Make it unmistakably yours", text: "Add the recipient, message, cover, photographs, theme, music and optional password protection." },
  { icon: WandSparkles, title: "Preview every detail", text: "Review the full wish experience on desktop and mobile before it reaches anyone you care about." },
  { icon: Share2, title: "Share one beautiful link", text: "Publish and send the private link on WhatsApp, email, Instagram or any channel you prefer." },
];

function HowItWorksPage() {
  return (
    <PublicPage
      active="/how-it-works"
      eyebrow="Simple by design"
      icon={Rocket}
      title="From idea to unforgettable in"
      accent="four elegant steps."
      description="No design software and no complicated setup. The experience guides you from a thoughtful idea to a share-ready digital celebration."
      testId="how-it-works-page"
    >
      <ContentSection eyebrow="The journey" title="Create confidently, from any device">
        <div className="grid gap-5 md:grid-cols-2">
          {steps.map((step, index) => (
            <PremiumCard key={step.title} icon={step.icon} title={`${index + 1}. ${step.title}`}>{step.text}</PremiumCard>
          ))}
        </div>
      </ContentSection>
      <ContentSection eyebrow="Built into every wish" title="The details that make sharing feel effortless">
        <div className="grid gap-4 rounded-[2rem] bg-slate-950 p-6 text-white sm:grid-cols-2 sm:p-10 lg:grid-cols-4 dark:bg-white dark:text-slate-950">
          {["Responsive on every screen", "Optional password protection", "Personal photo galleries", "One-click shareable link"].map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 p-4 dark:border-slate-200">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-pink-400" /><span className="text-sm font-semibold leading-6">{item}</span>
            </div>
          ))}
        </div>
      </ContentSection>
      <div className="mb-8 flex justify-center"><a href="/templates" className="inline-flex items-center gap-2 rounded-full bg-[#6d4aff] px-6 py-3 text-sm font-bold text-white shadow-xl"><Link2 className="h-4 w-4" /> Start with a template</a></div>
    </PublicPage>
  );
}

export const Route = createFileRoute("/how-it-works")({ component: HowItWorksPage });
