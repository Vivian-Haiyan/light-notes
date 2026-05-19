# Theme Background And Books Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show full book covers on the books page, make all themes render consistently across the app, and center the settings-page theme labels.

**Architecture:** Keep `Layout` as the shared shell for signed-in pages and make `backgroundManager` the single source of truth for theme image selection. Reuse the same background-rendering logic on the note editor, and make the books grid and settings theme selector changes locally within their existing components.

**Tech Stack:** React 18, TypeScript, Vite, Ant Design, Framer Motion

---

## File Map

- Modify `src/utils/backgroundManager.ts`
  - Map each theme to the real background files that exist in `public/image`.
- Modify `src/components/BookCover.tsx`
  - Support non-cropping cover rendering while keeping placeholder behavior.
- Modify `src/pages/BooksPage.tsx`
  - Keep four cards per desktop row and resize the cover frame to a stable book ratio.
- Modify `src/pages/NoteEditPage.tsx`
  - Stop using hard-coded background files and reuse shared theme background logic.
- Modify `src/App.tsx`
  - Ensure `SettingsPage` and `ProfilePage` are wrapped by the shared `Layout`.
- Modify `src/pages/SettingsPage.tsx`
  - Center the theme-button labels with consistent sizing.
- Verify in browser
  - Books page
  - Settings page
  - Profile page
  - Note editor
  - Theme switching across `森绿`, `海蓝`, `暖橙`, `薰衣草`

## Task 1: Correct Theme Background Resolution

**Files:**
- Modify: `src/utils/backgroundManager.ts`

- [ ] **Step 1: Write a failing diagnostic check**

Run the app as-is and switch from `森绿` to `海蓝`.

Expected current behavior: `Layout` falls back to a gradient because `getBackgroundImage()` looks for `/image/海蓝/1.jpg`, which does not exist.

- [ ] **Step 2: Implement the minimal theme-path fix**

Update the theme background logic so:

```ts
if (theme === '森绿') {
  const ext = pageKey === '1' ? 'jpg' : 'png';
  imagePath = `/image/${pageKey}.${ext}`;
} else {
  imagePath = `/image/${theme}.png`;
}
```

Apply the same rule in `getBackgroundImageSync()`.

- [ ] **Step 3: Verify the fix**

Run:

```powershell
pnpm build
```

Expected: build succeeds with no TypeScript errors.

Then switch among the four themes in the browser.

Expected:
- `森绿` still varies by route.
- `海蓝`, `暖橙`, and `薰衣草` each use their single full-page asset.

## Task 2: Show Full Book Covers Without Losing Grid Density

**Files:**
- Modify: `src/components/BookCover.tsx`
- Modify: `src/pages/BooksPage.tsx`

- [ ] **Step 1: Reproduce the current crop**

Open the books page and inspect any tall cover such as `小王子.png`.

Expected current behavior: top or bottom edges are cropped because the card uses a fixed `260px` frame and cover-fit rendering.

- [ ] **Step 2: Implement non-cropping cover rendering**

Update `BookCover` to accept an optional fit mode:

```ts
interface BookCoverProps {
  coverUrl: string | null;
  style?: React.CSSProperties;
  alt?: string;
  fit?: 'cover' | 'contain';
}
```

Default it to `'cover'`, then use the chosen mode for both `backgroundSize` and the hidden image fallback.

- [ ] **Step 3: Resize the books-page cover frame**

Change the books-page cover wrapper from a fixed height to a stable ratio:

```ts
aspectRatio: '3 / 4',
background: 'rgba(245, 245, 245, 0.9)'
```

Render the cover with:

```tsx
<BookCover
  coverUrl={book.cover_url}
  fit="contain"
  style={{ height: '100%', width: '100%' }}
/>
```

- [ ] **Step 4: Verify the fix**

In the browser:
- confirm four cards still fit in one desktop row;
- confirm each tall cover is fully visible;
- confirm spacing still looks balanced with the metadata below.

## Task 3: Bring Stray Pages Into The Shared Theme Background System

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/NoteEditPage.tsx`

- [ ] **Step 1: Reproduce the inconsistent pages**

Switch to `海蓝`, then open:
- `/settings`
- `/profile`
- `/notes/new`

Expected current behavior:
- `settings` and `profile` do not receive the shared themed shell.
- `notes/new` still uses hard-coded background art.

- [ ] **Step 2: Wrap settings and profile with `Layout`**

Update the matching routes in `App.tsx` so they render:

```tsx
<Layout>
  <ProfilePage />
</Layout>
```

and

```tsx
<Layout>
  <SettingsPage />
</Layout>
```

Import `Layout` in `App.tsx`.

- [ ] **Step 3: Reuse shared theme resolution in the note editor**

Replace the hard-coded `backgroundImage` assignment in `NoteEditPage.tsx` with background state loaded through the existing manager:

```ts
const pageKey = isEdit ? '5' : '4';
```

Load `getBackgroundImage(pageKey)`, `getThemeColor()`, `themeBackgrounds`, and `themeOverlayColors`, and listen for `themeChange` the same way `LoginPage` already does.

- [ ] **Step 4: Verify the fix**

Switch themes and confirm:
- `/settings` follows the active theme;
- `/profile` follows the active theme;
- `/notes/new` and edit mode follow the active theme and still render readable cards above the overlay.

## Task 4: Center The Settings Theme Labels

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Reproduce the misalignment**

Open settings and compare the vertical position of `森绿`, `海蓝`, `暖橙`, and `薰衣草`.

Expected current behavior: the labels sit slightly off-center because sizing relies on padding alone.

- [ ] **Step 2: Implement centered button layout**

Update each `Radio.Button` style to include:

```ts
height: '44px',
display: 'inline-flex',
alignItems: 'center',
justifyContent: 'center',
lineHeight: 1,
padding: '0 28px',
```

Keep the existing gradients, colors, and widths.

- [ ] **Step 3: Verify the fix**

In the browser, confirm the text in all four buttons is horizontally and vertically centered at normal desktop width and after wrapping to a second row.

## Task 5: Full-Page Verification

**Files:**
- No production files

- [ ] **Step 1: Run the production build**

Run:

```powershell
pnpm build
```

Expected: successful build with no TypeScript errors.

- [ ] **Step 2: Do a browser pass**

Check:
- `/books`
- `/settings`
- `/profile`
- `/notes/new`
- one note edit route if available

For each route, switch through:
- `森绿`
- `海蓝`
- `暖橙`
- `薰衣草`

Expected:
- books page covers are complete;
- all four themes look coherent;
- non-green themes use their single backdrop image across the app;
- settings theme labels stay centered.

- [ ] **Step 3: Record any residual caveats**

If a page still uses its own hard-coded accent colors, note that as out-of-scope for this change unless it blocks readability.
