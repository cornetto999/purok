export interface BarangaySeed {
  name: string;
  barangayCaptainName: string;
  puroks: string[];
}

export const BARANGAYS_SEED_DATA: BarangaySeed[] = [
  {
    name: "Burnay",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
    ],
  },
  {
    name: "Carlos P. Garcia",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
    ],
  },
  {
    name: "Cogon",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
      "Purok 8",
    ],
  },
  {
    name: "Gregorio Pelaez (Lagutay)",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
    ],
  },
  {
    name: "Kilangit",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
    ],
  },
  {
    name: "Matangad",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
      "Purok 8",
    ],
  },
  {
    name: "Pangayawan",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Zone 1",
      "Zone 2",
      "Zone 3",
      "Zone 4",
      "Zone 5",
      "Zone 6",
      "Zone 7",
      "Zone 8",
      "Zone 9",
      "Zone 10",
      "Zone 11",
    ],
  },
  {
    name: "Poblacion",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
      "Purok 8",
      "Purok 9",
      "Sitio Arancon",
      "Sitio Boholano",
      "Sitio Damasing",
      "Sitio Hildo",
      "Sitio Valerio",
    ],
  },
  {
    name: "Quezon",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
    ],
  },
  {
    name: "Tala-o",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 3A",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
    ],
  },
  {
    name: "Ulab",
    barangayCaptainName: "—",
    puroks: [
      "Purok 1",
      "Purok 2",
      "Purok 3",
      "Purok 4",
      "Purok 5",
      "Purok 6",
      "Purok 7",
    ],
  },
];

/**
 * Normalizes string for comparisons: lowercase, strip punctuation and extra spaces.
 */
function cleanName(val: string): string {
  return val
    .toLowerCase()
    .replace(/[._\-()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts / auto-detects a barangay name from a file name like "RV_BURNAY.xlsx".
 * Matches against known barangays or parses a clean title.
 */
export function extractBarangayFromFileName(fileName: string): string {
  // Remove file extension
  let base = fileName.replace(/\.[^/.]+$/, "");

  // Remove common prefixes
  base = base.replace(/^(rv|brgy|barangay)[_\-\s]+/i, "");

  const cleaned = cleanName(base);

  // Exact or fuzzy match against known barangays
  for (const b of BARANGAYS_SEED_DATA) {
    const bClean = cleanName(b.name);
    if (cleaned === bClean) return b.name;

    // Aliases
    if (b.name === "Carlos P. Garcia" && (cleaned === "cpg" || cleaned.includes("carlos p garcia"))) {
      return b.name;
    }
    if (b.name === "Gregorio Pelaez (Lagutay)" && (cleaned.includes("lagutay") || cleaned.includes("gregorio pelaez") || cleaned.includes("pelaez"))) {
      return b.name;
    }
    if (b.name === "Tala-o" && (cleaned === "talao" || cleaned === "tala o")) {
      return b.name;
    }
    if (cleaned.includes(bClean) || bClean.includes(cleaned)) {
      return b.name;
    }
  }

  // If not matched to seed list, capitalize words nicely
  return base
    .replace(/[_\-]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ") || "Imported Barangay";
}
