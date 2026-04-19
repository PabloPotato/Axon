// dashboard/lib/supabase/types.ts
// Minimal typed Database interface for Axon tables.
// Run `supabase gen types typescript` to regenerate from live schema.

export interface Database {
  public: {
    Tables: {
      operators: {
        Row: {
          id: string;
          name: string;
          legal_entity: string;
          country_code: string;
          billing_email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_entity: string;
          country_code: string;
          billing_email: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["operators"]["Insert"]>;
      };
      operator_members: {
        Row: {
          operator_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["operator_members"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["operator_members"]["Insert"]>;
      };
      agents: {
        Row: {
          id: string;
          operator_id: string;
          slug: string;
          display_name: string;
          identity_ref: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["agents"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
      };
      policies: {
        Row: {
          id: string;
          operator_id: string;
          agent_id: string;
          version: string;
          source: string;
          hash: string;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["policies"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["policies"]["Insert"]>;
      };
      audit_records: {
        Row: {
          id: string;
          operator_id: string;
          agent_id: string;
          policy_id: string;
          policy_hash: string;
          record_uuid: string;
          action: Record<string, unknown>;
          decision: Record<string, unknown>;
          obligations_emitted: string[];
          prev_record_hash: string;
          self_hash: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_records"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: never; // append-only
      };
      approval_requests: {
        Row: {
          id: string;
          operator_id: string;
          agent_id: string;
          audit_record_id: string;
          requested_approver: string | null;
          status: "pending" | "approved" | "denied" | "timed_out";
          approved_by: string | null;
          responded_at: string | null;
          timeout_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["approval_requests"]["Row"],
          "id" | "created_at" | "responded_at"
        > & {
          id?: string;
          created_at?: string;
          responded_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["approval_requests"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      member_role: "owner" | "admin" | "member" | "viewer";
      approval_status: "pending" | "approved" | "denied" | "timed_out";
    };
  };
}
