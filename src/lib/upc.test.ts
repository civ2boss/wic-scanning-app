import { describe, expect, it } from "vitest";
import { expandUpcE, normalizeUpc } from "./upc";

describe("normalizeUpc", () => {
  it("preserves 4-digit conventional and 5-digit organic produce PLUs", () => {
    expect(normalizeUpc("4098")).toBe("4098");
    expect(normalizeUpc("94098")).toBe("94098");
    expect(normalizeUpc(4098)).toBe("4098");
  });

  it("preserves standard 12-digit UPC-A codes", () => {
    expect(normalizeUpc("036514237175")).toBe("036514237175");
    expect(normalizeUpc("653341551191")).toBe("653341551191");
  });

  it("strips the leading 0 from 13-digit EAN-13 scans of North American UPC-A codes", () => {
    // BarcodeDetector often prefixes 12-digit UPC-A with a 0 to form EAN-13
    expect(normalizeUpc("0036514237175")).toBe("036514237175");
    expect(normalizeUpc("0653341551191")).toBe("653341551191");
  });

  it("preserves 13-digit EAN-13 codes that do not start with 0 (e.g., Aldi products)", () => {
    expect(normalizeUpc("4099100121315")).toBe("4099100121315");
  });

  it("left-pads 6-to-11 digit UPCs where leading zeros were stripped", () => {
    expect(normalizeUpc("36514237175")).toBe("036514237175");
    expect(normalizeUpc("123456")).toBe("000000123456");
  });

  it("expands 8-digit UPC-E codes to 12-digit UPC-A", () => {
    // d6 = 0 -> manufacturer d1 d2 d6 00, item 00 d3 d4 d5
    expect(expandUpcE("04210009")).toBe("042000001009");
    expect(normalizeUpc("04210009")).toBe("042000001009");
    // d6 = 3 -> manufacturer d1 d2 d3 00, item 000 d4 d5
    expect(normalizeUpc("04252634")).toBe("042500000264");
    // d6 = 4 -> manufacturer d1 d2 d3 d4 0, item 0000 d5
    expect(normalizeUpc("01234543")).toBe("012340000053");
    // d6 = 5..9 -> manufacturer d1 d2 d3 d4 d5, item 0000 d6
    expect(normalizeUpc("01234565")).toBe("012345000065");
  });

  it("strips non-digit formatting characters and handles empty inputs", () => {
    expect(normalizeUpc("0-36514-23717-5")).toBe("036514237175");
    expect(normalizeUpc("  4098 ")).toBe("4098");
    expect(normalizeUpc("")).toBe("");
    expect(normalizeUpc(null)).toBe("");
    expect(normalizeUpc(undefined)).toBe("");
  });
});
