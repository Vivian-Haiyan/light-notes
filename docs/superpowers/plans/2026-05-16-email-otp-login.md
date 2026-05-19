# Email OTP Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unused phone OTP path with a real email OTP path while renaming the login modes to `密码登录` and `验证码登录`.

**Architecture:** Keep authentication actions in `useUserStore`, and let `LoginPage` switch between password and email OTP forms. Email/password, email OTP, and anonymous users continue through the same Supabase session and profile-loading path once authenticated.

**Tech Stack:** React, Zustand, Ant Design, Supabase Auth

---

### Task 1: Extend auth store

**Files:**
- Modify: `src/store/useUserStore.ts`

- [ ] Replace phone OTP store actions with `sendEmailOtp(email)` and `verifyEmailOtp(email, token)`.
- [ ] Use `supabase.auth.signInWithOtp({ email })` and `supabase.auth.verifyOtp({ email, token, type: 'email' })`.
- [ ] Keep shared session initialization unchanged.

### Task 2: Update login page

**Files:**
- Modify: `src/pages/LoginPage.tsx`

- [ ] Rename segmented labels to `密码登录` and `验证码登录`.
- [ ] Replace phone and SMS inputs with email plus OTP inputs.
- [ ] Keep a two-step send/verify flow for the 6-digit code.
- [ ] Keep `访客体验` unchanged.
- [ ] Remove phone-specific error copy.

### Task 3: Verify

**Files:**
- Verify: `src/store/useUserStore.ts`
- Verify: `src/pages/LoginPage.tsx`

- [ ] Run `pnpm build`.
- [ ] Open `/login` and confirm the visible labels are `密码登录` and `验证码登录`.
- [ ] Confirm the OTP mode no longer shows phone fields.
