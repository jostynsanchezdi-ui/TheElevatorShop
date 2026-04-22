import { getZohoAccessToken } from "./auth";
import { slugify } from "@/lib/utils/formatters";
import type { ZohoItem, ZohoItemsResponse } from "./types";
import type { Product } from "@/types/product";
import type { Order } from "@/types/order";

const BASE = process.env.ZOHO_API_BASE_URL!;
const ORG = process.env.ZOHO_ORGANIZATION_ID!;

async function zohoFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const token = await getZohoAccessToken();
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set("organization_id", ORG);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });
  if (!res.ok) throw new Error(`Zoho API error: ${res.status} ${path}`);
  return res.json();
}

function mapItem(item: ZohoItem): Product {
  return {
    id: item.item_id,
    name: item.name,
    slug: slugify(item.name),
    sku: item.sku,
    description: item.description ?? "",
    price: Math.round(item.rate * 100),
    category: item.group_name ?? "",
    brand: item.brand ?? "",
    images: item.image_url ? [item.image_url] : [],
    stock: item.available_stock,
    specifications: Object.fromEntries(
      (item.custom_fields ?? []).map((f) => [f.label, f.value])
    ),
    isActive: item.status === "active",
  };
}

export async function getProducts(params?: Record<string, string>): Promise<Product[]> {
  const data = await zohoFetch<ZohoItemsResponse>("/items", params);
  return data.items.filter((i) => i.status === "active").map(mapItem);
}

export async function getProduct(itemId: string): Promise<Product> {
  const data = await zohoFetch<{ item: ZohoItem }>(`/items/${itemId}`);
  return mapItem(data.item);
}

export async function getZohoItems(itemIds: string[]): Promise<ZohoItem[]> {
  const results = await Promise.all(
    itemIds.map((id) =>
      zohoFetch<{ item: ZohoItem }>(`/items/${id}`).then((d) => d.item)
    )
  );
  return results;
}

export async function createZohoSalesOrder(order: Order): Promise<string> {
  const token = await getZohoAccessToken();
  const url = new URL(`${BASE}/salesorders`);
  url.searchParams.set("organization_id", ORG);

  const body = {
    customer_name: "Online Customer",
    line_items: order.items.map((item) => ({
      item_id: item.zohoItemId,
      quantity: item.quantity,
      rate: item.price / 100,
    })),
  };

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Failed to create Zoho sales order: ${res.status}`);
  const data = await res.json();
  return data.salesorder.salesorder_id as string;
}
