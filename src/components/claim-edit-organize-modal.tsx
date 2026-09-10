import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Home,
  Lock,
  MapPin,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import type { Member, Purok, Barangay, Household, CivilStatus, Team } from "@/lib/types";
import { memberFullName } from "@/lib/types";
import { ModalShell, Field, inputCls } from "./modal-shell";
import { useStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";

interface ClaimEditOrganizeModalProps {
  member: Member;
  leaderPurok: Purok;
  leaderBarangay?: Barangay | undefined;
  purokHouseholds: Household[];
  teams: Team[];
  onSaveSuccess?: (updatedMember: Member, newHousehold?: Household) => void;
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

export function ClaimEditOrganizeModal({
  member,
  leaderPurok,
  leaderBarangay,
  purokHouseholds,
  teams,
  onSaveSuccess,
  onClose,
}: ClaimEditOrganizeModalProps) {
  const store = useStore();

  // ── Section A (Pre-filled Data - Read Only) ────────────────────────────────
  const firstName = member.firstName || "";
  const lastName = member.lastName || "";
  const middleName = member.middleName || "";
  const precinctNo = member.pn || member.precinct || "";

  // ── Section B (Update Details) ─────────────────────────────────────────────
  const [age, setAge] = useState<number | string>(member.age || "");
  const [status, setStatus] = useState<CivilStatus>(member.status || "Single");
  const [religion, setReligion] = useState(
    member.religion && COMMON_RELIGIONS.includes(member.religion)
      ? member.religion
      : member.religion
        ? "Other"
        : "Roman Catholic",
  );
  const [customReligion, setCustomReligion] = useState(
    member.religion && !COMMON_RELIGIONS.includes(member.religion)
      ? member.religion
      : "",
  );
  const [sc, setSc] = useState<boolean>(member.sc || false);
  const [pwd, setPwd] = useState<boolean>(member.pwd || false);
  const [ip, setIp] = useState<boolean>(member.ip || false);

  // ── Section C (Team & Hierarchy Assignment) ────────────────────────────────
  // Filter teams for leader's barangay, or fallback to all teams
  const availableTeams = useMemo(() => {
    const byBarangay = teams.filter(
      (t) => t.barangay_id === leaderPurok.barangayId,
    );
    return byBarangay.length > 0 ? byBarangay : teams;
  }, [teams, leaderPurok.barangayId]);

  const [teamId, setTeamId] = useState<number | null>(
    member.team_id !== undefined && member.team_id !== null
      ? member.team_id
      : member.teamId || null,
  );

  // Household Role: HL (Household Leader) vs HM (Household Member)
  const initialRole: "HL" | "HM" = member.is_household_leader
    ? "HL"
    : purokHouseholds.length === 0
      ? "HL"
      : "HM";
  const [role, setRole] = useState<"HL" | "HM">(initialRole);

  // If HL: text input to create a "New Household Address"
  const [householdAddress, setHouseholdAddress] = useState(
    member.address || `${leaderPurok.name}, ${leaderBarangay?.name || "Barangay"}`,
  );

  // If HM: searchable dropdown of existing Households in this PL's jurisdiction
  const existingHouseholdInPurok = purokHouseholds.find(
    (h) => h.id === member.householdId,
  );
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | null>(
    existingHouseholdInPurok
      ? existingHouseholdInPurok.id
      : purokHouseholds[0]?.id ?? null,
  );
  const [householdSearchQuery, setHouseholdSearchQuery] = useState("");

  const filteredExistingHouseholds = useMemo(() => {
    if (!householdSearchQuery.trim()) return purokHouseholds;
    const q = householdSearchQuery.toLowerCase().trim();
    return purokHouseholds.filter(
      (h) =>
        h.householdLeaderName.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q) ||
        String(h.id).includes(q),
    );
  }, [purokHouseholds, householdSearchQuery]);

  // Loading & error states
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ── Database Transaction Handler ───────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (role === "HL" && !householdAddress.trim()) {
      setErrorMessage("Please enter a Household Address for the new household.");
      return;
    }

    if (role === "HM" && !selectedHouseholdId) {
      setErrorMessage(
        purokHouseholds.length === 0
          ? "No households exist in this Purok yet. Please select Household Leader (HL) to register the first household."
          : "Please select an existing Household to link this member to.",
      );
      return;
    }

    setSaving(true);
    try {
      const finalReligion =
        religion === "Other" ? customReligion.trim() || "Other" : religion;

      let targetHouseholdId: number;
      let createdHousehold: Household | undefined;

      // 1. Household Creation / Selection
      if (role === "HL") {
        const fullLeaderName = memberFullName(member);

        const newHouseholdPayload = {
          purokId: leaderPurok.id,
          barangayId: leaderPurok.barangayId,
          householdLeaderName: fullLeaderName,
          address: householdAddress.trim(),
        };

        const { data: insertedHh, error: hhErr } = await supabase
          .from("households")
          .insert([newHouseholdPayload])
          .select()
          .single();

        if (hhErr || !insertedHh) {
          throw new Error(
            `Failed to create household record: ${hhErr?.message || "Unknown error"}`,
          );
        }

        createdHousehold = insertedHh as unknown as Household;
        targetHouseholdId = insertedHh.id;
      } else {
        targetHouseholdId = selectedHouseholdId!;
      }

      // 2. Member Update Payload
      const updatedMemberPayload: Record<string, unknown> = {
        householdId: targetHouseholdId,
        purok_id: leaderPurok.id,
        team_id: teamId ? Number(teamId) : null,
        teamId: teamId ? Number(teamId) : null,
        is_household_leader: role === "HL",
        is_household_member: role === "HM",
        code: leaderPurok.name,
        barangayId: leaderPurok.barangayId,
        age: Number(age) || 0,
        religion: finalReligion,
        status,
        sc,
        pwd,
        ip,
      };

      const { data: updatedMember, error: memErr } = await supabase
        .from("members")
        .update(updatedMemberPayload)
        .eq("id", member.id)
        .select()
        .single();

      if (memErr || !updatedMember) {
        throw new Error(
          `Failed to update member record: ${memErr?.message || "Unknown error"}`,
        );
      }

      // 3. Refresh Global Store State
      await store.refreshData();

      // 4. Callback
      if (onSaveSuccess) {
        onSaveSuccess(
          updatedMember as unknown as Member,
          createdHousehold,
        );
      }

      onClose();
    } catch (err: unknown) {
      console.error("Save & Claim failed:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save and claim member.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title="Claim Member & Assign to Purok"
      onClose={onClose}
      width="max-w-2xl"
    >
      <form onSubmit={handleSave} className="space-y-5">
        {/* Error Alert */}
        {errorMessage && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 shadow-2xs">
            {errorMessage}
          </div>
        )}

        {/* ── SECTION A: PRE-FILLED DATA (READ ONLY) ───────────────────────── */}
        <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-200/70 text-slate-700">
                <Lock className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Section A: Pre-filled Voter Information
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200">
              Read-Only
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {/* First Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                First Name
              </label>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-800 select-all cursor-not-allowed">
                <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{firstName || "—"}</span>
              </div>
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Last Name
              </label>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-800 select-all cursor-not-allowed">
                <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{lastName || "—"}</span>
              </div>
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Middle Name
              </label>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs font-semibold text-slate-800 select-all cursor-not-allowed">
                <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{middleName || "—"}</span>
              </div>
            </div>

            {/* Precinct */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Precinct
              </label>
              <div className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 px-3 py-2 text-xs font-bold text-indigo-900 font-mono select-all cursor-not-allowed">
                <Lock className="h-3 w-3 text-indigo-400 shrink-0" />
                <span className="truncate">{precinctNo || "—"}</span>
              </div>
            </div>

            {/* Voter / Serial No. */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                No.
              </label>
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-2 text-xs font-bold text-slate-800 font-mono select-all cursor-not-allowed">
                <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{member.no || "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION B: UPDATE DETAILS ────────────────────────────────────── */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <User className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Section B: Update Demographics & Details
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* Age */}
            <Field label="Age">
              <input
                type="number"
                min={0}
                max={130}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className={inputCls}
                placeholder="e.g. 28"
              />
            </Field>

            {/* Civil Status */}
            <Field label="Civil Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as CivilStatus)}
                className={inputCls}
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Widowed">Widowed</option>
                <option value="Separated">Separated</option>
              </select>
            </Field>

            {/* Religion */}
            <Field label="Religion">
              <select
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className={inputCls}
              >
                {COMMON_RELIGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {religion === "Other" && (
            <Field label="Specify Religion">
              <input
                type="text"
                value={customReligion}
                onChange={(e) => setCustomReligion(e.target.value)}
                className={inputCls}
                placeholder="Enter religion name..."
              />
            </Field>
          )}

          {/* Toggles for SC, PWD, IP */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Special Sector Toggles
            </label>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {/* SC Toggle */}
              <button
                type="button"
                onClick={() => setSc(!sc)}
                className={`flex items-center justify-between rounded-xl border p-2.5 transition-all text-left ${
                  sc
                    ? "border-blue-500 bg-blue-50/70 ring-1 ring-blue-500/30"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                      sc
                        ? "bg-blue-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    SC
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Senior Citizen
                  </span>
                </div>
                {/* Switch indicator */}
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    sc ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      sc ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>

              {/* PWD Toggle */}
              <button
                type="button"
                onClick={() => setPwd(!pwd)}
                className={`flex items-center justify-between rounded-xl border p-2.5 transition-all text-left ${
                  pwd
                    ? "border-emerald-500 bg-emerald-50/70 ring-1 ring-emerald-500/30"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                      pwd
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    PWD
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Person w/ Disability
                  </span>
                </div>
                {/* Switch indicator */}
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    pwd ? "bg-emerald-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      pwd ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>

              {/* IP Toggle */}
              <button
                type="button"
                onClick={() => setIp(!ip)}
                className={`flex items-center justify-between rounded-xl border p-2.5 transition-all text-left ${
                  ip
                    ? "border-amber-500 bg-amber-50/70 ring-1 ring-amber-500/30"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold ${
                      ip
                        ? "bg-amber-600 text-white"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    IP
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Indigenous Peoples
                  </span>
                </div>
                {/* Switch indicator */}
                <span
                  className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                    ip ? "bg-amber-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      ip ? "translate-x-4.5" : "translate-x-1"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ── SECTION C: TEAM & HIERARCHY ASSIGNMENT ───────────────────────── */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Users className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Section C: Team & Hierarchy Assignment
            </h3>
          </div>

          {/* 1. Assign to Team */}
          <Field label="Assign to Team">
            <select
              value={teamId !== null ? String(teamId) : ""}
              onChange={(e) => setTeamId(e.target.value ? Number(e.target.value) : null)}
              className={inputCls}
            >
              <option value="">No Team / Unassigned</option>
              {availableTeams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.team_name} {team.description ? `(${team.description})` : ""}
                </option>
              ))}
            </select>
          </Field>

          {/* 2. Household Role Selection (Radio Buttons for HL vs HM) */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Household Role
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {/* Option 1: Household Leader (HL) */}
              <label
                onClick={() => setRole("HL")}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all select-none ${
                  role === "HL"
                    ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="householdRole"
                  checked={role === "HL"}
                  onChange={() => setRole("HL")}
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" />
                    Household Leader (HL)
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Registers a new Household under {leaderPurok.name} with this person as the household head.
                  </p>
                </div>
              </label>

              {/* Option 2: Household Member (HM) */}
              <label
                onClick={() => setRole("HM")}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all select-none ${
                  role === "HM"
                    ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                }`}
              >
                <input
                  type="radio"
                  name="householdRole"
                  checked={role === "HM"}
                  onChange={() => setRole("HM")}
                  className="mt-0.5 h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <User className="h-3.5 w-3.5 text-indigo-600" />
                    Household Member (HM)
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Links this resident as a family member into an existing household within {leaderPurok.name}.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 3. Household Assignment (Conditional based on HL vs HM) */}
          {role === "HL" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                New Household Address
              </div>
              <Field label="Address Description">
                <input
                  type="text"
                  required
                  value={householdAddress}
                  onChange={(e) => setHouseholdAddress(e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Block 3, Lot 5, Sampaguita Street"
                />
              </Field>
              <p className="text-[11px] text-emerald-800">
                A new Household record will be created in {leaderPurok.name} and linked to this resident.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                  <Home className="h-3.5 w-3.5 text-indigo-600" />
                  Select Existing Household in {leaderPurok.name}
                </div>
                <span className="text-[11px] font-semibold text-indigo-700">
                  {purokHouseholds.length} available household{purokHouseholds.length === 1 ? "" : "s"}
                </span>
              </div>

              {purokHouseholds.length === 0 ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                  <p className="font-semibold">No households registered yet in {leaderPurok.name}.</p>
                  <p className="mt-0.5 text-[11px]">
                    To assign members, first select{" "}
                    <button
                      type="button"
                      onClick={() => setRole("HL")}
                      className="font-bold underline text-emerald-800"
                    >
                      Household Leader (HL)
                    </button>{" "}
                    to create a household.
                  </p>
                </div>
              ) : (
                <>
                  {purokHouseholds.length > 4 && (
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search existing households by head or address..."
                        value={householdSearchQuery}
                        onChange={(e) => setHouseholdSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <Field label="Choose Existing Household">
                    <select
                      value={selectedHouseholdId !== null ? String(selectedHouseholdId) : ""}
                      onChange={(e) =>
                        setSelectedHouseholdId(
                          e.target.value ? Number(e.target.value) : null,
                        )
                      }
                      className={inputCls}
                      required
                    >
                      <option value="">-- Choose Household Family --</option>
                      {filteredExistingHouseholds.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.householdLeaderName} — {h.address} (HH #{h.id})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <p className="text-[11px] text-indigo-800">
                    This member will be joined into the selected household as a Household Member (HM).
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── SUBMIT ACTION ────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving & Adding...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Save & Add to My Members
              </>
            )}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
