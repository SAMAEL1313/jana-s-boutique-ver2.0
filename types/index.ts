export type Category =
  | "tops"
  | "bottoms"
  | "dresses"
  | "perfumes"
  | "shoes"
  | "accessories";

export interface Product {
  id: number;
  name: string;
  category: Category;
  subcategory: string | null;
  /** Display label, e.g. "Shoes > Heels" */
  folder: string;
  price: number;
  stock: number;
  overview: string | null;
  /** Optional size label -> price map (perfumes) */
  features: Record<string, number> | null;
  stylingTip: string | null;
  imageUrl: string | null;
}

export interface CartItem extends Product {
  quantity: number;
  size: string | null;
}

export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export interface OrderItemDTO {
  id: number;
  productId: number | null;
  name: string;
  imageUrl: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
}

export interface OrderDTO {
  id: number;
  orderNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  phone: string;
  paymentMethod: string;
  shippingCost: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItemDTO[];
}

export interface CustomerDTO {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export type ApiResult<T = object> =
  | ({ success: true } & T)
  | { success: false; message: string };
