# Production Security Checklist

## Application
- [ ] **Input Validation**: Ensure all forms/APIs use Zod.
- [ ] **HTML Escaping**: Sanitize user-generated content rendered via innerHTML.
- [ ] **CSP Policy**: Verify `connect-src` only allows `api.web3forms.com`.
- [ ] **Honeypot Field**: Confirm the `botcheck` field is included in Web3Forms payloads.

## Secrets & Dependencies
- [ ] **Secret Safety**: Confirm no .env files are committed (`git log --all -- '.env*'`).
- [ ] **API Key Rotation**: Verify production keys are separated from development keys.
- [ ] **Dependency Audit**: Run `npm audit --audit-level=high` and resolve critical issues.
