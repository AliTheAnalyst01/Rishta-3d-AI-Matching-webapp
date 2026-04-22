# RishtaConnect 3D Web App — Design Spec
**Date:** 2026-04-19  
**Status:** Approved  

---

## Overview

A 3D Muslim matrimonial website ("RishtaConnect") that displays rishta profiles from a Google Sheets database. Visitors browse profiles in a cinematic 3D carousel, filter by key attributes, get AI-powered compatibility scores, and interact with a bilingual (Urdu/English) AI assistant. Only Muslims are listed. Contact is via WhatsApp/phone — no login system required for Phase 1.

---

## Visual Design

- **Theme:** Warm & Cultural — inspired by South Asian weddings
- **Palette:** Deep mahogany backgrounds · Terracotta (#c4773b) accents · Ivory (#f5e6d3) text · Copper (#e8c49a) secondary
- **3D Style:** Cinematic carousel — profiles scroll in a 3D arc, central card highlighted and larger
- **Typography:** Serif for headings, clean sans-serif for body

---

## Data Source

**Google Sheets:** `1YnZEEqJG-p7PIEbIVtccCkfFJHrCDhu6QaxLPOmXRA4`

### Sheet Inventory (14 sheets)
| Sheet | Contents |
|---|---|
| Data | 3,840 pre-structured profiles (24 columns) — primary source |
| Male Rishta | Male Shia + Male Sunni (raw text blobs, side by side) |
| Female Rishta | Female Shia + Female Sunni |
| Syed Male Rishta | Male Syed Shia + Male Syed Sunni |
| Non Syed Male Rishta | Male Non-Syed Shia + Male Non-Syed Sunni |
| Syed Female Rishta | Female Syed Shia + Female Syed Sunni |
| Non Syed Female Rishta | Female Non-Syed Shia + Female Non-Syed Sunni |
| Doctors Proposal | Female Doctor + Male Doctor |
| 2nd Marriage Proposal | Female + Male 2nd Marriage |
| Shia 2nd Marriage Proposal | Female + Male Shia 2nd Marriage |
| Sunni 2nd Marriage Proposal | Female + Male Sunni 2nd Marriage |
| Sheet12 | Category label references (internal) |
| Sheet13 | Empty (unused) |

### Data Sheet Columns (24 fields)
`Timestamp, Registration No., Gender, Name, Sect, Marital Status, Caste, Date of Birth, Height, Weight, Body Type, Complexion, Education, Profession, Income, Family Status, Father/Mother Profession, Siblings, Address, City & Country, Demand/Requirements, Photo URL, Age, Raw Text`

---

## Architecture

**Stack:** Next.js 14 + FastAPI (Python) + PostgreSQL + React Three Fiber + Claude API

```
Google Sheets API
      ↓
AI Parser (Claude) — cleans raw text blobs
      ↓
PostgreSQL — structured profiles table
      ↓
FastAPI — 5 API modules
      ↓
Next.js 14 — 6 pages + 3D UI
      ↓
User Browser
```

### Backend — FastAPI (Python)
| Module | Responsibility |
|---|---|
| Profiles API | Filter, search, paginate profiles |
| Analytics API | Aggregated stats for 3D dashboard |
| AI Match API | Claude-powered compatibility scoring |
| Chat API | Claude-powered bilingual assistant |
| Pipeline Job | Google Sheets → PostgreSQL sync worker (APScheduler, 1hr) |

Also exposes `POST /admin/sync` for manual pipeline trigger.

### Frontend — Next.js 14
| Route | Description |
|---|---|
| `/` | Hero landing — 3D carousel + CTA |
| `/browse` | Full profile browser with filter bar |
| `/profile/[id]` | Individual profile detail (semi-private) |
| `/insights` | 3D data dashboard |
| `/match` | AI compatibility score form + results |
| `/admin` | Pipeline status + manual sync |

---

## Data Pipeline

### Steps
1. **Extract** — Google Sheets API (OAuth2) reads all 14 sheets. Prioritises the `Data` sheet (already structured). Raw sheets processed for any new entries not yet merged.
2. **Transform** — Claude API standardises:
   - Age calculated from DOB
   - Height normalised to cm
   - Income extracted as integer
   - City normalised ("karachi pk" → "Karachi")
   - Marital status standardised ("Single/Never Married" → "Unmarried")
   - Sect normalised ("Shia Muslim" → "Shia")
   - Duplicates detected by Reg No
3. **Load** — PostgreSQL upsert keyed on Registration No. Removed profiles set `is_active=false` (never hard deleted). Both cleaned fields and `raw_text` stored.
4. **Schedule** — APScheduler runs inside FastAPI every 1 hour on startup. Manual trigger via `POST /admin/sync`. Sync results logged to `pipeline_log` table.

### PostgreSQL Schema — `profiles` table
```sql
id, reg_no, name, gender, sect, caste,
marital_status, no_of_kids, age, dob,
height_cm, weight_kg, complexion, body_type,
education, profession, income, family_status,
city, country, nationality, requirements,
photo_url, category,  -- Syed/NonSyed/Doctor/2ndMarriage
is_active, raw_text, created_at, updated_at
```

---

## Frontend Design

### Privacy Model
- **Public (no login):** Reg No, age, city, sect, caste, education, profession, income range, body type, marital status, requirements
- **Hidden until WhatsApp contact:** Name, photo
- Contact number displayed prominently: **03454100742**

### 3D Carousel (`/` and `/browse`)
- Built with **React Three Fiber** + **@react-three/drei**
- Profiles rendered as 3D cards arranged in a curved arc
- Central card: enlarged, fully visible
- Side cards: smaller, rotated ~35°, reduced opacity
- Swipe left/right (touch + mouse drag) to navigate
- Click centre card → navigates to `/profile/[id]`

### Filter Bar (`/browse`)
Dropdowns for: Gender · Sect (Shia/Sunni) · Caste · Age Range · City · Category (Syed/Doctor/2nd Marriage)  
Free-text search box. 24 profiles per page with infinite scroll.

### Profile Card (public fields shown)
- Reg No · Sect badge · Age · City
- Education · Profession · Income range
- Category badge (Syed / Doctor / 2nd Marriage)
- "Contact via WhatsApp" button

### Insights Dashboard (`/insights`)
- **Stat cards:** Total profiles, % female, average age
- **3D bar chart:** Profiles by city (Three.js animated)
- **Donut chart:** Sect breakdown (Shia vs Sunni)
- **Donut chart:** Marital status breakdown
- **Age histogram:** Distribution across 5-year buckets
- **Category breakdown:** Syed / Non-Syed / Doctor / 2nd Marriage

---

## AI Integration

All AI powered by **Claude API** (claude-sonnet-4-6).

### Feature 1 — AI Match Score (`/match`)
- Visitor fills form: gender seeking, sect, age range, city preference, education preference
- Backend sends visitor preferences + top 100 candidate profiles to Claude
- Claude returns ranked list with % compatibility score + one-line reasoning per profile
- Frontend displays top matches with colour-coded score badges (green/yellow/amber)

### Feature 2 — Rishta Assistant Chatbot (all pages)
- Floating chat bubble (bottom-right) on every page
- System prompt includes: available filter options, DB schema summary, instructions to respond in same language as user (Urdu or English)
- Claude extracts search intent from natural language, calls Profiles API internally, returns results with profile cards inline
- Example queries handled:
  - "Show me Shia doctors from Karachi under 35"
  - "کراچی میں سنی لڑکا چاہیے گریجویٹ"
  - "Second marriage proposals for females"

### Feature 3 — AI Profile Parser (backend, invisible to users)
- Runs during pipeline sync for raw text blob entries
- Claude extracts structured JSON from unstructured profile text
- Output mapped to `profiles` schema fields
- Falls back to regex patterns if Claude call fails

### Bilingual Support
- Chatbot detects Urdu vs English input automatically
- Responds in the same language the user writes in
- Profile data stored with original Urdu text preserved in `raw_text`

---

## Build Phases

### Phase 1 — Core (MVP)
1. Data pipeline: Sheets → PostgreSQL (with AI parser)
2. FastAPI: Profiles API + Analytics API
3. Next.js: `/browse` with filter bar + profile cards
4. Next.js: `/profile/[id]` detail page
5. Deploy (Docker Compose: FastAPI + PostgreSQL + Next.js)

### Phase 2 — 3D + Insights
6. React Three Fiber 3D carousel on `/` and `/browse`
7. `/insights` 3D data dashboard
8. Polish warm & cultural theme

### Phase 3 — AI
9. `/match` AI compatibility score page
10. Floating chat widget with Claude assistant
11. Bilingual (Urdu/English) support

---

## Out of Scope (Phase 1)
- User login / accounts
- Profile submission form on the website
- Direct messaging between users
- Mobile app
- Payment / subscription model
