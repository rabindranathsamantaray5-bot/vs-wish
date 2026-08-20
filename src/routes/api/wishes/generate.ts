import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const inputSchema = z.object({
  name: z.string().trim().max(100).default("someone special"),
  occasion: z.string().trim().max(100).default("special occasion"),
  tone: z.string().trim().max(80).default("warm and heartfelt"),
  from: z.string().trim().max(100).default(""),
  details: z.string().trim().max(500).default(""),
});

export const Route = createFileRoute("/api/wishes/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const value = inputSchema.parse(await request.json());
          const recipient = value.name || "someone special";
          const detail = value.details ? ` ${value.details.trim()}` : "";
          const signature = value.from ? ` With love, ${value.from}.` : "";
          const message = `Dear ${recipient}, wishing you a wonderful ${value.occasion} filled with happiness, laughter, and beautiful memories.${detail}${signature}`;
          return Response.json({ message, generatedBy: "local" });
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Invalid request";
          return Response.json({ error: message }, { status: 400 });
        }
      },
    },
  },
});
