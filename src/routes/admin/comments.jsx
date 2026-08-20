import { createFileRoute } from "@tanstack/react-router";
import ResourceManager from "@/components/admin/ResourceManager";
import { MessageSquare } from "lucide-react";
import { getAuthHeaders } from "@/lib/auth-client";
import { toast } from "sonner";

function CommentsPage() {
  return (
    <ResourceManager
      resource="comments"
      testIdPrefix="comment"
      title="Comments"
      subtitle="Moderate customer comments."
      readOnly={true} // For now, only moderation actions
      columns={[
        { key: "name", label: "Author", render: (i) => i.name || "Anonymous" },
        {
          key: "message",
          label: "Message",
          render: (i) => <span className="max-w-xs truncate">{i.message}</span>,
        },
        {
          key: "moderation_status",
          label: "Status",
          render: (i) => (
            <select
              value={i.moderation_status}
              onChange={async (e) => {
                // Capture before the first await. This is a controlled select, so React can
                // restore the old value while the auth token is being resolved.
                const moderationStatus = e.currentTarget.value;
                try {
                  const response = await fetch(`/api/admin/comments/${i.id}`, {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                      "Content-Type": "application/json",
                      ...(await getAuthHeaders()),
                    },
                    body: JSON.stringify({ moderation_status: moderationStatus }),
                  });
                  const data = await response.json();
                  if (!response.ok) throw new Error(data.error || "Moderation failed");
                  toast.success("Comment moderation updated");
                  window.location.reload();
                } catch (error) {
                  toast.error(error.message || "Moderation failed");
                }
              }}
              className="text-xs border rounded p-1"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          ),
        },
      ]}
    />
  );
}

export const Route = createFileRoute("/admin/comments")({
  component: CommentsPage,
});
