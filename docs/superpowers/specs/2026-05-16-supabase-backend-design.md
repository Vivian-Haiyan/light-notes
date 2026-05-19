# Supabase Backend Design

## Goal

Turn the current browser-local reading app into a real multi-user cloud-backed product using Supabase Auth, Postgres, Row Level Security, and Storage.

## Current State

- `books`, `notes`, `collections`, `readingPlans`, deleted items, user state, and card appearances are all stored in `localStorage`.
- `.env` still contains placeholder Supabase values.
- No real backend schema, RLS policy set, or Storage bucket exists in the app codebase.

## Recommended Architecture

Use Supabase as the backend of record:

- Auth for sign-up, login, logout, and sessions
- Postgres for structured app data
- RLS for per-user isolation
- Storage for avatar images and card-background uploads

## Data Model

### `profiles`

- `id uuid primary key references auth.users(id)`
- `email text`
- `nickname text`
- `avatar_url text`
- timestamps

### `books`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- title, author, cover_url, status, type, progress, rating, tags
- timestamps

### `notes`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `book_id uuid references books(id)`
- content, tags
- timestamps

### `collections`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- name, description
- timestamps

### `collection_books`

- `collection_id uuid references collections(id)`
- `book_id uuid references books(id)`
- `user_id uuid references auth.users(id)`
- composite primary key `(collection_id, book_id)`

### `reading_plans`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `book_id uuid references books(id)`
- book_title, start_date, end_date, daily_goal, goal_unit, progress, status
- timestamps

### `deleted_books`

- same display fields needed by the trash view
- `user_id`
- deletion timestamp

### `deleted_notes`

- same display fields needed by the trash view
- `user_id`
- deletion timestamp

### `card_appearances`

- `id uuid primary key`
- `user_id uuid references auth.users(id)`
- `scope text check in ('inspirations', 'tags')`
- `card_key text`
- `theme_color text`
- `background_image_url text`
- timestamps
- unique `(user_id, scope, card_key)`

## Access Control

- Enable RLS on every app table.
- Policies use `auth.uid()` and user ownership checks.
- Each authenticated user can only select, insert, update, and delete their own rows.
- Foreign-key tables such as `collection_books` also carry `user_id` so policy checks remain direct and efficient.
- The browser only uses public client credentials, never service-role secrets.

## Storage

Create private buckets:

- `avatars`
- `card-backgrounds`

Objects are stored under per-user prefixes. Storage policies allow users to manage only files under their own prefix.

## Frontend Integration

- Add a single Supabase client module.
- Replace `localStorage` repositories in `src/data/*.ts` with Supabase-backed implementations while preserving existing function signatures where practical.
- Replace fake local auth in `useUserStore` with Supabase Auth session handling.
- Use Storage uploads for avatar images and card-background images.
- Keep UI-level changes narrow by retaining current page APIs.

## Migration Strategy

- Provide a one-time import from existing `localStorage` content into the authenticated user's Supabase records.
- After migration, cloud data becomes the source of truth.
- Preserve current user-visible data where possible:
  - books
  - notes
  - collections
  - reading plans
  - deleted items
  - card appearances

## Validation

1. Users can sign up, log in, log out, and refresh without losing session.
2. Two users cannot read each other's rows.
3. Existing local data can be imported once into cloud tables.
4. Books, notes, collections, reading plans, trash, avatars, and card appearances all persist across reloads and devices.
5. Storage uploads are private to the current user.

## Scope

This work does not add Edge Functions, team collaboration, live presence, or audit logging yet. It focuses on making the current product fully cloud-backed and secure for individual users.
