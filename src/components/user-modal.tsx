import { useState } from "react";
import type { UserRole, Purok, Household } from "@/lib/types";
import { hashPassword } from "@/lib/auth";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";

export function UserModal({ puroksData, householdsData, onSave, onClose, restrictRole }: {
  puroksData: Purok[];
  householdsData: Household[];
  onSave: (data: { username: string; password_hash: string; role: UserRole; linked_entity_id: number | null; displayName: string }) => void;
  onClose: () => void;
  restrictRole?: UserRole; // If set, only allow this role
}) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    displayName: "",
    role: (restrictRole ?? "Household Leader") as UserRole,
    linkedEntityId: "",
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const entityOptions = form.role === "Purok Leader"
    ? puroksData.map((p) => ({ id: p.id, label: p.name }))
    : form.role === "Household Leader"
      ? householdsData.map((h) => ({ id: h.id, label: `${h.householdLeaderName} — ${h.address}` }))
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) return;
    setSaving(true);
    try {
      const hash = await hashPassword(form.password);
      onSave({
        username: form.username.trim(),
        password_hash: hash,
        role: form.role,
        linked_entity_id: form.role === "Admin" ? null : ((Number(form.linkedEntityId) || entityOptions[0]?.id) ?? null),
        displayName: form.displayName.trim() || form.username.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title="Create User Account" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Display Name">
          <input className={inputCls} value={form.displayName} onChange={(e) => set("displayName", e.target.value)} placeholder="e.g. Juan Dela Cruz" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Username">
            <input className={inputCls} value={form.username} onChange={(e) => set("username", e.target.value)} placeholder="e.g. juan.delacruz" required />
          </Field>
          <Field label="Password">
            <input type="password" className={inputCls} value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" required />
          </Field>
        </div>
        {!restrictRole && (
          <Field label="Role">
            <select className={inputCls} value={form.role} onChange={(e) => set("role", e.target.value)}>
              <option>Admin</option>
              <option>Purok Leader</option>
              <option>Household Leader</option>
            </select>
          </Field>
        )}
        {form.role !== "Admin" && entityOptions.length > 0 && (
          <Field label={form.role === "Purok Leader" ? "Assign to Purok" : "Assign to Household"}>
            <select className={inputCls} value={form.linkedEntityId || entityOptions[0]?.id} onChange={(e) => set("linkedEntityId", e.target.value)}>
              {entityOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </Field>
        )}
        <FormActions
          onClose={onClose}
          submitLabel={saving ? "Creating…" : "Create Account"}
          submitColor="bg-slate-900 hover:bg-slate-700"
        />
      </form>
    </ModalShell>
  );
}
