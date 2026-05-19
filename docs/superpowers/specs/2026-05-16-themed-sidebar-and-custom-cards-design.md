# Themed Sidebar And Custom Cards Design

## Goal

Improve four related areas:

1. Make the left sidebar adapt to the active theme.
2. Make the books page denser and more browse-friendly.
3. Refresh the inspirations cards with a more polished visual style.
4. Refresh the tags cards and let each inspiration/tag card choose its own theme color or uploaded background image.

## Current Problems

### Sidebar

The sidebar uses one fixed warm-neutral background and fixed hover colors, so it feels detached from non-green themes.

### Books Page

- The card layout is visually large for browsing.
- The book metadata footer takes more vertical space than needed.
- `public/image/月亮与六便士.png` is older than the newer source asset in `image/月亮与六便士.png`.
- The requested current behavior is now for book covers to fill their frames.

### Inspirations Cards

The current inspiration cards are flat color blocks with minimal hierarchy and no per-card visual customization.

### Tags Cards

The current tags cards are plain utility cards with little character and no per-card visual customization.

## Recommended Approach

Keep books-page changes local, but create one shared "card appearance" capability for inspirations and tags.

### 1. Theme-Adaptive Sidebar

- Add sidebar palette values per theme.
- Use those values for:
  - sidebar background
  - separator borders
  - selected item background
  - hover state
  - user-menu hover state
- Keep the treatment light and translucent so the sidebar still feels calm and readable.

### 2. Denser Books Page

- Copy the newest `月亮与六便士.png` asset from `image/` into the app-served image directory.
- Use filled cover rendering on the books page.
- Reduce the overall book-card scale by:
  - shrinking the visual footprint of the cover frame slightly
  - reducing footer padding
  - tightening title/author spacing and type sizes
- Preserve four cards per desktop row.

### 3. Shared Card Appearance Model

Create a reusable appearance model for customizable cards:

- `themeColor`: one of several curated presets
- `backgroundImage`: optional uploaded image URL
- `updatedAt`: optional bookkeeping if useful for future extension

Persist settings per card:

- inspiration cards keyed by note id
- tag cards keyed by tag name

Uploaded images take precedence over theme colors. If neither is present, cards use their default style.

### 4. Inspirations Card Redesign

- Improve hierarchy with richer spacing, ornamental accents, and a more crafted paper-card feel.
- Add a small palette action in the card's top-right corner.
- The palette action opens a compact editor with:
  - preset theme colors
  - image upload
  - reset-to-default option
- Keep current interactions such as selection/export support intact.

### 5. Tags Card Redesign

- Apply a more refined card treatment with subtle decoration, clearer hierarchy, and slightly richer depth.
- Add the same top-right palette action and shared editor as inspirations cards.
- Preserve existing rename/delete actions and quick scanability.

## UX Notes

- Books should feel easier to browse, not more decorative.
- Inspirations cards may be more expressive.
- Tags cards should be prettier but still operational.
- Card customization should feel discoverable but not noisy; a compact icon button is preferable to persistent explanatory text.

## Validation

1. Sidebar:
   - all four app themes produce a visibly adapted sidebar
   - active and hover states remain readable
2. Books:
   - the latest `月亮与六便士` asset is shown
   - cards are visibly smaller and metadata area is shorter
   - covers fill the frame
3. Inspirations:
   - redesigned cards look more polished
   - each card can store a separate preset color or uploaded background image
4. Tags:
   - redesigned cards look more polished
   - each tag card can store a separate preset color or uploaded background image
5. Persistence:
   - custom card appearances survive refresh

## Scope

This change does not redesign every component in the app, build a full global design-token system, or add advanced image editing. It focuses on the user-selected sidebar, books cards, inspirations cards, and tags cards.
