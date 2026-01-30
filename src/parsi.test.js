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
