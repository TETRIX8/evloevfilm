export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assignments: {
        Row: {
          created_at: string
          description: string
          due_date: string
          id: string
          teacher_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          due_date: string
          id?: string
          teacher_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          teacher_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          user_name?: string
        }
        Relationships: []
      }
      chat_room_participants: {
        Row: {
          chat_room_id: string
          user_id: string
        }
        Insert: {
          chat_room_id: string
          user_id: string
        }
        Update: {
          chat_room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_room_participants_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_room_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      connection_clicks: {
        Row: {
          created_at: string | null
          id: number
          key_id: string
          platform: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          key_id: string
          platform: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          key_id?: string
          platform?: string
          user_id?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          file_path: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          file_path: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          file_path?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grades: {
        Row: {
          created_at: string
          date: string
          id: string
          student_id: string | null
          value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          student_id?: string | null
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          student_id?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      key_selections: {
        Row: {
          created_at: string | null
          id: number
          key_id: string
          key_name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          key_id: string
          key_name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          key_id?: string
          key_name?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string | null
          created_at: string
          file_type: string | null
          file_url: string | null
          id: string
          receiver_id: string
          sender_id: string
          status: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          receiver_id: string
          sender_id: string
          status?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string
          file_type?: string | null
          file_url?: string | null
          id?: string
          receiver_id?: string
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      movie_details: {
        Row: {
          created_at: string
          description: string | null
          genres: string[] | null
          id: string
          rating: number | null
          title: string
          year: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          genres?: string[] | null
          id?: string
          rating?: number | null
          title: string
          year?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          genres?: string[] | null
          id?: string
          rating?: number | null
          title?: string
          year?: number | null
        }
        Relationships: []
      }
      movie_room_messages: {
        Row: {
          created_at: string | null
          id: string
          is_system_message: boolean | null
          message: string
          room_code: string
          sender_nickname: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          message: string
          room_code: string
          sender_nickname: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_system_message?: boolean | null
          message?: string
          room_code?: string
          sender_nickname?: string
        }
        Relationships: []
      }
      movie_rooms: {
        Row: {
          created_at: string
          creator_id: string | null
          id: string
          is_active: boolean
          movie_id: number
          movie_iframe_url: string
          movie_name: string
          movie_poster: string | null
          movie_type: string | null
          movie_year: number | null
          password: string | null
          room_code: string
        }
        Insert: {
          created_at?: string
          creator_id?: string | null
          id?: string
          is_active?: boolean
          movie_id: number
          movie_iframe_url: string
          movie_name: string
          movie_poster?: string | null
          movie_type?: string | null
          movie_year?: number | null
          password?: string | null
          room_code: string
        }
        Update: {
          created_at?: string
          creator_id?: string | null
          id?: string
          is_active?: boolean
          movie_id?: number
          movie_iframe_url?: string
          movie_name?: string
          movie_poster?: string | null
          movie_type?: string | null
          movie_year?: number | null
          password?: string | null
          room_code?: string
        }
        Relationships: []
      }
      playback_states: {
        Row: {
          id: string
          is_playing: boolean
          last_updated: string
          playback_time: number
          room_id: string
        }
        Insert: {
          id?: string
          is_playing?: boolean
          last_updated?: string
          playback_time?: number
          room_id: string
        }
        Update: {
          id?: string
          is_playing?: boolean
          last_updated?: string
          playback_time?: number
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "playback_states_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "active_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playback_states_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "movie_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          preview_url: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          preview_url?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          preview_url?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      publication_authors: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          name: string
          publication_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name: string
          publication_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          name?: string
          publication_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "publication_authors_publication_id_fkey"
            columns: ["publication_id"]
            isOneToOne: false
            referencedRelation: "publications"
            referencedColumns: ["id"]
          },
        ]
      }
      publications: {
        Row: {
          abstract: string
          author_id: string | null
          category: string
          comments_count: number | null
          content: string
          cover_image: string | null
          created_at: string | null
          date: string
          id: string
          saved: boolean | null
          tags: string[] | null
          title: string
        }
        Insert: {
          abstract: string
          author_id?: string | null
          category: string
          comments_count?: number | null
          content: string
          cover_image?: string | null
          created_at?: string | null
          date?: string
          id?: string
          saved?: boolean | null
          tags?: string[] | null
          title: string
        }
        Update: {
          abstract?: string
          author_id?: string | null
          category?: string
          comments_count?: number | null
          content?: string
          cover_image?: string | null
          created_at?: string | null
          date?: string
          id?: string
          saved?: boolean | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string | null
          referrer_id: string
          status: Database["public"]["Enums"]["referral_status"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id?: string | null
          referrer_id: string
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          referrer_id?: string
          status?: Database["public"]["Enums"]["referral_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          content: string
          created_at: string
          id: string
          name: string
          rating: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          name: string
          rating: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          name?: string
          rating?: number
        }
        Relationships: []
      }
      room_participants: {
        Row: {
          id: string
          is_leader: boolean
          joined_at: string
          nickname: string
          room_id: string
          user_id: string | null
        }
        Insert: {
          id?: string
          is_leader?: boolean
          joined_at?: string
          nickname: string
          room_id: string
          user_id?: string | null
        }
        Update: {
          id?: string
          is_leader?: boolean
          joined_at?: string
          nickname?: string
          room_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "active_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "movie_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_movies: {
        Row: {
          id: string
          image: string | null
          link: string
          saved_at: string
          title: string
          user_id: string
        }
        Insert: {
          id?: string
          image?: string | null
          link: string
          saved_at?: string
          title: string
          user_id: string
        }
        Update: {
          id?: string
          image?: string | null
          link?: string
          saved_at?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_movies_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      simple_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_name?: string
        }
        Relationships: []
      }
      site_statistics: {
        Row: {
          id: string
          page_views: number | null
          unique_visitors: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          page_views?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          page_views?: number | null
          unique_visitors?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      student_performance: {
        Row: {
          attendance_percent: number
          average_grade: number
          created_at: string
          id: string
          max_score_points: number
          score_points: number
          student_id: string
          study_period_name: string
          study_period_status: Database["public"]["Enums"]["study_period_status"]
          updated_at: string
        }
        Insert: {
          attendance_percent: number
          average_grade: number
          created_at?: string
          id?: string
          max_score_points: number
          score_points: number
          student_id: string
          study_period_name: string
          study_period_status: Database["public"]["Enums"]["study_period_status"]
          updated_at?: string
        }
        Update: {
          attendance_percent?: number
          average_grade?: number
          created_at?: string
          id?: string
          max_score_points?: number
          score_points?: number
          student_id?: string
          study_period_name?: string
          study_period_status?: Database["public"]["Enums"]["study_period_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_performance_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["student_id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          student_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          student_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          student_id?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "study_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      study_groups: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      submissions: {
        Row: {
          assignment_id: string
          content: string | null
          feedback: string | null
          file_url: string | null
          grade: number | null
          id: string
          student_id: string
          submitted_at: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          student_id: string
          submitted_at?: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          feedback?: string | null
          file_url?: string | null
          grade?: number | null
          id?: string
          student_id?: string
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_visits: {
        Row: {
          created_at: string | null
          id: number
          ip_address: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_chat_participants: {
        Row: {
          id: string
          joined_at: string | null
          participant_nickname: string
          room_code: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          participant_nickname: string
          room_code: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          participant_nickname?: string
          room_code?: string
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          id: string
          image: string | null
          last_watched: string
          link: string
          progress: number | null
          title: string
          user_id: string
        }
        Insert: {
          id?: string
          image?: string | null
          last_watched?: string
          link: string
          progress?: number | null
          title: string
          user_id: string
        }
        Update: {
          id?: string
          image?: string | null
          last_watched?: string
          link?: string
          progress?: number | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      active_rooms: {
        Row: {
          created_at: string | null
          has_password: boolean | null
          id: string | null
          movie_name: string | null
          movie_poster: string | null
          movie_type: string | null
          movie_year: number | null
          room_code: string | null
          viewer_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_referral_code: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
      referral_status: "pending" | "completed"
      study_period_status: "STARTED" | "FINISHED"
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      referral_status: ["pending", "completed"],
      study_period_status: ["STARTED", "FINISHED"],
      user_role: ["admin", "user"],
    },
  },
} as const
