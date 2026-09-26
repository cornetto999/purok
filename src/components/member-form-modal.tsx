import { useState, useMemo, useRef } from "react";
import type {
  Member,
  Household,
  Purok,
  Barangay,
  CivilStatus,
} from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";
import { MapPin } from "lucide-react";

type MemberFormData = Omit<Member, "id">;

function defaultForm(
  initial?: Member,
  defaultHouseholdId?: number,
  householdsData?: Household[],
): MemberFormData {
  return {
    lastName: initial?.lastName ?? "",
    firstName: initial?.firstName ?? "",
    middleName: initial?.middleName ?? "",
    householdId:
      initial?.householdId ??
      defaultHouseholdId ??
      householdsData?.[0]?.id ??
      0,
    precinct: initial?.precinct || initial?.pn || "",
    no: initial?.no ?? "",
    pn: initial?.precinct || initial?.pn || "",
    address: initial?.address ?? "",
    code: initial?.code ?? "",
    is_purok_leader_indicator: initial?.is_purok_leader_indicator ?? false,
    is_household_leader: initial?.is_household_leader ?? false,
    is_household_member: initial?.is_household_member ?? true,
    age: initial?.age ?? 30,
    religion: initial?.religion ?? "",
    status: initial?.status ?? "Single",
    sc: initial?.sc ?? false,
    pwd: initial?.pwd ?? false,
    ip: initial?.ip ?? false,
    remarks: initial?.remarks ?? "",
  };
}

export function MemberFormModal({
  initial,
  householdsData,
  barangaysData = [],
  puroksData = [],
  onSave,
  onClose,
  defaultHouseholdId,
}: {
  initial?: Member | undefined;
  householdsData: Household[];
  barangaysData?: Barangay[];
  puroksData?: Purok[];
  onSave: (data: MemberFormData) => void | Promise<void>;
  onClose: () => void;
  defaultHouseholdId?: number | undefined;
}) {
  const [form, setForm] = useState<MemberFormData>(() =>
    defaultForm(initial, defaultHouseholdId, householdsData),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const savingRef = useRef(false);
  const [locationChanged, setLocationChanged] = useState(false);

  // Derive initial barangay and purok from initial member / defaultHouseholdId
  const initialHousehold = useMemo(() => {
    const targetId = form.householdId || defaultHouseholdId;
    return householdsData.find((h) => h.id === targetId);
  }, [form.householdId, defaultHouseholdId, householdsData]);

  const initialPurok = useMemo(() => {
    const claimed = puroksData.find((p) => p.id === initial?.purok_id);
    if (claimed) return claimed;
    if (!initialHousehold) return puroksData[0];
    return (
      puroksData.find((p) => p.id === initialHousehold.purokId) ?? puroksData[0]
    );
  }, [initial?.purok_id, initialHousehold, puroksData]);

  const initialBarangay = useMemo(() => {
    if (!initialPurok) return barangaysData[0];
    return (
      barangaysData.find((b) => b.id === initialPurok.barangayId) ??
      barangaysData[0]
    );
  }, [initialPurok, barangaysData]);

  const [selectedBarangayId, setSelectedBarangayId] = useState<number>(
    () => initialBarangay?.id ?? 0,
  );
  const [selectedPurokId, setSelectedPurokId] = useState<number>(
    () => initialPurok?.id ?? 0,
  );

  // Filtered puroks for selected barangay
  const availablePuroks = useMemo(() => {
    if (!selectedBarangayId) return puroksData;
    return puroksData.filter((p) => p.barangayId === selectedBarangayId);
  }, [selectedBarangayId, puroksData]);

  // Filtered households for selected purok
  const availableHouseholds = useMemo(() => {
    if (!selectedPurokId) return locationChanged ? [] : householdsData;
    const matched = householdsData.filter((h) => h.purokId === selectedPurokId);
    // Keep a legacy household visible until the user explicitly moves the member.
    const current = householdsData.find((h) => h.id === form.householdId);
    return !locationChanged && current && !matched.includes(current)
      ? [current, ...matched]
      : matched;
  }, [selectedPurokId, householdsData, form.householdId, locationChanged]);

  // When barangay changes, update selected purok & household
  const handleBarangayChange = (bId: number) => {
    setLocationChanged(true);
    setSelectedBarangayId(bId);
    const puroksForB = puroksData.filter((p) => p.barangayId === bId);
    const firstPurok = puroksForB[0];
    setSelectedPurokId(firstPurok?.id ?? 0);
    set(
      "householdId",
      householdsData.find((h) => h.purokId === firstPurok?.id)?.id ?? 0,
    );
  };

  // When purok changes, update selected household
  const handlePurokChange = (pId: number) => {
    setLocationChanged(true);
    setSelectedPurokId(pId);
    const hhForP = householdsData.filter((h) => h.purokId === pId);
    set("householdId", hhForP[0]?.id ?? 0);
  };

  const handleQuickAddress = () => {
    const curPurok = puroksData.find((p) => p.id === selectedPurokId);
    const curBarangay = barangaysData.find((b) => b.id === selectedBarangayId);
    if (curPurok && curBarangay) {
      set("address", `${curPurok.name}, ${curBarangay.name}`);
    }
  };

  const set = <K extends keyof MemberFormData>(k: K, v: MemberFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const close = () => {
    if (!savingRef.current) onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingRef.current) return;
    if (!form.lastName.trim() && !form.firstName.trim()) return;
    if (!form.householdId) {
      setSaveError(
        "Select a household before saving. Create a household in this purok if none are available.",
      );
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        ...form,
        householdId: Number(form.householdId),
        age: Number(form.age),
        ...(locationChanged
          ? {
              purok_id: selectedPurokId,
              barangayId: selectedBarangayId,
              code:
                puroksData.find((p) => p.id === selectedPurokId)?.name ??
                form.code,
            }
          : {}),
      });
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : "Could not save member. Please try again.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <ModalShell
      title={initial ? "Edit Member" : "Add Member"}
      onClose={close}
      width="max-w-xl"
    >
      <form onSubmit={handleSubmit} aria-busy={saving}>
        <fieldset disabled={saving} className="space-y-4">
          {/* Name fields */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Last Name">
              <input
                className={inputCls}
                value={form.lastName}
                onChange={(e) => set("lastName", e.target.value)}
                placeholder="e.g. Reyes"
                required
              />
            </Field>
            <Field label="First Name">
              <input
                className={inputCls}
                value={form.firstName}
                onChange={(e) => set("firstName", e.target.value)}
                placeholder="e.g. Antonio"
                required
              />
            </Field>
            <Field label="Middle Name">
              <input
                className={inputCls}
                value={form.middleName}
                onChange={(e) => set("middleName", e.target.value)}
                placeholder="e.g. Cruz"
              />
            </Field>
          </div>

          {/* Location / Barangay & Purok Dropdowns */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                Barangay & Purok Selection
              </div>
              <button
                type="button"
                onClick={handleQuickAddress}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
              >
                Fill into Address
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Barangay">
                <select
                  className={inputCls}
                  value={selectedBarangayId}
                  onChange={(e) => handleBarangayChange(Number(e.target.value))}
                >
                  {barangaysData.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Purok / Zone / Sitio">
                <select
                  className={inputCls}
                  value={selectedPurokId}
                  onChange={(e) => handlePurokChange(Number(e.target.value))}
                >
                  <option value={0} disabled>
                    Select a purok
                  </option>
                  {availablePuroks.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Household selector */}
            {!defaultHouseholdId && (
              <Field label="Household Leader / Unit">
                <select
                  className={inputCls}
                  value={form.householdId}
                  onChange={(e) => set("householdId", Number(e.target.value))}
                >
                  <option value={0} disabled>
                    Select a household
                  </option>
                  {availableHouseholds.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.householdLeaderName}{" "}
                      {h.address ? `— ${h.address}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          {/* Address */}
          <Field label="Specific Address / Landmark">
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="e.g. Purok 1, Burnay (or Blk 1 Lot 3)"
            />
          </Field>

          {/* Precinct / PN / Code row */}
          <div className="grid grid-cols-4 gap-3">
            <Field label="Precinct">
              <input
                className={inputCls}
                value={form.precinct}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    precinct: e.target.value,
                    pn: e.target.value,
                  }))
                }
                placeholder="001A"
              />
            </Field>
            <Field label="No.">
              <input
                className={inputCls}
                value={form.no}
                onChange={(e) => set("no", e.target.value)}
                placeholder="1"
              />
            </Field>
            <Field label="PN (Precinct No.)">
              <input
                className={inputCls}
                value={form.pn}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    precinct: e.target.value,
                    pn: e.target.value,
                  }))
                }
                placeholder="0001-A"
              />
            </Field>
            <Field label="Code">
              <input
                className={inputCls}
                value={form.code}
                onChange={(e) => set("code", e.target.value)}
              />
            </Field>
          </div>

          {/* Demographics row */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Age">
              <input
                type="number"
                min={0}
                max={150}
                className={inputCls}
                value={form.age}
                onChange={(e) => set("age", Number(e.target.value))}
              />
            </Field>
            <Field label="Civil Status">
              <select
                className={inputCls}
                value={form.status}
                onChange={(e) => set("status", e.target.value as CivilStatus)}
              >
                {(["Single", "Married", "Widowed", "Separated"] as const).map(
                  (s) => (
                    <option key={s}>{s}</option>
                  ),
                )}
              </select>
            </Field>
            <Field label="Religion">
              <input
                className={inputCls}
                value={form.religion}
                onChange={(e) => set("religion", e.target.value)}
                placeholder="e.g. Roman Catholic"
              />
            </Field>
          </div>

          {/* Role indicators */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Role Indicators
            </p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["is_purok_leader_indicator", "Purok Leader (PI)"],
                  ["is_household_leader", "Household Leader (HL)"],
                  ["is_household_member", "Household Member (HM)"],
                ] as const
              ).map(([key, lbl]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          {/* Sector flags */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Sector Tags
            </p>
            <div className="flex flex-wrap gap-4">
              {(
                [
                  ["sc", "Senior Citizen (SC)"],
                  ["pwd", "Person with Disability (PWD)"],
                  ["ip", "Indigenous Person (IP)"],
                ] as const
              ).map(([key, lbl]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) => set(key, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-slate-900"
                  />
                  {lbl}
                </label>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <Field label="Remarks">
            <textarea
              className={inputCls}
              rows={2}
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
            />
          </Field>

          {saveError && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {saveError}
            </p>
          )}
          <FormActions
            onClose={close}
            submitLabel={
              saving ? "Saving…" : initial ? "Save Changes" : "Add Member"
            }
          />
        </fieldset>
      </form>
    </ModalShell>
  );
}
