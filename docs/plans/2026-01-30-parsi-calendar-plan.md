# Parsi Calendar Event Generator — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a static single-page web app that generates .ics calendar files for recurring Parsi calendar occasions.

**Architecture:** Vanilla HTML/CSS/JS, no build step for production. Vitest for testing pure JS modules. Three JS modules: `parsi.js` (calendar math), `ics.js` (file generation), `main.js` (DOM/orchestration). Hosted on GitHub Pages.

**Tech Stack:** HTML, CSS, vanilla JS (ES modules), Vitest (dev only)

**Design doc:** `docs/plans/2026-01-30-parsi-calendar-design.md`

---

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vitest.config.js`

**Step 1: Initialize project**

```bash
cd /Users/david.smith/Projects/parsi-calendar
yarn init -y
yarn add -D vitest
```

**Step 2: Create vitest config**

Create `vitest.config.js`:
```js
export default {
  test: {
    include: ["src/**/*.test.js"],
  },
};
```

**Step 3: Add test script to package.json**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

**Step 4: Verify vitest runs**

```bash
yarn test
```

Expected: exits cleanly with "no test files found" or similar.

**Step 5: Commit**

```bash
git add package.json yarn.lock vitest.config.js
git commit -m "chore: init project with vitest"
```

---

### Task 2: Parsi Calendar — Ordinal Suffix Utility

**Files:**
- Create: `src/parsi.js`
- Create: `src/parsi.test.js`

**Step 1: Write failing test for ordinal suffixes**

Create `src/parsi.test.js`:
```js
import { describe, it, expect } from "vitest";
import { ordinal } from "./parsi.js";

describe("ordinal", () => {
  it("handles 1st, 2nd, 3rd", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
  });

  it("handles teens (11th, 12th, 13th)", () => {
    expect(ordinal(11)).toBe("11th");
    expect(ordinal(12)).toBe("12th");
    expect(ordinal(13)).toBe("13th");
  });

  it("handles 21st, 22nd, 23rd, 24th", () => {
    expect(ordinal(21)).toBe("21st");
    expect(ordinal(22)).toBe("22nd");
    expect(ordinal(23)).toBe("23rd");
    expect(ordinal(24)).toBe("24th");
  });

  it("handles 100th, 101st, 111th, 112th", () => {
    expect(ordinal(100)).toBe("100th");
    expect(ordinal(101)).toBe("101st");
    expect(ordinal(111)).toBe("111th");
    expect(ordinal(112)).toBe("112th");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
yarn test
```

Expected: FAIL — `ordinal` is not exported from `./parsi.js`.

**Step 3: Implement ordinal in `src/parsi.js`**

Create `src/parsi.js`:
```js
export function ordinal(n) {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  const mod10 = n % 10;
  if (mod10 === 1) return `${n}st`;
  if (mod10 === 2) return `${n}nd`;
  if (mod10 === 3) return `${n}rd`;
  return `${n}th`;
}
```

**Step 4: Run tests**

```bash
yarn test
```

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/parsi.js src/parsi.test.js
git commit -m "feat: add ordinal suffix utility"
```

---

### Task 3: Parsi Calendar — Gregorian-to-Parsi Conversion

**Files:**
- Modify: `src/parsi.js`
- Modify: `src/parsi.test.js`

**Reference epochs (verified via research):**
- Shahenshahi: 1 Farvardin 1394 YZ = 15 August 2025
- Kadmi: 30 days ahead of Shahenshahi, so 1 Farvardin 1394 YZ (Kadmi) = 16 July 2025
- Fasli: 1 Farvardin 1394 YZ = 21 March 2025

Parsi month names (in order):
1. Fravardin, 2. Ardibehesht, 3. Khordad, 4. Tir, 5. Amardad, 6. Shehrevar,
7. Meher, 8. Avan, 9. Adar, 10. Dae, 11. Bahman, 12. Asfandarmad, + Gatha days

**Step 1: Write failing tests for Gregorian-to-Parsi conversion**

Add to `src/parsi.test.js`:
```js
import { ordinal, gregorianToParsi, SHAHENSHAHI, KADMI, FASLI } from "./parsi.js";

describe("gregorianToParsi", () => {
  it("converts Shahenshahi epoch date", () => {
    const result = gregorianToParsi(new Date(2025, 7, 15), SHAHENSHAHI);
    expect(result).toEqual({ day: 1, month: 1, year: 1394, monthName: "Fravardin" });
  });

  it("converts a date within first Shahenshahi month", () => {
    const result = gregorianToParsi(new Date(2025, 7, 20), SHAHENSHAHI);
    expect(result).toEqual({ day: 6, month: 1, year: 1394, monthName: "Fravardin" });
  });

  it("converts Kadmi epoch date", () => {
    const result = gregorianToParsi(new Date(2025, 6, 16), KADMI);
    expect(result).toEqual({ day: 1, month: 1, year: 1394, monthName: "Fravardin" });
  });

  it("converts Fasli epoch date", () => {
    const result = gregorianToParsi(new Date(2025, 2, 21), FASLI);
    expect(result).toEqual({ day: 1, month: 1, year: 1394, monthName: "Fravardin" });
  });

  it("handles Gatha days (day 361-365)", () => {
    const result = gregorianToParsi(new Date(2026, 7, 10), SHAHENSHAHI);
    expect(result.monthName).toBe("Gatha");
  });

  it("handles year rollover", () => {
    const result = gregorianToParsi(new Date(2026, 7, 15), SHAHENSHAHI);
    expect(result).toEqual({ day: 1, month: 1, year: 1395, monthName: "Fravardin" });
  });
});
```

**Step 2: Run tests to verify failure**

```bash
yarn test
```

Expected: FAIL — new exports don't exist.

**Step 3: Implement conversion**

Add to `src/parsi.js`:
```js
const MONTH_NAMES = [
  "Fravardin", "Ardibehesht", "Khordad", "Tir", "Amardad", "Shehrevar",
  "Meher", "Avan", "Adar", "Dae", "Bahman", "Asfandarmad"
];

export const SHAHENSHAHI = "shahenshahi";
export const KADMI = "kadmi";
export const FASLI = "fasli";

const EPOCH_GREGORIAN = {
  [SHAHENSHAHI]: new Date(2025, 7, 15),
  [KADMI]: new Date(2025, 6, 16),
  [FASLI]: new Date(2025, 2, 21),
};

const EPOCH_PARSI_YEAR = 1394;

function daysBetween(a, b) {
  const msPerDay = 86400000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcB - utcA) / msPerDay);
}

export function gregorianToParsi(gregDate, variant) {
  const epoch = EPOCH_GREGORIAN[variant];
  let totalDays = daysBetween(epoch, gregDate);

  const parsiYearLength = 365;
  let year = EPOCH_PARSI_YEAR;

  if (totalDays < 0) {
    while (totalDays < 0) {
      year--;
      totalDays += parsiYearLength;
    }
  } else {
    while (totalDays >= parsiYearLength) {
      totalDays -= parsiYearLength;
      year++;
    }
  }

  const dayOfYear = totalDays;
  if (dayOfYear >= 360) {
    return { day: dayOfYear - 360 + 1, month: 13, year, monthName: "Gatha" };
  }

  const month = Math.floor(dayOfYear / 30) + 1;
  const day = (dayOfYear % 30) + 1;
  return { day, month, year, monthName: MONTH_NAMES[month - 1] };
}
```

**Step 4: Run tests**

```bash
yarn test
```

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/parsi.js src/parsi.test.js
git commit -m "feat: add Gregorian-to-Parsi date conversion"
```

---

### Task 4: Parsi Calendar — Anniversary Date Generation

**Files:**
- Modify: `src/parsi.js`
- Modify: `src/parsi.test.js`

**Step 1: Write failing tests**

Add to `src/parsi.test.js`:
```js
import { ordinal, gregorianToParsi, generateAnniversaries, SHAHENSHAHI, KADMI, FASLI } from "./parsi.js";

describe("generateAnniversaries", () => {
  it("generates correct number of anniversaries", () => {
    const base = new Date(2025, 7, 17);
    const result = generateAnniversaries(base, SHAHENSHAHI, 5);
    expect(result).toHaveLength(5);
  });

  it("first anniversary is the base date itself", () => {
    const base = new Date(2025, 7, 17);
    const result = generateAnniversaries(base, SHAHENSHAHI, 3);
    expect(result[0].gregorianDate.getTime()).toBe(base.getTime());
    expect(result[0].number).toBe(1);
  });

  it("Shahenshahi anniversaries are exactly 365 days apart", () => {
    const base = new Date(2025, 7, 17);
    const result = generateAnniversaries(base, SHAHENSHAHI, 3);
    const d1 = result[0].gregorianDate;
    const d2 = result[1].gregorianDate;
    const d3 = result[2].gregorianDate;
    const msPerDay = 86400000;
    expect((d2 - d1) / msPerDay).toBe(365);
    expect((d3 - d2) / msPerDay).toBe(365);
  });

  it("each anniversary has a parsi date", () => {
    const base = new Date(2025, 7, 17);
    const result = generateAnniversaries(base, SHAHENSHAHI, 2);
    expect(result[0].parsiDate.monthName).toBe("Fravardin");
    expect(result[1].parsiDate.year).toBe(result[0].parsiDate.year + 1);
  });

  it("Fasli anniversaries stay near the same Gregorian date", () => {
    const base = new Date(2025, 2, 25);
    const result = generateAnniversaries(base, FASLI, 5);
    for (const ann of result) {
      const month = ann.gregorianDate.getMonth();
      expect(month === 2 || month === 3).toBe(true);
    }
  });
});
```

**Step 2: Run tests to verify failure**

```bash
yarn test
```

Expected: FAIL — `generateAnniversaries` not exported.

**Step 3: Implement**

Add to `src/parsi.js`:
```js
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isFasliLeapYear(fasliYear) {
  const gregApproxYear = fasliYear + 631;
  return (gregApproxYear % 4 === 0 && gregApproxYear % 100 !== 0) || gregApproxYear % 400 === 0;
}

export function generateAnniversaries(baseGregorianDate, variant, count) {
  const anniversaries = [];
  let currentDate = new Date(baseGregorianDate);

  for (let i = 0; i < count; i++) {
    const parsiDate = gregorianToParsi(currentDate, variant);
    anniversaries.push({
      number: i + 1,
      gregorianDate: new Date(currentDate),
      parsiDate,
    });

    if (variant === FASLI) {
      const nextYearLength = isFasliLeapYear(parsiDate.year) ? 366 : 365;
      currentDate = addDays(currentDate, nextYearLength);
    } else {
      currentDate = addDays(currentDate, 365);
    }
  }

  return anniversaries;
}
```

**Step 4: Run tests**

```bash
yarn test
```

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/parsi.js src/parsi.test.js
git commit -m "feat: add anniversary date generation"
```

---

### Task 5: ICS File Generation

**Files:**
- Create: `src/ics.js`
- Create: `src/ics.test.js`

**Step 1: Write failing tests**

Create `src/ics.test.js`:
```js
import { describe, it, expect } from "vitest";
import { generateICS } from "./ics.js";

describe("generateICS", () => {
  const mockAnniversaries = [
    {
      number: 1,
      gregorianDate: new Date(2025, 7, 17),
      parsiDate: { day: 3, month: 1, year: 1394, monthName: "Fravardin" },
    },
    {
      number: 2,
      gregorianDate: new Date(2026, 7, 17),
      parsiDate: { day: 3, month: 1, year: 1395, monthName: "Fravardin" },
    },
  ];

  it("starts with VCALENDAR header", () => {
    const ics = generateICS(mockAnniversaries, "Hoshi's", "Birthday", "Shahenshahi");
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
  });

  it("contains VEVENT for each anniversary", () => {
    const ics = generateICS(mockAnniversaries, "Hoshi's", "Birthday", "Shahenshahi");
    const eventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    expect(eventCount).toBe(2);
  });

  it("formats summary with ordinal", () => {
    const ics = generateICS(mockAnniversaries, "Hoshi's", "Birthday", "Shahenshahi");
    expect(ics).toContain("SUMMARY:Hoshi's 1st Birthday");
    expect(ics).toContain("SUMMARY:Hoshi's 2nd Birthday");
  });

  it("formats date as all-day event (YYYYMMDD)", () => {
    const ics = generateICS(mockAnniversaries, "Hoshi's", "Birthday", "Shahenshahi");
    expect(ics).toContain("DTSTART;VALUE=DATE:20250817");
  });

  it("includes Parsi date in description", () => {
    const ics = generateICS(mockAnniversaries, "Hoshi's", "Birthday", "Shahenshahi");
    expect(ics).toContain("3 Fravardin 1394 YZ (Shahenshahi)");
  });

  it("ends with END:VCALENDAR", () => {
    const ics = generateICS(mockAnniversaries, "Hoshi's", "Birthday", "Shahenshahi");
    expect(ics.trim()).toMatch(/END:VCALENDAR$/);
  });
});
```

**Step 2: Run tests to verify failure**

```bash
yarn test
```

Expected: FAIL.

**Step 3: Implement**

Create `src/ics.js`:
```js
import { ordinal } from "./parsi.js";

function formatDateICS(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

function formatParsiDate(parsiDate, variant) {
  const variantLabel =
    variant === "shahenshahi" ? "Shahenshahi" :
    variant === "kadmi" ? "Kadmi" : "Fasli";
  return `${parsiDate.day} ${parsiDate.monthName} ${parsiDate.year} YZ (${variantLabel})`;
}

export function generateICS(anniversaries, subject, occasion, variant) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Parsi Calendar//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const ann of anniversaries) {
    const summary = `${subject} ${ordinal(ann.number)} ${occasion}`;
    const dtstart = formatDateICS(ann.gregorianDate);
    const description = formatParsiDate(ann.parsiDate, variant);

    lines.push(
      "BEGIN:VEVENT",
      `DTSTART;VALUE=DATE:${dtstart}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `UID:parsi-${dtstart}-${ann.number}@parsi-calendar`,
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
```

**Step 4: Run tests**

```bash
yarn test
```

Expected: ALL PASS.

**Step 5: Commit**

```bash
git add src/ics.js src/ics.test.js
git commit -m "feat: add ICS file generation"
```

---

### Task 6: HTML Page and Styling

**Files:**
- Create: `index.html`
- Create: `style.css`

**Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parsi Calendar Event Generator</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <main>
    <h1>Parsi Calendar Event Generator</h1>
    <p>Generate calendar files (.ics) for recurring occasions on the Parsi calendar.</p>

    <form id="event-form">
      <label>
        Subject
        <input type="text" id="subject" value="Hoshi's">
      </label>
      <label>
        Occasion
        <input type="text" id="occasion" value="Birthday">
      </label>
      <label>
        Date (Gregorian)
        <input type="date" id="date">
      </label>
      <label>
        Calendar
        <select id="variant">
          <option value="shahenshahi" selected>Shahenshahi</option>
          <option value="kadmi">Kadmi</option>
          <option value="fasli">Fasli</option>
        </select>
      </label>
      <label>
        Number of events
        <input type="number" id="count" value="100" min="1" max="500">
      </label>
      <button type="submit">Download .ics</button>
    </form>

    <section id="preview">
      <h2>Preview</h2>
      <div id="preview-events"></div>
    </section>
  </main>
  <script type="module" src="src/main.js"></script>
</body>
</html>
```

**Step 2: Create `style.css`**

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: #1a1a1a;
  background: #fafafa;
}

h1 {
  margin-bottom: 0.5rem;
}

main > p {
  color: #555;
  margin-bottom: 2rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 500;
  font-size: 0.9rem;
}

input, select {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  padding: 0.75rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
}

button:hover {
  background: #1d4ed8;
}

#preview {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #ddd;
}

#preview h2 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.preview-event {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.preview-event-title {
  font-weight: 600;
}

.preview-event-greg {
  color: #555;
  font-size: 0.9rem;
}

.preview-event-parsi {
  color: #888;
  font-size: 0.85rem;
}
```

**Step 3: Commit**

```bash
git add index.html style.css
git commit -m "feat: add HTML page and styling"
```

---

### Task 7: Main JS — Form Handling, Preview, Download

**Files:**
- Create: `src/main.js`

**Step 1: Implement `src/main.js`**

```js
import { generateAnniversaries, gregorianToParsi, ordinal, SHAHENSHAHI, KADMI, FASLI } from "./parsi.js";
import { generateICS } from "./ics.js";

const form = document.getElementById("event-form");
const subjectInput = document.getElementById("subject");
const occasionInput = document.getElementById("occasion");
const dateInput = document.getElementById("date");
const variantSelect = document.getElementById("variant");
const countInput = document.getElementById("count");
const previewContainer = document.getElementById("preview-events");

function todayString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

dateInput.value = todayString();

function formatGregorianDisplay(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function updatePreview() {
  const subject = subjectInput.value || "Subject";
  const occasion = occasionInput.value || "Occasion";
  const dateVal = dateInput.value;
  if (!dateVal) {
    previewContainer.innerHTML = "";
    return;
  }

  const [y, m, d] = dateVal.split("-").map(Number);
  const baseDate = new Date(y, m - 1, d);
  const variant = variantSelect.value;

  const preview = generateAnniversaries(baseDate, variant, 3);
  const variantLabel =
    variant === "shahenshahi" ? "Shahenshahi" :
    variant === "kadmi" ? "Kadmi" : "Fasli";

  previewContainer.innerHTML = preview
    .map((ann) => {
      const title = `${subject} ${ordinal(ann.number)} ${occasion}`;
      const greg = formatGregorianDisplay(ann.gregorianDate);
      const parsi = `${ann.parsiDate.day} ${ann.parsiDate.monthName} ${ann.parsiDate.year} YZ (${variantLabel})`;
      return `<div class="preview-event">
        <div class="preview-event-title">${title}</div>
        <div class="preview-event-greg">${greg}</div>
        <div class="preview-event-parsi">${parsi}</div>
      </div>`;
    })
    .join("");
}

[subjectInput, occasionInput, dateInput, variantSelect, countInput].forEach((el) =>
  el.addEventListener("input", updatePreview)
);

updatePreview();

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const subject = subjectInput.value || "Subject";
  const occasion = occasionInput.value || "Occasion";
  const dateVal = dateInput.value;
  if (!dateVal) return;

  const [y, m, d] = dateVal.split("-").map(Number);
  const baseDate = new Date(y, m - 1, d);
  const variant = variantSelect.value;
  const count = parseInt(countInput.value, 10) || 100;

  const anniversaries = generateAnniversaries(baseDate, variant, count);
  const ics = generateICS(anniversaries, subject, occasion, variant);

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${subject.replace(/\s+/g, "-")}-${occasion.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
});
```

**Step 2: Open in browser and manually verify**

```bash
open /Users/david.smith/Projects/parsi-calendar/index.html
```

Verify:
- Form is pre-filled with defaults
- Preview shows 3 events immediately
- Changing any field updates preview live
- Download button produces a valid .ics file
- Import the .ics into a calendar app to spot check dates

**Step 3: Commit**

```bash
git add src/main.js
git commit -m "feat: add form handling, live preview, and ICS download"
```

---

### Task 8: Final Verification and GitHub Pages Setup

**Step 1: Run all tests one final time**

```bash
yarn test
```

Expected: ALL PASS.

**Step 2: Create GitHub repo and push**

```bash
gh repo create parsi-calendar --public --source=. --push
```

**Step 3: Enable GitHub Pages**

```bash
gh api repos/{owner}/parsi-calendar/pages -X POST -f "build_type=legacy" -f "source[branch]=master" -f "source[path]=/"
```

**Step 4: Verify the deployed site**

Check the pages URL from:
```bash
gh repo view --web
```

**Step 5: Commit any final fixes**

If anything needs fixing, commit and push.
