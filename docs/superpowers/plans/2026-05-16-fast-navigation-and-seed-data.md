# Fast Navigation And Seed Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the existing layouts while making sidebar navigation faster and restoring first-run sample data for empty accounts.

**Architecture:** Optimize only the data access layer used by page fetches, replacing N+1 lookups with batch reads and local maps. Add a one-time seed helper that inserts the original demo books and notes only for users whose remote bookshelf is empty.

**Tech Stack:** React, TypeScript, Supabase

---

### Task 1: Add one-time seed data

**Files:**
- Create: `src/utils/defaultSeedData.ts`
- Modify: `src/store/useUserStore.ts`

- [ ] Add default books and notes based on the original UI examples.
- [ ] Add `ensureDefaultSeedData()` that checks for an empty remote bookshelf and inserts defaults once.
- [ ] Call the helper after login initialization without overwriting existing user data.

### Task 2: Remove N+1 queries from bookshelf and inspirations

**Files:**
- Modify: `src/data/notes.ts`
- Modify: `src/pages/BooksPage.tsx`
- Modify: `src/pages/InspirationsPage.tsx`

- [ ] Add batch note retrieval helpers.
- [ ] Replace per-book note fetches on the bookshelf page with a single note query and in-memory grouping.
- [ ] Replace per-note book fetches on the inspirations page with one batch book query and local lookup.

### Task 3: Verify

**Files:**
- Verify: `src/utils/defaultSeedData.ts`
- Verify: `src/pages/BooksPage.tsx`
- Verify: `src/pages/InspirationsPage.tsx`

- [ ] Run `pnpm build`.
- [ ] Open the app with an empty account and confirm the default books, inspirations, and tags appear.
- [ ] Navigate with the left sidebar and confirm the layout remains unchanged while transitions feel faster.
