# Launch Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the app safe to deploy by adding SPA deployment config, repo hygiene, a working lint baseline, and a storage-backed book-cover flow.

**Architecture:** Keep deployment fixes at the project root and keep cover-storage logic inside `src/lib/storage.ts`. Import utilities return editable draft metadata plus an optional source image file, while UI components upload through one shared storage path before persisting books.

**Tech Stack:** React 18, TypeScript, Vite, ESLint, Supabase JS, Supabase Storage, Vercel.

---

## File Structure

- Create `vercel.json` for SPA route rewrites.
- Create `.gitignore` for local artifacts and environment files.
- Create `.eslintrc.cjs` for the existing lint script.
- Modify `src/lib/storage.ts` to support book-cover uploads.
- Modify `src/utils/bookImport.ts` and `src/components/AddBookModal.tsx` to carry image source files into the save step.
- Modify `src/components/ImageUploader.tsx` so manual uploads reuse the same callback contract.
- Create focused tests under `src/utils/__tests__/` for deployment config and import/storage helpers.

### Task 1: Add deployment safety rails

**Files:**
- Create: `vercel.json`
- Create: `.gitignore`
- Create: `.eslintrc.cjs`
- Test: `src/utils/__tests__/deploymentConfig.test.ts`

- [ ] **Step 1: Write failing tests** that assert the SPA rewrite config and ignore list exist.
- [ ] **Step 2: Run the tests and confirm they fail** because the files do not exist yet.
- [ ] **Step 3: Add the minimal root config files.**
- [ ] **Step 4: Run the tests again and confirm they pass.**

### Task 2: Add storage-backed cover helpers

**Files:**
- Modify: `src/lib/storage.ts`
- Test: `src/utils/__tests__/bookCoverStorage.test.ts`

- [ ] **Step 1: Write a failing test** for the book-cover object-path builder.
- [ ] **Step 2: Run the test and confirm it fails** because the helper does not exist yet.
- [ ] **Step 3: Implement the minimal helper and upload function.**
- [ ] **Step 4: Run the test and confirm it passes.**

### Task 3: Preserve editable imports while deferring image persistence

**Files:**
- Modify: `src/utils/bookImport.ts`
- Modify: `src/components/AddBookModal.tsx`
- Modify: `src/components/ImageUploader.tsx`
- Test: `src/utils/__tests__/bookImport.test.ts`

- [ ] **Step 1: Update the existing import test** so image drafts expose the source file for later upload.
- [ ] **Step 2: Run the test and confirm it fails** against the current draft model.
- [ ] **Step 3: Implement the minimal draft and upload wiring** while keeping preview behavior intact.
- [ ] **Step 4: Run the import tests and confirm they pass.**

### Task 4: Prepare Supabase Storage

**Files:**
- Remote Supabase project schema and storage metadata

- [ ] **Step 1: Create a `book-covers` bucket** matching the existing private bucket model.
- [ ] **Step 2: Add owner-only Storage policies** for read, insert, update, and delete.
- [ ] **Step 3: Query the project to confirm the bucket and policies exist.**

### Task 5: Verify release readiness

**Files:**
- No new files required

- [ ] **Step 1: Run `pnpm lint`.**
- [ ] **Step 2: Run `pnpm test`.**
- [ ] **Step 3: Run `pnpm build`.**
- [ ] **Step 4: Use the browser to verify login, book list, book detail, and add-book flows.**
