import assert from "node:assert/strict";
import test from "node:test";
import { File } from "node:buffer";
import XLSX from "xlsx";
import { loadTypeScript } from "./load-typescript.mjs";

const { importFromExcel, toRows } = loadTypeScript("src/lib/excel.ts");

async function importedData() {
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.json_to_sheet([
      {
        Barangay: "Burnay",
        Purok: "Purok 1",
        "Household Leader": "Test, Leader",
        Address: "Original resident address",
        "Last Name": "Test",
        "First Name": "Imported",
        Precinct: "0005A",
        No: "0007",
        Age: 65,
        Religion: "Catholic",
        Status: "Married",
        SC: "Yes",
        PWD: "No",
        IP: "No",
        Remarks: "Imported note",
      },
    ]),
    "Residents",
  );
  return importFromExcel(
    new File(
      [XLSX.write(book, { type: "buffer", bookType: "xlsx" })],
      "residents.xlsx",
    ),
  );
}

function exportDouble(data, failedTable) {
  let workbook;
  const exports = loadTypeScript("src/lib/export-residents.ts", {
    xlsx: {
      ...XLSX,
      writeFile(book) {
        workbook = XLSX.read(
          XLSX.write(book, { type: "buffer", bookType: "xlsx" }),
        );
      },
    },
    "./supabase": {
      supabase: {
        from(table) {
          return {
            select() {
              return this;
            },
            order(key) {
              assert.equal(key, "id");
              return this;
            },
            async range(from, to) {
              return {
                data: data[table].slice(from, to + 1),
                count: data[table].length,
                error:
                  table === failedTable
                    ? { message: "Database unavailable" }
                    : null,
              };
            },
          };
        },
      },
    },
  });
  return { ...exports, workbook: () => workbook };
}

test("download preserves imported values and includes newly saved residents beyond one page", async () => {
  const data = await importedData();
  const original = toRows(data)[0];
  data.households[0].address = "Shared household address";
  data.members.push(
    ...Array.from({ length: 1001 }, (_, index) => ({
      ...data.members[0],
      id: index + 2,
      firstName: `New resident ${index}`,
      no: String(index + 8).padStart(4, "0"),
      address: `New address ${index}`,
      remarks: "Entered in the app",
    })),
  );
  const exported = exportDouble(data);
  assert.equal(await exported.exportResidents(), 1002);
  const sheet = exported.workbook().Sheets.Residents;
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  assert.equal(rows.length, 1002);
  assert.deepEqual(rows[0], original);
  assert.equal(rows[1001]["First Name"], "New resident 1000");
  assert.equal(rows[1001].Address, "New address 1000");
  assert.equal(rows[1001].Remarks, "Entered in the app");
  assert.equal(rows[0].Precinct, "0005A");
  assert.equal(rows[0].No, "0007");
});

test("export resolves current purok claims and barangays without a household", async () => {
  const data = await importedData();
  data.barangays.push({ id: 2, name: "Cogon", barangayCaptainName: "Captain" });
  data.puroks.push({
    id: 2,
    barangayId: 2,
    name: "Purok 2",
    purokLeaderName: "Leader",
  });
  data.members[0].purok_id = 2;
  assert.equal(toRows(data)[0].Purok, "Purok 2");
  assert.equal(toRows(data)[0].Barangay, "Cogon");
  data.members[0].purok_id = null;
  data.members[0].barangayId = 2;
  data.members[0].householdId = 999;
  assert.equal(toRows(data)[0].Barangay, "Cogon");
  assert.equal(toRows(data)[0].Address, "Original resident address");
});

test("residents with no individual address keep the household address fallback", async () => {
  const data = await importedData();
  data.members[0].address = "";
  assert.equal(toRows(data)[0].Address, "Original resident address");
});

test("failed data retrieval never downloads an incomplete workbook", async () => {
  const exported = exportDouble(await importedData(), "members");
  await assert.rejects(exported.exportResidents(), /Database unavailable/);
  assert.equal(exported.workbook(), undefined);
});
