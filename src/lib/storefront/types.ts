/**
 * Types for the dukonline.uz Storefront API.
 *
 * Derived from live responses of `https://api.dukonline.uz/api/storefront/*`.
 * The API exposes exactly six endpoints — there is no product-detail,
 * category or pagination endpoint, so the whole catalog arrives in one call
 * and everything else is derived from it.
 *
 * The ERP also models phones (IMEI serials, storage/colour/region buckets).
 * This catalog contains none, so those types are deliberately absent.
 */

/** `tracked` products decrement stock; others are always sellable. */
export type StockType = "tracked" | "untracked" | (string & {});

export interface StoreBanner {
  id: number;
  image: string;
  title: string;
}

export interface StoreInfo {
  organization: string;
  store: string;
  /** May be a symbol (`"$"`) or a code (`"USD"`) — normalise before use. */
  currency: string;
  banners: StoreBanner[];
}

/**
 * A sellable unit of a product (piece, box, kg…). `multiplier` is how many
 * base stock units one of these consumes, so a "box of 12" has multiplier 12.
 */
export interface ProductUnit {
  unit_id: number | null;
  unit_name: string;
  multiplier: number;
  price: number;
  original_price: number | null;
  /** Empty string means "the store's base currency". */
  currency: string;
  /** Price converted into the currency the customer is shown. */
  cur_price: number;
  cur_original_price: number | null;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  original_price: number | null;
  currency: string;
  cur_price: number;
  cur_original_price: number | null;
  stock: number | null;
  in_stock: boolean;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description: string;
  category_id: number | null;
  category_name: string | null;
  category_parent_id: number | null;
  category_parent_name: string | null;
  image: string;
  stock_type: StockType;
  stock: number;
  in_stock: boolean;
  has_variants: boolean;
  variants: ProductVariant[];
  units: ProductUnit[];
  discount_percent: number;
  /** ERP product class; empty for this catalog. */
  product_type: string;
  attributes: Record<string, string>;
}

export interface CategoryImage {
  id: number;
  image: string;
}

export interface CatalogResponse {
  store: string;
  results: Product[];
  show_stock: boolean;
  show_images: boolean;
  category_images: CategoryImage[];
}

export interface TopProductsResponse {
  product_ids: number[];
}

export interface Customer {
  customer_code: string;
  code?: string;
  name: string;
  phone: string;
  debt?: number;
  credit?: number;
  currency_debts?: Record<string, number>;
  [key: string]: unknown;
}

export interface CustomerSaleItem {
  name?: string;
  product_name?: string;
  qty?: number;
  quantity?: number;
  unit?: string;
  unit_name?: string;
  price?: number;
  serial?: {
    imei?: string;
    storage?: string;
    color?: string;
    region?: string;
    battery?: number;
  };
}

export interface PaymentBreakdown {
  method?: string;
  amount?: number;
}

export interface CustomerSale {
  receipt_number?: string;
  created_at?: string;
  total?: number;
  paid?: number;
  debt?: number;
  debt_currency?: string;
  debt_currency_amount?: number;
  debt_rate?: number;
  payment_method?: string;
  payment_breakdown?: PaymentBreakdown[];
  items?: CustomerSaleItem[];
}

export interface CustomerOrder {
  order_no?: string;
  created_at?: string;
  total?: number;
  status?: string;
}

export interface CustomerPayment {
  amount?: number;
  currency?: string;
  created_at?: string;
  note?: string;
}

export interface CustomerAccountResponse {
  customer: Customer;
  sales: CustomerSale[];
  online_orders: CustomerOrder[];
  payments: CustomerPayment[];
}

export interface OrderItemPayload {
  product_id: number;
  variant_id?: number;
  unit_id?: number;
  qty: number;
}

export type DeliveryType = "courier" | "pickup";

export interface OrderPayload {
  customer_name: string;
  phone: string;
  delivery_type: DeliveryType;
  payment_method: string;
  address?: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  customer_code?: string;
  items: OrderItemPayload[];
}

export interface OrderResponse {
  order_no: string;
  [key: string]: unknown;
}

/** A node in the category tree derived client-side from product rows. */
export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  image?: string;
  children: Category[];
  count: number;
}
