import { useState } from "react";
import type { Household, Purok, Barangay } from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";

// ── Household Modal ────────────────────────────────────────────────────────────

export function HouseholdModal({ initial, puroksData, onSave, onClose }: {
  initial?: Household;
  puroksData: Purok[];
  onSave: (data: Omit<Household, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    householdLeaderName: initial?.householdLeaderName ?? "",
    address: initial?.address ?? "",
    purokId: initial?.purokId ?? (puroksData[0]?.id ?? 0),
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.householdLeaderName.trim()) return;
    onSave({ ...form, purokId: Number(form.purokId) });
  };

  return (
    <ModalShell title={initial ? "Edit Household" : "Add Household"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Household Leader Name">
          <input className={inputCls} value={form.householdLeaderName} onChange={(e) => set("householdLeaderName", e.target.value)} placeholder="Last, First Middle" required />
        </Field>
        <Field label="Address">
          <input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="e.g. Blk 1 Lot 2, Street Name" />
        </Field>
        <Field label="Purok">
          <select className={inputCls} value={form.purokId} onChange={(e) => set("purokId", e.target.value)}>
            {puroksData.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <FormActions onClose={onClose} submitLabel={initial ? "Save Changes" : "Add Household"} submitColor="bg-indigo-600 hover:bg-indigo-700" />
      </form>
    </ModalShell>
  );
}

// ── Purok Modal ────────────────────────────────────────────────────────────────

export function PurokModal({ initial, barangaysData, onSave, onClose }: {
  initial?: Purok;
  barangaysData: Barangay[];
  onSave: (data: Omit<Purok, "id">) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    purokLeaderName: initial?.purokLeaderName ?? "",
    barangayId: initial?.barangayId ?? (barangaysData[0]?.id ?? 0),
  });

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.purokLeaderName.trim()) return;
    onSave({ ...form, barangayId: Number(form.barangayId) });
  };

  return (
    <ModalShell title={initial ? "Edit Purok" : "Add Purok"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Purok Name">
          <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Purok 6 - Mapayapa" required />
        </Field>
        <Field label="Purok Leader Name">
          <input className={inputCls} value={form.purokLeaderName} onChange={(e) => set("purokLeaderName", e.target.value)} placeholder="Last, First Middle" required />
        </Field>
        <Field label="Barangay">
          <select className={inputCls} value={form.barangayId} onChange={(e) => set("barangayId", e.target.value)}>
            {barangaysData.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </Field>
        <FormActions onClose={onClose} submitLabel={initial ? "Save Changes" : "Add Purok"} submitColor="bg-emerald-600 hover:bg-emerald-700" />
      </form>
    </ModalShell>
  );
}
