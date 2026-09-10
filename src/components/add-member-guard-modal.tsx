import { useState, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  ShieldAlert,
  UserCheck,
  UserPlus,
} from "lucide-react";
import type { Member, Purok, Household } from "@/lib/types";
import { memberFullName } from "@/lib/types";
import { ModalShell, Field, inputCls } from "./modal-shell";

interface AddMemberGuardModalProps {
  allMembers: Member[];
  puroks: Purok[];
  households: Household[];
  leaderPurok: Purok;
  initialQuery?: string;
  onSelectExisting: (member: Member) => void;
  onProceedNew: (initialData: { firstName: string; lastName: string; middleName: string }) => void;
  onClose: () => void;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function AddMemberGuardModal({
  allMembers,
  puroks,
  households,
  leaderPurok,
  initialQuery = "",
  onSelectExisting,
  onProceedNew,
  onClose,
}: AddMemberGuardModalProps) {
  // Parse initial query if provided (e.g. "Arlene Abales")
  const initialParts = initialQuery.trim().split(/\s+/);
  const defaultFirst = initialParts.length > 1 ? initialParts.slice(0, -1).join(" ") : "";
  const defaultLast = (initialParts.length > 1 ? initialParts[initialParts.length - 1] : initialParts[0]) || "";

  const [firstName, setFirstName] = useState<string>(defaultFirst);
  const [lastName, setLastName] = useState<string>(defaultLast);
  const [middleName, setMiddleName] = useState<string>("");
  const [hasChecked, setHasChecked] = useState(Boolean(defaultFirst && defaultLast));

  const purokById = useMemo(() => new Map(puroks.map((p) => [p.id, p])), [puroks]);
  const householdById = useMemo(() => new Map(households.map((h) => [h.id, h])), [households]);

  // Find matches based on First Name + Last Name
  const matches = useMemo(() => {
    const fNorm = normalize(firstName);
    const lNorm = normalize(lastName);

    if (!fNorm || !lNorm) return [];

    return allMembers.filter((m) => {
      const mfNorm = normalize(m.firstName);
      const mlNorm = normalize(m.lastName);

      // Exact first & last name match, or strong substring match
      const exactMatch = mfNorm === fNorm && mlNorm === lNorm;
      const looseMatch =
        (mfNorm.includes(fNorm) || fNorm.includes(mfNorm)) &&
        (mlNorm === lNorm || mlNorm.startsWith(lNorm));

      return exactMatch || looseMatch;
    });
  }, [allMembers, firstName, lastName]);

  const exactMatches = useMemo(() => {
    const fNorm = normalize(firstName);
    const lNorm = normalize(lastName);
    if (!fNorm || !lNorm) return [];
    return allMembers.filter((m) => normalize(m.firstName) === fNorm && normalize(m.lastName) === lNorm);
  }, [allMembers, firstName, lastName]);

  const isDuplicateDetected = exactMatches.length > 0 || (matches.length > 0 && firstName.length >= 2 && lastName.length >= 2);

  const getMemberStatus = (m: Member) => {
    const hh = householdById.get(m.householdId);
    const pk = hh ? purokById.get(hh.purokId) : undefined;
    const isUnassigned =
      !pk ||
      pk.name.toLowerCase().includes("unassigned") ||
      !m.code ||
      m.code.toLowerCase().includes("unassigned");

    if (isUnassigned) {
      return {
        label: "Unassigned",
        badge: "bg-slate-100 text-slate-700 ring-slate-300",
      };
    }
    if (pk?.id === leaderPurok.id) {
      return {
        label: "Assigned to Your Purok",
        badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
      };
    }
    return {
      label: `Assigned to ${pk?.name || "Other Purok"}`,
      badge: "bg-amber-50 text-amber-800 ring-amber-600/20",
    };
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setHasChecked(true);
  };

  return (
    <ModalShell
      title="Anti-Duplicate Verification Guard"
      onClose={onClose}
      width="max-w-lg"
    >
      <div className="space-y-4">
        {/* Info card */}
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
          <ShieldAlert className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Voter Registry Verification Required</p>
            <p className="text-indigo-700 mt-0.5">
              Before creating a new resident record, verify their first and last name against the barangay voter database to prevent accidental duplicates.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleVerify} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name *">
              <input
                className={inputCls}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setHasChecked(true);
                }}
                placeholder="e.g. Juan"
                required
                autoFocus
              />
            </Field>
            <Field label="Last Name *">
              <input
                className={inputCls}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setHasChecked(true);
                }}
                placeholder="e.g. Dela Cruz"
                required
              />
            </Field>
          </div>

          <Field label="Middle Name (Optional)">
            <input
              className={inputCls}
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="e.g. Santos"
            />
          </Field>
        </form>

        {/* Duplicate Alert or Green Status */}
        {hasChecked && firstName.trim() && lastName.trim() && (
          <div className="space-y-3 pt-1">
            {isDuplicateDetected ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-red-900 uppercase tracking-wide">
                      Existing Record Detected
                    </h4>
                    <p className="text-xs text-red-700 mt-1">
                      A member with this name already exists in the system. Please use the Search function to find and update their record instead of creating a duplicate.
                    </p>
                  </div>
                </div>

                {/* List of matching existing records */}
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-red-800">
                    Matching Record{matches.length > 1 ? "s" : ""} Found in Database:
                  </p>
                  {matches.slice(0, 3).map((match) => {
                    const status = getMemberStatus(match);
                    return (
                      <div
                        key={match.id}
                        className="flex items-center justify-between rounded-lg border border-red-200 bg-white p-3 shadow-xs"
                      >
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-900">
                            {memberFullName(match)}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>PN: {match.pn || "—"}</span>
                            <span>·</span>
                            <span className={`inline-flex items-center rounded-full px-2 py-0.2 text-[10px] font-semibold ring-1 ring-inset ${status.badge}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectExisting(match)}
                          className="flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
                        >
                          <UserCheck className="h-3.5 w-3.5" /> Edit & Assign
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      No Duplicate Found
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      No existing member matching <span className="font-semibold">{firstName} {lastName}</span> was found in the database. You may safely register this resident as a new member.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onProceedNew({
                      firstName: firstName.trim().toUpperCase(),
                      lastName: lastName.trim().toUpperCase(),
                      middleName: middleName.trim().toUpperCase(),
                    })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  <UserPlus className="h-4 w-4" /> Proceed to Register New Member
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
