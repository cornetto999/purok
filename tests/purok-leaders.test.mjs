import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./load-typescript.mjs";

const { getPurokLeaderRows } = loadTypeScript("src/lib/purok-leaders.ts");

test("shows named and account-linked leaders while hiding unassigned puroks", () => {
  const rows = getPurokLeaderRows({
    puroks: [
      { id: 1, name: "Unassigned Purok", purokLeaderName: "—" },
      { id: 2, name: "Purok 1", purokLeaderName: "  Ana Leader  " },
      { id: 3, name: "Purok 2", purokLeaderName: "—" },
      { id: 4, name: "Purok 3", purokLeaderName: " " },
      { id: 5, name: "Purok 4", purokLeaderName: "Unassigned" },
    ],
    users: [
      {
        id: 1,
        role: "Purok Leader",
        linked_entity_id: 3,
        displayName: "Ben Leader",
        username: "ben",
      },
      {
        id: 2,
        role: "Household Leader",
        linked_entity_id: 4,
        displayName: "Household Leader",
      },
      {
        id: 3,
        role: "Purok Leader",
        linked_entity_id: null,
        displayName: "Unlinked Account",
      },
    ],
    households: [],
    members: [],
  });
  assert.deepEqual(
    rows.map((row) => [row.purok.id, row.leaderName]),
    [
      [2, "Ana Leader"],
      [3, "Ben Leader"],
    ],
  );
  assert.equal(rows[1].leaderUser.username, "ben");
  assert.deepEqual(rows[0].members, []);
});

test("leader roster and count use current claims before legacy household assignments", () => {
  const rows = getPurokLeaderRows({
    puroks: [
      { id: 1, name: "Purok 1", purokLeaderName: "Ana" },
      { id: 2, name: "Purok 2", purokLeaderName: "Ben" },
    ],
    users: [],
    households: [
      { id: 10, purokId: 1 },
      { id: 20, purokId: 2 },
    ],
    members: [
      { id: 100, householdId: 10, purok_id: null },
      { id: 101, householdId: 10, purok_id: 2 },
      { id: 102, householdId: 999, purok_id: 2 },
      { id: 103, householdId: 20 },
      { id: 104, householdId: 999, purok_id: null },
    ],
  });
  assert.deepEqual(
    rows[0].members.map((m) => m.id),
    [100],
  );
  assert.deepEqual(
    rows[1].members.map((m) => m.id),
    [101, 102, 103],
  );
  assert.equal(rows[0].householdCount, 1);
  assert.equal(rows[1].householdCount, 1);
});

test("uses the linked account username when no display name is set", () => {
  const rows = getPurokLeaderRows({
    puroks: [{ id: 1, name: "Purok 1", purokLeaderName: "-" }],
    users: [
      {
        id: 1,
        role: "Purok Leader",
        linked_entity_id: 1,
        displayName: "",
        username: "leader1",
      },
    ],
    households: [],
    members: [],
  });
  assert.equal(rows[0].leaderName, "leader1");
});

test("cleared records produce an empty leader list", () => {
  assert.deepEqual(
    getPurokLeaderRows({ puroks: [], users: [], households: [], members: [] }),
    [],
  );
});
