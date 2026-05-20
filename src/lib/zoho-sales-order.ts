import { getZohoAccessToken } from "./zoho-token";

const API_BASE = process.env.ZOHO_API_BASE_URL ?? "https://www.zohoapis.com/inventory/v1";
const ORG_ID = process.env.ZOHO_ORGANIZATION_ID!;
const NY_TAX_ID = process.env.ZOHO_NY_TAX_ID;

interface ZohoAddress {
  attention?: string;
  address?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
}

interface OrderLineItem {
  /** Zoho item_id */
  id: string;
  name: string;
  /** Unit price in cents */
  price: number;
  quantity: number;
}

export interface CreateSalesOrderParams {
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  company?: string | null;
  /** Our internal PO number (e.g. "PO-00031") — goes into Zoho's reference_number field */
  referenceNumber: string;
  items: OrderLineItem[];
  /** Shipping cost in cents */
  shippingCostCents: number;
  shippingAddress: ZohoAddress;
  billingAddress: ZohoAddress;
}

interface ZohoApiError {
  code: number;
  message: string;
}

async function zohoFetch<T>(
  path: string,
  init: { method?: "GET" | "POST"; body?: unknown } = {}
): Promise<T> {
  const token = await getZohoAccessToken();
  const url = `${API_BASE}${path}${path.includes("?") ? "&" : "?"}organization_id=${ORG_ID}`;
  const res = await fetch(url, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || (data?.code !== undefined && data.code !== 0)) {
    const err: ZohoApiError = { code: data?.code ?? res.status, message: data?.message ?? res.statusText };
    throw new Error(`Zoho ${path} failed: ${err.code} — ${err.message}`);
  }
  return data as T;
}

interface ContactSearchResponse {
  contacts: Array<{ contact_id: string; email?: string }>;
}

async function findContactByEmail(email: string): Promise<string | null> {
  const safeEmail = encodeURIComponent(email);
  const data = await zohoFetch<ContactSearchResponse>(`/contacts?email=${safeEmail}`);
  return data.contacts?.[0]?.contact_id ?? null;
}

interface ContactCreateResponse {
  contact: { contact_id: string };
}

async function createContact(params: CreateSalesOrderParams): Promise<string> {
  const [first, ...rest] = params.customerName.trim().split(/\s+/);
  const last = rest.join(" ") || ".";
  const contactName = params.company?.trim() || params.customerName;

  const body = {
    contact_name: contactName,
    company_name: params.company || undefined,
    customer_sub_type: params.company ? "business" : "individual",
    contact_persons: [
      {
        first_name: first,
        last_name: last,
        email: params.customerEmail,
        mobile: params.customerPhone || undefined,
        is_primary_contact: true,
      },
    ],
    billing_address: params.billingAddress,
    shipping_address: params.shippingAddress,
  };

  const data = await zohoFetch<ContactCreateResponse>("/contacts", { method: "POST", body });
  return data.contact.contact_id;
}

interface SalesOrderCreateResponse {
  salesorder: { salesorder_id: string; salesorder_number: string };
}

export interface PushOrderResult {
  ok: boolean;
  salesorder_id?: string;
  salesorder_number?: string;
  customer_id?: string;
  error?: string;
}

export async function pushOrderToZoho(params: CreateSalesOrderParams): Promise<PushOrderResult> {
  try {
    // 1. Find or create the contact
    let contactId = await findContactByEmail(params.customerEmail);
    if (!contactId) contactId = await createContact(params);

    // 2. Build line items (prices in dollars, not cents)
    const line_items = params.items.map((item) => ({
      item_id: item.id,
      quantity: item.quantity,
      rate: item.price / 100,
      ...(NY_TAX_ID ? { tax_id: NY_TAX_ID } : {}),
    }));

    // 3. Create the Sales Order (defaults to draft status)
    const today = new Date().toISOString().slice(0, 10);
    const soBody = {
      customer_id: contactId,
      date: today,
      reference_number: params.referenceNumber,
      line_items,
      shipping_charge: params.shippingCostCents / 100,
      notes: "Generated automatically from theelevatorshop.net checkout.",
      is_inclusive_tax: false,
    };

    const data = await zohoFetch<SalesOrderCreateResponse>("/salesorders", {
      method: "POST",
      body: soBody,
    });

    return {
      ok: true,
      customer_id: contactId,
      salesorder_id: data.salesorder.salesorder_id,
      salesorder_number: data.salesorder.salesorder_number,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}
