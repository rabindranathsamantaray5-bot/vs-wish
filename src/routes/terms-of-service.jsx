import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, FileCheck2, Gavel, Scale, ShieldAlert } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage, RichText } from "@/components/site/PublicPage";
import { SITE } from "@/lib/site-config";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

function TermsPage() {
  const { site } = usePublicSettings();
  return (
    <PublicPage eyebrow="Terms of service" icon={FileCheck2} title="Simple rules for a respectful and" accent="reliable platform." description={`These terms describe the agreement between you and ${site.siteName} when you browse, create, publish or manage digital wishes.`} ctaTitle="Need clarification before using the service?" ctaText="Contact us directly and we will explain the product behavior as clearly as possible." ctaHref={`mailto:${site.supportEmail}?subject=${encodeURIComponent("Terms enquiry")}`} ctaLabel="Ask a question" testId="terms-page">
      <ContentSection eyebrow="The essentials" title="Use the platform thoughtfully">
        <div className="grid gap-5 md:grid-cols-3"><PremiumCard icon={BadgeCheck} title="Use accurate information">Keep account information current and protect access to your credentials.</PremiumCard><PremiumCard icon={Scale} title="Respect rights">Upload only content you may legally use and respect privacy, copyright and personal dignity.</PremiumCard><PremiumCard icon={ShieldAlert} title="No abuse">Do not use the service for harassment, fraud, malware, unlawful material or attempts to bypass security.</PremiumCard></div>
      </ContentSection>
      <ContentSection><RichText>
        <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white">1. Acceptance and eligibility</h2><p className="mt-4">By using the service you agree to these terms and the Privacy Policy. You must have legal capacity to enter this agreement or use the service with appropriate guardian consent.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">2. Accounts and security</h2><p className="mt-4">You are responsible for activity through your account and for keeping credentials confidential. Notify support promptly if you suspect unauthorized access.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">3. Your content</h2><p className="mt-4">You retain rights in content you create or upload. You grant the service a limited permission to host, process, resize and display that content only as required to operate and share your wish. You confirm that you have the necessary rights and permissions.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">4. Templates, pricing and purchases</h2><p className="mt-4">Free templates may be used without payment. Paid access, when enabled, will use the customer price and applicable validated discounts shown before checkout. Payment is not considered complete until confirmed through an approved server-side payment process.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">5. Availability and changes</h2><p className="mt-4">Features may change, pause for maintenance or be withdrawn to protect security and quality. We aim for reliable operation but do not guarantee uninterrupted availability.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">6. Disclaimer and liability</h2><p className="mt-4">The service is provided on an “as available” basis to the extent permitted by law. Liability is limited only where applicable law allows; mandatory consumer rights are not excluded.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">7. Contact</h2><p className="mt-4">Questions may be sent to {SITE.founder} at <a className="font-semibold text-[#6d4aff]" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.</p>
        <p className="mt-8 text-xs text-slate-500">Effective date: 19 August 2026. Obtain jurisdiction-specific legal review before commercial production launch.</p>
      </RichText></ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/terms-of-service")({ component: TermsPage });
