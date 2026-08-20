import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock3, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { ContentSection, PremiumCard, PublicPage } from "@/components/site/PublicPage";
import { SITE } from "@/lib/site-config";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

function ContactPage() {
  const { site } = usePublicSettings();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const submit = (event) => {
    event.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.location.href = `mailto:${site.supportEmail}?subject=${encodeURIComponent(form.subject || "Website enquiry")}&body=${encodeURIComponent(body)}`;
  };
  return (
    <PublicPage
      eyebrow="We’re here to help"
      icon={MessageCircle}
      title="Let’s talk about what you want to"
      accent="create."
      description="Questions, feedback, collaborations or a special occasion that needs extra care—reach the team directly and expect a thoughtful response."
      ctaTitle="Prefer a direct conversation?"
      ctaText={`Call ${SITE.founder} for product, partnership or business enquiries.`}
      ctaHref={`tel:${SITE.phoneHref}`}
      ctaLabel="Call now"
      testId="contact-page"
    >
      <ContentSection>
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <PremiumCard icon={Mail} title="Email us"><a className="font-semibold text-[#6d4aff]" href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a><br />Best for support, feedback and detailed enquiries.</PremiumCard>
            <PremiumCard icon={Phone} title="Call directly"><a className="font-semibold text-[#6d4aff]" href={`tel:${SITE.phoneHref}`}>{SITE.phone}</a><br />Founder and business contact: {SITE.founder}.</PremiumCard>
            <PremiumCard icon={MapPin} title="Based in India">Serving creators and families digitally, wherever their special people happen to be.</PremiumCard>
            <PremiumCard icon={Clock3} title="Response time">Most genuine messages receive a response within one business day.</PremiumCard>
          </div>
          <form onSubmit={submit} className="rounded-[2rem] border border-slate-200/70 bg-white p-6 shadow-2xl shadow-purple-500/10 sm:p-9 dark:border-slate-800 dark:bg-slate-900" data-testid="contact-form">
            <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#6d4aff]">Send a message</div>
            <h2 className="mt-2 font-display text-3xl font-bold">Tell us how we can help</h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-bold">Your name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#6d4aff] dark:border-slate-700 dark:bg-slate-800" /></label>
              <label className="text-xs font-bold">Email address<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#6d4aff] dark:border-slate-700 dark:bg-slate-800" /></label>
              <label className="text-xs font-bold sm:col-span-2">Subject<input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-[#6d4aff] dark:border-slate-700 dark:bg-slate-800" /></label>
              <label className="text-xs font-bold sm:col-span-2">Message<textarea required rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-[#6d4aff] dark:border-slate-700 dark:bg-slate-800" /></label>
            </div>
            <button className="mt-5 inline-flex h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#6d4aff] to-[#ff5fa2] px-6 text-sm font-bold text-white shadow-xl" type="submit">Compose email <Send className="h-4 w-4" /></button>
          </form>
        </div>
      </ContentSection>
    </PublicPage>
  );
}

export const Route = createFileRoute("/contact")({ component: ContactPage });
