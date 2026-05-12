# Project Rules & Development Standards

## Project Context
**Purpose:** ElderGuideSurvey is a lightweight, public-facing B2C micro-app designed to collect post-placement feedback from families via URL parameters.
**Data Model:** SurveyResponse (rating, feedback, client_id, loved_one, facility)
**Key Patterns:** Hooks/Services separation · Zod validation · Web3Forms email delivery

---

## 1. Safety & Security
* No hardcoded secrets. Use .env variables.
* All API boundaries must include Zod validation.
* Sanitize user-generated content (XSS prevention).

## 2. Code Quality & Naming
* **Dead Code:** Remove unused logic immediately.
* **DRY:** Abstract logic into hooks if repeated 3+ times.
* **TypeScript:** NO 'any' types. Use strict interfaces.

## 3. Documentation & Registry
* Update components.yaml when creating new domain components.
* Run `.agent/scripts/generate-registry.sh` to refresh the auto-generated file index.
* Follow the Planning -> Execution -> Audit protocol for every change.
