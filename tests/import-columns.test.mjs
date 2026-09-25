import assert from "node:assert/strict";
import test from "node:test";
import { File } from "node:buffer";
import XLSX from "xlsx";
import { loadTypeScript } from "./load-typescript.mjs";

const { readVoterIdentifiers } = loadTypeScript(
  "src/lib/spreadsheet-columns.ts",
);
const { missingVoterIdentifiers, importNameKey } = loadTypeScript(
  "src/lib/import-identifiers.ts",
);
const { parseEntrySheet } = loadTypeScript("src/lib/import-entry-sheet.ts");
const { importFromExcel } = loadTypeScript("src/lib/excel.ts");

function workbookFile(sheet, name = "ENTRY") {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, name);
  return new File(
    [XLSX.write(book, { type: "buffer", bookType: "xlsx" })],
    "RV_BURNAY.xlsx",
  );
}

function entryFile() {
  const sheet = XLSX.utils.aoa_to_sheet([
    ["REGISTERED VOTERS — PRECINCT LIST"],
    [],
    ["Precinct No.", "No.", "LAST", "FIRST", "MIDDLE"],
    [5, 7, "Test", "Resident", "Middle"],
  ]);
  sheet.A4.z = '0000"A"';
  sheet.B4.z = "0000";
  return workbookFile(sheet);
}

test("maps Precinct and No. aliases independently", () => {
  for (const [precinctHeader, numberHeader] of [
    ["Precinct", "No."],
    ["P.N.", "S.N."],
    ["Precinct Number", "#"],
    ["PRECINCT NO.", "S/NO"],
    ["PN", "Voter Number"],
  ]) {
    assert.deepEqual(
      readVoterIdentifiers({
        [precinctHeader]: "0005A",
        [numberHeader]: "0007",
      }),
      { precinct: "0005A", no: "0007" },
    );
  }
  assert.deepEqual(
    readVoterIdentifiers({ PN: "17", Precinct: "0005A", SN: 0 }),
    { precinct: "0005A", no: "0" },
  );
});

test("ENTRY import skips title rows and preserves displayed leading zeros", async () => {
  const result = await parseEntrySheet(entryFile());
  assert.equal(result.memberCount, 1);
  assert.equal(result.data.members[0].precinct, "0005A");
  assert.equal(result.data.members[0].pn, "0005A");
  assert.equal(result.data.members[0].no, "0007");
});

test("standard import preserves identifiers too and does not invent missing numbers", async () => {
  const file = workbookFile(
    XLSX.utils.aoa_to_sheet([
      ["Last Name", "First Name", "Precinct", "No."],
      ["Test", "First", "0001B", "0012"],
      ["Test", "Second", "", ""],
    ]),
    "Residents",
  );
  const { members } = await importFromExcel(file);
  assert.equal(members[0].precinct, "0001B");
  assert.equal(members[0].no, "0012");
  assert.equal(members[1].no, "");
});

test("re-import fills missing identifiers and preserves saved values", () => {
  assert.deepEqual(
    missingVoterIdentifiers(
      { precinct: "", pn: "", no: "" },
      { precinct: "0005A", pn: "0005A", no: "0007" },
    ),
    { precinct: "0005A", pn: "0005A", no: "0007" },
  );
  assert.deepEqual(
    missingVoterIdentifiers(
      { precinct: "0001B", pn: "0001B", no: "0012" },
      { precinct: "0005A", pn: "0005A", no: "0007" },
    ),
    {},
  );
  assert.deepEqual(
    missingVoterIdentifiers(
      { precinct: "", pn: "0001B", no: "" },
      { precinct: "0005A", pn: "0005A", no: "" },
    ),
    { precinct: "0001B" },
  );
  assert.notEqual(
    importNameKey({ lastName: "Test", firstName: "Resident", middleName: "A" }),
    importNameKey({ lastName: "Test", firstName: "Resident", middleName: "B" }),
  );
});

function databaseDouble(existingMembers = [], updateError = null) {
  const writes = [];
  return {
    writes,
    supabase: {
      from(table) {
        let operation = "select",
          payload,
          start = 0,
          end = 999,
          id;
        const query = {
          select() {
            return this;
          },
          ilike() {
            return this;
          },
          limit() {
            return this;
          },
          order() {
            return this;
          },
          eq(key, value) {
            if (key === "id") id = value;
            return this;
          },
          range(from, to) {
            start = from;
            end = to;
            return this;
          },
          insert(data) {
            operation = "insert";
            payload = data;
            return this;
          },
          update(data) {
            operation = "update";
            payload = data;
            return this;
          },
          then(resolve, reject) {
            if (operation !== "select") {
              writes.push({ table, operation, payload, id });
              return Promise.resolve({
                data: [],
                error: operation === "update" ? updateError : null,
              }).then(resolve, reject);
            }
            const data =
              table === "barangays"
                ? [{ id: 1 }]
                : table === "puroks"
                  ? [{ id: 10, name: "Unassigned Purok" }]
                  : table === "households"
                    ? [{ id: 100, purokId: 10 }]
                    : existingMembers.slice(start, end + 1);
            return Promise.resolve({
              data,
              error: null,
              count: table === "members" ? existingMembers.length : data.length,
            }).then(resolve, reject);
          },
        };
        return query;
      },
    },
  };
}

test("batch upload sends both identifiers to member inserts", async () => {
  const db = databaseDouble();
  const batch = loadTypeScript("src/lib/batch-importer.ts", {
    "./supabase": db,
  });
  await batch.processSingleFile(batch.createBatchItem(entryFile()));
  const insert = db.writes.find(
    (write) => write.table === "members" && write.operation === "insert",
  );
  assert.equal(insert.payload[0].precinct, "0005A");
  assert.equal(insert.payload[0].pn, "0005A");
  assert.equal(insert.payload[0].no, "0007");
});

test("batch re-import updates a matching resident beyond the first 1000 rows", async () => {
  const existing = Array.from({ length: 1001 }, (_, id) => ({
    id,
    lastName: `Other ${id}`,
    firstName: "Resident",
    middleName: "",
    precinct: "",
    pn: "",
    no: "",
  }));
  existing[1000] = {
    ...existing[1000],
    lastName: "Test",
    firstName: "Resident",
    middleName: "Middle",
  };
  const db = databaseDouble(existing);
  const batch = loadTypeScript("src/lib/batch-importer.ts", {
    "./supabase": db,
  });
  await batch.processSingleFile(batch.createBatchItem(entryFile()));
  assert.deepEqual(db.writes, [
    {
      table: "members",
      operation: "update",
      id: 1000,
      payload: { precinct: "0005A", pn: "0005A", no: "0007" },
    },
  ]);
});

test("failed identifier updates report failure", async () => {
  const db = databaseDouble(
    [
      {
        id: 1,
        lastName: "Test",
        firstName: "Resident",
        middleName: "Middle",
        precinct: "",
        pn: "",
        no: "",
      },
    ],
    { message: "Write failed" },
  );
  const batch = loadTypeScript("src/lib/batch-importer.ts", {
    "./supabase": db,
  });
  await assert.rejects(
    batch.processSingleFile(batch.createBatchItem(entryFile())),
    /Failed to update member identifiers: Write failed/,
  );
});

const { readBatchWorksheet } = loadTypeScript("src/lib/batch-worksheet.ts");

function printedVoterSheet() {
  return XLSX.utils.aoa_to_sheet(
    [
      ["Republic of the Philippines"],
      ["No.", "Name", "Address", "Precinct"],
      ["001", "TEST, MARIA ANA SANTOS", "Street A", "0005A"],
      ["Page 1 of 2"],
      ["No.", "Name", "", "Address", "Precinct"],
      ["002", "SAMPLE, JUAN CRUZ JR.", "", "Street B", "0006B"],
    ],
    { origin: "A2" },
  );
}

test("batch accepts Sheet1 printed voter lists with repeated and shifted columns", async () => {
  const db = databaseDouble();
  const batch = loadTypeScript("src/lib/batch-importer.ts", {
    "./supabase": db,
  });
  const result = await batch.processSingleFile(
    batch.createBatchItem(workbookFile(printedVoterSheet(), "Sheet1")),
  );
  assert.equal(result.memberCount, 2);
  const members = db.writes.find((write) => write.table === "members").payload;
  assert.deepEqual(
    members.map(
      ({ lastName, firstName, middleName, no, precinct, address }) => ({
        lastName,
        firstName,
        middleName,
        no,
        precinct,
        address,
      }),
    ),
    [
      {
        lastName: "TEST",
        firstName: "MARIA ANA",
        middleName: "SANTOS",
        no: "001",
        precinct: "0005A",
        address: "Street A",
      },
      {
        lastName: "SAMPLE",
        firstName: "JUAN",
        middleName: "CRUZ JR.",
        no: "002",
        precinct: "0006B",
        address: "Street B",
      },
    ],
  );
});

test("batch worksheet selection prefers ENTRY and rejects ambiguous worksheets", () => {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, printedVoterSheet(), "Residents");
  XLSX.utils.book_append_sheet(book, printedVoterSheet(), "Other Residents");
  assert.throws(
    () => readBatchWorksheet(XLSX, book),
    /Multiple resident worksheets/,
  );
  XLSX.utils.book_append_sheet(book, printedVoterSheet(), "ENTRY");
  assert.equal(readBatchWorksheet(XLSX, book).sheetName, "ENTRY");
});

test("invalid worksheets fail before any database access", async () => {
  const batch = loadTypeScript("src/lib/batch-importer.ts", {
    "./supabase": {
      supabase: {
        from() {
          assert.fail("Database should not be accessed");
        },
      },
    },
  });
  await assert.rejects(
    batch.processSingleFile(
      batch.createBatchItem(
        workbookFile(
          XLSX.utils.aoa_to_sheet([["Summary"], ["Total", 5]]),
          "Sheet1",
        ),
      ),
    ),
    /No resident worksheet found/,
  );
  await assert.rejects(
    batch.processSingleFile(
      batch.createBatchItem(
        workbookFile(
          XLSX.utils.aoa_to_sheet([
            ["Name", "No."],
            ["Unstructured name", 1],
          ]),
          "Sheet1",
        ),
      ),
    ),
    /Last, First Middle/,
  );
  await assert.rejects(
    batch.processSingleFile(
      batch.createBatchItem(
        workbookFile(XLSX.utils.aoa_to_sheet([["LAST", "FIRST"]])),
      ),
    ),
    /No resident records/,
  );
});

test("failed files can be retried without reprocessing successful files", async () => {
  const db = databaseDouble();
  const batch = loadTypeScript("src/lib/batch-importer.ts", {
    "./supabase": db,
  });
  const item = {
    ...batch.createBatchItem(workbookFile(printedVoterSheet(), "Sheet1")),
    status: "failed",
  };
  const done = {
    ...batch.createBatchItem(entryFile()),
    status: "success",
    memberCount: 1,
  };
  const progress = [];
  const result = await batch.processBatchUpload(
    [done, item],
    (id, patch) => progress.push({ id, ...patch }),
    () => false,
  );
  assert.equal(result.successfulCount, 2);
  assert.deepEqual(
    progress.map((item) => item.status),
    ["processing", "success"],
  );
  assert.ok(progress.every((update) => update.id === item.id));
});
