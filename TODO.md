# TODO - Google Login Integration

- [x] Inspect backend auth flow and token issuance (done)
- [ ] Add Google OAuth endpoints to backend (`/api/auth/google/login` and `/api/auth/google/callback`)
- [ ] Add Google OAuth settings/env vars to backend config
- [ ] Add store helper to create/find Google users as `is_admin=False`
- [ ] Update frontend login UI with “Continue with Google” button
- [ ] Update frontend login page to read `?token=` redirect and store session
- [ ] Add minimal docs for required Google OAuth env vars
- [ ] Run backend/frontend and verify end-to-end OAuth redirect + session creation

