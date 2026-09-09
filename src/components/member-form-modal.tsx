import { useState } from "react";
import type { Member, Household, CivilStatus } from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";

type MemberFormData = Omit<Member, "id">;

function defaultForm(initial?: Member, defaultHouseholdId?: number, householdsData?: Household[]): MemberFormData {
  return {
    lastName: initial?.lastName ?? "",
    firstName: initial?.firstName ?? "",
    middleName: initial?.middleName ?? "",
    householdId: initial?.householdId ?? defaultHouseholdId ?? (householdsData?.[0]?.id ?? 0),
    precinct: initial?.precinct ?? "",
    no: initial?.no ?? "",
    pn: initial?.pn ?? "",
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

export function MemberFormModal({ initial, householdsData, onSave, onClose, defaultHouseholdId }: {
  initial?: Member;
  householdsData: Household[];
  onSave: (data: MemberFormData) => void;
  onClose: () => void;
  defaultHouseholdId?: number | undefined;
}) {
  const [form, setForm] = useState<MemberFormData>(() => defaultForm(initial, defaultHouseholdId, householdsData));

  const set = <K extends keyof MemberFormData>(k: K, v: MemberFormData[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lastName.trim() && !form.firstName.trim()) return;
    onSave({ ...form, householdId: Number(form.householdId), age: Number(form.age) });
  };

  return (
    <ModalShell title={initial ? "Edit Member" : "Add Member"} onClose={onClose} width="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name fields */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Last Name">
            <input className={inputCls} value={form.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="e.g. Reyes" required />
          </Field>
          <Field label="First Name">
            <input className={inputCls} value={form.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="e.g. Antonio" required />
          </Field>
          <Field label="Middle Name">
            <input className={inputCls} value={form.middleName} onChange={(e) => set("middleName", e.target.value)} placeholder="e.g. Cruz" />
          </Field>
        </div>

        {/* Household selector */}
        {!defaultHouseholdId && (
          <Field label="Household">
            <select className={inputCls} value={form.householdId} onChange={(e) => set("householdId", Number(e.target.value))}>
              {householdsData.map((h) => (
                <option key={h.id} value={h.id}>{h.householdLeaderName} — {h.address}</option>
              ))}
            </select>
          </Field>
        )}

        {/* Precinct / PN / Code row */}
        <div className="grid grid-cols-4 gap-3">
          <Field label="Precinct">
            <input className={inputCls} value={form.precinct} onChange={(e) => set("precinct", e.target.value)} placeholder="001A" />
          </Field>
          <Field label="No.">
            <input className={inputCls} value={form.no} onChange={(e) => set("no", e.target.value)} placeholder="1" />
          </Field>
          <Field label="PN (Precinct No.)">
            <input className={inputCls} value={form.pn} onChange={(e) => set("pn", e.target.value)} placeholder="0001-A" />
          </Field>
          <Field label="Code">
            <input className={inputCls} value={form.code} onChange={(e) => set("code", e.target.value)} />
          </Field>
        </div>

        {/* Demographics row */}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Age">
            <input type="number" min={0} max={150} className={inputCls} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />
          </Field>
          <Field label="Civil Status">
            <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as CivilStatus)}>
              {(["Single", "Married", "Widowed", "Separated"] as const).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Religion">
            <input className={inputCls} value={form.religion} onChange={(e) => set("religion", e.target.value)} placeholder="e.g. Roman Catholic" />
          </Field>
        </div>

        {/* Address */}
        <Field label="Address">
          <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. Blk 1 Lot 3, Malinaw St." />
        </Field>

        {/* Role indicators */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Role Indicators</p>
          <div className="flex flex-wrap gap-4">
            {([
              ["is_purok_leader_indicator", "Purok Leader (PI)"],
              ["is_household_leader", "Household Leader (HL)"],
              ["is_household_member", "Household Member (HM)"],
            ] as const).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Sector Tags</p>
          <div className="flex flex-wrap gap-4">
            {([
              ["sc", "Senior Citizen (SC)"],
              ["pwd", "Person with Disability (PWD)"],
              ["ip", "Indigenous Person (IP)"],
            ] as const).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer text-sm">
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
          <textarea className={inputCls} rows={2} value={form.remarks} onChange={(e) => set("remarks", e.target.value)} />
        </Field>

        <FormActions onClose={onClose} submitLabel={initial ? "Save Changes" : "Add Member"} />
      </form>
    </ModalShell>
  );
}
