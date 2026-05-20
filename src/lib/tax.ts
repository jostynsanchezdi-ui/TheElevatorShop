// NY State sales tax — fixed rate, used across cart, checkout, PO and emails.
export const NY_TAX_RATE = 0.08875;
export const NY_TAX_LABEL = "NY Sales Tax (8.875%)";

/**
 * Calculate NY sales tax on the subtotal (in cents).
 * Rounded to the nearest cent to avoid floating-point drift.
 */
export function calcTaxCents(subtotalCents: number): number {
  return Math.round(subtotalCents * NY_TAX_RATE);
}
