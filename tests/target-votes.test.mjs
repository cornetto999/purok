import assert from "node:assert/strict";
import test from "node:test";
import { loadTypeScript } from "./load-typescript.mjs";

const { parseVoteTarget, readVoteTargets } = loadTypeScript("src/lib/target-votes.ts");

test("accepts whole targets and treats cleared fields as unset", () => {
  assert.equal(parseVoteTarget("20000"), 20000);
  assert.equal(parseVoteTarget("0"), 0);
  assert.equal(parseVoteTarget(" "), 0);
});

test("rejects negative, fractional, non-numeric, and unsafe targets", () => {
  for (const value of ["-1", "1.5", "Infinity", "NaN", "abc", "9007199254740992"]) {
    assert.throws(() => parseVoteTarget(value), /whole numbers/);
  }
});

test("saved overall and individual barangay targets remain independent", () => {
  const targets = { overall: 20000, barangays: { 23: 2000, 24: 1500 } };
  assert.deepEqual(readVoteTargets(JSON.stringify(targets)), targets);
});

test("recovers safely from missing, malformed, or invalid saved values", () => {
  for (const saved of [null, "bad json", "null", "[]"]) {
    assert.deepEqual(readVoteTargets(saved), { overall: 0, barangays: {} });
  }
  assert.deepEqual(readVoteTargets('{"overall":-5,"barangays":{"23":2000,"24":-10,"25":1.5}}'), {
    overall: 0, barangays: { 23: 2000 },
  });
});
