import unitsData from "@/data/product-units.json";

export interface UnitInfo {
  name: string;
  unit?: string;
  /** Packaging description from the client's spreadsheet, e.g. "box-25pc", "1 ROLL = 500FT". */
  description?: string;
  /** Minimum Order Quantity — quantity floor. */
  moq?: number;
  /** Maximum order quantity per item. When set, the counter caps here (or at stock, whichever is lower). */
  maxQty?: number;
  /** Increment step for +/- and validation. Defaults to MOQ when not provided. */
  step?: number;
}

const lookup: Record<string, UnitInfo> = unitsData as Record<string, UnitInfo>;

function normalize(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

/**
 * AWG wires are sold by the foot — they don't follow the spreadsheet's "1 ROLL = 500FT"
 * packaging rule. Override: min 25ft, max 500ft, 1ft increments.
 */
function isAwgWire(name: string): boolean {
  return /\bawg\s*#\d+/i.test(name);
}

/** Look up unit / packaging / MOQ info for a product by its display name. */
export function getUnitInfo(productName: string | null | undefined): UnitInfo | null {
  if (!productName) return null;
  const base = lookup[normalize(productName)];
  if (!base) return null;
  if (isAwgWire(productName)) {
    return { ...base, unit: "ft", moq: 25, maxQty: 500, step: 1 };
  }
  return base;
}

/** Get just the unit string (defaults to "pcs"). */
export function getUnit(productName: string | null | undefined): string {
  return getUnitInfo(productName)?.unit ?? "pcs";
}
