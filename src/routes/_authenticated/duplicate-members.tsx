import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, CopyX, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import type { Member } from "@/lib/types";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/duplicate-members")({
  head: () => ({
    meta: [
      { title: "Duplicate Member Review — Barangay RMS" },
      {
        name: "description",
        content: "Review possible duplicate members before approval.",
      },
    ],
  }),
  component: DuplicateMembersPage,
});

function DuplicateMembersPage() {
  const {
    state,
    approveDuplicate,
    dismissDuplicate,
    approveAllDuplicates,
    dismissAllDuplicates,
  } = useStore();
  const navigate = useNavigate();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState<"approve" | "dismiss" | null>(
    null,
  );

  useEffect(() => {
    if (state.session?.role !== "Admin") void navigate({ to: "/my-dashboard" });
  }, [navigate, state.session]);

  const existingMembers = new Map(
    state.members.map((member) => [member.id, member]),
  );

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      await approveDuplicate(id);
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveAll = async () => {
    if (
      !confirm(
        `Approve and add all ${state.pendingDuplicates.length} duplicate members?`,
      )
    )
      return;
    setBulkAction("approve");
    try {
      await approveAllDuplicates();
    } finally {
      setBulkAction(null);
    }
  };

  const handleDismissAll = () => {
    if (
      !confirm(
        `Dismiss all ${state.pendingDuplicates.length} duplicate members?`,
      )
    )
      return;
    setBulkAction("dismiss");
    dismissAllDuplicates();
    setBulkAction(null);
  };

  return (
    <>
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold">Duplicate Member Review</h1>
        <p className="text-sm text-slate-500">
          Approve only members who should be added as a separate resident
          record.
        </p>
      </header>
      <div className="space-y-4 p-6">
        {state.pendingDuplicates.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm font-medium text-amber-900">
              {state.pendingDuplicates.length.toLocaleString()} duplicate
              {state.pendingDuplicates.length === 1 ? "" : "s"} awaiting review
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => void handleApproveAll()}
                disabled={bulkAction !== null}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                <Check className="h-3.5 w-3.5" />{" "}
                {bulkAction === "approve" ? "Approving all..." : "Approve All"}
              </button>
              <button
                onClick={handleDismissAll}
                disabled={bulkAction !== null}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                <CopyX className="h-3.5 w-3.5" />{" "}
                {bulkAction === "dismiss" ? "Dismissing..." : "Dismiss All"}
              </button>
            </div>
          </div>
        )}
        {state.pendingDuplicates.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <UserRound className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              No duplicate members to review
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Possible duplicates from future imports will appear here.
            </p>
          </div>
        ) : (
          state.pendingDuplicates.map((duplicate) => {
            const existing = existingMembers.get(duplicate.existingMemberId);
            return (
              <article
                key={duplicate.id}
                className="rounded-xl border border-amber-200 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <MemberSummary title="Existing member" member={existing} />
                  <MemberSummary
                    title="Imported member"
                    member={duplicate.importedMember}
                  />
                </div>
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                  <button
                    onClick={() => void handleApprove(duplicate.id)}
                    disabled={approvingId === duplicate.id}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />{" "}
                    {approvingId === duplicate.id
                      ? "Approving..."
                      : "Approve and Add"}
                  </button>
                  <button
                    onClick={() => dismissDuplicate(duplicate.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <CopyX className="h-4 w-4" /> Dismiss
                  </button>
                </div>
              </article>
            );
          })
        )}
      </div>
    </>
  );
}

type DuplicateMemberDetails = Pick<
  Member,
  "lastName" | "firstName" | "middleName" | "pn" | "no" | "address"
>;

function MemberSummary({
  title,
  member,
}: {
  title: string;
  member: DuplicateMemberDetails | undefined;
}) {
  const name = member
    ? [member.lastName, member.firstName, member.middleName]
        .filter(Boolean)
        .join(", ")
    : "";
  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {member ? (
        <>
          <p className="mt-1 font-semibold text-slate-800">{name || "—"}</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-slate-400">Precinct / PN</dt>
              <dd className="font-medium text-slate-700">{member.pn || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Number</dt>
              <dd className="font-medium text-slate-700">{member.no || "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-slate-400">Address</dt>
              <dd className="font-medium text-slate-700">
                {member.address || "—"}
              </dd>
            </div>
          </dl>
        </>
      ) : (
        <p className="mt-1 text-sm text-slate-500">
          Duplicate found in this import file.
        </p>
      )}
    </section>
  );
}
