# CLAUDE.md — Workplace Support Passport

## What this is
A workplace adjustments passport tool: employees complete an 8-step, diagnosis-free questionnaire about what helps them work well, and can choose to share the result with their manager. Built to be licensed to organisations, each running their own private instance.

## Non-negotiable architecture principle
**The vendor never accesses, stores, or transmits client data.** Each organisation deploys their own single-tenant instance in their own infrastructure (their cloud account or on-prem). No shared database, no shared auth service, no telemetry containing personal data. This must hold true for every feature added: before building anything, check it doesn't introduce a path for data to leave the client's own environment.

## Stack
- Next.js (React) frontend and API routes
- PostgreSQL database
- Authentication via the client's own identity provider (SAML/OIDC against their Azure AD, Google Workspace, or generic SAML), not a third-party auth service
- Deployed as a Docker container the client runs themselves

## Data model
```
organisations
  id, name, branding_config, review_period_months

users
  id, organisation_id, email, role (employee | manager | hr_admin), sso_subject_id

passports
  id, user_id, organisation_id, status (draft | complete | archived),
  created_at, last_updated_at, next_review_date

passport_responses
  id, passport_id, section, field_key, value (json)

passport_consent
  id, passport_id, section, recipient (manager | hr | occupational_health), shared (boolean)

audit_log
  id, organisation_id, actor_user_id, action, target_passport_id, timestamp
```

Consent is granular: per-section x per-recipient, matching the existing prototype, not a single blanket flag. `passport_consent` is checked per-section, per-recipient on every read.

**Occupational Health is an external recipient only.** No login role, no dashboard access, no in-app view. Where a passport section is shared with OH, it goes out as an email/report only, the same as the manager and HR email delivery.

Aggregate reporting queries should return counts/themes from checkbox fields, not raw free-text fields, unless explicitly shared.

## Email delivery
Real sending is required in v1, not mocked. Delivery goes via a client-configured webhook (their own Zapier or Wix Velo, set as a constant per deployment), with mailto as a fallback if no webhook is configured. This stays consistent with the zero-data principle: the webhook is the client's own, configured to their own infrastructure, nothing passes through anything the vendor controls.

## EEES and Which Means What content
The translation dictionary (plain-language meanings, exploratory questions, adjustment ideas per EEES category) lives as static content in the codebase, not editable through the UI. It's Matt's proprietary IP and gets reviewed/updated by him directly in the source, not exposed as an admin-editable feature.

## The 8-section question flow
This already exists as a working HTML/CSS/JS prototype (attached separately as `reference-prototype.html` — reuse its exact question wording, section order, and visual design language, but rebuild it as real React components backed by the database rather than in-memory state):

1. About You (name, role, organisation, optional named contact)
2. Working Environment (location preferences, sensory factors, free text)
3. Equipment and Technology (specialist equipment, assistive software, free text)
4. Getting To and From Work (travel support, building access, free text)
5. Communication and Interaction (info preferences, communication style, interview adjustments, free text)
6. Planning, Organisation and Workload (workload supports, executive function difficulties, free text)
7. Wellbeing and In-Work Support (wellbeing factors, in-work support, variability, free text)
8. Priorities and Next Steps (top three priorities, previous support, who it's shared with, intended use)

## Build order

Two phases. Phase 1 gets to something demoable as fast as possible, using simplifications that are fine for a demo but must not be mistaken for production-ready. Phase 2 hardens it into something you'd actually deploy to a client. Work through these as separate sessions, reviewing each before moving on.

### Phase 1: Demo-ready (priority)
1. Scaffold the Next.js project and database. For speed, use SQLite instead of Postgres for the demo build, same schema as below, easy to swap to Postgres later since nothing else depends on the choice. Get the schema reviewed before building UI on top.
2. Rebuild the 8-step passport flow as React components, saving each step to the database as the user progresses (not just at the end). This is the centrepiece of the demo, get it feeling as polished as the existing prototype.
3. Build the PDF/print export for a completed passport. This is one of the most persuasive things to show a prospective client.
4. Build a simple manager/HR admin view: list of passports shared with them, plus basic aggregate counts (e.g. "14 people selected X"). Keep this simple for the demo, full reporting detail can wait.
5. Add simple email/password or magic-link login, clearly labelled in code comments as a **demo-only stand-in for the real SSO integration in Phase 2, not for production use**. Only ever populate the demo with fake/sample data, never real employee data, while this is in place.
6. Add the teal/amber design system and branding so it looks finished, not a wireframe.

### Phase 2: Production hardening (after the demo has done its job)
7. Replace the demo login with real authentication against a configurable SAML/OIDC provider (the client's own Azure AD, Google Workspace, or generic SAML).
8. Migrate from SQLite to Postgres if not already done, and add the audit log, wired into every passport view/read.
9. Build out full aggregate reporting and review date tracking on the admin view.
10. Containerise the app (Dockerfile) and write deployment documentation for a client's IT team to follow.
11. Add per-organisation branding configuration (logo, colours) so each client's instance can be white-labelled.

## Distribution & Deployment Model

This is licensed software: each client hosts and runs their own instance.
ThinkNeurodiversity never holds, stores, or has infrastructure-level access to
any client instance or its data. The only permitted vendor connection is a
one-way, outbound update channel so security patches and content updates
(including EEES/Which Means What revisions) can reach the instance without
requiring client input.

### Core principle
Code and data stay fully separated. Client servers hold the database and all
employee data, full stop. The vendor controls only the release/update channel.
No inbound connection to client infrastructure exists at any point; the
instance always initiates the connection outward, never the other way round.

### Update mechanism: pull-based auto-update
- Each instance periodically checks a vendor-controlled version endpoint and
  pulls a signed release package, verified before applying
- Both security patches and feature/content updates auto-apply on this
  schedule. No client approval step, no deferral window, no config to disable
  it. This is deliberate: it's what keeps every instance in the field patched
  without needing the client to do anything
- A minimal heartbeat (instance ID, version, timestamp only, no client or
  employee data) lets the vendor confirm instances are current. Purely
  operational, not a compliance or liability mechanism

### What the vendor never has
- No access to any client database or hosting environment
- No ability to log in to a client instance
- No visibility into employee-submitted data

### What the vendor controls
- The release/update server
- Versioning, signing, and publishing of releases

## Design language to carry over
Teal (#1a6b6b) and amber (#c97c2a) colour palette, DM Serif Display for headings, DM Sans for body text, card-based layout with a progress bar, checkbox groups styled as selectable tiles rather than plain checkboxes. Keep this consistent, it's an established brand.

## Style and copy notes
British English throughout. No em dashes in any UI copy or generated documents, use commas or full stops instead. Tone is direct and respectful, never infantilising, consistent with the existing "Your passport, your information" framing.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
