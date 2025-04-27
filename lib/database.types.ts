export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      achievements: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          requirements: Json | null
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          requirements?: Json | null
          type: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          requirements?: Json | null
          type?: string
        }
        Relationships: []
      }
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "admin_roles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      cron_job_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error: string | null
          id: string
          job_name: string
          result: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          job_name: string
          result?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error?: string | null
          id?: string
          job_name?: string
          result?: Json | null
          status?: string
        }
        Relationships: []
      }
      disputes: {
        Row: {
          created_at: string
          description: string
          evidence: Json | null
          id: string
          match_id: string
          reported_by: string
          resolved_at: string | null
          resolved_by: string | null
          resolution_notes: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          description: string
          evidence?: Json | null
          id?: string
          match_id: string
          reported_by: string
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          status?: string
          type: string
        }
        Update: {
          created_at?: string
          description?: string
          evidence?: Json | null
          id?: string
          match_id?: string
          reported_by?: string
          resolved_at?: string | null
          resolved_by?: string | null
          resolution_notes?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      elo_history: {
        Row: {
          created_at: string
          elo_after: number
          elo_before: number
          game_id: string
          id: string
          match_id: string | null
          profile_id: string
          team_id: string | null
        }
        Insert: {
          created_at?: string
          elo_after: number
          elo_before: number
          game_id: string
          id?: string
          match_id?: string | null
          profile_id: string
          team_id?: string | null
        }
        Update: {
          created_at?: string
          elo_after?: number
          elo_before?: number
          game_id?: string
          id?: string
          match_id?: string | null
          profile_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "elo_history_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_history_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_history_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_history_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      elo_ratings: {
        Row: {
          created_at: string
          elo_rating: number
          game_id: string
          id: string
          last_match_id: string | null
          matches_played: number
          profile_id: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          elo_rating?: number
          game_id: string
          id?: string
          last_match_id?: string | null
          matches_played?: number
          profile_id: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          elo_rating?: number
          game_id?: string
          id?: string
          last_match_id?: string | null
          matches_played?: number
          profile_id?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "elo_ratings_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_ratings_last_match_id_fkey"
            columns: ["last_match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_ratings_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "elo_ratings_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      friend_requests: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          status: string
          to_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          status?: string
          to_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          status?: string
          to_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_requests_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friend_requests_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          id: string
          user_id_1: string
          user_id_2: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id_1: string
          user_id_2: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id_1?: string
          user_id_2?: string
        }
        Relationships: [
          {
            foreignKeyName: "friendships_user_id_1_fkey"
            columns: ["user_id_1"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_user_id_2_fkey"
            columns: ["user_id_2"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          status?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          status?: string
        }
        Relationships: []
      }
      hero_sliders: {
        Row: {
          created_at: string
          id: string
          image_url: string
          link_url: string | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          link_url?: string | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          link_url?: string | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      match_chats: {
        Row: {
          content: string
          created_at: string
          id: string
          match_id: string
          profile_id: string
          team_id: string | null
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          match_id: string
          profile_id: string
          team_id?: string | null
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          match_id?: string
          profile_id?: string
          team_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_chats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_chats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_chats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_invitations: {
        Row: {
          created_at: string
          id: string
          invited_by: string
          match_id: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by: string
          match_id: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string
          match_id?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invitations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_map_vetos: {
        Row: {
          created_at: string
          id: string
          map_name: string
          match_id: string
          status: string
          team_id: string | null
          veto_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          map_name: string
          match_id: string
          status: string
          team_id?: string | null
          veto_order: number
        }
        Update: {
          created_at?: string
          id?: string
          map_name?: string
          match_id?: string
          status?: string
          team_id?: string | null
          veto_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_map_vetos_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_map_vetos_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          created_at: string
          id: string
          match_id: string
          profile_id: string | null
          role: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          profile_id?: string | null
          role?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          profile_id?: string | null
          role?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_player_stats: {
        Row: {
          assists: number | null
          created_at: string
          deaths: number | null
          id: string
          kills: number | null
          match_id: string
          other_stats: Json | null
          profile_id: string
          team_id: string | null
        }
        Insert: {
          assists?: number | null
          created_at?: string
          deaths?: number | null
          id?: string
          kills?: number | null
          match_id: string
          other_stats?: Json | null
          profile_id: string
          team_id?: string | null
        }
        Update: {
          assists?: number | null
          created_at?: string
          deaths?: number | null
          id?: string
          kills?: number | null
          match_id?: string
          other_stats?: Json | null
          profile_id?: string
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_player_stats_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_player_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_player_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_results: {
        Row: {
          created_at: string
          id: string
          loser_team_id: string | null
          match_id: string
          reported_by: string
          score_loser: number | null
          score_winner: number | null
          verified: boolean
          winner_team_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          loser_team_id?: string | null
          match_id: string
          reported_by: string
          score_loser?: number | null
          score_winner?: number | null
          verified?: boolean
          winner_team_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          loser_team_id?: string | null
          match_id?: string
          reported_by?: string
          score_loser?: number | null
          score_winner?: number | null
          verified?: boolean
          winner_team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_loser_team_id_fkey"
            columns: ["loser_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_results_winner_team_id_fkey"
            columns: ["winner_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      match_settings: {
        Row: {
          created_at: string
          id: string
          match_id: string
          rules: Json | null
          settings: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id: string
          rules?: Json | null
          settings?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string
          rules?: Json | null
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "match_settings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: true
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          end_time: string
          game_id: string | null
          game_mode: string | null
          id: string
          is_private: boolean
          match_format: string | null
          name: string
          scheduled_by: string
          start_time: string
          status: string
          team_size: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          end_time: string
          game_id?: string | null
          game_mode?: string | null
          id?: string
          is_private?: boolean
          match_format?: string | null
          name: string
          scheduled_by: string
          start_time: string
          status?: string
          team_size?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          end_time?: string
          game_id?: string | null
          game_mode?: string | null
          id?: string
          is_private?: boolean
          match_format?: string | null
          name?: string
          scheduled_by?: string
          start_time?: string
          status?: string
          team_size?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_scheduled_by_fkey"
            columns: ["scheduled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean
          profile_id: string
          title: string
          type: string
        }
        Insert: {
          action_url?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id: string
          title: string
          type: string
        }
        Update: {
          action_url?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          profile_id?: string
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_achievements: {
        Row: {
          achievement_id: string
          created_at: string
          id: string
          profile_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string
          id?: string
          profile_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string
          id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_achievements_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      player_stats: {
        Row: {
          assists: number
          created_at: string
          deaths: number
          game_id: string
          id: string
          kills: number
          losses: number
          matches_played: number
          other_stats: Json | null
          profile_id: string
          updated_at: string
          wins: number
        }
        Insert: {
          assists?: number
          created_at?: string
          deaths?: number
          game_id: string
          id?: string
          kills?: number
          losses?: number
          matches_played?: number
          other_stats?: Json | null
          profile_id: string
          updated_at?: string
          wins?: number
        }
        Update: {
          assists?: number
          created_at?: string
          deaths?: number
          game_id?: string
          id?: string
          kills?: number
          losses?: number
          matches_played?: number
          other_stats?: Json | null
          profile_id?: string
          updated_at?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_stats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_stats_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          country: string | null
          created_at: string
          discord_username: string | null
          display_name: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          last_seen: string | null
          online_status: string | null
          role: string | null
          settings: Json | null
          twitch_url: string | null
          twitter_url: string | null
          updated_at: string | null
          username: string | null
          website_url: string | null
          youtube_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          discord_username?: string | null
          display_name?: string | null
          email?: string | null
          facebook_url?: string | null
          id: string
          instagram_url?: string | null
          last_seen?: string | null
          online_status?: string | null
          role?: string | null
          settings?: Json | null
          twitch_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          country?: string | null
          created_at?: string
          discord_username?: string | null
          display_name?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          last_seen?: string | null
          online_status?: string | null
          role?: string | null
          settings?: Json | null
          twitch_url?: string | null
          twitter_url?: string | null
          updated_at?: string | null
          username?: string | null
          website_url?: string | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string
          id: string
          invited_by: string
          status: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_by: string
          status?: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_by?: string
          status?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          role: string
          team_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          role?: string
          team_id: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          bio: string | null
          created_at: string
          created_by: string
          id: string
          logo_url: string | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          created_by: string
          id?: string
          logo_url?: string | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          created_by?: string
          id?: string
          logo_url?: string | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_brackets: {
        Row: {
          bracket_data: Json
          created_at: string
          id: string
          tournament_id: string
          updated_at: string
        }
        Insert: {
          bracket_data: Json
          created_at?: string
          id?: string
          tournament_id: string
          updated_at?: string
        }
        Update: {
          bracket_data?: Json
          created_at?: string
          id?: string
          tournament_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_brackets_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_registrations: {
        Row: {
          created_at: string
          id: string
          status: string
          team_id: string
          tournament_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          team_id: string
          tournament_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          team_id?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_registrations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_registrations_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string
          description: string | null
          end_date: string
          game_id: string
          id: string
          max_teams: number
          name: string
          prize_pool: string | null
          rules: string | null
          slug: string
          start_date: string
          status: string
          team_size: number
          updated_at: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          end_date: string
          game_id: string
          id?: string
          max_teams?: number
          name: string
          prize_pool?: string | null
          rules?: string | null
          slug: string
          start_date: string
          status?: string
          team_size?: number
          updated_at?: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          end_date?: string
          game_id?: string
          id?: string
          max_teams?: number
          name?: string
          prize_pool?: string | null
          rules?: string | null
          slug?: string
          start_date?: string
          status?: string
          team_size?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_elo_change: {
        Args: {
          winner_rating: number
          loser_rating: number
          k_factor: number
        }
        Returns: {
          winner_change: number
          loser_change: number
        }
      }
      exec_sql: {
        Args: {
          sql_string: string
        }
        Returns: Json
      }
      get_elo_stats: {
        Args: {
          game_id_param: string
        }
        Returns: {
          profile_id: string
          username: string
          display_name: string
          avatar_url: string
          elo_rating: number
          matches_played: number
          last_match_date: string
        }[]
      }
      update_elo_after_match: {
        Args: {
          match_id_param: string
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
