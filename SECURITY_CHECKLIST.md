# Production Security Checklist

## Application
- [ ] **Input Validation**: Ensure all forms/APIs use Zod.
- [ ] **HTML Escaping**: Sanitize user-generated content rendered via innerHTML.
- [ ] **CSP Policy**: Delivered via `public/_headers` (HTTP layer — authoritative). Verify `connect-src` only allows `api.web3forms.com` and `frame-ancestors` is restricted to the client domain. Do NOT add a `<meta>` CSP — dual CSP causes silent policy intersection.
- [ ] **Iframe Embedding**: `frame-ancestors` in `public/_headers` controls which domains may embed this survey. Update this value when onboarding a new client.
- [ ] **Honeypot Field**: Confirm the `botcheck` field is included in Web3Forms payloads.

## Secrets & Dependencies
- [ ] **Secret Safety**: Confirm no .env files are committed (`git log --all -- '.env*'`).
- [ ] **API Key Rotation**: Verify production keys are separated from development keys.
- [ ] **Dependency Audit**: Run `npm audit --audit-level=high` and resolve critical issues.
