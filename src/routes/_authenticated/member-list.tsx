import { createFileRoute } from "@tanstack/react-router";
import { MembersPage } from "./members";

export const Route = createFileRoute("/_authenticated/member-list")({
  head: () => ({
    meta: [
      { title: "My Member List — Barangay RMS" },
      { name: "description", content: "Residents assigned to your purok." },
    ],
  }),
  component: MemberListPage,
});

function MemberListPage() {
  return <MembersPage memberListOnly />;
}
