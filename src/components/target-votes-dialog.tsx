import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseVoteTarget, type TargetVotesConfig } from "@/lib/target-votes";
import type { Barangay } from "@/lib/types";

export function TargetVotesDialog({
  targets,
  barangays,
  focusTarget,
  onSave,
  onClose,
}: {
  targets: TargetVotesConfig;
  barangays: Barangay[];
  focusTarget: "overall" | number;
  onSave: (targets: TargetVotesConfig) => void;
  onClose: () => void;
}) {
  const [overall, setOverall] = useState(String(targets.overall || ""));
  const [drafts, setDrafts] = useState<Record<number, string>>(() =>
    Object.fromEntries(
      barangays.map((barangay) => [
        barangay.id,
        String(targets.barangays[barangay.id] || ""),
      ]),
    ),
  );
  const [error, setError] = useState("");
  const focusRef = useRef<HTMLInputElement>(null);
  const barangayTotal = barangays.reduce(
    (total, barangay) => total + (Number(drafts[barangay.id]) || 0),
    0,
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="flex max-h-[85vh] max-w-xl flex-col overflow-hidden"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          focusRef.current?.focus();
        }}
      >
        <DialogHeader>
          <DialogTitle>Set vote targets</DialogTitle>
          <DialogDescription>
            Set an overall goal and a goal for each barangay. Saved in this
            browser. Leave blank or enter 0 to clear a target.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            try {
              const next = {
                overall: parseVoteTarget(overall),
                barangays: { ...targets.barangays },
              };
              for (const barangay of barangays)
                next.barangays[barangay.id] = parseVoteTarget(
                  drafts[barangay.id] ?? "",
                );
              onSave(next);
              onClose();
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Could not save targets.",
              );
            }
          }}
        >
          <div className="min-h-0 space-y-5 overflow-y-auto px-1 pb-1">
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <Label htmlFor="overall-vote-target">Overall target votes</Label>
              <Input
                ref={focusTarget === "overall" ? focusRef : undefined}
                id="overall-vote-target"
                type="number"
                min="0"
                step="1"
                max={Number.MAX_SAFE_INTEGER}
                placeholder="e.g. 20000"
                value={overall}
                onChange={(event) => setOverall(event.target.value)}
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Barangay total: {barangayTotal.toLocaleString()}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOverall(String(barangayTotal))}
                >
                  Use barangay total
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Targets by barangay</h3>
              {barangays.map((barangay) => (
                <div
                  key={barangay.id}
                  className="grid grid-cols-[minmax(0,1fr)_8rem] items-center gap-4"
                >
                  <Label htmlFor={`barangay-target-${barangay.id}`}>
                    {barangay.name}
                  </Label>
                  <Input
                    ref={focusTarget === barangay.id ? focusRef : undefined}
                    id={`barangay-target-${barangay.id}`}
                    type="number"
                    min="0"
                    step="1"
                    max={Number.MAX_SAFE_INTEGER}
                    placeholder="Not set"
                    value={drafts[barangay.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((previous) => ({
                        ...previous,
                        [barangay.id]: event.target.value,
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save targets</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
