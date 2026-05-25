/**
 * One-off: parse units_full.csv (from xlsx) into a clean JSON lookup
 * keyed by normalized product name.
 * Run once: `node scripts/convert-units.mjs`
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname).replace(/^\//, ""), "..");
const csvPath = path.join(root, "units_full.csv");
const outPath = path.join(root, "src", "data", "product-units.json");

const raw = fs.readFileSync(csvPath, "utf8").replace(/^﻿/, "");

// Stream parser that respects quoted multi-line values
function parseCsv(text) {
  const rows = [];
  let cur = "";
  let row = [];
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuote) {
      if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuote = false; }
      else cur += c;
    } else {
      if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cur); cur = "";
        rows.push(row); row = [];
      }
      else if (c === '"') { inQuote = true; }
      else cur += c;
    }
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}

const rows = parseCsv(raw);
// First row is the sheet name "Inventory Summary usage unit" — skip
// Second row is the header
// Remaining are data

function normalize(name) {
  return name.toLowerCase().replace(/\s+/g, " ").trim();
}

const lookup = {};
let count = 0;

for (let i = 2; i < rows.length; i++) {
  const cols = rows[i];
  if (!cols || cols.length === 0) continue;
  const [name, unit, description, moq] = cols;
  if (!name || !name.trim()) continue;
  const key = normalize(name);
  const entry = { name: name.trim() };
  if (unit && unit.trim()) entry.unit = unit.trim();
  if (description && description.trim()) entry.description = description.trim().replace(/\s+/g, " ");
  if (moq && moq.trim()) {
    const n = parseInt(moq, 10);
    if (!isNaN(n) && n > 0) entry.moq = n;
  }
  lookup[key] = entry;
  count++;
}

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(lookup, null, 2));
console.log(`Wrote ${count} entries to ${outPath}`);
