import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";

const { outputText } = ts.transpileModule(
  readFileSync(
    new URL("../src/lib/fetch-all-rows.ts", import.meta.url),
    "utf8",
  ),
  { compilerOptions: { module: ts.ModuleKind.ESNext } },
);
const { fetchAllRows } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("loads all pages in order with at most four concurrent requests", async () => {
  const expected = Array.from({ length: 10555 }, (_, id) => ({ id }));
  let active = 0;
  let peak = 0;
  let requests = 0;
  const rows = await fetchAllRows(async (from, to) => {
    requests++;
    active++;
    peak = Math.max(peak, active);
    // Force out-of-order responses within each group.
    await new Promise((resolve) =>
      setTimeout(resolve, 5 - ((from / 1000) % 4)),
    );
    active--;
    return {
      data: expected.slice(from, to + 1),
      error: null,
      count: from === 0 ? expected.length : null,
    };
  });
  assert.deepEqual(rows, expected);
  assert.equal(peak, 4);
  assert.equal(requests, 11);
});

test("empty and small tables need only one request", async () => {
  for (const data of [[], [{ id: 1 }]]) {
    let requests = 0;
    const rows = await fetchAllRows(async () => {
      requests++;
      return { data, error: null, count: data.length };
    });
    assert.deepEqual(rows, data);
    assert.equal(requests, 1);
  }
});

test("exact page boundaries do not cause an extra empty request", async () => {
  const starts = [];
  const rows = await fetchAllRows(async (from, to) => {
    starts.push(from);
    return {
      data: Array.from({ length: to - from + 1 }, (_, i) => from + i),
      error: null,
      count: 2000,
    };
  });
  assert.equal(rows.length, 2000);
  assert.deepEqual(starts, [0, 1000]);
});

test("honors a smaller database page cap without skipping records", async () => {
  const expected = Array.from({ length: 1250 }, (_, id) => id);
  const rows = await fetchAllRows(async (from, to) => ({
    data: expected.slice(from, Math.min(from + 500, to + 1)),
    error: null,
    count: expected.length,
  }));
  assert.deepEqual(rows, expected);
});

test("a failed page rejects instead of returning an incomplete roster", async () => {
  await assert.rejects(
    fetchAllRows(async (from) =>
      from === 1000
        ? { data: null, error: { message: "Connection interrupted" } }
        : {
            data: Array.from({ length: 1000 }, (_, i) => i),
            error: null,
            count: 3000,
          },
    ),
    /Connection interrupted/,
  );
});

test("a failed first request does not start more requests", async () => {
  let requests = 0;
  await assert.rejects(
    fetchAllRows(async () => {
      requests++;
      return { data: null, error: { message: "Unavailable" } };
    }),
    /Unavailable/,
  );
  assert.equal(requests, 1);
});

test("still reads all rows when a server omits the count", async () => {
  const expected = Array.from({ length: 1250 }, (_, id) => id);
  const rows = await fetchAllRows(async (from, to) => ({
    data: expected.slice(from, to + 1),
    error: null,
  }));
  assert.deepEqual(rows, expected);
});
