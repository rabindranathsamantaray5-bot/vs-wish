import { createFileRoute } from "@tanstack/react-router";
import { BadgeIndianRupee, BarChart3, Handshake, Link2, Megaphone, ShieldCheck } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage } from "@/components/site/PublicPage";
import { SITE } from "@/lib/site-config";

function AffiliatePage() {
  return (
    <PublicPage eyebrow="Partner with us" icon={Handshake} title="Recommend meaningful design and grow" accent="with the community." description="The partner program is being shaped for creators, celebration professionals and communities that genuinely help people mark important moments." ctaTitle="Interested in becoming an early partner?" ctaText={`Tell ${SITE.founder} about your audience, content or business and how you would introduce the platform responsibly.`} ctaHref={`mailto:${SITE.email}?subject=${encodeURIComponent("Affiliate programme enquiry")}`} ctaLabel="Apply by email" testId="affiliate-page">
      <ContentSection eyebrow="Designed for trust" title="A partner model built around real customer value">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <PremiumCard icon={Link2} title="Simple attribution">A unique partner link will connect genuine referrals to your account when tracking launches.</PremiumCard>
          <PremiumCard icon={BadgeIndianRupee} title="Clear rewards">Commission rates, qualifying purchases and payout terms will be published before activation.</PremiumCard>
          <PremiumCard icon={BarChart3} title="Useful reporting">Partners will be able to understand visits, conversions and approved earnings without opaque metrics.</PremiumCard>
          <PremiumCard icon={Megaphone} title="Creative resources">Launch-ready brand assets and product guidance will help partners communicate accurately.</PremiumCard>
          <PremiumCard icon={ShieldCheck} title="Responsible standards">No spam, misleading claims, trademark bidding or privacy-invasive promotion will be accepted.</PremiumCard>
          <PremiumCard icon={Handshake} title="Human support">Early partners can work directly with the founder on suitable campaigns and audience fit.</PremiumCard>
        </div>
      </ContentSection>
      <div className="mb-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"><strong>Programme status:</strong> applications are currently expressions of interest. Referral tracking, commission and payouts are not active until formal partner terms and payment systems are published.</div>
    </PublicPage>
  );
}

export const Route = createFileRoute("/affiliate-program")({ component: AffiliatePage });
