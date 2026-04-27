export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      about_values: {
        Row: {
          description_en: string | null
          description_fr: string | null
          icon: string | null
          id: string
          sort_order: number
          title_en: string
          title_fr: string
        }
        Insert: {
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title_en: string
          title_fr: string
        }
        Update: {
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title_en?: string
          title_fr?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author: string | null
          canonical_url: string | null
          category: string | null
          content_en: string | null
          content_fr: string | null
          cover_image: string | null
          created_at: string
          excerpt_en: string | null
          excerpt_fr: string | null
          focus_keyword: string | null
          h1_en: string | null
          h1_fr: string | null
          h2_en: string | null
          h2_fr: string | null
          id: string
          meta_robots: string | null
          og_description_en: string | null
          og_description_fr: string | null
          og_image: string | null
          og_title_en: string | null
          og_title_fr: string | null
          published: boolean
          published_at: string | null
          reading_time_minutes: number | null
          seo_description_en: string | null
          seo_description_fr: string | null
          seo_keywords: string | null
          seo_title_en: string | null
          seo_title_fr: string | null
          slug: string
          structured_data_type: string | null
          tags: string[] | null
          title_en: string
          title_fr: string
          twitter_card: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          canonical_url?: string | null
          category?: string | null
          content_en?: string | null
          content_fr?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_fr?: string | null
          focus_keyword?: string | null
          h1_en?: string | null
          h1_fr?: string | null
          h2_en?: string | null
          h2_fr?: string | null
          id?: string
          meta_robots?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          seo_description_en?: string | null
          seo_description_fr?: string | null
          seo_keywords?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          slug: string
          structured_data_type?: string | null
          tags?: string[] | null
          title_en: string
          title_fr: string
          twitter_card?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          canonical_url?: string | null
          category?: string | null
          content_en?: string | null
          content_fr?: string | null
          cover_image?: string | null
          created_at?: string
          excerpt_en?: string | null
          excerpt_fr?: string | null
          focus_keyword?: string | null
          h1_en?: string | null
          h1_fr?: string | null
          h2_en?: string | null
          h2_fr?: string | null
          id?: string
          meta_robots?: string | null
          og_description_en?: string | null
          og_description_fr?: string | null
          og_image?: string | null
          og_title_en?: string | null
          og_title_fr?: string | null
          published?: boolean
          published_at?: string | null
          reading_time_minutes?: number | null
          seo_description_en?: string | null
          seo_description_fr?: string | null
          seo_keywords?: string | null
          seo_title_en?: string | null
          seo_title_fr?: string | null
          slug?: string
          structured_data_type?: string | null
          tags?: string[] | null
          title_en?: string
          title_fr?: string
          twitter_card?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          company: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          message: string
          phone: string | null
          read: boolean
          service_interest: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          message: string
          phone?: string | null
          read?: boolean
          service_interest?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          message?: string
          phone?: string | null
          read?: boolean
          service_interest?: string | null
        }
        Relationships: []
      }
      home_pillars: {
        Row: {
          description_en: string | null
          description_fr: string | null
          icon: string | null
          id: string
          sort_order: number
          title_en: string
          title_fr: string
        }
        Insert: {
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title_en: string
          title_fr: string
        }
        Update: {
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          sort_order?: number
          title_en?: string
          title_fr?: string
        }
        Relationships: []
      }
      home_stats: {
        Row: {
          id: string
          label_en: string
          label_fr: string
          sort_order: number
          value: string
        }
        Insert: {
          id?: string
          label_en: string
          label_fr: string
          sort_order?: number
          value: string
        }
        Update: {
          id?: string
          label_en?: string
          label_fr?: string
          sort_order?: number
          value?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          cover_image: string | null
          created_at: string
          description_en: string | null
          description_fr: string | null
          icon: string | null
          id: string
          number: string
          slug: string
          sort_order: number
          tagline_en: string | null
          tagline_fr: string | null
          title_en: string
          title_fr: string
          updated_at: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          number: string
          slug: string
          sort_order?: number
          tagline_en?: string | null
          tagline_fr?: string | null
          title_en: string
          title_fr: string
          updated_at?: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          icon?: string | null
          id?: string
          number?: string
          slug?: string
          sort_order?: number
          tagline_en?: string | null
          tagline_fr?: string | null
          title_en?: string
          title_fr?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_story_en: string | null
          about_story_fr: string | null
          address_en: string | null
          address_fr: string | null
          contact_email: string | null
          contact_phone: string | null
          default_og_image: string | null
          default_seo_description_en: string | null
          default_seo_description_fr: string | null
          default_seo_title_en: string | null
          default_seo_title_fr: string | null
          differentiator_en: string | null
          differentiator_fr: string | null
          hero_headline_en: string | null
          hero_headline_fr: string | null
          hero_sub_en: string | null
          hero_sub_fr: string | null
          id: string
          linkedin_url: string | null
          mission_en: string | null
          mission_fr: string | null
          organization_logo: string | null
          organization_name: string | null
          site_name: string | null
          team_culture_en: string | null
          team_culture_fr: string | null
          twitter_handle: string | null
          updated_at: string
          vision_en: string | null
          vision_fr: string | null
        }
        Insert: {
          about_story_en?: string | null
          about_story_fr?: string | null
          address_en?: string | null
          address_fr?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          default_og_image?: string | null
          default_seo_description_en?: string | null
          default_seo_description_fr?: string | null
          default_seo_title_en?: string | null
          default_seo_title_fr?: string | null
          differentiator_en?: string | null
          differentiator_fr?: string | null
          hero_headline_en?: string | null
          hero_headline_fr?: string | null
          hero_sub_en?: string | null
          hero_sub_fr?: string | null
          id?: string
          linkedin_url?: string | null
          mission_en?: string | null
          mission_fr?: string | null
          organization_logo?: string | null
          organization_name?: string | null
          site_name?: string | null
          team_culture_en?: string | null
          team_culture_fr?: string | null
          twitter_handle?: string | null
          updated_at?: string
          vision_en?: string | null
          vision_fr?: string | null
        }
        Update: {
          about_story_en?: string | null
          about_story_fr?: string | null
          address_en?: string | null
          address_fr?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          default_og_image?: string | null
          default_seo_description_en?: string | null
          default_seo_description_fr?: string | null
          default_seo_title_en?: string | null
          default_seo_title_fr?: string | null
          differentiator_en?: string | null
          differentiator_fr?: string | null
          hero_headline_en?: string | null
          hero_headline_fr?: string | null
          hero_sub_en?: string | null
          hero_sub_fr?: string | null
          id?: string
          linkedin_url?: string | null
          mission_en?: string | null
          mission_fr?: string | null
          organization_logo?: string | null
          organization_name?: string | null
          site_name?: string | null
          team_culture_en?: string | null
          team_culture_fr?: string | null
          twitter_handle?: string | null
          updated_at?: string
          vision_en?: string | null
          vision_fr?: string | null
        }
        Relationships: []
      }
      sub_services: {
        Row: {
          best_for_en: string | null
          best_for_fr: string | null
          created_at: string
          id: string
          number: string
          service_id: string
          slug: string
          sort_order: number
          title_en: string
          title_fr: string
          updated_at: string
          what_it_is_en: string | null
          what_it_is_fr: string | null
          whats_included_en: string[] | null
          whats_included_fr: string[] | null
          why_it_matters_en: string | null
          why_it_matters_fr: string | null
        }
        Insert: {
          best_for_en?: string | null
          best_for_fr?: string | null
          created_at?: string
          id?: string
          number: string
          service_id: string
          slug: string
          sort_order?: number
          title_en: string
          title_fr: string
          updated_at?: string
          what_it_is_en?: string | null
          what_it_is_fr?: string | null
          whats_included_en?: string[] | null
          whats_included_fr?: string[] | null
          why_it_matters_en?: string | null
          why_it_matters_fr?: string | null
        }
        Update: {
          best_for_en?: string | null
          best_for_fr?: string | null
          created_at?: string
          id?: string
          number?: string
          service_id?: string
          slug?: string
          sort_order?: number
          title_en?: string
          title_fr?: string
          updated_at?: string
          what_it_is_en?: string | null
          what_it_is_fr?: string | null
          whats_included_en?: string[] | null
          whats_included_fr?: string[] | null
          why_it_matters_en?: string | null
          why_it_matters_fr?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sub_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "editor", "user"],
    },
  },
} as const
