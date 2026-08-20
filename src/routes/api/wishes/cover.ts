import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { getPublicSettings } from "@/lib/public-settings.server";

const inputSchema = z.object({
  occasion: z.string().trim().max(100).default("A Special Wish"),
  recipient: z.string().trim().max(100).default("Someone Special"),
  theme: z.string().trim().max(40).default("celebration"),
});

const escapeXml = (value: string) =>
  value.replace(
    /[<>&'"]/g,
    (character) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[character] ?? character,
  );

export const Route = createFileRoute("/api/wishes/cover")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const value = inputSchema.parse(await request.json());
          const { site } = await getPublicSettings();
          const occasion = escapeXml(value.occasion || "A Special Wish");
          const recipient = escapeXml(value.recipient || "Someone Special");
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#6d4aff"/><stop offset=".55" stop-color="#c34fff"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="180" cy="160" r="130" fill="#fff" opacity=".1"/><circle cx="1050" cy="680" r="220" fill="#fff" opacity=".08"/><text x="600" y="330" fill="white" font-family="Georgia,serif" font-size="72" text-anchor="middle">${occasion}</text><text x="600" y="430" fill="white" opacity=".92" font-family="Arial,sans-serif" font-size="38" text-anchor="middle">For ${recipient}</text><text x="600" y="700" fill="white" opacity=".75" font-family="Arial,sans-serif" font-size="22" text-anchor="middle">Created with ${escapeXml(site.siteName)} · ${escapeXml(value.theme)}</text></svg>`;
          return Response.json({
            image: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Invalid request";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
