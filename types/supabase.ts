// Database types for supabase-js, matching supabase/migrations.
// Can be regenerated with:
//   npx supabase gen types typescript --project-id <project-ref> > types/supabase.ts
// (then re-add the `Row` helper at the bottom).

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          first_name: string;
          last_name: string;
          email: string;
          password_hash: string;
          is_admin: boolean;
          reset_token_hash: string | null;
          reset_token_expires: string | null;
          session_version: number;
          shipping_address: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          first_name: string;
          last_name: string;
          email: string;
          password_hash: string;
          is_admin?: boolean;
          reset_token_hash?: string | null;
          reset_token_expires?: string | null;
          session_version?: number;
          shipping_address?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          first_name?: string;
          last_name?: string;
          email?: string;
          password_hash?: string;
          is_admin?: boolean;
          reset_token_hash?: string | null;
          reset_token_expires?: string | null;
          session_version?: number;
          shipping_address?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      rate_limits: {
        Row: { key: string; count: number; window_start: string };
        Insert: { key: string; count: number; window_start: string };
        Update: { key?: string; count?: number; window_start?: string };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          category: string;
          subcategory: string | null;
          price: number;
          stock: number;
          overview: string | null;
          features: Json | null;
          styling_tip: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          category: string;
          subcategory?: string | null;
          price: number;
          stock?: number;
          overview?: string | null;
          features?: Json | null;
          styling_tip?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          category?: string;
          subcategory?: string | null;
          price?: number;
          stock?: number;
          overview?: string | null;
          features?: Json | null;
          styling_tip?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: number;
          order_number: string;
          billing_id: string;
          user_id: number | null;
          email: string;
          first_name: string;
          last_name: string;
          address: string;
          city: string;
          province: string;
          zip: string;
          phone: string;
          country: string;
          payment_method: string;
          shipping_cost: number;
          total_amount: number;
          purchase_date: string;
        };
        Insert: {
          id?: number;
          order_number: string;
          billing_id: string;
          user_id?: number | null;
          email: string;
          first_name: string;
          last_name: string;
          address: string;
          city: string;
          province: string;
          zip: string;
          phone: string;
          country?: string;
          payment_method: string;
          shipping_cost: number;
          total_amount: number;
          purchase_date?: string;
        };
        Update: {
          id?: number;
          order_number?: string;
          billing_id?: string;
          user_id?: number | null;
          email?: string;
          first_name?: string;
          last_name?: string;
          address?: string;
          city?: string;
          province?: string;
          zip?: string;
          phone?: string;
          country?: string;
          payment_method?: string;
          shipping_cost?: number;
          total_amount?: number;
          purchase_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number | null;
          name: string;
          image_url: string | null;
          size: string | null;
          quantity: number;
          unit_price: number;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id?: number | null;
          name: string;
          image_url?: string | null;
          size?: string | null;
          quantity: number;
          unit_price: number;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number | null;
          name?: string;
          image_url?: string | null;
          size?: string | null;
          quantity?: number;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      place_order: {
        Args: {
          p_user_id: number;
          p_email: string;
          p_order_number: string;
          p_billing_id: string;
          p_shipping: Json;
          p_payment_method: string;
          p_shipping_cost: number;
          p_items: Json;
        };
        Returns: number;
      };
      hit_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number };
        Returns: number;
      };
      admin_stats: {
        Args: Record<PropertyKey, never>;
        Returns: { total_products: number; total_orders: number; total_earnings: number }[];
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type Row<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];
