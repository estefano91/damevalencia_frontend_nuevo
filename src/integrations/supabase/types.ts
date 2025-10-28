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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      connections: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          requester_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          requester_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          tags: string[] | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_user_id: string | null
          opportunity_id: string | null
          status: string
          referral_date: string | null
          success_date: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_user_id?: string | null
          opportunity_id?: string | null
          status?: string
          referral_date?: string | null
          success_date?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_user_id?: string | null
          opportunity_id?: string | null
          status?: string
          referral_date?: string | null
          success_date?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          achievements: string[] | null
          aura_score: number | null
          avatar_url: string | null
          badge_type: string | null
          bio: string | null
          certifications: string[] | null
          cover_url: string | null
          created_at: string | null
          elite_member: boolean | null
          endorsement_count: number | null
          engagement_score: number | null
          full_name: string
          id: string
          is_referrer: boolean | null
          location: string | null
          media_urls: string[] | null
          portfolio_url: string | null
          referrer_code: string | null
          referrer_points: number | null
          referrer_rank: string | null
          skills: string[] | null
          social_links: Json | null
          sport: string | null
          successful_referrals: number | null
          total_referrals: number | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          verified: boolean | null
          goals: string[] | null
          level: string | null
          nationality: string | null
          latitude: number | null
          longitude: number | null
          radius_km: number | null
          looking_for: string[] | null
          availability: string | null
          commitment_level: string | null
        }
        Insert: {
          achievements?: string[] | null
          aura_score?: number | null
          avatar_url?: string | null
          badge_type?: string | null
          bio?: string | null
          certifications?: string[] | null
          cover_url?: string | null
          created_at?: string | null
          elite_member?: boolean | null
          endorsement_count?: number | null
          engagement_score?: number | null
          full_name: string
          id: string
          is_referrer?: boolean | null
          location?: string | null
          media_urls?: string[] | null
          portfolio_url?: string | null
          referrer_code?: string | null
          referrer_points?: number | null
          referrer_rank?: string | null
          skills?: string[] | null
          social_links?: Json | null
          sport?: string | null
          successful_referrals?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_type: Database["public"]["Enums"]["user_type"]
          verified?: boolean | null
          goals?: string[] | null
          level?: string | null
          nationality?: string | null
          latitude?: number | null
          longitude?: number | null
          radius_km?: number | null
          looking_for?: string[] | null
          availability?: string | null
          commitment_level?: string | null
        }
        Update: {
          achievements?: string[] | null
          aura_score?: number | null
          avatar_url?: string | null
          badge_type?: string | null
          bio?: string | null
          certifications?: string[] | null
          cover_url?: string | null
          created_at?: string | null
          elite_member?: boolean | null
          endorsement_count?: number | null
          engagement_score?: number | null
          full_name?: string
          id?: string
          is_referrer?: boolean | null
          location?: string | null
          media_urls?: string[] | null
          portfolio_url?: string | null
          referrer_code?: string | null
          referrer_points?: number | null
          referrer_rank?: string | null
          skills?: string[] | null
          social_links?: Json | null
          sport?: string | null
          successful_referrals?: number | null
          total_referrals?: number | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["user_type"]
          verified?: boolean | null
          goals?: string[] | null
          level?: string | null
          nationality?: string | null
          latitude?: number | null
          longitude?: number | null
          radius_km?: number | null
          looking_for?: string[] | null
          availability?: string | null
          commitment_level?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          id: string
          user_id: string
          matched_with_id: string
          match_score: number
          match_reasons: string[] | null
          status: string
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          matched_with_id: string
          match_score?: number
          match_reasons?: string[] | null
          status?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          matched_with_id?: string
          match_score?: number
          match_reasons?: string[] | null
          status?: string
          created_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          related_user_id: string | null
          read: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          related_user_id?: string | null
          read?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          related_user_id?: string | null
          read?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          id: string
          type: string
          name: string | null
          description: string | null
          sport: string | null
          country: string | null
          opportunity_type: string | null
          created_by: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          type?: string
          name?: string | null
          description?: string | null
          sport?: string | null
          country?: string | null
          opportunity_type?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          type?: string
          name?: string | null
          description?: string | null
          sport?: string | null
          country?: string | null
          opportunity_type?: string | null
          created_by?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      chat_members: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          role: string
          joined_at: string | null
          last_read_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          role?: string
          joined_at?: string | null
          last_read_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          role?: string
          joined_at?: string | null
          last_read_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          translated_content: Json | null
          message_type: string
          read_by: Json | null
          translated: boolean
          original_language: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          translated_content?: Json | null
          message_type?: string
          read_by?: Json | null
          translated?: boolean
          original_language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          translated_content?: Json | null
          message_type?: string
          read_by?: Json | null
          translated?: boolean
          original_language?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      calls: {
        Row: {
          id: string
          call_type: string
          caller_id: string
          receiver_id: string | null
          chat_id: string | null
          status: string
          started_at: string | null
          ended_at: string | null
          duration_seconds: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          call_type: string
          caller_id: string
          receiver_id?: string | null
          chat_id?: string | null
          status?: string
          started_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          call_type?: string
          caller_id?: string
          receiver_id?: string | null
          chat_id?: string | null
          status?: string
          started_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      quick_connects: {
        Row: {
          id: string
          user_id: string
          target_user_id: string
          action: string
          context: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          target_user_id: string
          action: string
          context?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          target_user_id?: string
          action?: string
          context?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          club_id: string
          title: string
          description: string | null
          sport: string | null
          position: string | null
          contract_type: string | null
          status: string
          requirements: string[] | null
          location: string | null
          salary_range: string | null
          application_deadline: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          club_id: string
          title: string
          description?: string | null
          sport?: string | null
          position?: string | null
          contract_type?: string | null
          status?: string
          requirements?: string[] | null
          location?: string | null
          salary_range?: string | null
          application_deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          club_id?: string
          title?: string
          description?: string | null
          sport?: string | null
          position?: string | null
          contract_type?: string | null
          status?: string
          requirements?: string[] | null
          location?: string | null
          salary_range?: string | null
          application_deadline?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_records: {
        Row: {
          id: string
          referrer_id: string
          player_id: string
          club_id: string
          opportunity_id: string | null
          referral_code: string | null
          referral_date: string | null
          interaction_status: string
          validation_state: string
          evidence_links: string[] | null
          club_confirmed_at: string | null
          player_confirmed_at: string | null
          community_verified_at: string | null
          verified_by: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          referrer_id: string
          player_id: string
          club_id: string
          opportunity_id?: string | null
          referral_code?: string | null
          referral_date?: string | null
          interaction_status?: string
          validation_state?: string
          evidence_links?: string[] | null
          club_confirmed_at?: string | null
          player_confirmed_at?: string | null
          community_verified_at?: string | null
          verified_by?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          referrer_id?: string
          player_id?: string
          club_id?: string
          opportunity_id?: string | null
          referral_code?: string | null
          referral_date?: string | null
          interaction_status?: string
          validation_state?: string
          evidence_links?: string[] | null
          club_confirmed_at?: string | null
          player_confirmed_at?: string | null
          community_verified_at?: string | null
          verified_by?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_validations: {
        Row: {
          id: string
          referral_record_id: string
          validator_id: string
          validator_role: string | null
          validation_type: string | null
          notes: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          referral_record_id: string
          validator_id: string
          validator_role?: string | null
          validation_type?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          referral_record_id?: string
          validator_id?: string
          validator_role?: string | null
          validation_type?: string | null
          notes?: string | null
          created_at?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          author_id: string
          content: string
          post_type: string
          tags: string[] | null
          media_urls: string[] | null
          is_boosted: boolean
          boost_expires_at: string | null
          boost_amount: number
          target_audience: string | null
          target_sport: string | null
          target_country: string | null
          target_level: string | null
          location: string | null
          start_date: string | null
          end_date: string | null
          contact_email: string | null
          contact_phone: string | null
          application_deadline: string | null
          budget_range: string | null
          requirements: string[] | null
          likes_count: number
          comments_count: number
          shares_count: number
          views_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          author_id: string
          content: string
          post_type?: string
          tags?: string[] | null
          media_urls?: string[] | null
          is_boosted?: boolean
          boost_expires_at?: string | null
          boost_amount?: number
          target_audience?: string | null
          target_sport?: string | null
          target_country?: string | null
          target_level?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          application_deadline?: string | null
          budget_range?: string | null
          requirements?: string[] | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          author_id?: string
          content?: string
          post_type?: string
          tags?: string[] | null
          media_urls?: string[] | null
          is_boosted?: boolean
          boost_expires_at?: string | null
          boost_amount?: number
          target_audience?: string | null
          target_sport?: string | null
          target_country?: string | null
          target_level?: string | null
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          application_deadline?: string | null
          budget_range?: string | null
          requirements?: string[] | null
          likes_count?: number
          comments_count?: number
          shares_count?: number
          views_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          created_at?: string | null
        }
        Relationships: []
      }
      open_calls: {
        Row: {
          id: string
          posted_by: string
          title: string
          description: string
          call_type: string
          sport: string
          position: string | null
          level_required: string | null
          location: string | null
          contract_type: string | null
          salary_range: string | null
          deadline: string | null
          requirements: string[] | null
          benefits: string[] | null
          how_to_apply: string | null
          status: string
          views_count: number
          applications_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          posted_by: string
          title: string
          description: string
          call_type: string
          sport: string
          position?: string | null
          level_required?: string | null
          location?: string | null
          contract_type?: string | null
          salary_range?: string | null
          deadline?: string | null
          requirements?: string[] | null
          benefits?: string[] | null
          how_to_apply?: string | null
          status?: string
          views_count?: number
          applications_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          posted_by?: string
          title?: string
          description?: string
          call_type?: string
          sport?: string
          position?: string | null
          level_required?: string | null
          location?: string | null
          contract_type?: string | null
          salary_range?: string | null
          deadline?: string | null
          requirements?: string[] | null
          benefits?: string[] | null
          how_to_apply?: string | null
          status?: string
          views_count?: number
          applications_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contract_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          sport: string | null
          template_content: Json
          default_terms: Json | null
          is_public: boolean
          created_by: string | null
          usage_count: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          sport?: string | null
          template_content: Json
          default_terms?: Json | null
          is_public?: boolean
          created_by?: string | null
          usage_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          sport?: string | null
          template_content?: Json
          default_terms?: Json | null
          is_public?: boolean
          created_by?: string | null
          usage_count?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          id: string
          template_id: string | null
          contract_type: string
          title: string
          description: string
          party_a_id: string
          party_a_type: string | null
          party_b_id: string | null
          party_b_type: string | null
          terms: Json
          salary_amount: number | null
          currency: string | null
          duration_months: number | null
          start_date: string | null
          end_date: string | null
          party_a_signed: boolean
          party_a_signed_at: string | null
          party_a_signature_data: Json | null
          party_b_signed: boolean
          party_b_signed_at: string | null
          party_b_signature_data: Json | null
          status: string
          negotiation_notes: string[] | null
          visibility: string
          visible_to_verified_agents: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          template_id?: string | null
          contract_type: string
          title: string
          description: string
          party_a_id: string
          party_a_type?: string | null
          party_b_id?: string | null
          party_b_type?: string | null
          terms: Json
          salary_amount?: number | null
          currency?: string | null
          duration_months?: number | null
          start_date?: string | null
          end_date?: string | null
          party_a_signed?: boolean
          party_a_signed_at?: string | null
          party_a_signature_data?: Json | null
          party_b_signed?: boolean
          party_b_signed_at?: string | null
          party_b_signature_data?: Json | null
          status?: string
          negotiation_notes?: string[] | null
          visibility?: string
          visible_to_verified_agents?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          template_id?: string | null
          contract_type?: string
          title?: string
          description?: string
          party_a_id?: string
          party_a_type?: string | null
          party_b_id?: string | null
          party_b_type?: string | null
          terms?: Json
          salary_amount?: number | null
          currency?: string | null
          duration_months?: number | null
          start_date?: string | null
          end_date?: string | null
          party_a_signed?: boolean
          party_a_signed_at?: string | null
          party_a_signature_data?: Json | null
          party_b_signed?: boolean
          party_b_signed_at?: string | null
          party_b_signature_data?: Json | null
          status?: string
          negotiation_notes?: string[] | null
          visibility?: string
          visible_to_verified_agents?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      partnerships: {
        Row: {
          id: string
          sponsor_id: string
          sponsored_id: string
          match_score: number
          match_reasons: string[]
          partnership_type: string | null
          sport: string | null
          target_audience: string | null
          budget_range: string | null
          status: string
          suggested_at: string | null
          accepted_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          sponsor_id: string
          sponsored_id: string
          match_score: number
          match_reasons: string[]
          partnership_type?: string | null
          sport?: string | null
          target_audience?: string | null
          budget_range?: string | null
          status?: string
          suggested_at?: string | null
          accepted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          sponsor_id?: string
          sponsored_id?: string
          match_score?: number
          match_reasons?: string[]
          partnership_type?: string | null
          sport?: string | null
          target_audience?: string | null
          budget_range?: string | null
          status?: string
          suggested_at?: string | null
          accepted_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      digital_signatures: {
        Row: {
          id: string
          contract_id: string
          signer_id: string
          signature_data: Json
          ip_address: string | null
          user_agent: string | null
          signed_at: string | null
          consent_text: string | null
          terms_version: number
        }
        Insert: {
          id?: string
          contract_id: string
          signer_id: string
          signature_data: Json
          ip_address?: string | null
          user_agent?: string | null
          signed_at?: string | null
          consent_text?: string | null
          terms_version?: number
        }
        Update: {
          id?: string
          contract_id?: string
          signer_id?: string
          signature_data?: Json
          ip_address?: string | null
          user_agent?: string | null
          signed_at?: string | null
          consent_text?: string | null
          terms_version?: number
        }
        Relationships: []
      }
      networking_events: {
        Row: {
          id: string
          title: string
          description: string
          event_type: string
          theme: string | null
          start_time: string
          end_time: string
          timezone: string | null
          duration_minutes: number | null
          format: string
          video_link: string | null
          room_url: string | null
          host_id: string
          max_participants: number
          target_audience: string[] | null
          target_sports: string[] | null
          target_levels: string[] | null
          status: string
          registration_open: boolean
          registration_deadline: string | null
          registration_count: number
          is_recording: boolean
          allow_recordings: boolean
          requires_verification: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_type: string
          theme?: string | null
          start_time: string
          end_time: string
          timezone?: string | null
          duration_minutes?: number | null
          format?: string
          video_link?: string | null
          room_url?: string | null
          host_id: string
          max_participants?: number
          target_audience?: string[] | null
          target_sports?: string[] | null
          target_levels?: string[] | null
          status?: string
          registration_open?: boolean
          registration_deadline?: string | null
          registration_count?: number
          is_recording?: boolean
          allow_recordings?: boolean
          requires_verification?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_type?: string
          theme?: string | null
          start_time?: string
          end_time?: string
          timezone?: string | null
          duration_minutes?: number | null
          format?: string
          video_link?: string | null
          room_url?: string | null
          host_id?: string
          max_participants?: number
          target_audience?: string[] | null
          target_sports?: string[] | null
          target_levels?: string[] | null
          status?: string
          registration_open?: boolean
          registration_deadline?: string | null
          registration_count?: number
          is_recording?: boolean
          allow_recordings?: boolean
          requires_verification?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          id: string
          event_id: string
          user_id: string
          registered_at: string | null
          status: string
          attended: boolean
          checked_in_at: string | null
          checked_out_at: string | null
          rating: number | null
          feedback: string | null
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          registered_at?: string | null
          status?: string
          attended?: boolean
          checked_in_at?: string | null
          checked_out_at?: string | null
          rating?: number | null
          feedback?: string | null
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          registered_at?: string | null
          status?: string
          attended?: boolean
          checked_in_at?: string | null
          checked_out_at?: string | null
          rating?: number | null
          feedback?: string | null
        }
        Relationships: []
      }
      premium_plans: {
        Row: {
          id: string
          name: string
          description: string | null
          tier: string
          monthly_price: number
          yearly_price: number | null
          currency: string | null
          features: Json
          visibility_boost_multiplier: number
          max_boosts_per_month: number
          max_connects_per_month: number
          advanced_analytics: boolean
          is_active: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          tier: string
          monthly_price: number
          yearly_price?: number | null
          currency?: string | null
          features: Json
          visibility_boost_multiplier?: number
          max_boosts_per_month?: number
          max_connects_per_month?: number
          advanced_analytics?: boolean
          is_active?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          tier?: string
          monthly_price?: number
          yearly_price?: number | null
          currency?: string | null
          features?: Json
          visibility_boost_multiplier?: number
          max_boosts_per_month?: number
          max_connects_per_month?: number
          advanced_analytics?: boolean
          is_active?: boolean
          created_at?: string | null
        }
        Relationships: []
      }
      premium_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: string
          current_period_start: string | null
          current_period_end: string
          cancel_at_period_end: boolean
          payment_method: string | null
          billing_email: string | null
          cancelled_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          status?: string
          current_period_start?: string | null
          current_period_end: string
          cancel_at_period_end?: boolean
          payment_method?: string | null
          billing_email?: string | null
          cancelled_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          status?: string
          current_period_start?: string | null
          current_period_end?: string
          cancel_at_period_end?: boolean
          payment_method?: string | null
          billing_email?: string | null
          cancelled_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      aura_credits: {
        Row: {
          id: string
          user_id: string
          balance: number
          total_earned: number
          total_spent: number
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          balance?: number
          total_earned?: number
          total_spent?: number
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          amount: number
          source: string | null
          related_entity_id: string | null
          description: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: string
          amount: number
          source?: string | null
          related_entity_id?: string | null
          description?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          amount?: number
          source?: string | null
          related_entity_id?: string | null
          description?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      sponsorship_packages: {
        Row: {
          id: string
          brand_id: string
          name: string
          description: string
          target_audience: string[]
          target_sports: string[] | null
          target_countries: string[] | null
          target_levels: string[] | null
          package_type: string
          duration_days: number
          price: number
          currency: string | null
          banner_url: string | null
          video_url: string | null
          landing_page_url: string | null
          promo_code: string | null
          impressions_count: number
          clicks_count: number
          conversions_count: number
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          description: string
          target_audience: string[]
          target_sports?: string[] | null
          target_countries?: string[] | null
          target_levels?: string[] | null
          package_type: string
          duration_days: number
          price: number
          currency?: string | null
          banner_url?: string | null
          video_url?: string | null
          landing_page_url?: string | null
          promo_code?: string | null
          impressions_count?: number
          clicks_count?: number
          conversions_count?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          description?: string
          target_audience?: string[]
          target_sports?: string[] | null
          target_countries?: string[] | null
          target_levels?: string[] | null
          package_type?: string
          duration_days?: number
          price?: number
          currency?: string | null
          banner_url?: string | null
          video_url?: string | null
          landing_page_url?: string | null
          promo_code?: string | null
          impressions_count?: number
          clicks_count?: number
          conversions_count?: number
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      affiliate_rewards: {
        Row: {
          id: string
          user_id: string
          reward_type: string
          source_id: string | null
          credits_earned: number
          cash_value: number | null
          bonus_type: string | null
          status: string
          claimed_at: string | null
          description: string | null
          timestamp: string | null
        }
        Insert: {
          id?: string
          user_id: string
          reward_type: string
          source_id?: string | null
          credits_earned: number
          cash_value?: number | null
          bonus_type?: string | null
          status?: string
          claimed_at?: string | null
          description?: string | null
          timestamp?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          reward_type?: string
          source_id?: string | null
          credits_earned?: number
          cash_value?: number | null
          bonus_type?: string | null
          status?: string
          claimed_at?: string | null
          description?: string | null
          timestamp?: string | null
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          id: string
          user_id: string
          document_type: string
          document_number: string | null
          front_url: string | null
          back_url: string | null
          additional_files: string[] | null
          country: string | null
          issued_date: string | null
          expiry_date: string | null
          status: string
          rejection_reason: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          document_type: string
          document_number?: string | null
          front_url?: string | null
          back_url?: string | null
          additional_files?: string[] | null
          country?: string | null
          issued_date?: string
          expiry_date?: string
          status?: string
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          document_type?: string
          document_number?: string | null
          front_url?: string | null
          back_url?: string | null
          additional_files?: string[] | null
          country?: string | null
          issued_date?: string
          expiry_date?: string
          status?: string
          rejection_reason?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verifications: {
        Row: {
          id: string
          user_id: string
          verification_type: string
          verification_level: string
          badge_name: string | null
          badge_icon: string | null
          badge_color: string | null
          status: string
          verified_at: string | null
          reviewed_by: string | null
          reviewed_at: string | null
          expires_at: string | null
          renewal_required: boolean
          renewal_reminder_sent: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          verification_type: string
          verification_level?: string
          badge_name?: string | null
          badge_icon?: string | null
          badge_color?: string | null
          status?: string
          verified_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          expires_at?: string | null
          renewal_required?: boolean
          renewal_reminder_sent?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          verification_type?: string
          verification_level?: string
          badge_name?: string | null
          badge_icon?: string | null
          badge_color?: string | null
          status?: string
          verified_at?: string | null
          reviewed_by?: string | null
          reviewed_at?: string | null
          expires_at?: string | null
          renewal_required?: boolean
          renewal_reminder_sent?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fraud_reports: {
        Row: {
          id: string
          reported_user_id: string
          reporter_id: string
          report_type: string
          severity: string
          description: string
          evidence_urls: string[] | null
          chat_message_ids: string[] | null
          post_ids: string[] | null
          ai_confidence_score: number | null
          ai_moderation_notes: string | null
          automated_action: string | null
          status: string
          reviewed_by: string | null
          reviewed_at: string | null
          review_notes: string | null
          action_taken: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          reported_user_id: string
          reporter_id: string
          report_type: string
          severity?: string
          description: string
          evidence_urls?: string[] | null
          chat_message_ids?: string[] | null
          post_ids?: string[] | null
          ai_confidence_score?: number | null
          ai_moderation_notes?: string | null
          automated_action?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          action_taken?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          reported_user_id?: string
          reporter_id?: string
          report_type?: string
          severity?: string
          description?: string
          evidence_urls?: string[] | null
          chat_message_ids?: string[] | null
          post_ids?: string[] | null
          ai_confidence_score?: number | null
          ai_moderation_notes?: string | null
          automated_action?: string | null
          status?: string
          reviewed_by?: string | null
          reviewed_at?: string | null
          review_notes?: string | null
          action_taken?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          reviewed_user_id: string
          reviewer_id: string
          rating: number
          title: string | null
          content: string | null
          categories: Json | null
          context: string | null
          related_entity_id: string | null
          status: string
          flagged_by: string | null
          flagged_reason: string | null
          ai_moderation_score: number | null
          ai_moderation_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          reviewed_user_id: string
          reviewer_id: string
          rating: number
          title?: string | null
          content?: string | null
          categories?: Json | null
          context?: string | null
          related_entity_id?: string | null
          status?: string
          flagged_by?: string | null
          flagged_reason?: string | null
          ai_moderation_score?: number | null
          ai_moderation_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          reviewed_user_id?: string
          reviewer_id?: string
          rating?: number
          title?: string | null
          content?: string | null
          categories?: Json | null
          context?: string | null
          related_entity_id?: string | null
          status?: string
          flagged_by?: string | null
          flagged_reason?: string | null
          ai_moderation_score?: number | null
          ai_moderation_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reputation_scores: {
        Row: {
          id: string
          user_id: string
          overall_score: number
          trust_score: number
          reliability_score: number
          professionalism_score: number
          total_reviews: number
          positive_reviews: number
          negative_reviews: number
          report_count: number
          score_history: Json[]
          is_verified: boolean
          is_trusted: boolean
          is_suspended: boolean
          suspension_reason: string | null
          suspension_end_date: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          overall_score?: number
          trust_score?: number
          reliability_score?: number
          professionalism_score?: number
          total_reviews?: number
          positive_reviews?: number
          negative_reviews?: number
          report_count?: number
          score_history?: Json[]
          is_verified?: boolean
          is_trusted?: boolean
          is_suspended?: boolean
          suspension_reason?: string | null
          suspension_end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          overall_score?: number
          trust_score?: number
          reliability_score?: number
          professionalism_score?: number
          total_reviews?: number
          positive_reviews?: number
          negative_reviews?: number
          report_count?: number
          score_history?: Json[]
          is_verified?: boolean
          is_trusted?: boolean
          is_suspended?: boolean
          suspension_reason?: string | null
          suspension_end_date?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_distance: {
        Args: {
          lat1: number
          lon1: number
          lat2: number
          lon2: number
        }
        Returns: number
      }
      find_nearby_profiles: {
        Args: {
          user_lat: number
          user_lon: number
          max_distance_km?: number
          limit_results?: number
        }
        Returns: {
          id: string
          full_name: string
          user_type: string
          sport: string
          distance: number
        }[]
      }
      generate_recommendations: {
        Args: {
          target_user_id: string
          limit_results?: number
        }
        Returns: {
          profile_data: Database['public']['Tables']['profiles']['Row']
          match_score: number
          match_reasons: string[]
        }[]
      }
      create_private_chat: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: string
      }
      get_user_chats_with_last_message: {
        Args: {
          user_id_param: string
        }
        Returns: {
          chat_id: string
          chat_name: string
          chat_type: string
          last_message: string
          last_message_time: string
          unread_count: number
          other_participants: Json
        }[]
      }
      register_referral: {
        Args: {
          p_referrer_id: string
          p_player_id: string
          p_club_id: string
          p_opportunity_id?: string
          p_referral_code?: string
        }
        Returns: string
      }
      confirm_hire_by_club: {
        Args: {
          p_referral_id: string
          p_status?: string
        }
        Returns: undefined
      }
      self_confirm_by_player: {
        Args: {
          p_referral_id: string
          p_evidence_links?: string[]
        }
        Returns: undefined
      }
      submit_recognition_claim: {
        Args: {
          p_referral_id: string
          p_notes?: string
        }
        Returns: undefined
      }
      submit_community_validation: {
        Args: {
          p_referral_id: string
          p_validator_role: string
          p_validation_type: string
          p_notes?: string
        }
        Returns: boolean
      }
      get_referrer_stats: {
        Args: {
          p_referrer_id: string
        }
        Returns: {
          total_referrals: number
          confirmed_hires: number
          community_verified: number
          pending_validation: number
        }[]
      }
      generate_partnership_suggestions: {
        Args: {
          target_profile_id: string
          limit_results?: number
        }
        Returns: {
          suggested_partner: Database['public']['Tables']['profiles']['Row']
          match_score: number
          match_reasons: string[]
        }[]
      }
      sign_contract: {
        Args: {
          p_contract_id: string
          p_signer_id: string
          p_signature_data: Json
        }
        Returns: undefined
      }
      get_event_calendar: {
        Args: {
          user_id_param: string
          start_date_param: string
          end_date_param: string
        }
        Returns: {
          event: Database['public']['Tables']['networking_events']['Row']
          is_registered: boolean
          is_host: boolean
          registration_status: string
        }[]
      }
      add_aura_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_source: string
          p_description?: string
          p_related_entity_id?: string
        }
        Returns: undefined
      }
      spend_aura_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_source: string
          p_description?: string
          p_related_entity_id?: string
        }
        Returns: boolean
      }
      is_user_premium: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      reward_affiliate: {
        Args: {
          p_user_id: string
          p_reward_type: string
          p_credits: number
          p_source_id?: string
          p_description?: string
        }
        Returns: string
      }
      calculate_reputation_score: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      request_verification: {
        Args: {
          p_user_id: string
          p_verification_type: string
          p_document_type: string
          p_front_url: string
          p_back_url?: string
        }
        Returns: string
      }
      approve_verification: {
        Args: {
          p_verification_id: string
          p_reviewer_id: string
          p_expires_at?: string
        }
        Returns: undefined
      }
      report_fraud: {
        Args: {
          p_reported_user_id: string
          p_reporter_id: string
          p_report_type: string
          p_description: string
          p_severity?: string
          p_evidence_urls?: string[]
        }
        Returns: string
      }
    }
    Enums: {
      user_type: "player" | "coach" | "club" | "agent" | "sponsor" | "investor"
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
      user_type: ["player", "coach", "club", "agent", "sponsor", "investor"],
    },
  },
} as const
