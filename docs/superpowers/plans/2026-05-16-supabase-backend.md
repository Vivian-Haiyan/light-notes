# Supabase Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current local-only data layer with a secure Supabase backend that supports auth, multi-user data isolation, persistent storage, and one-time local-data migration.

**Architecture:** Use Supabase Auth for identity, Postgres tables with RLS for application data, and Storage buckets for user-uploaded media. Keep page-level APIs stable by replacing repository implementations beneath `src/data/*` and upgrading the auth store beneath `src/store/useUserStore.ts`.

**Tech Stack:** React 18, TypeScript, Vite, Zustand, Supabase Auth, Postgres, Supabase Storage

---

## Task 1: Create Supabase Schema And Policies

**Files:**
- Remote DB only

- [ ] Create tables:
  - `profiles`
  - `books`
  - `notes`
  - `collections`
  - `collection_books`
  - `reading_plans`
  - `deleted_books`
  - `deleted_notes`
  - `card_appearances`
- [ ] Enable RLS on all tables.
- [ ] Add ownership-based policies for authenticated users.
- [ ] Add trigger/function to create a profile row after auth sign-up.
- [ ] Verify with SQL that tables, constraints, and policies exist.

## Task 2: Create Storage Buckets And Policies

**Files:**
- Remote DB / Storage only

- [ ] Create private buckets:
  - `avatars`
  - `card-backgrounds`
- [ ] Add policies so users can manage only files under their own folder prefix.
- [ ] Verify bucket existence and policy behavior.

## Task 3: Add Frontend Supabase Client And Types

**Files:**
- Create: `src/lib/supabase.ts`
- Create: `src/types/database.ts`
- Modify: `.env`

- [ ] Fill `VITE_SUPABASE_URL`.
- [ ] Add the public anon/publishable key variable slot.
- [ ] Add a single shared client.
- [ ] Generate or define TypeScript database types.

## Task 4: Replace Fake Auth With Supabase Auth

**Files:**
- Modify: `src/store/useUserStore.ts`
- Modify: `src/pages/LoginPage.tsx`

- [ ] Replace local fake login with Supabase sign-up/sign-in/session handling.
- [ ] Load profile metadata from `profiles`.
- [ ] Update nickname/avatar writes to Supabase.
- [ ] Preserve session across refresh.

## Task 5: Replace Local Data Repositories

**Files:**
- Modify:
  - `src/data/books.ts`
  - `src/data/notes.ts`
  - `src/data/collections.ts`
  - `src/data/readingPlans.ts`
  - `src/data/deletedBooks.ts`
  - `src/data/deletedNotes.ts`
  - `src/utils/cardAppearance.ts`

- [ ] Preserve existing exported function names where practical.
- [ ] Replace browser-local reads/writes with Supabase CRUD.
- [ ] Move card appearance persistence to the `card_appearances` table.
- [ ] Keep trash flows working through deleted tables.

## Task 6: Move Uploads To Storage

**Files:**
- Modify:
  - `src/store/useUserStore.ts`
  - `src/components/CardAppearanceEditor.tsx`
  - any avatar/image upload call sites

- [ ] Upload avatars to `avatars/<user-id>/...`
- [ ] Upload card backgrounds to `card-backgrounds/<user-id>/...`
- [ ] Save returned object paths/URLs in the database.

## Task 7: Add One-Time Local Migration

**Files:**
- Create: `src/utils/localDataMigration.ts`
- Modify a suitable entry point or settings flow

- [ ] Read current local data sets.
- [ ] Insert them into Supabase under the current user.
- [ ] Mark migration completion so it does not repeat.
- [ ] Verify imported counts.

## Task 8: Verification

- [ ] Run production build.
- [ ] Verify auth sign-up/sign-in/sign-out/session restore.
- [ ] Verify CRUD for books, notes, collections, reading plans.
- [ ] Verify card appearances and uploaded images persist.
- [ ] Verify RLS isolation with at least two users or policy-targeted SQL checks.
