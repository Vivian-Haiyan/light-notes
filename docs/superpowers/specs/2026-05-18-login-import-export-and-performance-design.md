# Login, Import, Export, And Performance Design

## Goal

Improve the current reading app in four connected ways:

1. Use `/image/1.jpg` as the login-page background.
2. Keep the existing book-card presentation while showing four books per desktop row.
3. Expand book import/export so users can work with `PDF` and image files in addition to the existing formats.
4. Remove low-value theme helper copy and make the app feel smoother during everyday use.

## Visual Design

### Login Page

- Replace the current gradient-only login background with `/image/1.jpg`.
- Keep the centered login panel and add a soft overlay so text and controls remain legible.
- Do not redesign the authentication flow or the panel layout.

### Books Home

- Keep the current card structure:
  - full cover area
  - title and author
  - status and notes count
- Reduce the overall card footprint slightly if needed, but do not remove information or change the visual model.
- Keep desktop rows at four cards by tuning the outer grid width, card width, and responsive breakpoints rather than rewriting the card itself.
- Preserve responsive behavior on smaller screens.

### Settings Page

- Remove the explanatory paragraph shown below the theme selector controls.

## File Import And Export

### Add New Book Import

- Preserve the existing `JSON / CSV` bulk import path.
- Add a separate `PDF / image` import path for creating a single new book.
- Imported `PDF / image` files first become an editable draft rather than being saved immediately.
- Automatic recognition should prefill whatever can be derived reliably:
  - file name -> default title
  - image file -> default cover preview
  - PDF metadata -> title and author when available
- The user can still edit title, author, cover, status, and type before confirming.
- When recognition is incomplete, the flow should still succeed with sensible defaults instead of blocking.

### Selected Books Export

- Keep current `JSON / CSV` export for selected books.
- Add `PDF` export for selected books, containing readable book metadata plus their notes.
- Add `image` export as a single long share image rather than one image per book.
- The long image should be vertically laid out and suitable for sharing, including:
  - title
  - author
  - cover
  - reading status
  - note excerpts or note summary

### Data Manager

- Keep whole-library backup and restore focused on structured data.
- Preserve `JSON` import/export and `Markdown` export there.
- Clarify labels so users can distinguish:
  - importing a backup
  - importing a new book from a source file

## Data Flow

### Import Drafts

- A dedicated parser layer should convert `PDF / image` uploads into a lightweight draft object.
- UI state owns that draft until the user confirms.
- Confirming reuses the normal `addBook` path so validation and duplicate checks stay consistent with manual creation.

### Export Builders

- Export generation should be separated from the page component:
  - structured data formatter
  - PDF builder
  - share-image builder
- The page should only gather selected books plus their notes and call the requested builder.

## Performance Design

- Keep the existing page split and lazy-loaded routes.
- Improve the current data initialization path so notes are actually fetched once and grouped client-side instead of triggering extra lookups later.
- Avoid eager export work; generate `PDF` and long images only after the user asks for them.
- Lazy-load visual export dependencies if new libraries are required.
- Keep derived homepage values memoized and avoid changing the book-card tree when unrelated state changes.
- Defer or downscale large image processing work where possible so importing a cover does not freeze the interface.

## Error Handling

- Unsupported import formats should fail with a clear message.
- If automatic recognition fails, fall back to editable defaults rather than losing the import flow.
- Export failures should report which export type failed.
- Long-image generation should handle missing covers and books without notes gracefully.

## Testing

- Add focused unit coverage for:
  - file-name parsing and import draft generation
  - export formatting helpers
  - share-image layout model generation
  - notes grouping behavior used by the global data store
- Add browser verification for:
  - login page background
  - four-card desktop book grid
  - add-book import flow
  - export menu options
  - removed theme helper text

## Non-Goals

- Do not redesign the whole app theme system.
- Do not build a full attachment library or e-reader.
- Do not add OCR or heavy PDF text extraction in this pass.
- Do not change the existing book-card visual language beyond small sizing adjustments needed for four cards per row.

## Validation

1. Login uses `/image/1.jpg` and remains readable.
2. Desktop home page shows four books per row while preserving the current card information structure.
3. Users can import:
   - bulk `JSON / CSV`
   - single `PDF / image` files with editable auto-filled fields
4. Users can export selected books as:
   - `JSON`
   - `CSV`
   - `PDF`
   - one long share image
5. Theme helper text under the selector is gone.
6. Common interactions feel smoother, with no unnecessary eager export work and corrected note preloading.
