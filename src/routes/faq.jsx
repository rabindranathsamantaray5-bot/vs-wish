import { createFileRoute } from "@tanstack/react-router";
import { HelpCircle, MessageCircleQuestion } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContentSection, PublicPage } from "@/components/site/PublicPage";
import { usePublicSettings } from "@/components/site/PublicSettingsProvider";

const groups = [
  { title: "Creating and sharing", items: [
    ["How do I create a digital wish?", "Choose a template, sign in, personalize the recipient, message, theme, cover and photos, preview the experience and publish it as a shareable link."],
    ["Can I use a free template without paying?", "Yes. Any template with a payable price of ₹0 can be used directly. No purchase is created and no checkout is required."],
    ["Can I protect a wish with a password?", "Yes. Enable password protection while creating the wish and share the password only with the intended recipient."],
    ["Where can I share the wish?", "The published link works through WhatsApp, Instagram, email, SMS and other platforms that accept web links."],
  ]},
  { title: "Templates and payments", items: [
    ["What is the difference between free and premium?", "Free templates have a payable price of zero. Premium designs may carry a customer price and can include more elaborate visual experiences."],
    ["How is a discount calculated?", "When a customer price is configured, that amount replaces the base price. A valid coupon can then reduce it according to its minimum amount, cap, date and usage rules."],
    ["Can I preview before choosing?", "Yes. Template cards show the design, page count, category, badge and current customer price before you start."],
  ]},
  { title: "Account, privacy and support", items: [
    ["Do I need an account?", "Browsing is public, while creating and managing wishes requires an account so your work remains connected to you."],
    ["Who can see my wish?", "Anyone with the link can see a public wish. For a private moment, enable password protection before publishing."],
    ["How can I get help?", "Use the Contact page, email the support address shown below or call the published business number."],
  ]},
];

function FAQPage() {
  const { site } = usePublicSettings();
  return (
    <PublicPage eyebrow="Clear answers" icon={MessageCircleQuestion} title="Everything you need to know about" accent={`${site.siteName}.`} description="Straightforward answers about creating, pricing, privacy, sharing and getting support." testId="faq-page">
      {groups.map((group) => (
        <ContentSection key={group.title} eyebrow="FAQ" title={group.title}>
          <Accordion type="single" collapsible className="space-y-3">
            {group.items.map(([question, answer], index) => (
              <AccordionItem key={question} value={`${group.title}-${index}`} className="rounded-2xl border border-slate-200 bg-white px-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <AccordionTrigger className="text-left font-display text-base font-bold hover:no-underline">{question}</AccordionTrigger>
                <AccordionContent className="text-sm leading-7 text-slate-600 dark:text-slate-300">{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ContentSection>
      ))}
      <div className="mb-10 rounded-[2rem] bg-gradient-to-r from-purple-50 to-pink-50 p-7 text-center dark:from-purple-950/40 dark:to-pink-950/30">
        <HelpCircle className="mx-auto h-7 w-7 text-[#6d4aff]" /><h2 className="mt-3 font-display text-2xl font-bold">Still need an answer?</h2><a href="/contact" className="mt-4 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">Contact support</a>
      </div>
    </PublicPage>
  );
}

export const Route = createFileRoute("/faq")({ component: FAQPage });
