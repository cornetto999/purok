import { useState, useMemo } from "react";
import type { Member, Barangay, Purok, Household } from "@/lib/types";
import { memberFullName } from "@/lib/types";
import { ModalShell, Field, inputCls, FormActions } from "./modal-shell";
import { MapPin, ArrowRight } from "lucide-react";

export function FastEditPurokModal({
  member,
  barangaysData,
  puroksData,
  householdsData,
  onSave,
  onClose,
}: {
  member: Member;
  barangaysData: Barangay[];
  puroksData: Purok[];
  householdsData: Household[];
  onSave: (memberId: number, newHouseholdId: number, newAddress?: string) => void;
  onClose: () => void;
}) {
  // Current location
  const currentHousehold = useMemo(
    () => householdsData.find((h) => h.id === member.householdId),
    [member.householdId, householdsData],
  );
  const currentPurok = useMemo(
    () => puroksData.find((p) => p.id === currentHousehold?.purokId),
    [currentHousehold, puroksData],
  );
  const currentBarangay = useMemo(
    () => barangaysData.find((b) => b.id === currentPurok?.barangayId),
    [currentPurok, barangaysData],
  );

  // Form state
  const [selectedBarangayId, setSelectedBarangayId] = useState<number>(
    () => currentBarangay?.id ?? (barangaysData[0]?.id ?? 0),
  );

  const availablePuroks = useMemo(
    () => puroksData.filter((p) => p.barangayId === selectedBarangayId),
    [selectedBarangayId, puroksData],
  );

  const [selectedPurokId, setSelectedPurokId] = useState<number>(() => {
    if (currentPurok && currentPurok.barangayId === selectedBarangayId) {
      return currentPurok.id;
    }
    return availablePuroks[0]?.id ?? 0;
  });

  const availableHouseholds = useMemo(
    () => householdsData.filter((h) => h.purokId === selectedPurokId),
    [selectedPurokId, householdsData],
  );

  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number>(() => {
    return availableHouseholds[0]?.id ?? member.householdId;
  });

  const [updateAddress, setUpdateAddress] = useState<boolean>(true);

  // When barangay changes
  const handleBarangayChange = (bId: number) => {
    setSelectedBarangayId(bId);
    const puroks = puroksData.filter((p) => p.barangayId === bId);
    const firstP = puroks[0];
    if (firstP) {
      setSelectedPurokId(firstP.id);
      const hh = householdsData.filter((h) => h.purokId === firstP.id);
      if (hh[0]) {
        setSelectedHouseholdId(hh[0].id);
      }
    }
  };

  // When purok changes
  const handlePurokChange = (pId: number) => {
    setSelectedPurokId(pId);
    const hh = householdsData.filter((h) => h.purokId === pId);
    if (hh[0]) {
      setSelectedHouseholdId(hh[0].id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chosenPurok = puroksData.find((p) => p.id === selectedPurokId);
    const chosenBarangay = barangaysData.find((b) => b.id === selectedBarangayId);
    const newAddress =
      updateAddress && chosenPurok && chosenBarangay
        ? `${chosenPurok.name}, ${chosenBarangay.name}`
        : undefined;

    onSave(member.id, Number(selectedHouseholdId), newAddress);
  };

  return (
    <ModalShell title="Fast Edit — Barangay & Purok" onClose={onClose} width="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Resident Summary */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Resident</p>
          <p className="text-sm font-bold text-slate-800">{memberFullName(member)}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
            <span>Current:</span>
            <span className="font-medium text-slate-700">
              {currentPurok?.name ?? "—"}, {currentBarangay?.name ?? "—"}
            </span>
          </div>
        </div>

        {/* New Location Selectors */}
        <div className="space-y-3">
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
              {availablePuroks.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>

          {availableHouseholds.length > 1 && (
            <Field label="Household Leader / Unit">
              <select
                className={inputCls}
                value={selectedHouseholdId}
                onChange={(e) => setSelectedHouseholdId(Number(e.target.value))}
              >
                {availableHouseholds.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.householdLeaderName} {h.address ? `(${h.address})` : ""}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 pt-1">
            <input
              type="checkbox"
              checked={updateAddress}
              onChange={(e) => setUpdateAddress(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-indigo-600"
            />
            Auto-update address to selected Purok & Barangay
          </label>
        </div>

        <FormActions
          onClose={onClose}
          submitLabel="Save Changes"
          submitColor="bg-indigo-600 hover:bg-indigo-700"
        />
      </form>
    </ModalShell>
  );
}
