# Theme Background And Books Layout Design

## Goal

Improve three related presentation issues:

1. Show full book covers on the books home page without reducing the current desktop density of four books per row.
2. Make theme switching visually consistent across the app:
   - `森绿` keeps page-specific backgrounds from `/image/1.jpg` and `/image/2.png` through `/image/8.png`.
   - `海蓝`, `暖橙`, and `薰衣草` each use one theme-specific full-page background image across the whole app.
3. Center the theme names inside the theme selector buttons on the settings page.

## Current Problems

### Books Home

The books grid currently uses a fixed-height cover area with `background-size: cover`, which crops tall book-cover artwork instead of showing the full image.

### Theme Backgrounds

The background manager currently expects non-green themes to provide page-specific files under paths such as `/image/海蓝/1.jpg`, but the project actually ships single full-page assets:

- `/image/海蓝.png`
- `/image/暖橙.png`
- `/image/薰衣草.png`

Some pages also bypass the shared `Layout` background container entirely, which makes the theme change feel partial.

### Theme Buttons

The settings page uses `Radio.Button` controls with padding-only sizing, so the label text is not reliably centered inside each button.

## Recommended Approach

Use one shared background system for all app pages while keeping the existing layout model intact.

### 1. Books Home Layout

- Keep the desktop grid at four columns.
- Replace the fixed `260px` cover frame with a stable book-cover ratio close to the source assets (`3:4`).
- Display the actual cover with a non-cropping fit mode so the entire cover is visible.
- Use a soft neutral backing surface behind the image when aspect-ratio differences leave spare space.

### 2. Theme Background Strategy

- Preserve page-specific images only for `森绿`.
- Route all other themes to their single provided full-page image asset:
  - `海蓝` -> `/image/海蓝.png`
  - `暖橙` -> `/image/暖橙.png`
  - `薰衣草` -> `/image/薰衣草.png`
- Reuse the same background rendering rules everywhere: full-page cover sizing, centered positioning, and consistent overlay treatment.
- Bring pages that currently skip the shared background shell into the same system, especially `设置`, `个人资料`, and `笔记编辑`.

### 3. Settings Theme Selector

- Keep the current four-button selector.
- Give each button a fixed shared height and use flex alignment so labels are horizontally and vertically centered.

## UX Notes

- The books page should remain dense enough for quick scanning.
- The non-green themes should feel cohesive rather than page-by-page.
- Existing cards and controls should remain readable over the new backgrounds through the existing translucent overlays.

## Validation

1. Books home:
   - Four cards remain visible per desktop row.
   - Tall cover art is fully visible without cropping.
2. Theme switching:
   - `森绿` still changes by page.
   - `海蓝`, `暖橙`, and `薰衣草` each use their own whole-page background on all main app pages.
   - `设置`, `个人资料`, and `笔记编辑` visually follow the active theme.
3. Settings page:
   - Theme names sit centered in their buttons at common browser sizes.

## Scope

This change does not redesign the whole theme-token system or restyle every green accent in the app. It focuses on background consistency, book-cover visibility, and selector alignment.
