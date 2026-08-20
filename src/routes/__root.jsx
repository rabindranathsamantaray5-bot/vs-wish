import { createRootRoute, Outlet, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import "@/styles.css";
import {
  PublicSettingsProvider,
  usePublicSettings,
} from "@/components/site/PublicSettingsProvider";

const queryClient = new QueryClient();

function NotFoundPage() {
  const { site } = usePublicSettings();
  return (
    <main className="min-h-screen grid place-items-center bg-slate-50 px-4 text-center">
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-500">The page you requested does not exist.</p>
        <a
          href="/"
          className="mt-6 inline-flex rounded-full bg-[#6d4aff] px-5 py-3 font-semibold text-white"
        >
          Back to {site.siteName}
        </a>
      </div>
    </main>
  );
}

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <RootDocument>
        <PublicSettingsProvider>
          <Outlet />
        </PublicSettingsProvider>
      </RootDocument>
    </QueryClientProvider>
  );
}

function RootDocument({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadContent />
      </head>
      <body className="antialiased font-sans bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden">
        {children}
        <Toaster position="top-right" expand={false} richColors />
        <Scripts />
      </body>
    </html>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
  head: () => ({
    meta: [
      { title: "WishFly | Premium Digital Wishes & Greetings" },
      {
        name: "description",
        content:
          "Create breathtaking digital wishes with WishFly. Premium templates, custom messages, and magical animations for every special occasion.",
      },
      { property: "og:title", content: "WishFly | Premium Digital Wishes" },
      { property: "og:description", content: "Create breathtaking digital wishes with WishFly." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap",
      },
    ],
  }),
});
