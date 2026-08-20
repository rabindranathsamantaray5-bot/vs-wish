export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      ai_settings: {
        Row: {
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          active: boolean | null;
          bg: string | null;
          created_at: string | null;
          id: string;
          img: string | null;
          name: string;
          order: number | null;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          bg?: string | null;
          created_at?: string | null;
          id?: string;
          img?: string | null;
          name: string;
          order?: number | null;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          bg?: string | null;
          created_at?: string | null;
          id?: string;
          img?: string | null;
          name?: string;
          order?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          created_at: string | null;
          id: string;
          is_spam: boolean;
          message: string | null;
          moderated_at: string | null;
          moderated_by: string | null;
          moderation_status: string;
          name: string | null;
          reaction: string | null;
          user_id: string | null;
          wish_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          is_spam?: boolean;
          message?: string | null;
          moderated_at?: string | null;
          moderated_by?: string | null;
          moderation_status?: string;
          name?: string | null;
          reaction?: string | null;
          user_id?: string | null;
          wish_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          is_spam?: boolean;
          message?: string | null;
          moderated_at?: string | null;
          moderated_by?: string | null;
          moderation_status?: string;
          name?: string | null;
          reaction?: string | null;
          user_id?: string | null;
          wish_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_wish_id_fkey";
            columns: ["wish_id"];
            isOneToOne: false;
            referencedRelation: "wishes";
            referencedColumns: ["id"];
          },
        ];
      };
      coupons: {
        Row: {
          code: string;
          created_at: string | null;
          description: string | null;
          discount_type: string;
          discount_value: number;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          maximum_discount: number | null;
          minimum_amount: number;
          per_user_limit: number | null;
          starts_at: string | null;
          updated_at: string | null;
          usage_count: number;
          usage_limit: number | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          maximum_discount?: number | null;
          minimum_amount?: number;
          per_user_limit?: number | null;
          starts_at?: string | null;
          updated_at?: string | null;
          usage_count?: number;
          usage_limit?: number | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          description?: string | null;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          maximum_discount?: number | null;
          minimum_amount?: number;
          per_user_limit?: number | null;
          starts_at?: string | null;
          updated_at?: string | null;
          usage_count?: number;
          usage_limit?: number | null;
        };
        Relationships: [];
      };
      media_library: {
        Row: {
          attribution: string | null;
          created_at: string | null;
          file_size: number | null;
          id: string;
          mime_type: string | null;
          storage_path: string | null;
          tags: string | null;
          title: string | null;
          type: string | null;
          updated_at: string | null;
          url: string;
        };
        Insert: {
          attribution?: string | null;
          created_at?: string | null;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          storage_path?: string | null;
          tags?: string | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          url: string;
        };
        Update: {
          attribution?: string | null;
          created_at?: string | null;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
          storage_path?: string | null;
          tags?: string | null;
          title?: string | null;
          type?: string | null;
          updated_at?: string | null;
          url?: string;
        };
        Relationships: [];
      };
      plans: {
        Row: {
          billing_period: string;
          created_at: string | null;
          currency: string;
          description: string | null;
          display_order: number;
          features: Json;
          id: string;
          is_active: boolean;
          is_visible: boolean;
          name: string;
          price: number;
          slug: string;
          updated_at: string | null;
        };
        Insert: {
          billing_period?: string;
          created_at?: string | null;
          currency?: string;
          description?: string | null;
          display_order?: number;
          features?: Json;
          id?: string;
          is_active?: boolean;
          is_visible?: boolean;
          name: string;
          price?: number;
          slug: string;
          updated_at?: string | null;
        };
        Update: {
          billing_period?: string;
          created_at?: string | null;
          currency?: string;
          description?: string | null;
          display_order?: number;
          features?: Json;
          id?: string;
          is_active?: boolean;
          is_visible?: boolean;
          name?: string;
          price?: number;
          slug?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string | null;
          id: string;
          name: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          name?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          amount: number;
          created_at: string | null;
          id: string;
          status: string | null;
          template_id: string | null;
          user_id: string;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          id?: string;
          status?: string | null;
          template_id?: string | null;
          user_id: string;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          id?: string;
          status?: string | null;
          template_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
      system_settings: {
        Row: {
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          active: boolean | null;
          badge: string | null;
          category_id: string | null;
          created_at: string | null;
          discount_price: number | null;
          id: string;
          is_premium: boolean | null;
          label: string | null;
          order: number | null;
          pages: number | null;
          photo: string | null;
          price: number | null;
          sub: string | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          active?: boolean | null;
          badge?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          discount_price?: number | null;
          id?: string;
          is_premium?: boolean | null;
          label?: string | null;
          order?: number | null;
          pages?: number | null;
          photo?: string | null;
          price?: number | null;
          sub?: string | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          active?: boolean | null;
          badge?: string | null;
          category_id?: string | null;
          created_at?: string | null;
          discount_price?: number | null;
          id?: string;
          is_premium?: boolean | null;
          label?: string | null;
          order?: number | null;
          pages?: number | null;
          photo?: string | null;
          price?: number | null;
          sub?: string | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "templates_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      user_roles: {
        Row: {
          created_at: string | null;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
      website_settings: {
        Row: {
          key: string;
          updated_at: string | null;
          value: Json;
        };
        Insert: {
          key: string;
          updated_at?: string | null;
          value: Json;
        };
        Update: {
          key?: string;
          updated_at?: string | null;
          value?: Json;
        };
        Relationships: [];
      };
      wish_photos: {
        Row: {
          created_at: string | null;
          id: string;
          order: number | null;
          url: string;
          wish_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          order?: number | null;
          url: string;
          wish_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          order?: number | null;
          url?: string;
          wish_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wish_photos_wish_id_fkey";
            columns: ["wish_id"];
            isOneToOne: false;
            referencedRelation: "wishes";
            referencedColumns: ["id"];
          },
        ];
      };
      wishes: {
        Row: {
          cover_url: string | null;
          created_at: string | null;
          details: string | null;
          event_date: string | null;
          from_name: string | null;
          id: string;
          message: string | null;
          music_url: string | null;
          password_hash: string | null;
          recipient: string | null;
          slug: string;
          template_id: string | null;
          theme: string | null;
          title: string | null;
          updated_at: string | null;
          user_id: string | null;
          video_url: string | null;
          views: number | null;
        };
        Insert: {
          cover_url?: string | null;
          created_at?: string | null;
          details?: string | null;
          event_date?: string | null;
          from_name?: string | null;
          id?: string;
          message?: string | null;
          music_url?: string | null;
          password_hash?: string | null;
          recipient?: string | null;
          slug: string;
          template_id?: string | null;
          theme?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          video_url?: string | null;
          views?: number | null;
        };
        Update: {
          cover_url?: string | null;
          created_at?: string | null;
          details?: string | null;
          event_date?: string | null;
          from_name?: string | null;
          id?: string;
          message?: string | null;
          music_url?: string | null;
          password_hash?: string | null;
          recipient?: string | null;
          slug?: string;
          template_id?: string | null;
          theme?: string | null;
          title?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          video_url?: string | null;
          views?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "wishes_template_id_fkey";
            columns: ["template_id"];
            isOneToOne: false;
            referencedRelation: "templates";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      increment_wish_view: { Args: { wish_id: string }; Returns: undefined };
    };
    Enums: {
      app_role: "admin" | "user";
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    },
  },
} as const;
