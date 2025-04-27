export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          online_status: string | null
          last_seen: string | null
          twitter_handle: string | null
          youtube_handle: string | null
          tiktok_url: string | null
          tiktok_handle: string | null
          kick_url: string | null
          kick_handle: string | null
          email_notifications: boolean | null
          push_notifications: boolean | null
          tournament_notifications: boolean | null
          match_notifications: boolean | null
          team_notifications: boolean | null
          friend_notifications: boolean | null
          message_notifications: boolean | null
          marketing_notifications: boolean | null
          theme_preference: string | null
          accent_color: string | null
          font_size: string | null
          profile_visibility: string | null
          show_online_status: boolean | null
          show_activity: boolean | null
          allow_friend_requests: boolean | null
          allow_team_invites: boolean | null
          allow_direct_messages: string | null
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          online_status?: string | null
          last_seen?: string | null
          twitter_handle?: string | null
          youtube_handle?: string | null
          tiktok_url?: string | null
          tiktok_handle?: string | null
          kick_url?: string | null
          kick_handle?: string | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          tournament_notifications?: boolean | null
          match_notifications?: boolean | null
          team_notifications?: boolean | null
          friend_notifications?: boolean | null
          message_notifications?: boolean | null
          marketing_notifications?: boolean | null
          theme_preference?: string | null
          accent_color?: string | null
          font_size?: string | null
          profile_visibility?: string | null
          show_online_status?: boolean | null
          show_activity?: boolean | null
          allow_friend_requests?: boolean | null
          allow_team_invites?: boolean | null
          allow_direct_messages?: string | null
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          online_status?: string | null
          last_seen?: string | null
          twitter_handle?: string | null
          youtube_handle?: string | null
          tiktok_url?: string | null
          tiktok_handle?: string | null
          kick_url?: string | null
          kick_handle?: string | null
          email_notifications?: boolean | null
          push_notifications?: boolean | null
          tournament_notifications?: boolean | null
          match_notifications?: boolean | null
          team_notifications?: boolean | null
          friend_notifications?: boolean | null
          message_notifications?: boolean | null
          marketing_notifications?: boolean | null
          theme_preference?: string | null
          accent_color?: string | null
          font_size?: string | null
          profile_visibility?: string | null
          show_online_status?: boolean | null
          show_activity?: boolean | null
          allow_friend_requests?: boolean | null
          allow_team_invites?: boolean | null
          allow_direct_messages?: string | null
        }
      }
      games: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          cover_image: string | null
          banner_image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          cover_image?: string | null
          banner_image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          cover_image?: string | null
          banner_image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          description: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          description?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          description?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          profile_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          profile_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          profile_id?: string
          role?: string
          joined_at?: string
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          profile_id: string
          status: string
          role: string
          message: string | null
          created_at: string
          updated_at: string
          acceptance_deadline: string | null
          invited_by: string
        }
        Insert: {
          id?: string
          team_id: string
          profile_id: string
          status?: string
          role?: string
          message?: string | null
          created_at?: string
          updated_at?: string
          acceptance_deadline?: string | null
          invited_by: string
        }
        Update: {
          id?: string
          team_id?: string
          profile_id?: string
          status?: string
          role?: string
          message?: string | null
          created_at?: string
          updated_at?: string
          acceptance_deadline?: string | null
          invited_by?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          game_id: string
          start_date: string
          end_date: string
          registration_close_date: string
          max_teams: number | null
          team_size: number
          entry_fee: number
          prize_pool: number
          rules: string | null
          banner_image: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
          bracket_type: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          game_id: string
          start_date: string
          end_date: string
          registration_close_date: string
          max_teams?: number | null
          team_size: number
          entry_fee?: number
          prize_pool?: number
          rules?: string | null
          banner_image?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
          bracket_type?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          game_id?: string
          start_date?: string
          end_date?: string
          registration_close_date?: string
          max_teams?: number | null
          team_size?: number
          entry_fee?: number
          prize_pool?: number
          rules?: string | null
          banner_image?: string | null
          status?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          bracket_type?: string | null
        }
      }
      match_participants: {
        Row: {
          id: string
          match_id: string
          team_id: string | null
          profile_id: string | null
          score: number | null
          result: string | null
        }
        Insert: {
          id?: string
          match_id: string
          team_id?: string | null
          profile_id?: string | null
          score?: number | null
          result?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          team_id?: string | null
          profile_id?: string | null
          score?: number | null
          result?: string | null
        }
      }
      matches: {
        Row: {
          id: string
          scheduled_by: string
          start_time: string
          status: string
          location: string | null
          match_type: string
          is_private: boolean
          stream_url: string | null
          match_notes: string | null
          created_at: string
          updated_at: string
          game_id: string | null
          acceptance_status: Json | null
          next_match_id: string | null
          next_match_position: number | null
          round: number | null
          match_number: number | null
          bracket_position: number | null
        }
        Insert: {
          id?: string
          scheduled_by: string
          start_time: string
          status?: string
          location?: string | null
          match_type?: string
          is_private?: boolean
          stream_url?: string | null
          match_notes?: string | null
          created_at?: string
          updated_at?: string
          game_id?: string | null
          acceptance_status?: Json | null
          next_match_id?: string | null
          next_match_position?: number | null
          round?: number | null
          match_number?: number | null
          bracket_position?: number | null
        }
      }
      team_invitations: {
        Row: {
          id: string
          team_id: string
          profile_id: string
          status: string
          role: string
          message: string | null
          created_at: string
          updated_at: string
          acceptance_deadline: string | null
          invited_by: string
        }
        Insert: {
          id?: string
          team_id: string
          profile_id: string
          status?: string
          role?: string
          message?: string | null
          created_at?: string
          updated_at?: string
          acceptance_deadline?: string | null
          invited_by: string
        }
        Update: {
          id?: string
          team_id?: string
          profile_id?: string
          status?: string
          role?: string
          message?: string | null
          created_at?: string
          updated_at?: string
          acceptance_deadline?: string | null
          invited_by?: string
        }
      }
      tournament_registrations: {
        Row: {
          id: string
          tournament_id: string
          team_id: string | null
          profile_id: string | null
          status: string
          registered_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tournament_id: string
          team_id?: string | null
          profile_id?: string | null
          status?: string
          registered_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tournament_id?: string
          team_id?: string | null
          profile_id?: string | null
          status?: string
          registered_at?: string
          updated_at?: string
        }
      }
      player_stats: {
        Row: {
          id: string
          user_id: string
          game_id: string
          matches_played: number
          matches_won: number
          tournaments_played: number
          tournaments_won: number
          total_earnings: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          game_id: string
          matches_played?: number
          matches_won?: number
          tournaments_played?: number
          tournaments_won?: number
          total_earnings?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          game_id?: string
          matches_played?: number
          matches_won?: number
          tournaments_played?: number
          tournaments_won?: number
          total_earnings?: number
          created_at?: string
          updated_at?: string
        }
      }
      site_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_roles: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_permissions: {
        Row: {
          id: string
          name: string
          description: string | null
          resource: string
          action: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          resource: string
          action: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          resource?: string
          action?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
        }
        Update: {
          id?: string
          role_id?: string
          permission_id?: string
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          email: string | null
          is_super_admin: boolean | null
          created_at: string | null
          updated_at: string | null
          role_id: string | null
        }
        Insert: {
          id: string
          email?: string | null
          is_super_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          role_id?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          is_super_admin?: boolean | null
          created_at?: string | null
          updated_at?: string | null
          role_id?: string | null
        }
      }
      hero_sliders: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          banner_image: string | null
          active: boolean | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          banner_image?: string | null
          active?: boolean | null
          order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          banner_image?: string | null
          active?: boolean | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      match_invitations: {
        Row: {
          id: string
          match_id: string
          team_id: string
          invited_by: string
          status: string
          invited_at: string
          responded_at: string | null
          acceptance_deadline: string | null
        }
        Insert: {
          id?: string
          match_id: string
          team_id: string
          invited_by: string
          status?: string
          invited_at?: string
          responded_at?: string | null
          acceptance_deadline?: string | null
        }
        Update: {
          id?: string
          match_id?: string
          team_id?: string
          invited_by?: string
          status?: string
          invited_at?: string
          responded_at?: string | null
          acceptance_deadline?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          profile_id: string
          title: string
          message: string
          type: string
          reference_id: string | null
          reference_type: string | null
          action_url: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          title: string
          message: string
          type: string
          reference_id?: string | null
          reference_type?: string | null
          action_url?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          title?: string
          message?: string
          type?: string
          reference_id?: string | null
          reference_type?: string | null
          action_url?: string | null
          is_read?: boolean
          created_at?: string
        }
      }
      disputes: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          match_id: string | null
          reported_by_id: string | null
          assigned_to_id: string | null
          resolution_note: string | null
          evidence_urls: string[] | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string
          match_id?: string | null
          reported_by_id?: string | null
          assigned_to_id?: string | null
          resolution_note?: string | null
          evidence_urls?: string[] | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          match_id?: string | null
          reported_by_id?: string | null
          assigned_to_id?: string | null
          resolution_note?: string | null
          evidence_urls?: string[] | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon_url: string | null
          category: string
          points: number
          rarity: string
          requirement_type: string
          requirement_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon_url?: string | null
          category: string
          points?: number
          rarity?: string
          requirement_type: string
          requirement_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon_url?: string | null
          category?: string
          points?: number
          rarity?: string
          requirement_type?: string
          requirement_value?: number
          created_at?: string
          updated_at?: string
        }
      }

      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          progress: number
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          progress?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      user_friends: {
        Row: {
          id: string | null
          user_id: string | null
          friend_id: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
          direction: string | null
        }
        Insert: {
          id?: string | null
          user_id?: string | null
          friend_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          direction?: string | null
        }
        Update: {
          id?: string | null
          user_id?: string | null
          friend_id?: string | null
          status?: string | null
          created_at?: string | null
          updated_at?: string | null
          direction?: string | null
        }
      }
    }
    Functions: {
      get_admin_dashboard_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          users: number
          teams: number
          tournaments: number
          matches: number
          disputes: number
        }
      }
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
