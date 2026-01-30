# Parsi Calendar Event Generator — Design

## Problem

The Parsi (Zoroastrian) calendar doesn't align with the Gregorian calendar in a fixed way. The Shahenshahi and Kadmi variants have no leap year (365 days/year), so dates drift relative to the Gregorian calendar. This makes it hard to track recurring Parsi occasions (birthdays, anniversaries, etc.) in a standard calendar app.

## Solution

A static single-page web app where you enter a Gregorian date, a subject, an occasion, and it generates an `.ics` file with N anniversary events calculated according to the Parsi calendar.

## User Flow

1. Open the page — form is pre-filled with defaults (Subject: "Hoshi's", Occasion: "Birthday") and a live preview shows sample events immediately
2. Modify fields as needed: Subject, Occasion, Date (Gregorian date picker), Calendar variant (dropdown), Count (default 100)
3. Live preview updates in real-time showing the first 2–3 events with format and dates
4. Click "Download .ics" to get the calendar file
5. Import the `.ics` into Google Calendar, Apple Calendar, Outlook, etc.

## Event Format

Each event is an all-day VEVENT with:
- **Summary:** `{Subject} {Nth} {Occasion}` — e.g. "Hoshi's 2nd Birthday"
- **Description:** Parsi date for reference — e.g. "6 Fravardin 1396 YZ (Shahenshahi)"
- Correct ordinal suffixes (1st, 2nd, 3rd, 4th, 11th, 12th, 13th, 21st, 22nd, 23rd, etc.)

## Parsi Calendar Logic

All three variants: 12 months × 30 days + 5 Gatha days = 365 days/year.

| Variant | Leap year | Epoch note |
|---------|-----------|------------|
| Shahenshahi | No | Most common among Mumbai Parsis |
| Kadmi | No | 30 days behind Shahenshahi |
| Fasli | Yes (every 4 years) | Tracks solar year, aligns with spring equinox |

### Anniversary Calculation

**Shahenshahi/Kadmi (no leap year):**
Each Parsi year is exactly 365 days. Anniversary N falls on `base_gregorian_date + (N × 365)` days. No conversion needed for date placement — only for displaying the Parsi date in the description.

**Fasli (has leap year):**
Tracks the solar year closely, so anniversaries land on approximately the same Gregorian date each year (±1 day around Fasli leap years). Requires accounting for Fasli leap day (6th Gatha day added in leap years).

### Reference Epoch

Shahenshahi: 1 Farvardin 1394 YZ = 16 August 2025 (to be verified during implementation).
Kadmi: 30 days behind Shahenshahi.
Fasli: 1 Farvardin aligns with ~21 March (spring equinox).

## Form Inputs

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Subject | text | "Hoshi's" | Pre-filled default value |
| Occasion | text | "Birthday" | Pre-filled default value |
| Date | date picker | today | Gregorian date |
| Calendar | dropdown | Shahenshahi | Shahenshahi / Kadmi / Fasli |
| Count | number | 100 | Number of events to generate |

## Live Preview

Displays below the form, updates in real-time. Shows first 2–3 events:

```
Hoshi's 1st Birthday
17 August 2025
6 Fravardin 1394 YZ (Shahenshahi)

Hoshi's 2nd Birthday
17 August 2026
6 Fravardin 1395 YZ (Shahenshahi)
```

## Architecture

```
parsi-calendar/
├── index.html          # Single page with form + preview + download
├── style.css           # Minimal styling
├── src/
│   ├── main.js         # Form handling, orchestration, preview
│   ├── parsi.js        # Parsi calendar conversion logic
│   └── ics.js          # .ics file generation
└── docs/plans/         # This design doc
```

- No build step, no dependencies, no framework
- Vanilla HTML/CSS/JS
- Hosted on GitHub Pages from `main` branch root
- `.ics` generated entirely client-side

## Deliberately Excluded

- No RRULE (recurring rules) — Parsi dates aren't periodic in Gregorian terms
- No backend / database / persistence / accounts
- No i18n beyond Parsi month names in English
- No mobile-specific design (responsive CSS is fine, no PWA)
