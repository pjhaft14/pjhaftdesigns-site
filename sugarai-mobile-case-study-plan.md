# SugarAI Mobile Case Study + Prototype Storyboard

## Working Thesis

We redesigned Sugar mobile from a module browser into a customer-branded field sales command center powered by SugarAI.

The old mobile experience gave reps access to CRM records. The new concept helps manufacturing field reps prepare for plant visits, answer technical questions, act on ERP/catalog/service context, capture field intelligence, and save structured updates without fighting the CRM.

## Case Study Positioning

### Eyebrow

SugarAI · Mobile CRM · Manufacturing field sales

### Working Title Options

- What if mobile CRM started with the visit?
- From CRM access to field intelligence.
- A field sales command center powered by SugarAI.
- When the CRM knows where the rep is going next.

### Hero Summary

I designed a customer-branded SugarAI Mobile concept for manufacturing field sales reps, replacing module-first CRM navigation with a Today-first workflow for visits, routes, product lookup, inventory checks, quote actions, and low-friction capture.

### Role / Scope

- Role: Lead UX designer
- Scope: Product strategy, UX, UI, prototyping, case study
- Platform: Mobile
- Context: SugarAI concept / portfolio case study

## The Case Study Story

### 1. Problem

#### Kicker

The problem

#### Heading

Mobile CRM worked like a smaller desktop CRM.

#### Story

The current Sugar mobile app provides access to accounts, emails, notes, contracts, leads, opportunities, dashboards, and reports. That access matters, but the experience is organized around CRM objects rather than the way a field sales rep works during the day.

Most modules repeat the same pattern: list view, record view, tabs, related records, and long create forms. The interface is consistent, but the consistency mostly reflects the database. A rep still has to decide where to go, which record matters, what changed, and what to do next.

#### Core Contrast

The existing experience begins with CRM structure. The redesign begins with the rep's next visit.

## 2. Problem Anatomy

### Kicker

Problem anatomy

### Heading

The same pattern repeated across every module.

### Evidence From Current Screens

- Dashboard tiles did not answer urgent sales questions.
- Lists exposed many records but did not clearly prioritize action.
- Record views relied on tabs and field rows.
- Reports showed data without an obvious takeaway.
- Create screens asked for too many fields.
- Related records were useful, but still organized by CRM module.

### Before Pattern

1. Open module.
2. Scan list.
3. Open record.
4. Move between Details, Timeline, Related, Dashboards.
5. Create or update records through long forms.
6. Repeat the same structure in the next module.

### Before/After Line

From list/detail/tab navigation to a visit-centered workflow.

## 3. User And Context

### Kicker

How I got there

### Heading

Design for the rep standing inside the plant.

### Persona

Manufacturing field sales representative.

### Environment

On the road, active factory floors, warehouses, customer facilities, noisy environments, and low-connectivity areas.

### What They Need In The Moment

- Where am I going?
- What should I know before I walk in?
- What changed since the last visit?
- What can I promise about stock, lead time, or price?
- What do I need to log before I forget it?
- What needs to sync when the connection comes back?

### Product Jobs

- Prepare for the next customer visit.
- Access account/site context quickly.
- Look up technical product data.
- Check ERP inventory and lead time.
- Build or start a quote.
- Capture notes, photos, and business cards.
- Review and save structured CRM updates.

## 4. Design Challenge

### Kicker

Design challenge

### Heading

SugarAI had to help reps act without hiding the system.

### Story

The redesign could not simply replace modules with chat. Field reps still need trustworthy source data, fast navigation, offline status, and reviewable updates. SugarAI needed to make the work faster while keeping CRM, ERP, catalog, and service context visible enough to trust.

### Design Tension

- Fast enough for the field.
- Structured enough for CRM.
- Trustworthy enough for ERP/product data.
- Flexible enough for customer-branded deployments.

## 5. Key Decisions

### Kicker

Key decisions

### Heading

Four choices shaped the mobile system.

### 01. Start With Today, Not Modules

Considered: A refreshed module dashboard.

Chose: A Today screen built around the priority visit, route, offline readiness, and the next useful action.

Why: A field rep does not wake up needing "Accounts." They need to know where to go and what to do when they arrive.

### 02. Make Customer Sites First-Class

Considered: A generic map button on account records.

Chose: Visit Route + Customer Sites, where each account can have plants, warehouses, HQ offices, service locations, and site-specific context.

Why: Manufacturing accounts often span multiple facilities, and each site can have different contacts, equipment, tickets, orders, and visit notes.

### 03. Use SugarAI As The Intelligence Layer

Considered: Branding the entire app as Sugar Mobile.

Chose: A customer-branded header with SugarAI appearing in assistant actions, capture processing, and review/save moments.

Why: Enterprise customers should feel like this is their field app, powered by SugarAI in the background.

### 04. Review Before Saving

Considered: Automatically writing AI-generated updates into CRM.

Chose: A review-before-save sheet where reps can inspect, accept, or remove suggested updates.

Why: Field capture is messy. CRM updates need trust, control, and recovery.

## 6. Proposed Information Architecture

### Kicker

Proposed information architecture

### Heading

Specialized field work, connected by shared context.

### Primary Areas

- Today
- Visit Brief
- Account 360
- Customer Sites
- Product Lookup
- Quote / Pricing
- Capture
- Ask SugarAI

### Shared Data Sources

- CRM
- ERP
- Catalog
- Service
- Location
- Calendar

### Source Label Pattern

Every cross-system insight should show where it came from through small labels such as CRM, ERP, Catalog, Service, or Offline.

## 7. Prototype Storyboard

### Flow

Start day -> prep visit -> capture during the visit -> review AI-generated updates -> save to CRM -> sync/move on.

Product and inventory lookup remains the next supporting flow after the core visit-capture loop.

## 7A. Design Reframe

### Kicker

Design reframe

### Heading

From module browsing to visit momentum.

### Story

The redesign does not remove CRM structure. It changes when the rep has to think about it. Instead of starting with Accounts, Contacts, Opportunities, or Contracts, the app starts with the customer visit already in motion.

SugarAI assembles context before the meeting, captures what happens during the visit, and translates messy field input into CRM updates the rep can review before saving.

### Screen 1: Today

#### What It Proves

The app starts with the rep's day, not the CRM's module list.

#### Content

- Customer-branded header.
- Offline Ready state.
- Priority visit: Kelloway Plant 3.
- Route preview.
- One reorder risk insight.
- Quick actions: Check Stock, Build Quote, Capture.
- Ask SugarAI entry point.

#### Component Patterns

- Priority visit card.
- Route card.
- Offline/sync pill.
- Risk insight card.
- Quick action tiles.

### Screen 2: Visit Brief

#### What It Proves

The rep can walk into the plant with the right context already assembled.

#### Content

- Site/account hero.
- Meeting objective.
- Key facts.
- Risk insight.
- Bottom action bar: Navigate, Check Stock, Build Quote, Log Visit.

#### Component Patterns

- Site summary card.
- Meeting objective card.
- Key facts list.
- Risk insight row.
- Persistent bottom action bar.

### Screen 3: Active Visit + Capture

#### What It Proves

The rep can capture field intelligence without leaving the visit context.

#### Content

- Visit-in-progress state.
- Live voice notes and typed notes.
- Add photo, scan business card, and add task actions.
- Capture feed.
- Visit outcome.
- Meeting topic checklist.

#### Component Patterns

- Live status row.
- Capture card.
- Dictation control.
- Field tool grid.
- Outcome options.
- Persistent visit action bar.

### Screen 4: Capture Review

#### What It Proves

Messy field input becomes structured CRM work the rep can trust.

#### Content

- SugarAI-generated visit summary.
- Proposed CRM updates.
- Follow-up tasks.
- Source captures.
- Review flag for stock reservation.
- Save to Sugar primary action.

#### Component Patterns

- Generated summary card.
- Suggested update rows.
- Task review rows.
- Source chips.
- Review-before-save action bar.

## 8. Reusable Component System

### Kicker

Experience system

### Heading

Shared components, not one-off screens.

### Components To Build

- App shell with customer-branded header.
- Offline/sync status pill.
- Section header.
- Priority visit card.
- Site/account hero card.
- Route preview card.
- Risk insight card.
- Source badge.
- Quick action tile.
- Bottom action bar.
- Product result card.
- Availability summary.
- Specs preview.
- Expandable detail row.
- Capture tab group.
- Extracted field row.
- Suggested update row.
- Ask SugarAI prompt row.

## Requirements Progress

### Status Key

- [x] Completed in the current concept or prototype.
- [ ] Still to design, build, or connect.

### Experience Strategy

- [x] Analyze the current Sugar mobile experience.
- [x] Define the manufacturing field sales persona and environment.
- [x] Establish the site-visit journey as the primary use case.
- [x] Replace module-first navigation with a Today-first direction.
- [x] Define customer branding with SugarAI as the intelligence layer.
- [x] Define customer sites and location as first-class CRM context.
- [x] Define review-before-save for AI-generated CRM updates.
- [x] Establish the green-led visual direction and reusable component approach.

### Primary Site-Visit Journey

- [x] Phase 1: Start the day and identify the priority visit.
- [x] Phase 2: Prepare for the customer visit.
- [x] Phase 3: Navigate to the customer site.
- [x] Phase 4: Work during the visit.
- [x] Phase 5: Capture visit intelligence.
- [x] Phase 6: Review and save suggested CRM updates.
- [x] Phase 7: Sync changes and move to the next visit.

### Prototype Screens

- [x] Today screen visual design.
- [x] Customer-branded app header.
- [x] Warm greeting and daily briefing.
- [x] Priority visit card.
- [x] Route preview using a real map image.
- [x] Offline-ready and last-sync states.
- [x] Risk and recommendation cards.
- [x] Quick tools.
- [x] Ask SugarAI entry point.
- [x] Accessible touch targets, contrast, focus states, and reduced-motion support.
- [x] Visit Brief screen.
- [x] Active Visit and field capture screen.
- [ ] Product and Inventory Lookup screen.
- [x] Capture Review screen.
- [ ] Account 360 and Customer Site screen.
- [ ] Quote Builder screen.
- [ ] Opportunity Update screen.
- [ ] Offline Sync and Conflict screen.

### Functional Requirements

- [x] Open navigation in Apple Maps or Google Maps.
- [ ] Search customer accounts, sites, contacts, and opportunities.
- [ ] Search the technical product catalog.
- [ ] View product specifications, drawings, and engineering sheets.
- [ ] View ERP inventory by warehouse.
- [ ] View production schedules and estimated lead times.
- [ ] Calculate customer-specific and volume pricing.
- [ ] Review past orders, equipment history, and active support cases.
- [x] Capture voice notes with transcription.
- [ ] Scan business cards and review extracted contact information.
- [x] Capture visit photos and typed notes.
- [x] Generate a structured visit summary with SugarAI.
- [x] Review suggested CRM updates before saving.
- [ ] Advance an opportunity stage with minimal input.
- [x] Create follow-up tasks and meetings.
- [ ] Cache visit information for offline use.
- [ ] Queue updates while offline and synchronize them later.

### Reusable Components

- [x] App shell and phone frame.
- [x] Customer-branded header.
- [x] Offline and sync status pill.
- [x] Section header.
- [x] Priority visit card.
- [x] Route preview card.
- [x] Risk insight card.
- [x] Quick action tile.
- [x] Bottom navigation.
- [x] Ask SugarAI prompt row.
- [x] Site and account summary.
- [x] Source badge.
- [x] Persistent bottom action bar.
- [ ] Product result card.
- [ ] Availability and lead-time summary.
- [ ] Specifications preview.
- [ ] Expandable technical detail row.
- [ ] Capture mode tabs.
- [ ] Extracted field row.
- [x] Suggested update row.
- [x] Review-before-save sheet.

### Design Direction

- Modern green-led accent system.
- Green for readiness, availability, success, and primary actions.
- Amber for caution.
- Red only for severe exceptions.
- Warm neutral background.
- Charcoal/navy text.
- Thin borders and restrained shadows.
- Compact cards with enough breathing room.
- Large thumb-friendly actions.

## 9. Before / After Section

### Kicker

Before and after

### Heading

From module browsing to field action.

### Before

Open Accounts, scan a list, open a record, move between tabs, inspect related records, then create updates through forms.

### After

Open Today, see the priority visit, prepare with a Visit Brief, check product and ERP data, capture field intelligence, review suggested updates, and move to the next visit.

## 10. What To Test

### Kicker

Next questions

### Heading

What I would test before expanding the system.

### Test Questions

- Can reps find the next customer action faster than in the module-based app?
- Do reps trust the ERP/catalog/source labels during customer conversations?
- Is the Visit Brief concise enough before a meeting but complete enough during one?
- Does Review & Save create confidence or feel like another form?
- What should be cached offline by default?
- How should customer sites roll up into account health?

## Current Build Direction

### Core Case-Study Screens

| Status | Screen | Purpose | Primary transition |
| --- | --- | --- | --- |
| [x] | Today | Welcome the rep, prioritize the next visit, show route readiness, and provide quick actions. | Open Visit Brief |
| [x] | Visit Brief | Assemble site, account, meeting, service, order, equipment, and opportunity context before arrival. | Check a product or begin the visit |
| [x] | Active Visit + Capture | Record live notes, voice transcription, photos, business cards, tasks, outcomes, and meeting-topic coverage. | End the visit and review captured intelligence |
| [ ] | Product + Inventory Lookup | Search technical products and show specifications, warehouse stock, lead time, and customer pricing. | Add to quote or return to visit |
| [x] | Capture Review | Review SugarAI's suggested CRM updates, follow-ups, and visit summary before saving. | Save updates and complete the visit |

### Supporting Screens And States

| Status | Screen or state | Purpose | Priority |
| --- | --- | --- | --- |
| [ ] | Account 360 + Customer Site | Show account-level history alongside plant-specific contacts, equipment, orders, and cases. | Next extension |
| [ ] | Quote Builder | Configure quantities, discounts, customer pricing, availability, and delivery expectations. | Next extension |
| [ ] | Opportunity Update | Advance stage, confirm value, record the next step, and update the expected close date. | Next extension |
| [ ] | Ask SugarAI | Provide contextual questions and actions from the current account, visit, or product. | Embedded first; full screen later |
| [ ] | Offline Sync | Show cached records, queued changes, synchronization progress, and conflicts. | Required state |
| [ ] | Route Details | Show all customer stops and allow reordering or skipping before opening external navigation. | Optional extension |

### External Handoffs

| Status | Handoff | Behavior |
| --- | --- | --- |
| [x] | Apple Maps / Google Maps | Launch turn-by-turn navigation for the selected customer site. |
| [x] | Phone / Email | Start a call or compose an email from account and contact actions. |
