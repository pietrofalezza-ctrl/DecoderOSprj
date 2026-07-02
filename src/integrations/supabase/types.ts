export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      analysis_activities: {
        Row: {
          activity_kind: string;
          created_at: string;
          file_id: string | null;
          id: string;
          language: string | null;
          model: string | null;
          owner_id: string;
          project_id: string | null;
          provider: string | null;
          query_text: string | null;
          repository_id: string | null;
          result_content: string | null;
          result_metadata: Json;
          result_summary: string | null;
          status: string;
        };
        Insert: {
          activity_kind: string;
          created_at?: string;
          file_id?: string | null;
          id?: string;
          language?: string | null;
          model?: string | null;
          owner_id: string;
          project_id?: string | null;
          provider?: string | null;
          query_text?: string | null;
          repository_id?: string | null;
          result_content?: string | null;
          result_metadata?: Json;
          result_summary?: string | null;
          status?: string;
        };
        Update: {
          activity_kind?: string;
          created_at?: string;
          file_id?: string | null;
          id?: string;
          language?: string | null;
          model?: string | null;
          owner_id?: string;
          project_id?: string | null;
          provider?: string | null;
          query_text?: string | null;
          repository_id?: string | null;
          result_content?: string | null;
          result_metadata?: Json;
          result_summary?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_activities_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_activities_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_activities_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      analysis_chat_messages: {
        Row: {
          content: string;
          created_at: string;
          folder_session_id: string | null;
          id: string;
          owner_id: string;
          role: string;
          session_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          folder_session_id?: string | null;
          id?: string;
          owner_id: string;
          role: string;
          session_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          folder_session_id?: string | null;
          id?: string;
          owner_id?: string;
          role?: string;
          session_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_chat_messages_folder_session_id_fkey";
            columns: ["folder_session_id"];
            isOneToOne: false;
            referencedRelation: "folder_chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "analysis_chat_sessions";
            referencedColumns: ["id"];
          },
        ];
      };
      analysis_chat_sessions: {
        Row: {
          created_at: string;
          file_id: string | null;
          id: string;
          model: string | null;
          owner_id: string;
          project_id: string | null;
          provider: string | null;
          repository_id: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          file_id?: string | null;
          id?: string;
          model?: string | null;
          owner_id: string;
          project_id?: string | null;
          provider?: string | null;
          repository_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          file_id?: string | null;
          id?: string;
          model?: string | null;
          owner_id?: string;
          project_id?: string | null;
          provider?: string | null;
          repository_id?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "analysis_chat_sessions_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_chat_sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "analysis_chat_sessions_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      email_send_log: {
        Row: {
          created_at: string;
          error_message: string | null;
          id: string;
          message_id: string | null;
          metadata: Json | null;
          recipient_email: string;
          status: string;
          template_name: string;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          recipient_email: string;
          status: string;
          template_name: string;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          id?: string;
          message_id?: string | null;
          metadata?: Json | null;
          recipient_email?: string;
          status?: string;
          template_name?: string;
        };
        Relationships: [];
      };
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number;
          batch_size: number;
          id: number;
          retry_after_until: string | null;
          send_delay_ms: number;
          transactional_email_ttl_minutes: number;
          updated_at: string;
        };
        Insert: {
          auth_email_ttl_minutes?: number;
          batch_size?: number;
          id?: number;
          retry_after_until?: string | null;
          send_delay_ms?: number;
          transactional_email_ttl_minutes?: number;
          updated_at?: string;
        };
        Update: {
          auth_email_ttl_minutes?: number;
          batch_size?: number;
          id?: number;
          retry_after_until?: string | null;
          send_delay_ms?: number;
          transactional_email_ttl_minutes?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      email_unsubscribe_tokens: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          token: string;
          used_at: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          token: string;
          used_at?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          token?: string;
          used_at?: string | null;
        };
        Relationships: [];
      };
      explanations: {
        Row: {
          content: string;
          created_at: string;
          explanation_type: string;
          file_id: string;
          file_sha256: string;
          id: string;
          language: string;
          model: string | null;
          owner_id: string;
          proficiency: string;
          provider: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          explanation_type: string;
          file_id: string;
          file_sha256: string;
          id?: string;
          language?: string;
          model?: string | null;
          owner_id: string;
          proficiency: string;
          provider: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          explanation_type?: string;
          file_id?: string;
          file_sha256?: string;
          id?: string;
          language?: string;
          model?: string | null;
          owner_id?: string;
          proficiency?: string;
          provider?: string;
        };
        Relationships: [
          {
            foreignKeyName: "explanations_file_id_fkey";
            columns: ["file_id"];
            isOneToOne: false;
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
        ];
      };
      files: {
        Row: {
          created_at: string;
          id: string;
          language: string | null;
          owner_id: string;
          path: string;
          repository_id: string;
          sha256: string;
          size_bytes: number;
          static_decision: string | null;
          static_entropy_global: number | null;
          static_entropy_window: number | null;
          static_last_error: string | null;
          static_scan_finished_at: string | null;
          static_scan_report: Json | null;
          static_scan_started_at: string | null;
          static_scan_status: string;
          storage_path: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          language?: string | null;
          owner_id: string;
          path: string;
          repository_id: string;
          sha256: string;
          size_bytes?: number;
          static_decision?: string | null;
          static_entropy_global?: number | null;
          static_entropy_window?: number | null;
          static_last_error?: string | null;
          static_scan_finished_at?: string | null;
          static_scan_report?: Json | null;
          static_scan_started_at?: string | null;
          static_scan_status?: string;
          storage_path: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          language?: string | null;
          owner_id?: string;
          path?: string;
          repository_id?: string;
          sha256?: string;
          size_bytes?: number;
          static_decision?: string | null;
          static_entropy_global?: number | null;
          static_entropy_window?: number | null;
          static_last_error?: string | null;
          static_scan_finished_at?: string | null;
          static_scan_report?: Json | null;
          static_scan_started_at?: string | null;
          static_scan_status?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: "files_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      folder_chat_sessions: {
        Row: {
          created_at: string;
          folder_path: string;
          id: string;
          model: string | null;
          owner_id: string;
          project_id: string | null;
          provider: string | null;
          repository_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          folder_path: string;
          id?: string;
          model?: string | null;
          owner_id: string;
          project_id?: string | null;
          provider?: string | null;
          repository_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          folder_path?: string;
          id?: string;
          model?: string | null;
          owner_id?: string;
          project_id?: string | null;
          provider?: string | null;
          repository_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "folder_chat_sessions_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "folder_chat_sessions_repository_id_fkey";
            columns: ["repository_id"];
            isOneToOne: false;
            referencedRelation: "repositories";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_audit: {
        Row: {
          action: string;
          actor: string | null;
          at: string;
          diff: Json;
          entry_id: string | null;
          id: string;
          opportunity_id: string | null;
        };
        Insert: {
          action: string;
          actor?: string | null;
          at?: string;
          diff?: Json;
          entry_id?: string | null;
          id?: string;
          opportunity_id?: string | null;
        };
        Update: {
          action?: string;
          actor?: string | null;
          at?: string;
          diff?: Json;
          entry_id?: string | null;
          id?: string;
          opportunity_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_audit_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_audit_opportunity_id_fkey";
            columns: ["opportunity_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_opportunities";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_edges: {
        Row: {
          auto_generated: boolean;
          created_at: string;
          from_entry: string;
          relation: string;
          to_entry: string;
          weight: number;
        };
        Insert: {
          auto_generated?: boolean;
          created_at?: string;
          from_entry: string;
          relation?: string;
          to_entry: string;
          weight?: number;
        };
        Update: {
          auto_generated?: boolean;
          created_at?: string;
          from_entry?: string;
          relation?: string;
          to_entry?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_edges_from_entry_fkey";
            columns: ["from_entry"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "knowledge_edges_to_entry_fkey";
            columns: ["to_entry"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      knowledge_entries: {
        Row: {
          category: string | null;
          created_at: string;
          created_by: string | null;
          difficulty: number;
          doc_impact: number;
          id: string;
          lang_default: string;
          priority: number;
          published_at: string | null;
          related_slugs: string[];
          reviewed_by: string | null;
          seo_impact: number;
          slug: string;
          source: Database["public"]["Enums"]["knowledge_entry_source"];
          source_ref: Json;
          status: Database["public"]["Enums"]["knowledge_entry_status"];
          tags: string[];
          type: Database["public"]["Enums"]["knowledge_entry_type"];
          updated_at: string;
        };
        Insert: {
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          difficulty?: number;
          doc_impact?: number;
          id?: string;
          lang_default?: string;
          priority?: number;
          published_at?: string | null;
          related_slugs?: string[];
          reviewed_by?: string | null;
          seo_impact?: number;
          slug: string;
          source?: Database["public"]["Enums"]["knowledge_entry_source"];
          source_ref?: Json;
          status?: Database["public"]["Enums"]["knowledge_entry_status"];
          tags?: string[];
          type: Database["public"]["Enums"]["knowledge_entry_type"];
          updated_at?: string;
        };
        Update: {
          category?: string | null;
          created_at?: string;
          created_by?: string | null;
          difficulty?: number;
          doc_impact?: number;
          id?: string;
          lang_default?: string;
          priority?: number;
          published_at?: string | null;
          related_slugs?: string[];
          reviewed_by?: string | null;
          seo_impact?: number;
          slug?: string;
          source?: Database["public"]["Enums"]["knowledge_entry_source"];
          source_ref?: Json;
          status?: Database["public"]["Enums"]["knowledge_entry_status"];
          tags?: string[];
          type?: Database["public"]["Enums"]["knowledge_entry_type"];
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_opportunities: {
        Row: {
          created_at: string;
          difficulty: number;
          doc_impact: number;
          eta_minutes: number | null;
          generated_from: Json;
          id: string;
          keywords: string[];
          kind: string;
          priority: number;
          rationale: string | null;
          related_entries: string[];
          seo_impact: number;
          source: Database["public"]["Enums"]["knowledge_entry_source"];
          status: Database["public"]["Enums"]["knowledge_opportunity_status"];
          suggested_slug: string | null;
          suggested_type: Database["public"]["Enums"]["knowledge_entry_type"] | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          difficulty?: number;
          doc_impact?: number;
          eta_minutes?: number | null;
          generated_from?: Json;
          id?: string;
          keywords?: string[];
          kind: string;
          priority?: number;
          rationale?: string | null;
          related_entries?: string[];
          seo_impact?: number;
          source?: Database["public"]["Enums"]["knowledge_entry_source"];
          status?: Database["public"]["Enums"]["knowledge_opportunity_status"];
          suggested_slug?: string | null;
          suggested_type?: Database["public"]["Enums"]["knowledge_entry_type"] | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          difficulty?: number;
          doc_impact?: number;
          eta_minutes?: number | null;
          generated_from?: Json;
          id?: string;
          keywords?: string[];
          kind?: string;
          priority?: number;
          rationale?: string | null;
          related_entries?: string[];
          seo_impact?: number;
          source?: Database["public"]["Enums"]["knowledge_entry_source"];
          status?: Database["public"]["Enums"]["knowledge_opportunity_status"];
          suggested_slug?: string | null;
          suggested_type?: Database["public"]["Enums"]["knowledge_entry_type"] | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      knowledge_sources: {
        Row: {
          id: string;
          ingested_at: string;
          kind: string;
          payload: Json;
          ref: string | null;
          sha: string | null;
        };
        Insert: {
          id?: string;
          ingested_at?: string;
          kind: string;
          payload?: Json;
          ref?: string | null;
          sha?: string | null;
        };
        Update: {
          id?: string;
          ingested_at?: string;
          kind?: string;
          payload?: Json;
          ref?: string | null;
          sha?: string | null;
        };
        Relationships: [];
      };
      knowledge_translations: {
        Row: {
          body_md: string | null;
          created_at: string;
          entry_id: string;
          faq: Json;
          glossary: Json;
          id: string;
          keywords: string[];
          lang: string;
          meta_description: string | null;
          meta_title: string | null;
          og_image: string | null;
          summary: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          body_md?: string | null;
          created_at?: string;
          entry_id: string;
          faq?: Json;
          glossary?: Json;
          id?: string;
          keywords?: string[];
          lang: string;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image?: string | null;
          summary?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          body_md?: string | null;
          created_at?: string;
          entry_id?: string;
          faq?: Json;
          glossary?: Json;
          id?: string;
          keywords?: string[];
          lang?: string;
          meta_description?: string | null;
          meta_title?: string | null;
          og_image?: string | null;
          summary?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "knowledge_translations_entry_id_fkey";
            columns: ["entry_id"];
            isOneToOne: false;
            referencedRelation: "knowledge_entries";
            referencedColumns: ["id"];
          },
        ];
      };
      maintenance_audit_log: {
        Row: {
          created_at: string;
          duration_ms: number | null;
          error: string | null;
          finished_at: string | null;
          id: string;
          job_name: string;
          request_id: string | null;
          started_at: string;
          stats: Json;
          status: string;
        };
        Insert: {
          created_at?: string;
          duration_ms?: number | null;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          job_name: string;
          request_id?: string | null;
          started_at?: string;
          stats?: Json;
          status: string;
        };
        Update: {
          created_at?: string;
          duration_ms?: number | null;
          error?: string | null;
          finished_at?: string | null;
          id?: string;
          job_name?: string;
          request_id?: string | null;
          started_at?: string;
          stats?: Json;
          status?: string;
        };
        Relationships: [];
      };
      password_reset_challenges: {
        Row: {
          attempts: number;
          code_hash: string;
          consumed_at: string | null;
          created_at: string;
          expires_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          attempts?: number;
          code_hash: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          attempts?: number;
          code_hash?: string;
          consumed_at?: string | null;
          created_at?: string;
          expires_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
          preferred_explanation_type: string;
          preferred_language: string;
          preferred_proficiency: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
          preferred_explanation_type?: string;
          preferred_language?: string;
          preferred_proficiency?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
          preferred_explanation_type?: string;
          preferred_language?: string;
          preferred_proficiency?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          analysis_mode: string;
          created_at: string;
          description: string | null;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          analysis_mode?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          analysis_mode?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      repositories: {
        Row: {
          created_at: string;
          file_count: number;
          id: string;
          name: string;
          owner_id: string;
          project_id: string;
          source: string;
        };
        Insert: {
          created_at?: string;
          file_count?: number;
          id?: string;
          name: string;
          owner_id: string;
          project_id: string;
          source?: string;
        };
        Update: {
          created_at?: string;
          file_count?: number;
          id?: string;
          name?: string;
          owner_id?: string;
          project_id?: string;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "repositories_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      suppressed_emails: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          metadata: Json | null;
          reason: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          metadata?: Json | null;
          reason: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          metadata?: Json | null;
          reason?: string;
        };
        Relationships: [];
      };
      user_acknowledgements: {
        Row: {
          accepted_at: string;
          accepted_language: string;
          accepted_terms_version: string;
          acknowledgement_type: string;
          id: string;
          ip_address: unknown;
          user_agent: string | null;
          user_id: string;
        };
        Insert: {
          accepted_at?: string;
          accepted_language: string;
          accepted_terms_version: string;
          acknowledgement_type: string;
          id?: string;
          ip_address?: unknown;
          user_agent?: string | null;
          user_id: string;
        };
        Update: {
          accepted_at?: string;
          accepted_language?: string;
          accepted_terms_version?: string;
          acknowledgement_type?: string;
          id?: string;
          ip_address?: unknown;
          user_agent?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_ai_credentials: {
        Row: {
          created_at: string;
          encrypted_key: string;
          id: string;
          key_hint: string | null;
          owner_id: string;
          provider: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          encrypted_key: string;
          id?: string;
          key_hint?: string | null;
          owner_id: string;
          provider: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          encrypted_key?: string;
          id?: string;
          key_hint?: string | null;
          owner_id?: string;
          provider?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_local_endpoints: {
        Row: {
          base_url: string;
          created_at: string;
          default_model: string | null;
          id: string;
          kind: string;
          owner_id: string;
          updated_at: string;
        };
        Insert: {
          base_url: string;
          created_at?: string;
          default_model?: string | null;
          id?: string;
          kind: string;
          owner_id: string;
          updated_at?: string;
        };
        Update: {
          base_url?: string;
          created_at?: string;
          default_model?: string | null;
          id?: string;
          kind?: string;
          owner_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      user_ai_credentials_safe: {
        Row: {
          created_at: string | null;
          id: string | null;
          key_hint: string | null;
          owner_id: string | null;
          provider: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string | null;
          key_hint?: string | null;
          owner_id?: string | null;
          provider?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string | null;
          key_hint?: string | null;
          owner_id?: string | null;
          provider?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      admin_reschedule_cron: {
        Args: { _command: string; _job_name: string; _schedule: string };
        Returns: undefined;
      };
      delete_email: {
        Args: { message_id: number; queue_name: string };
        Returns: boolean;
      };
      email_queue_dispatch: { Args: never; Returns: undefined };
      enqueue_email: {
        Args: { payload: Json; queue_name: string };
        Returns: number;
      };
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      move_to_dlq: {
        Args: {
          dlq_name: string;
          message_id: number;
          payload: Json;
          source_queue: string;
        };
        Returns: number;
      };
      promote_to_admin: { Args: { _email: string }; Returns: undefined };
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number };
        Returns: {
          message: Json;
          msg_id: number;
          read_ct: number;
        }[];
      };
    };
    Enums: {
      app_role: "admin" | "user";
      knowledge_entry_source: "manual" | "pr" | "changelog" | "codebase_scan" | "user_doc";
      knowledge_entry_status: "ai_draft" | "in_review" | "published" | "archived";
      knowledge_entry_type:
        | "capability"
        | "concept"
        | "integration"
        | "format"
        | "case_study"
        | "guide";
      knowledge_opportunity_status: "open" | "accepted" | "dismissed" | "converted";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      knowledge_entry_source: ["manual", "pr", "changelog", "codebase_scan", "user_doc"],
      knowledge_entry_status: ["ai_draft", "in_review", "published", "archived"],
      knowledge_entry_type: [
        "capability",
        "concept",
        "integration",
        "format",
        "case_study",
        "guide",
      ],
      knowledge_opportunity_status: ["open", "accepted", "dismissed", "converted"],
    },
  },
} as const;
