/**
 * Canonical UPC / PLU normalization utilities.
 *
 * Ensures barcode strings emitted by camera scanners (BarcodeDetector / ZXing),
 * manual keypad entry, and NYS WIC APL Excel spreadsheets normalize to the exact
 * same canonical key:
 * - 4 or 5 digits: Produce PLU (conventional 4-digit or organic 5-digit starting with 9)
 * - 8 digits (starting with 0 or 1): UPC-E expanded to 12-digit UPC-A
 * - 6 to 11 digits: Left-padded with "0" to 12-digit UPC-A
 * - 12 digits: Standard 12-digit UPC-A
 * - 13 digits starting with "0": EAN-13 representation of North American UPC-A -> strip leading "0" to 12 digits
 * - 13 digits not starting with "0": International EAN-13 (e.g., Aldi 4099100...) -> preserved as 13 digits
 */

/**
 * Expands an 8-digit UPC-E barcode (number system 0 or 1) into its 12-digit UPC-A equivalent.
 */
export function expandUpcE(upcE: string): string {
  if (!/^[01]\d{7}$/.test(upcE)) {
    return upcE.padStart(12, "0");
  }

  const numberSystem = upcE[0];
  const d1 = upcE[1];
  const d2 = upcE[2];
  const d3 = upcE[3];
  const d4 = upcE[4];
  const d5 = upcE[5];
  const d6 = upcE[6];
  const checkDigit = upcE[7];

  switch (d6) {
    case "0":
    case "1":
    case "2":
      return `${numberSystem}${d1}${d2}${d6}0000${d3}${d4}${d5}${checkDigit}`;
    case "3":
      return `${numberSystem}${d1}${d2}${d3}00000${d4}${d5}${checkDigit}`;
    case "4":
      return `${numberSystem}${d1}${d2}${d3}${d4}00000${d5}${checkDigit}`;
    default:
      // d6 is 5, 6, 7, 8, or 9
      return `${numberSystem}${d1}${d2}${d3}${d4}${d5}0000${d6}${checkDigit}`;
  }
}

/**
 * Normalizes any raw barcode or APL UPC/PLU value into its canonical string key.
 */
export function normalizeUpc(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) {
    return "";
  }

  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 0) {
    return "";
  }

  // 4-digit conventional PLU or 5-digit organic PLU
  if (digits.length === 4 || digits.length === 5) {
    return digits;
  }

  // 8-digit UPC-E (number system 0 or 1) -> expand to 12-digit UPC-A
  if (digits.length === 8) {
    return expandUpcE(digits);
  }

  // 6 to 11 digits -> zero-pad to 12-digit UPC-A
  if (digits.length >= 6 && digits.length <= 11) {
    return digits.padStart(12, "0");
  }

  // 12-digit UPC-A
  if (digits.length === 12) {
    return digits;
  }

  // 13-digit EAN-13: if it has a leading "0", it's a 12-digit UPC-A prefixed by the scanner
  if (digits.length === 13) {
    return digits.startsWith("0") ? digits.slice(1) : digits;
  }

  // 14-digit GTIN-14: strip leading "00" (or "0") if present
  if (digits.length === 14) {
    if (digits.startsWith("00")) {
      return digits.slice(2);
    }
    if (digits.startsWith("0")) {
      return digits.slice(1);
    }
  }

  return digits;
}
