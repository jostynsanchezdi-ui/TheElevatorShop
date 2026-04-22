export interface ZohoItem {
  item_id: string;
  name: string;
  sku: string;
  description: string;
  rate: number;
  group_name?: string;
  brand?: string;
  image_document_id?: string;
  image_url?: string;
  available_stock: number;
  status: "active" | "inactive";
  custom_fields?: Array<{ label: string; value: string }>;
}

export interface ZohoItemsResponse {
  items: ZohoItem[];
  page_context: {
    page: number;
    per_page: number;
    has_more_page: boolean;
    total: number;
  };
}

export interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}
