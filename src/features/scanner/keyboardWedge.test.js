import { describe, it, expect } from "vitest";
import { createScanBuffer, feedKey, SCAN_MAX_LENGTH } from "./keyboardWedge";

const ENTER = "Enter";

function simulate(keys) {
  const buffer = createScanBuffer();
  let result = null;
  let t = 0;
  for (const [k, dt] of keys) {
    t += dt;
    const out = feedKey(buffer, k, t);
    if (out !== null) result = out;
  }
  return { result, buffer };
}

describe("keyboardWedge.feedKey", () => {
  it("detects a fast scanner burst followed by Enter", () => {
    const digits = "4".repeat(13);
    const keys = [];
    for (const d of digits) keys.push([d, 10]);
    keys.push([ENTER, 10]);
    const { result } = simulate(keys);
    expect(result).toBe(digits);
  });

  it("returns null for normal human typing speed", () => {
    const keys = [];
    for (let i = 0; i < 6; i++) keys.push(["a", 200]);
    keys.push([ENTER, 200]);
    const { result } = simulate(keys);
    expect(result).toBeNull();
  });

  it("returns null when Enter is pressed with an empty buffer", () => {
    const { result } = simulate([[ENTER, 1]]);
    expect(result).toBeNull();
  });

  it("ignores non-printable keys and still detects a real scan", () => {
    const keys = [[ "Shift", 10 ]]; // length !== 1, skipped; the following burst is still detected
    for (let i = 0; i < 8; i++) keys.push(["B", 10]);
    keys.push([ENTER, 10]);
    const { result } = simulate(keys);
    expect(result).toBe("BBBBBBBB");
  });

  it("resets the buffer after a long pause between keys", () => {
    const keys = [
      ["1", 0], ["2", 10], ["3", 10], ["4", 10],
      ["9", 1500], ["8", 10], ["7", 10], ["6", 10], ["5", 10],
      [ENTER, 10],
    ];
    const { result } = simulate(keys);
    expect(result).toBe("98765");
  });

  it("caps the buffer length and never grows unbounded", () => {
    const keys = [];
    for (let i = 0; i < SCAN_MAX_LENGTH + 20; i++) keys.push(["0", 10]);
    const { buffer } = simulate(keys);
    expect(buffer.keys.length).toBeLessThanOrEqual(SCAN_MAX_LENGTH);
  });
});