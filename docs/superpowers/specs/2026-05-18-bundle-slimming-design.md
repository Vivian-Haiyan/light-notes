# Bundle Slimming Design

## Goal

Reduce load cost without changing the current UI or introducing risky rewrites.

## Recommended Approach

1. Keep the current route-level lazy loading.
2. Add stable vendor chunk boundaries for:
   - React runtime
   - Ant Design
   - Supabase
   - Recharts
   - PDF export support
3. Keep `StatsPage` lazy by route, but isolate `recharts` so chart code is never mixed into common app chunks.
4. Move selected-book export builders behind an on-demand dynamic import so the books page does not download PDF and share-image logic before the user requests export.

## Why This Approach

- It improves first-load and repeat-load caching without changing behavior.
- It keeps the existing design system and page structure intact.
- It avoids heavier refactors such as replacing `Ant Design` or rebuilding chart widgets.

## Validation

1. Production build succeeds.
2. The app still passes the existing test suite.
3. The build output shows distinct chunks for major vendors.
4. The largest generic application chunk shrinks compared with the pre-change baseline.
5. Export behavior still works after moving the export builders to dynamic import.

## Non-Goals

- Replacing `Ant Design`
- Replacing `Recharts`
- Rewriting the stats dashboard
- Introducing SSR or a different build system
