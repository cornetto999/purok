import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/member-assignment.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext },
});
const { memberPurokId } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const households = new Map([[701, { id: 701, purokId: 126 }]]);

test("claimed member remains visible before their household is loaded", () => {
  assert.equal(memberPurokId({ purok_id: 126, householdId: 999 }, households), 126);
});

test("legacy household assignment still appears in the leader roster", () => {
  assert.equal(memberPurokId({ purok_id: null, householdId: 701 }, households), 126);
});

test("a new claim takes precedence over a previous household's purok", () => {
  const member = { purok_id: 128, householdId: 701 };
  assert.equal(memberPurokId(member, households), 128);
  assert.notEqual(memberPurokId(member, households), 126);
});

test("unassigned residents are not included in a leader roster", () => {
  assert.equal(memberPurokId({ householdId: 999 }, households), null);
});

test("numeric string IDs from the database resolve correctly", () => {
  assert.equal(memberPurokId({ purok_id: "126", householdId: 999 }, households), 126);
  assert.equal(memberPurokId({ householdId: "701" }, households), 126);
});
