export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          domain: string
          project_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          domain: string
          project_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          domain?: string
          project_id?: string
          created_at?: string
        }
      }
      schemas: {
        Row: {
          id: string
          project_id: string
          type: string
          enabled: boolean
          url_pattern: string | null
          json: Json
          created_at: string
          updated_at: string
          edit_count: number
        }
        Insert: {
          id?: string
          project_id: string
          type: string
          enabled?: boolean
          url_pattern?: string | null
          json: Json
          created_at?: string
          updated_at?: string
          edit_count?: number
        }
        Update: {
          id?: string
          project_id?: string
          type?: string
          enabled?: boolean
          url_pattern?: string | null
          json?: Json
          created_at?: string
          updated_at?: string
          edit_count?: number
        }
      }
      schema_edits: {
        Row: {
          id: string
          user_id: string
          project_id: string
          schema_id: string | null
          action: string
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
          schema_id?: string | null
          action: string
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
          schema_id?: string | null
          action?: string
          month?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          is_promo: boolean
          domain_count: number
          subscription_status: string
          stripe_customer_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          is_promo?: boolean
          domain_count?: number
          subscription_status?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_promo?: boolean
          domain_count?: number
          subscription_status?: string
          stripe_customer_id?: string | null
          created_at?: string
        }
      }
    }
  }
}
