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
