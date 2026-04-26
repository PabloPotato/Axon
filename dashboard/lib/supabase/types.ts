// dashboard/lib/supabase/types.ts
// Minimal typed Database interface for Intaglio tables.
//
// IMPORTANT: Every table needs a `Relationships` array (even if empty) to
// satisfy @supabase/supabase-js v2.100+ GenericTable constraint. Without it
// the client's type machinery falls through to `never` for all queries.
//
// Run `supabase gen types typescript --project-id [SUPABASE_PROJECT_ID]` to
// regenerate from the live schema and replace this file.

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
        Relationships: [];
      };
      operator_members: {
        Row: {
          operator_id: string;
          user_id: string;
          role: "owner" | "admin" | "member" | "viewer";
          created_at: string;
        };
        Insert: {
          operator_id: string;
          user_id: string;
          role?: "owner" | "admin" | "member" | "viewer";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["operator_members"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "operator_members_operator_id_fkey";
            columns: ["operator_id"];
            isOneToOne: false;
            referencedRelation: "operators";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: {
          id?: string;
          operator_id: string;
          slug: string;
          display_name: string;
          identity_ref?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["agents"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "agents_operator_id_fkey";
            columns: ["operator_id"];
            isOneToOne: false;
            referencedRelation: "operators";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: {
          id?: string;
          operator_id: string;
          agent_id: string;
          version: string;
          source: string;
          hash: string;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["policies"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "policies_operator_id_fkey";
            columns: ["operator_id"];
            isOneToOne: false;
            referencedRelation: "operators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "policies_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: {
          id?: string;
          operator_id: string;
          agent_id: string;
          policy_id: string;
          policy_hash: string;
          record_uuid: string;
          action: Record<string, unknown>;
          decision: Record<string, unknown>;
          obligations_emitted?: string[];
          prev_record_hash: string;
          self_hash: string;
          created_at?: string;
        };
        Update: never; // append-only
        Relationships: [
          {
            foreignKeyName: "audit_records_operator_id_fkey";
            columns: ["operator_id"];
            isOneToOne: false;
            referencedRelation: "operators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audit_records_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
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
        Insert: {
          id?: string;
          operator_id: string;
          agent_id: string;
          audit_record_id: string;
          requested_approver?: string | null;
          status?: "pending" | "approved" | "denied" | "timed_out";
          approved_by?: string | null;
          responded_at?: string | null;
          timeout_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["approval_requests"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "approval_requests_operator_id_fkey";
            columns: ["operator_id"];
            isOneToOne: false;
            referencedRelation: "operators";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "approval_requests_agent_id_fkey";
            columns: ["agent_id"];
            isOneToOne: false;
            referencedRelation: "agents";
            referencedColumns: ["id"];
          },
        ];
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
