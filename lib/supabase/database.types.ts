// Mirrors supabase/migrations in the Jobin repo. Regenerate once the project exists:
//   npx supabase gen types typescript --project-id <project-ref> > lib/supabase/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          email: string
          username: string
          phone: string | null
          occupation: string | null
          location: string | null
          description: string | null
          experience: string | null
          skills: string[]
          photo_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: never
        Update: {
          username?: string
          phone?: string | null
          occupation?: string | null
          location?: string | null
          description?: string | null
          experience?: string | null
          skills?: string[]
          photo_path?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          id: string
          employer_id: string
          employer_name: string
          title: string
          category: string
          location: string
          pay: string
          description: string
          image_path: string | null
          status: Database["public"]["Enums"]["job_status"]
          posted_at: string
        }
        Insert: {
          title: string
          category: string
          location?: string
          pay?: string
          description?: string
          image_path?: string | null
        }
        Update: {
          title?: string
          category?: string
          location?: string
          pay?: string
          description?: string
          image_path?: string | null
          status?: Database["public"]["Enums"]["job_status"]
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          id: string
          job_id: string
          applicant_id: string
          status: Database["public"]["Enums"]["application_status"]
          applied_at: string
        }
        Insert: {
          job_id: string
        }
        Update: {
          status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          id: string
          title: string
          category: string
          level: string
          duration: string
          image_url: string
          description: string
          author: string | null
          rating: number | null
          lessons: Json
          created_at: string
        }
        Insert: never
        Update: never
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_rate_limit: {
        Args: { p_bucket: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      my_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      user_role: "worker" | "employer"
      job_status: "open" | "closed"
      application_status: "pending" | "accepted" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicTables = Database["public"]["Tables"]
export type ProfileRow = PublicTables["profiles"]["Row"]
export type JobRow = PublicTables["jobs"]["Row"]
export type ApplicationRow = PublicTables["applications"]["Row"]
export type CourseRow = PublicTables["courses"]["Row"]
export type UserRole = Database["public"]["Enums"]["user_role"]
