# Bundle Slimming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce first-load and route-load bundle cost through low-risk chunking and on-demand export code loading.

**Architecture:** Keep the current route boundaries intact, split heavyweight third-party dependencies into named vendor chunks, and move selected-book export helpers behind a dynamic import from `BooksPage`.

**Tech Stack:** Vite, React, TypeScript

---

### Task 1: Add a failing config test

**Files:**
- Create: `src/utils/__tests__/bundleConfig.test.ts`
- Modify: `vite.config.ts`

- [ ] Add a failing test that expects a manual chunk classifier to place `recharts`, `antd`, `pdf-lib`, `@supabase`, and React dependencies into named chunks.
- [ ] Run the test and confirm it fails before implementation.
- [ ] Implement the classifier and wire it into `vite.config.ts`.
- [ ] Re-run the test and confirm it passes.

### Task 2: Defer export builders

**Files:**
- Modify: `src/pages/BooksPage.tsx`

- [ ] Add a failing source assertion test proving `BooksPage` no longer statically imports the heavy export builders.
- [ ] Run the test and confirm it fails before implementation.
- [ ] Replace the static import with a dynamic import inside the export path.
- [ ] Re-run the test and confirm it passes.

### Task 3: Verify output

**Files:**
- No additional files

- [ ] Run `pnpm test`.
- [ ] Run `pnpm build`.
- [ ] Compare the largest emitted chunks against the previous baseline.
