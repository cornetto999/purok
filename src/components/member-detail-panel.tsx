import { Accessibility, Flag, MapPin, Pencil, Trash2, Users, X } from "lucide-react";
import type { Member, Household, Purok, Barangay } from "@/lib/types";
import { memberFullName } from "@/lib/types";

function sectorBadges(m: Member) {
  const badges: { label: string; fullLabel: string; icon: React.ReactNode; className: string }[] = [];
  if (m.sc)  badges.push({ label: "SC",  fullLabel: "Senior Citizen",    icon: <Flag className="h-3 w-3" />,          className: "bg-blue-100 text-blue-800 ring-blue-600/20" });
  if (m.pwd) badges.push({ label: "PWD", fullLabel: "PWD",               icon: <Accessibility className="h-3 w-3" />, className: "bg-green-100 text-green-800 ring-green-600/20" });
  if (m.ip)  badges.push({ label: "IP",  fullLabel: "Indigenous Person", icon: <Users className="h-3 w-3" />,         className: "bg-orange-100 text-orange-800 ring-orange-600/20" });
  return badges;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 px-3 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{value || "—"}</span>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</h3>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">{children}</div>
    </div>
  );
}

export function MemberDetailPanel({ member, householdById, purokById, barangayById, canManage, canDelete = true, onClose, onEdit, onFastEdit, onDelete }: {
  member: Member;
  householdById: Map<number, Household>;
  purokById: Map<number, Purok>;
  barangayById: Map<number, Barangay>;
  canManage: boolean;
  canDelete?: boolean;
  onClose: () => void;
  onEdit: () => void;
  onFastEdit?: () => void;
  onDelete: () => void;
}) {
  const household = householdById.get(member.householdId);
  const purok = household ? purokById.get(household.purokId) : undefined;
  const barangay = purok ? barangayById.get(purok.barangayId) : undefined;
  const fullName = memberFullName(member);

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">{fullName}</h2>
            <p className="text-sm text-slate-500">Precinct No. {member.pn || "—"}</p>
          </div>
          <div className="flex items-center gap-1">
            {canManage && (
              <>
                {onFastEdit && (
                  <button
                    onClick={onFastEdit}
                    className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                    title="Quick move to another Purok / Barangay"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Move Purok
                  </button>
                )}
                <button onClick={onEdit} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                {canDelete && (
                  <button onClick={onDelete} className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </>
            )}
            <button onClick={onClose} aria-label="Close" className="ml-1 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {/* Sector badges */}
          <div className="flex flex-wrap gap-2">
            {sectorBadges(member).length === 0 && (
              <span className="text-sm text-slate-400">No special sector tags</span>
            )}
            {sectorBadges(member).map((b) => (
              <span key={b.label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${b.className}`}>
                {b.icon} {b.fullLabel}
              </span>
            ))}
          </div>

          <DetailSection title="Personal Information">
            <DetailRow label="Last Name" value={member.lastName} />
            <DetailRow label="First Name" value={member.firstName} />
            <DetailRow label="Middle Name" value={member.middleName} />
            <DetailRow label="Age" value={String(member.age)} />
            <DetailRow label="Civil Status" value={member.status} />
            <DetailRow label="Religion" value={member.religion} />
          </DetailSection>

          <DetailSection title="Excel / Record Data">
            <DetailRow label="Precinct" value={member.precinct} />
            <DetailRow label="No." value={member.no} />
            <DetailRow label="PN" value={member.pn} />
            <DetailRow label="Code" value={member.code} />
            <DetailRow label="Address" value={member.address} />
          </DetailSection>

          <DetailSection title="Role Indicators">
            <DetailRow label="Purok Leader (PI)" value={member.is_purok_leader_indicator ? "Yes" : "No"} />
            <DetailRow label="Household Leader (HL)" value={member.is_household_leader ? "Yes" : "No"} />
            <DetailRow label="Household Member (HM)" value={member.is_household_member ? "Yes" : "No"} />
          </DetailSection>

          {household && (
            <DetailSection title="Household">
              <DetailRow label="Household Leader" value={household.householdLeaderName} />
              <DetailRow label="Address" value={household.address} />
            </DetailSection>
          )}

          {purok && (
            <DetailSection title="Purok">
              <DetailRow label="Purok" value={purok.name} />
              <DetailRow label="Purok Leader" value={purok.purokLeaderName} />
            </DetailSection>
          )}

          {barangay && (
            <DetailSection title="Barangay">
              <DetailRow label="Barangay" value={barangay.name} />
              <DetailRow label="Barangay Captain" value={barangay.barangayCaptainName} />
            </DetailSection>
          )}

          <DetailSection title="Remarks">
            <p className="px-3 py-3 text-sm text-slate-600">{member.remarks || "No remarks on record."}</p>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
