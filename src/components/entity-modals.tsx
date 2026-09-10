import { useState } from "react";
import type { Household, Purok, Barangay, User } from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";
import { Key, Eye, EyeOff, UserCheck } from "lucide-react";

function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".");
}

// ── Household Modal ────────────────────────────────────────────────────────────

export function HouseholdModal({
  initial,
  puroksData,
  barangaysData = [],
  usersData = [],
  onSave,
  onClose,
}: {
  initial?: Household;
  puroksData: Purok[];
  barangaysData?: Barangay[];
  usersData?: User[];
  onSave: (
    data: Omit<Household, "id">,
    userAccount?: { username: string; password?: string },
  ) => void;
  onClose: () => void;
}) {
  const initialPurok = puroksData.find((p) => p.id === initial?.purokId);
  const initialBarangay =
    barangaysData.find((b) => b.id === initialPurok?.barangayId) ??
    barangaysData[0];

  const existingUser = initial
    ? usersData.find(
        (u) =>
          u.role === "Household Leader" && u.linked_entity_id === initial.id,
      )
    : undefined;

  const [selectedBarangayId, setSelectedBarangayId] = useState<number>(
    () => initialBarangay?.id ?? (puroksData[0]?.barangayId ?? 0),
  );

  const [form, setForm] = useState({
    householdLeaderName: initial?.householdLeaderName ?? "",
    address: initial?.address ?? "",
    purokId: initial?.purokId ?? (puroksData[0]?.id ?? 0),
  });

  const [username, setUsername] = useState(existingUser?.username ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameManual, setIsUsernameManual] = useState(
    Boolean(existingUser?.username),
  );

  const availablePuroks = selectedBarangayId
    ? puroksData.filter((p) => p.barangayId === selectedBarangayId)
    : puroksData;

  const handleBarangayChange = (bId: number) => {
    setSelectedBarangayId(bId);
    const filtered = puroksData.filter((p) => p.barangayId === bId);
    const firstPurok = filtered[0];
    if (firstPurok) {
      setForm((f) => ({ ...f, purokId: firstPurok.id }));
    }
  };

  const handleLeaderNameChange = (val: string) => {
    setForm((f) => ({ ...f, householdLeaderName: val }));
    if (!isUsernameManual && !existingUser) {
      setUsername(suggestUsername(val));
    }
  };

  const handleQuickAddress = () => {
    const curP = puroksData.find((p) => p.id === Number(form.purokId));
    const curB = barangaysData.find((b) => b.id === selectedBarangayId);
    if (curP && curB) {
      setForm((f) => ({ ...f, address: `${curP.name}, ${curB.name}` }));
    }
  };

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.householdLeaderName.trim()) return;

    const userAccount = username.trim()
      ? {
          username: username.trim(),
          ...(password.trim() ? { password: password.trim() } : {}),
        }
      : undefined;

    onSave({ ...form, purokId: Number(form.purokId) }, userAccount);
  };

  return (
    <ModalShell
      title={initial ? "Edit Household" : "Add Household"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Household Leader Name">
          <input
            className={inputCls}
            value={form.householdLeaderName}
            onChange={(e) => handleLeaderNameChange(e.target.value)}
            placeholder="Last, First Middle"
            required
          />
        </Field>

        {/* Barangay and Purok Selectors */}
        <div className="grid grid-cols-2 gap-3">
          {barangaysData.length > 0 && (
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
          )}

          <Field label="Purok">
            <select
              className={inputCls}
              value={form.purokId}
              onChange={(e) => set("purokId", Number(e.target.value))}
            >
              {availablePuroks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Address">
          <div className="space-y-1">
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="e.g. Blk 1 Lot 2, Street Name"
            />
            <button
              type="button"
              onClick={handleQuickAddress}
              className="cursor-pointer text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
            >
              Fill Purok & Barangay into address
            </button>
          </div>
        </Field>

        {/* Leader Login Credentials */}
        <div className="space-y-3 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-950">
              <Key className="h-3.5 w-3.5 text-indigo-600" />
              <span>Leader Login Credentials</span>
            </div>
            {existingUser && (
              <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800">
                <UserCheck className="h-3 w-3" /> Account Linked
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Username">
              <input
                className={inputCls}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsUsernameManual(true);
                }}
                placeholder="e.g. maria.santos"
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputCls} pr-8`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    existingUser
                      ? "Leave blank to keep current"
                      : "Default: household123"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
          </div>
          <p className="text-[11px] text-slate-500">
            {existingUser
              ? "Update username or enter a new password to reset their login."
              : "Allows this household leader to sign in. Password defaults to 'household123' if omitted."}
          </p>
        </div>

        <FormActions
          onClose={onClose}
          submitLabel={initial ? "Save Changes" : "Add Household"}
          submitColor="bg-indigo-600 hover:bg-indigo-700"
        />
      </form>
    </ModalShell>
  );
}

// ── Purok Modal ────────────────────────────────────────────────────────────────

export function PurokModal({
  initial,
  barangaysData,
  usersData = [],
  onSave,
  onClose,
}: {
  initial?: Purok;
  barangaysData: Barangay[];
  usersData?: User[];
  onSave: (
    data: Omit<Purok, "id">,
    userAccount?: { username: string; password?: string },
  ) => void;
  onClose: () => void;
}) {
  const existingUser = initial
    ? usersData.find(
        (u) => u.role === "Purok Leader" && u.linked_entity_id === initial.id,
      )
    : undefined;

  const [form, setForm] = useState({
    name: initial?.name ?? "",
    purokLeaderName: initial?.purokLeaderName ?? "",
    barangayId: initial?.barangayId ?? (barangaysData[0]?.id ?? 0),
  });

  const [username, setUsername] = useState(existingUser?.username ?? "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isUsernameManual, setIsUsernameManual] = useState(
    Boolean(existingUser?.username),
  );

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleLeaderNameChange = (val: string) => {
    set("purokLeaderName", val);
    if (!isUsernameManual && !existingUser) {
      setUsername(suggestUsername(val));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.purokLeaderName.trim()) return;

    const userAccount = username.trim()
      ? {
          username: username.trim(),
          ...(password.trim() ? { password: password.trim() } : {}),
        }
      : undefined;

    onSave({ ...form, barangayId: Number(form.barangayId) }, userAccount);
  };

  return (
    <ModalShell title={initial ? "Edit Purok" : "Add Purok"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Purok Name">
          <input
            className={inputCls}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Purok 6 - Mapayapa"
            required
          />
        </Field>
        <Field label="Purok Leader Name">
          <input
            className={inputCls}
            value={form.purokLeaderName}
            onChange={(e) => handleLeaderNameChange(e.target.value)}
            placeholder="Last, First Middle"
            required
          />
        </Field>
        <Field label="Barangay">
          <select
            className={inputCls}
            value={form.barangayId}
            onChange={(e) => set("barangayId", e.target.value)}
          >
            {barangaysData.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>

        {/* Leader Login Credentials */}
        <div className="space-y-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-950">
              <Key className="h-3.5 w-3.5 text-emerald-600" />
              <span>Leader Login Credentials</span>
            </div>
            {existingUser && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800">
                <UserCheck className="h-3 w-3" /> Account Linked
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Username">
              <input
                className={inputCls}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setIsUsernameManual(true);
                }}
                placeholder="e.g. juan.delacruz"
              />
            </Field>

            <Field label="Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`${inputCls} pr-8`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    existingUser
                      ? "Leave blank to keep current"
                      : "Default: purok123"
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
          </div>
          <p className="text-[11px] text-slate-500">
            {existingUser
              ? "Update username or enter a new password to reset their login."
              : "Allows this purok leader to sign in to their portal. Password defaults to 'purok123' if omitted."}
          </p>
        </div>

        <FormActions
          onClose={onClose}
          submitLabel={initial ? "Save Changes" : "Add Purok"}
          submitColor="bg-emerald-600 hover:bg-emerald-700"
        />
      </form>
    </ModalShell>
  );
}
