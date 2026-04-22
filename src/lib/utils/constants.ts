export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const ZOHO_API_BASE = process.env.ZOHO_API_BASE_URL ?? "https://www.zohoapis.com/inventory/v1";

export const PRODUCT_LIST_REVALIDATE = 300;   // 5 min
export const PRODUCT_DETAIL_REVALIDATE = 120; // 2 min
