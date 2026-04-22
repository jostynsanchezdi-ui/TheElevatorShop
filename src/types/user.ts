export interface UserProfile {
  id: string;
  fullName?: string;
  companyName?: string;
  phone?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
