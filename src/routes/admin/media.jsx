import { createFileRoute } from "@tanstack/react-router";
import ResourceManager from "@/components/admin/ResourceManager";
import { Image as ImageIcon, Video, FileText, Hash, Link as LinkIcon, Info } from "lucide-react";

function MediaLibraryPage() {
  return (
    <ResourceManager
      resource="media"
      testIdPrefix="media"
      title="Media Library"
      subtitle="Central library of images, stickers, and short clips used in templates and wishes."
      defaults={{ type: "image", tags: "", title: "", url: "", attribution: "" }}
      fields={[
        {
          key: "file",
          label: "File Upload",
          type: "file",
          createOnly: true,
          placeholder: "Select a file to upload",
        },
        {
          key: "title",
          label: "Title (Optional)",
          type: "text",
          placeholder: "Purple confetti sticker",
        },
        {
          key: "url",
          label: "External Media URL (Optional if uploading)",
          type: "url",
          placeholder: "https://…",
        },
        {
          key: "type",
          label: "Type",
          type: "select",
          options: [
            { label: "Image", value: "image" },
            { label: "Video", value: "video" },
            { label: "GIF", value: "gif" },
            { label: "Sticker", value: "sticker" },
            { label: "Icon", value: "icon" },
          ],
        },
        {
          key: "tags",
          label: "Tags (comma-separated)",
          type: "text",
          placeholder: "birthday, confetti, purple",
        },
        { key: "attribution", label: "Attribution / Source", type: "text" },
      ]}
      columns={[
        {
          key: "url",
          label: "Preview",
          render: (i) =>
            i.url ? (
              <div className="relative group">
                <img
                  src={i.url}
                  alt=""
                  className="w-14 h-14 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors pointer-events-none" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <ImageIcon className="w-5 h-5" />
              </div>
            ),
        },
        {
          key: "title",
          label: "Title",
          render: (i) => (
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {i.title}
              </div>
              <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {i.url && i.url.startsWith("http") ? new URL(i.url).hostname : "Storage Asset"}
              </div>
            </div>
          ),
        },
        {
          key: "type",
          label: "Type",
          render: (i) => {
            const colors = {
              image: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
              video: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
              gif: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
              sticker:
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
              icon: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
            };
            const Icon =
              {
                image: ImageIcon,
                video: Video,
                gif: Video, // Or use a different one
                sticker: FileText,
                icon: Info,
              }[i.type] || ImageIcon;

            return (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${colors[i.type] || colors.image}`}
              >
                <Icon className="w-3 h-3" />
                {i.type}
              </span>
            );
          },
        },
        {
          key: "tags",
          label: "Tags",
          render: (i) => (
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {(i.tags || "")
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-0.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md"
                  >
                    <Hash className="w-2.5 h-2.5" /> {tag}
                  </span>
                ))}
            </div>
          ),
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/admin/media")({
  head: () => ({
    meta: [
      { title: "Media Library — WishFly Admin Console" },
      {
        name: "description",
        content:
          "Central library of images, stickers, and short clips used in templates and wishes.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Media Library — WishFly Admin Console" },
      { property: "og:description", content: "Manage WishFly media assets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MediaLibraryPage,
});
