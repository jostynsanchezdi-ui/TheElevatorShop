import unitsData from "@/data/product-units.json";

export interface UnitInfo {
  name: string;
  unit?: string;
  /** Packaging description from the client's spreadsheet, e.g. "box-25pc", "1 ROLL = 500FT". */
  description?: string;
  /** Minimum Order Quantity — if present, customers must order at least this amount. */
  moq?: number;
}

const lookup: Record<string, UnitInfo> = unitsData as Record<string, UnitInfo>;

function normalize(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

/** Look up unit / packaging / MOQ info for a product by its display name. */
export function getUnitInfo(productName: string | null | undefined): UnitInfo | null {
  if (!productName) return null;
  return lookup[normalize(productName)] ?? null;
}

/** Get just the unit string (defaults to "pcs"). */
export function getUnit(productName: string | null | undefined): string {
  return getUnitInfo(productName)?.unit ?? "pcs";
}
