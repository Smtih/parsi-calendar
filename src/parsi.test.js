import { describe, it, expect } from "vitest";
import { ordinal, gregorianToParsi, generateAnniversaries, SHAHENSHAHI, KADMI, FASLI } from "./parsi.js";

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

describe("generateAnniversaries", () => {
  it("generates correct number of anniversaries", () => {
    const base = new Date(2025, 7, 17);
    const result = generateAnniversaries(base, SHAHENSHAHI, 5);
    expect(result).toHaveLength(5);
  });

  it("first anniversary is one Parsi year after the base date", () => {
    const base = new Date(2025, 7, 17);
    const result = generateAnniversaries(base, SHAHENSHAHI, 3);
    const msPerDay = 86400000;
    expect((result[0].gregorianDate - base) / msPerDay).toBe(365);
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
