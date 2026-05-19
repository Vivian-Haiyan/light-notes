# Themed Sidebar And Custom Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the sidebar theme-aware, tighten the books grid, and add polished per-card appearance customization to inspiration and tag cards.

**Architecture:** Extend the existing theme system with sidebar palettes, keep books-page changes local, and introduce one reusable custom-card appearance layer shared by inspirations and tags. Persist appearance choices in local storage so uploaded images and color presets survive refreshes.

**Tech Stack:** React 18, TypeScript, Vite, Ant Design, Framer Motion

---

## File Map

- Modify `src/utils/backgroundManager.ts`
  - Add sidebar palette values per theme.
- Modify `src/components/Sidebar.tsx`
  - Consume theme-aware palette values.
- Modify `src/pages/BooksPage.tsx`
  - Tighten the books grid/card sizing and use filled cover rendering.
- Copy asset
  - Sync `image/月亮与六便士.png` to `public/image/月亮与六便士.png`.
- Create `src/utils/cardAppearance.ts`
  - Define the shared card appearance model and local-storage helpers.
- Create `src/components/CardAppearanceEditor.tsx`
  - Reusable preset-color / upload-image / reset editor.
- Modify `src/pages/InspirationsPage.tsx`
  - Redesign cards and wire per-card appearance editing.
- Modify `src/pages/TagsPage.tsx`
  - Redesign cards and wire per-card appearance editing.

## Task 1: Theme-Aware Sidebar

**Files:**
- Modify: `src/utils/backgroundManager.ts`
- Modify: `src/components/Sidebar.tsx`

- [ ] Add a `themeSidebarPalettes` map keyed by theme with background, border, hover, selected, and text accent values.
- [ ] Consume the active theme inside `Sidebar` via the existing theme hook or manager.
- [ ] Replace hard-coded sidebar colors with palette-driven values.
- [ ] Verify all four themes show visibly different sidebar treatments while keeping menu text readable.

## Task 2: Denser Books Grid And Latest Cover Asset

**Files:**
- Modify: `src/pages/BooksPage.tsx`
- Copy: `image/月亮与六便士.png` -> `public/image/月亮与六便士.png`

- [ ] Copy the newer asset from `image/` into `public/image/`.
- [ ] Switch the books-page cover back to filled rendering.
- [ ] Reduce the books grid footprint:
  - smaller cover frame ratio / height
  - tighter metadata padding
  - slightly smaller title/author typography
  - tighter vertical gaps
- [ ] Keep four cards per desktop row.
- [ ] Verify the new cover asset is the one shown and that the page feels denser without looking cramped.

## Task 3: Shared Card Appearance Utilities

**Files:**
- Create: `src/utils/cardAppearance.ts`
- Create: `src/components/CardAppearanceEditor.tsx`

- [ ] Define:
  - preset appearance options
  - `CardAppearance`
  - storage helpers for loading/saving appearances by scope and card id
- [ ] Add reusable image-upload behavior for card backgrounds.
- [ ] Build a compact editor component with:
  - preset swatches
  - image upload
  - reset action
- [ ] Verify saved settings survive refresh by reading/writing local storage.

## Task 4: Redesign And Customize Inspiration Cards

**Files:**
- Modify: `src/pages/InspirationsPage.tsx`

- [ ] Add local appearance state keyed by note id.
- [ ] Add a top-right palette action on each card.
- [ ] Apply preset/image appearance choices to each card independently.
- [ ] Refine card visuals:
  - richer depth
  - ornamental accent
  - improved text/tag/date hierarchy
- [ ] Preserve existing select/export behavior.
- [ ] Verify different cards can hold different visual styles simultaneously.

## Task 5: Redesign And Customize Tag Cards

**Files:**
- Modify: `src/pages/TagsPage.tsx`

- [ ] Add local appearance state keyed by tag name.
- [ ] Add the shared palette action to each tag card.
- [ ] Apply preset/image appearance choices to each card independently.
- [ ] Refine card visuals with subtle decoration while preserving rename/delete affordances.
- [ ] Verify different tag cards can hold different styles simultaneously.

## Task 6: Verification

**Files:**
- No new production files

- [ ] Run:

```powershell
pnpm build
```

- [ ] In the browser, verify:
  - `/books`
  - `/inspirations`
  - `/tags`
  - at least two different themes
- [ ] Confirm:
  - sidebar adapts with theme
  - books cards are denser and `月亮与六便士` uses the newest asset
  - per-card customization works for inspirations and tags
  - custom images and presets persist after refresh
