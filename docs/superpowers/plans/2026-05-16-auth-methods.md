# Login Methods Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore guest entry and add phone OTP login beside the existing email/password flow.

**Architecture:** Keep all auth actions inside `useUserStore`, and let `LoginPage` switch between compact email and phone forms. Anonymous, phone, and email users all continue through the same existing profile/RLS/data pipeline after a session is established.

**Tech Stack:** React, Zustand, Ant Design, Supabase Auth

---

### Task 1: Extend auth store

**Files:**
- Modify: `src/store/useUserStore.ts`

- [ ] Add `signInAsGuest`, `sendPhoneOtp`, and `verifyPhoneOtp` store actions.
- [ ] Reuse `initUser()` after anonymous and phone login succeed.
- [ ] Keep profile loading unchanged so all authenticated sessions share the same downstream behavior.

### Task 2: Redesign login page controls

**Files:**
- Modify: `src/pages/LoginPage.tsx`

- [ ] Add a segmented switch for `邮箱登录` and `手机号登录`.
- [ ] Keep the existing email login/register path intact.
- [ ] Add phone number and OTP fields with a two-step send/verify flow.
- [ ] Restore a separate `访客体验` button beneath the main form.
- [ ] Keep success and failure feedback inside the existing Ant Design message pattern.

### Task 3: Verify

**Files:**
- Verify: `src/store/useUserStore.ts`
- Verify: `src/pages/LoginPage.tsx`

- [ ] Run `pnpm build`.
- [ ] Open `/login` and confirm the three entry paths are visible.
- [ ] Confirm guest login reaches `/books`.
- [ ] Confirm phone login presents provider errors clearly if Phone Auth is not enabled yet.
