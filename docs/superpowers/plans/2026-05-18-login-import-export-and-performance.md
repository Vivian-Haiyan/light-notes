# Login, Import, Export, And Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the login background, preserve the current book-card design while showing four books per desktop row, add editable `PDF / image` import plus `PDF / share-image` export, remove the theme helper copy, and smooth current data loading hot spots.

**Architecture:** Keep page components thin and move reusable file logic into focused utilities. `AddBookModal` owns editable import-draft state, export helpers build files on demand from selected books plus grouped notes, and the existing global data store is corrected to preload notes once and derive counts locally.

**Tech Stack:** React 18, TypeScript, Vite, Ant Design, Supabase JS, browser `Canvas`, `pdf-lib` loaded only when exporting PDF.

---

## File Structure

- Modify `src/pages/LoginPage.tsx` for the background image treatment.
- Modify `src/index.css` for stable four-column book layout and responsive sizing.
- Modify `src/pages/SettingsPage.tsx` to remove theme helper copy.
- Modify `src/components/AddBookModal.tsx` to support editable `PDF / image` import drafts.
- Modify `src/pages/BooksPage.tsx` and `src/hooks/useExportSelection.ts` to expose new export options.
- Modify `src/lib/globalDataStore.ts` to preload notes correctly.
- Create `src/utils/bookImport.ts` for upload recognition helpers.
- Create `src/utils/bookExport.ts` for selected-book export helpers.
- Create focused tests under `src/utils/__tests__/` and `src/lib/__tests__/`.

### Task 1: Add import draft helpers

**Files:**
- Create: `src/utils/bookImport.ts`
- Test: `src/utils/__tests__/bookImport.test.ts`

- [ ] **Step 1: Write the failing test** for filename cleanup, image draft defaults, and PDF metadata fallback.
- [ ] **Step 2: Run the test and confirm it fails** because the helper module does not exist yet.
- [ ] **Step 3: Implement the minimal helper functions** for file-name parsing and draft creation.
- [ ] **Step 4: Run the test and confirm it passes.**

### Task 2: Add export builders

**Files:**
- Create: `src/utils/bookExport.ts`
- Test: `src/utils/__tests__/bookExport.test.ts`

- [ ] **Step 1: Write failing tests** for structured export data and long-image layout modeling.
- [ ] **Step 2: Run the tests and confirm they fail** because the helpers are missing.
- [ ] **Step 3: Implement minimal formatter helpers** plus browser-side long-image and PDF builders.
- [ ] **Step 4: Run the tests and confirm they pass.**

### Task 3: Correct notes preloading

**Files:**
- Modify: `src/lib/globalDataStore.ts`
- Test: `src/lib/__tests__/globalDataStore.test.ts`

- [ ] **Step 1: Write a failing test** proving notes are grouped from the fetched collection rather than an empty query.
- [ ] **Step 2: Run the test and confirm the current implementation fails.**
- [ ] **Step 3: Implement the minimal fix** by loading notes once during initialization and refresh.
- [ ] **Step 4: Run the test and confirm it passes.**

### Task 4: Wire UI updates

**Files:**
- Modify: `src/pages/LoginPage.tsx`
- Modify: `src/index.css`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/components/AddBookModal.tsx`
- Modify: `src/pages/BooksPage.tsx`
- Modify: `src/hooks/useExportSelection.ts`
- Modify: `package.json`

- [ ] **Step 1: Update the login background, settings copy, and four-column layout** while keeping the current card content model.
- [ ] **Step 2: Add editable `PDF / image` import flow** into `AddBookModal` using the import-draft helpers.
- [ ] **Step 3: Add `PDF / image` export options** in `BooksPage` and route them through the export helpers.
- [ ] **Step 4: Install `pdf-lib`** for on-demand PDF creation.
- [ ] **Step 5: Run typecheck/build and resolve integration issues.**

### Task 5: Verify the user-facing flow

**Files:**
- No new files required

- [ ] **Step 1: Run unit tests.**
- [ ] **Step 2: Run `pnpm build`.**
- [ ] **Step 3: Start the dev server and verify in browser:** login background, four-card row, add-book import options, export menu options, and removed theme helper copy.
- [ ] **Step 4: Review touched React files against the React best-practices checklist.**
