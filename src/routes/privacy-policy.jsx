import { createFileRoute } from "@tanstack/react-router";
import { Cookie, Database, Eye, KeyRound, LockKeyhole, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage, RichText } from "@/components/site/PublicPage";
import { SITE } from "@/lib/site-config";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

function PrivacyPolicyPage() {
  const { site } = usePublicSettings();
  return (
    <PublicPage eyebrow="Privacy policy" icon={ShieldCheck} title="Your memories deserve thoughtful" accent="protection." description={`This policy explains what ${site.siteName} processes, why it is needed and the choices available when you create or view a digital wish.`} ctaTitle="Have a privacy question?" ctaText="Contact the founder and support contact directly for access, correction or deletion enquiries." ctaHref={`mailto:${site.supportEmail}?subject=${encodeURIComponent("Privacy request")}`} ctaLabel="Email privacy support" testId="privacy-page">
      <ContentSection eyebrow="At a glance" title="Privacy principles">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <PremiumCard icon={Database} title="Data minimization">We collect only information needed to operate accounts, wishes, media, comments and access.</PremiumCard>
          <PremiumCard icon={LockKeyhole} title="Protected content">Password-protected wishes require successful verification before private content is returned.</PremiumCard>
          <PremiumCard icon={Eye} title="Clear visibility">A public wish is available to people with its link; password protection is available for private sharing.</PremiumCard>
          <PremiumCard icon={UserCheck} title="Your choices">You may request access, correction or deletion of personal information, subject to legal obligations.</PremiumCard>
        </div>
      </ContentSection>
      <ContentSection><RichText>
        <h2 className="font-display text-2xl font-bold text-slate-950 dark:text-white">1. Information we process</h2><p className="mt-4">Account data may include your name, email address, authentication identifiers and profile preferences. Wish data may include recipient details, messages, uploaded media, selected templates, privacy settings and publishing information. Operational data can include timestamps, views, comments and records needed to provide access.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">2. Why we use it</h2><p className="mt-4">Information is used to authenticate you, save and display your wishes, moderate comments, provide customer support, protect the service, calculate valid prices and improve reliability. We do not claim ownership over the personal content you upload.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">3. Sharing and service providers</h2><p className="mt-4">Infrastructure providers such as authentication, database and storage services process information only as needed to operate the product. Information may also be disclosed when required by applicable law, to prevent abuse or to protect users and the service.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">4. Cookies and local storage</h2><p className="mt-4">Authentication sessions and interface preferences such as theme selection may use browser storage. These are used for essential product behavior and continuity.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">5. Retention and security</h2><p className="mt-4">Information is retained while required for the service, account, dispute prevention or legal obligations. Reasonable technical and organizational safeguards are used, but no internet service can promise absolute security.</p>
        <h2 className="mt-8 font-display text-2xl font-bold text-slate-950 dark:text-white">6. Contact</h2><p className="mt-4">For privacy requests contact {SITE.founder} at <a className="font-semibold text-[#6d4aff]" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> or call <a className="font-semibold text-[#6d4aff]" href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a>.</p>
        <p className="mt-8 text-xs text-slate-500">Effective date: 19 August 2026. This policy should be reviewed with qualified legal counsel before a production commercial launch in every target jurisdiction.</p>
      </RichText></ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/privacy-policy")({ component: PrivacyPolicyPage });
