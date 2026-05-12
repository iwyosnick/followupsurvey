# Production Security Checklist

## Infrastructure
- [ ] **Supabase RLS**: Confirm all tables have RLS enabled.
- [ ] **CORS Policy**: Verify Edge Functions use a restricted origin allowlist, NOT `*`.
- [ ] **Database Exposure**: Verify DB is not accessible via public internet.

## Application
- [ ] **Input Validation**: Ensure all forms/APIs use Zod.
- [ ] **HTML Escaping**: Sanitize user-generated content rendered via innerHTML.

## Secrets & Dependencies
- [ ] **Secret Safety**: Confirm no .env files are committed (`git log --all -- '.env*'`).
- [ ] **API Key Rotation**: Verify production keys are separated from development keys.
- [ ] **Dependency Audit**: Run `npm audit --audit-level=high` and resolve critical issues.
