import { useState } from "react";
import {
  Accessibility,
  CheckCircle2,
  Flag,
  Home,
  Lock,
  Plus,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";
import type { Member, Purok, Barangay, Household, CivilStatus } from "@/lib/types";
import { memberFullName } from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";

interface EditAndAssignModalProps {
  member: Member;
  leaderPurok: Purok;
  leaderBarangay?: Barangay;
  purokHouseholds: Household[];
  onSave: (updatedData: Partial<Member>) => Promise<void> | void;
  onCreateHousehold?: (data: Omit<Household, "id">) => Promise<Household | void>;
  onClose: () => void;
}

const COMMON_RELIGIONS = [
  "Roman Catholic",
  "Christian / Born Again",
  "Islam",
  "Iglesia ni Cristo",
  "Seventh-day Adventist",
  "Bible Baptist",
  "Jehovah's Witnesses",
  "Other",
];

export function EditAndAssignModal({
  member,
  leaderPurok,
  leaderBarangay,
  purokHouseholds,
  onSave,
  onCreateHousehold,
  onClose,
}: EditAndAssignModalProps) {
  // Determine if member is already HL or HM
  const initialRole: "HL" | "HM" = member.is_household_leader ? "HL" : "HM";

  // Check if member is already in a household in this purok
  const existingHouseholdInPurok = purokHouseholds.find(
    (h) => h.id === member.householdId,
  );

  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number>(
    existingHouseholdInPurok ? existingHouseholdInPurok.id : purokHouseholds[0]?.id ?? 0,
  );
  const [householdRole, setHouseholdRole] = useState<"HL" | "HM">(initialRole);

  // Demographics
  const [age, setAge] = useState<number | string>(member.age || "");
  const [religion, setReligion] = useState<string>(member.religion || "Roman Catholic");
  const [customReligion, setCustomReligion] = useState<string>(
    member.religion && !COMMON_RELIGIONS.includes(member.religion)
      ? member.religion
      : "",
  );
  const [status, setStatus] = useState<CivilStatus>(member.status || "Single");
  const [sc, setSc] = useState<boolean>(member.sc || false);
  const [pwd, setPwd] = useState<boolean>(member.pwd || false);
  const [ip, setIp] = useState<boolean>(member.ip || false);
  const [remarks, setRemarks] = useState<string>(member.remarks || "");

  // Inline Create Household state
  const [isCreatingHousehold, setIsCreatingHousehold] = useState(false);
  const [newHhLeader, setNewHhLeader] = useState(`${member.lastName} Family`);
  const [newHhAddress, setNewHhAddress] = useState(
    `${leaderPurok.name}, ${leaderBarangay?.name || "Barangay"}`,
  );
  const [savingHh, setSavingHh] = useState(false);

  const [saving, setSaving] = useState(false);

  const handleCreateHousehold = async () => {
    if (!onCreateHousehold || !newHhLeader.trim()) return;
    setSavingHh(true);
    try {
      const created = await onCreateHousehold({
        purokId: leaderPurok.id,
        barangayId: leaderPurok.barangayId,
        householdLeaderName: newHhLeader.trim(),
        address: newHhAddress.trim() || `${leaderPurok.name}, ${leaderBarangay?.name || ""}`,
      });
      if (created && created.id) {
        setSelectedHouseholdId(created.id);
        setIsCreatingHousehold(false);
      }
    } finally {
      setSavingHh(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const finalReligion =
        religion === "Other"
          ? customReligion.trim() || "Other"
          : religion;

      await onSave({
        householdId: selectedHouseholdId,
        barangayId: leaderPurok.barangayId,
        code: leaderPurok.name, // Updated code reflects assignment to this Purok
        is_household_leader: householdRole === "HL",
        is_household_member: householdRole === "HM",
        age: Number(age) || 0,
        religion: finalReligion,
        status,
        sc,
        pwd,
        ip,
        remarks: remarks.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Edit & Assign Member to Your Purok"
      onClose={onClose}
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Read-Only COMELEC Registry Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600">
              <Lock className="h-3.5 w-3.5 text-slate-400" />
              Official Voter Registry (Read-Only)
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
              Locked Identity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-slate-400">PRECINCT NUMBER</span>
              <p className="font-mono font-semibold text-slate-800">
                {member.pn || "—"}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">REGISTERED NAME</span>
              <p className="font-semibold text-slate-900">
                {memberFullName(member)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">FIRST NAME</span>
              <p className="text-slate-700 font-medium">{member.firstName || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">LAST NAME</span>
              <p className="text-slate-700 font-medium">{member.lastName || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">MIDDLE NAME</span>
              <p className="text-slate-700 font-medium">{member.middleName || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400">VOTER ADDRESS</span>
              <p className="text-slate-700 font-medium truncate">{member.address || "—"}</p>
            </div>
          </div>
        </div>

        {/* Section: Purok & Household Assignment */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Purok Assignment & Household Placement
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              {leaderPurok.name}
            </span>
          </div>

          <div className="space-y-3">
            {/* Household Dropdown & Add option */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                  Select Household in {leaderPurok.name}
                </label>
                {onCreateHousehold && !isCreatingHousehold && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingHousehold(true)}
                    className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline"
                  >
                    <Plus className="h-3 w-3" /> New Household
                  </button>
                )}
              </div>

              {!isCreatingHousehold ? (
                <div className="space-y-1">
                  <select
                    className={inputCls}
                    value={selectedHouseholdId}
                    onChange={(e) => setSelectedHouseholdId(Number(e.target.value))}
                    required
                  >
                    {purokHouseholds.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.householdLeaderName} ({h.address})
                      </option>
                    ))}
                    {purokHouseholds.length === 0 && (
                      <option value={0}>No household in this purok yet</option>
                    )}
                  </select>
                  {purokHouseholds.length === 0 && (
                    <p className="text-xs text-amber-600">
                      No households exist in your Purok yet. Please create one below.
                    </p>
                  )}
                </div>
              ) : (
                /* Inline Create Household Box */
                <div className="rounded-lg border border-emerald-300 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                    <span>Create Household in {leaderPurok.name}</span>
                    <button
                      type="button"
                      onClick={() => setIsCreatingHousehold(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      className={inputCls}
                      placeholder="Household Leader / Family Name"
                      value={newHhLeader}
                      onChange={(e) => setNewHhLeader(e.target.value)}
                    />
                    <input
                      className={inputCls}
                      placeholder="Address / Location"
                      value={newHhAddress}
                      onChange={(e) => setNewHhAddress(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCreateHousehold}
                    disabled={savingHh || !newHhLeader.trim()}
                    className="w-full rounded-md bg-emerald-600 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                  >
                    {savingHh ? "Saving Household…" : "Save & Select Household"}
                  </button>
                </div>
              )}
            </div>

            {/* Household Role Designation: HL vs HM */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-700">
                Designate Household Role
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all ${
                    householdRole === "HL"
                      ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="householdRole"
                    value="HL"
                    checked={householdRole === "HL"}
                    onChange={() => setHouseholdRole("HL")}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Household Leader (HL)
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Primary representative of the household
                    </span>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-all ${
                    householdRole === "HM"
                      ? "border-emerald-600 bg-emerald-50/70 shadow-sm"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="householdRole"
                    value="HM"
                    checked={householdRole === "HM"}
                    onChange={() => setHouseholdRole("HM")}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Household Member (HM)
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      Resident living within this household
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Editable Demographics */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
            Editable Demographics & Sector Data
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Age">
              <input
                type="number"
                min={0}
                max={130}
                className={inputCls}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 28"
              />
            </Field>

            <Field label="Civil Status">
              <select
                className={inputCls}
                value={status}
                onChange={(e) => setStatus(e.target.value as CivilStatus)}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </Field>

            <Field label="Religion">
              <select
                className={inputCls}
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
              >
                {COMMON_RELIGIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {religion === "Other" && (
            <Field label="Specify Religion">
              <input
                type="text"
                className={inputCls}
                value={customReligion}
                onChange={(e) => setCustomReligion(e.target.value)}
                placeholder="Enter religion / affiliation"
              />
            </Field>
          )}

          {/* Special Sectors */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Special Sectors
            </label>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sc}
                  onChange={(e) => setSc(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="flex items-center gap-1">
                  <Flag className="h-3.5 w-3.5 text-blue-600" />
                  Senior Citizen (SC)
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pwd}
                  onChange={(e) => setPwd(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                />
                <span className="flex items-center gap-1">
                  <Accessibility className="h-3.5 w-3.5 text-green-600" />
                  PWD
                </span>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ip}
                  onChange={(e) => setIp(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-orange-600" />
                  Indigenous Person (IP)
                </span>
              </label>
            </div>
          </div>

          {/* Remarks */}
          <Field label="Remarks">
            <textarea
              className={`${inputCls} min-h-[70px] resize-y`}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Notes, contact details, or specific Purok observations…"
            />
          </Field>
        </div>

        {/* Action Buttons */}
        <FormActions
          onClose={onClose}
          submitLabel={saving ? "Saving & Assigning…" : `Save & Assign to ${leaderPurok.name}`}
          submitColor="bg-emerald-600 hover:bg-emerald-700 font-semibold"
        />
      </form>
    </ModalShell>
  );
}
