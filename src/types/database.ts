export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          cover_url: string | null
          created_at: string
          id: string
          progress: number | null
          rating: number | null
          status: string
          tags: string[]
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          progress?: number | null
          rating?: number | null
          status: string
          tags?: string[]
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          created_at?: string
          id?: string
          progress?: number | null
          rating?: number | null
          status?: string
          tags?: string[]
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      card_appearances: {
        Row: {
          background_image_url: string | null
          card_key: string
          created_at: string
          id: string
          scope: string
          theme_color: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          background_image_url?: string | null
          card_key: string
          created_at?: string
          id?: string
          scope: string
          theme_color?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          background_image_url?: string | null
          card_key?: string
          created_at?: string
          id?: string
          scope?: string
          theme_color?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      collection_books: {
        Row: {
          book_id: string
          collection_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          collection_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          collection_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'collection_books_book_id_fkey'
            columns: ['book_id']
            isOneToOne: false
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'collection_books_collection_id_fkey'
            columns: ['collection_id']
            isOneToOne: false
            referencedRelation: 'collections'
            referencedColumns: ['id']
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      deleted_books: {
        Row: {
          author: string | null
          cover_url: string | null
          deleted_at: string
          id: string
          original_created_at: string | null
          original_updated_at: string | null
          progress: number | null
          rating: number | null
          status: string
          tags: string[]
          title: string
          type: string
          user_id: string
        }
        Insert: {
          author?: string | null
          cover_url?: string | null
          deleted_at?: string
          id: string
          original_created_at?: string | null
          original_updated_at?: string | null
          progress?: number | null
          rating?: number | null
          status: string
          tags?: string[]
          title: string
          type: string
          user_id: string
        }
        Update: {
          author?: string | null
          cover_url?: string | null
          deleted_at?: string
          id?: string
          original_created_at?: string | null
          original_updated_at?: string | null
          progress?: number | null
          rating?: number | null
          status?: string
          tags?: string[]
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      deleted_notes: {
        Row: {
          book_id: string | null
          book_title: string | null
          content: string
          deleted_at: string
          id: string
          original_created_at: string | null
          original_updated_at: string | null
          tags: string[]
          user_id: string
        }
        Insert: {
          book_id?: string | null
          book_title?: string | null
          content: string
          deleted_at?: string
          id: string
          original_created_at?: string | null
          original_updated_at?: string | null
          tags?: string[]
          user_id: string
        }
        Update: {
          book_id?: string | null
          book_title?: string | null
          content?: string
          deleted_at?: string
          id?: string
          original_created_at?: string | null
          original_updated_at?: string | null
          tags?: string[]
          user_id?: string
        }
        Relationships: []
      }
      notes: {
        Row: {
          book_id: string
          content: string
          created_at: string
          id: string
          tags: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          content: string
          created_at?: string
          id?: string
          tags?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          content?: string
          created_at?: string
          id?: string
          tags?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notes_book_id_fkey'
            columns: ['book_id']
            isOneToOne: false
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          nickname: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          nickname?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          nickname?: string
          updated_at?: string
        }
        Relationships: []
      }
      reading_plans: {
        Row: {
          book_id: string | null
          book_title: string
          created_at: string
          daily_goal: number
          end_date: string
          goal_unit: string
          id: string
          progress: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          book_title: string
          created_at?: string
          daily_goal: number
          end_date: string
          goal_unit: string
          id?: string
          progress?: number
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          book_title?: string
          created_at?: string
          daily_goal?: number
          end_date?: string
          goal_unit?: string
          id?: string
          progress?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reading_plans_book_id_fkey'
            columns: ['book_id']
            isOneToOne: false
            referencedRelation: 'books'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
