import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/account/")({
  component: () => <div>Account Overview Index Fixed</div>,
});
