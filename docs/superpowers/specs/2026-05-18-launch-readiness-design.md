# Launch Readiness Design

## Goal

Prepare the current reading app for a real production release by removing the concrete blockers found in the deployment review:

1. Support deep links on Vercel for the Vite SPA.
2. Keep local development artifacts and environment files out of source control.
3. Make the existing lint command usable in CI.
4. Move uploaded book covers out of database rows and into private Supabase Storage.

## Deployment Readiness

- Add a root `vercel.json` that rewrites all routes to `/index.html`.
- Add a root `.gitignore` covering dependencies, build output, local environment files, logs, and browser-test artifacts.
- Add a minimal ESLint configuration that matches the existing TypeScript + React setup and allows `pnpm lint` to run successfully.

## Cover Storage Design

- Add a private `book-covers` Storage bucket.
- Mirror the existing avatar/card-background ownership model:
  - each object path starts with the authenticated user's ID
  - only the owner can read, insert, update, or delete their own files
- Extend `src/lib/storage.ts` with a focused `uploadBookCoverFile()` helper.
- Keep `books.cover_url` as the persisted field, but store the signed URL returned by Storage instead of a base64 data URL.
- Reuse the same upload path for:
  - manual cover selection
  - auto-filled cover previews from imported image files

## Import Flow

- `buildBookDraftFromFile()` should continue deriving editable title and author defaults.
- Image drafts should keep a temporary preview URL for the modal only.
- Saving a book should upload the image source file first, then persist the returned signed URL.
- Source images should be validated before processing:
  - only image files
  - max 5 MB
- PDFs continue to prefill title/author only and do not upload cover files automatically.

## Existing Data

- Existing books that already contain base64 cover URLs remain readable.
- This pass will not migrate historical rows automatically; the new upload path prevents new rows from growing the same way.

## Error Handling

- Failed cover uploads should leave the modal open and surface a clear error.
- Unsupported or oversized source files should be rejected before expensive work begins.
- Signed URL creation failure should fail the upload transaction rather than persisting a broken cover value.

## Testing

- Add tests proving imported image drafts keep a file reference for later upload.
- Add tests proving the Vercel rewrite and ignore files exist with the expected contents.
- Add tests for the book-cover path builder so user-owned object paths stay predictable.
- Keep the existing build, test, and export coverage intact.

## Non-Goals

- Do not redesign book cards or the import UI.
- Do not bulk-migrate historical cover rows in this pass.
- Do not add a public bucket or expose book-cover files without authentication.

## Validation

1. Direct navigation to nested routes works after deployment configuration is added.
2. `pnpm lint`, `pnpm test`, and `pnpm build` all pass locally.
3. New uploaded covers are stored in Supabase Storage under the current user's prefix.
4. New books persist signed cover URLs rather than image data URLs.
5. Existing books with old data URLs continue to render.
