import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./load-typescript.mjs";

const { buildPrecinctStats } = loadTypeScript("src/lib/precinct-stats.ts");
const { isClaimedHouseholdLeader } = loadTypeScript(
  "src/lib/claimed-households.ts",
);
const member = (id, fields = {}) => ({
  id,
  precinct: "0005A",
  pn: "",
  is_purok_leader_indicator: false,
  is_household_leader: false,
  is_household_member: false,
  ...fields,
});

test("precinct totals include residents without role flags", () => {
  const result = buildPrecinctStats([
    member(1),
    member(2, { is_household_member: true }),
  ]);
  assert.deepEqual(result.totals, {
    pl: 0,
    hl: 0,
    hm: 1,
    unassigned: 1,
    total: 2,
  });
  assert.equal(result.rows[0].total, 2);
});

test("counts every saved role flag while counting each resident once", () => {
  const row = member(1, {
    is_purok_leader_indicator: true,
    is_household_leader: true,
    is_household_member: true,
  });
  const result = buildPrecinctStats([row, row]);
  assert.deepEqual(result.totals, {
    pl: 1,
    hl: 1,
    hm: 1,
    unassigned: 0,
    total: 1,
  });
});

test("normalizes precinct labels, falls back to PN, and keeps blank records", () => {
  const result = buildPrecinctStats([
    member(1, { precinct: " 0005a " }),
    member(2, { precinct: "", pn: "0005A" }),
    member(3, { precinct: " " }),
    member(4, { precinct: "__proto__" }),
  ]);
  assert.equal(result.rows.find((row) => row.precinct === "0005A").total, 2);
  assert.equal(result.rows.at(-1).precinct, "No precinct");
  assert.equal(
    result.rows.reduce((sum, row) => sum + row.total, 0),
    result.totals.total,
  );
});

test("empty database produces an empty tally", () => {
  assert.equal(buildPrecinctStats([]).rows.length, 0);
  assert.equal(buildPrecinctStats([]).totals.total, 0);
});

test("only claimed HL residents assigned to the household's purok are listed", () => {
  const household = { id: 701, purokId: 126 };
  const claimed = member(1, {
    householdId: 701,
    purok_id: 126,
    is_household_leader: true,
  });
  assert.equal(isClaimedHouseholdLeader(claimed, household), true);
  assert.equal(
    isClaimedHouseholdLeader({ ...claimed, purok_id: null }, household),
    false,
  );
  assert.equal(
    isClaimedHouseholdLeader(
      { ...claimed, is_household_leader: false, is_household_member: true },
      household,
    ),
    false,
  );
  assert.equal(
    isClaimedHouseholdLeader({ ...claimed, purok_id: 127 }, household),
    false,
  );
  assert.equal(
    isClaimedHouseholdLeader({ ...claimed, householdId: 702 }, household),
    false,
  );
  assert.equal(
    isClaimedHouseholdLeader(
      { ...claimed, purok_id: "126", householdId: "701" },
      household,
    ),
    true,
  );
});
