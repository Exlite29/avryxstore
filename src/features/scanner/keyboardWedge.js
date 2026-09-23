// Keyboard-wedge barcode scanner support.
//
// Bluetooth/USB handheld scanners present themselves as keyboards (HID):
// they "type" the barcode very quickly and finish with Enter. Normal human
// typing is much slower. This module detects those fast bursts so the POS
// can auto-capture a scan, while ignoring manual typing.

export const SCAN_MIN_LENGTH = 4;
export const SCAN_MAX_LENGTH = 128;
export const KEY_GAP_MS = 100; // max ms between keystrokes in one burst
export const TOTAL_MS = 1000; // max total burst duration

export function createScanBuffer() {
  return { keys: [], start: 0, last: 0 };
}

// Feed a single keydown. Returns null when there is no completed scan (the
// key was consumed/buffered or skipped). Returns the decoded barcode string
// when the Enter key finishes a valid scanner burst. `now` can be injected
// for tests.
export function feedKey(buffer, key, now = Date.now()) {
  if (key === "Enter") {
    const isScan =
      buffer.keys.length >= SCAN_MIN_LENGTH &&
      buffer.keys.length <= SCAN_MAX_LENGTH &&
      now - buffer.start <= TOTAL_MS &&
      (now - buffer.start) / buffer.keys.length <= KEY_GAP_MS;
    const scannedValue = isScan ? buffer.keys.join("") : null;

    buffer.keys = [];
    buffer.start = 0;
    buffer.last = 0;
    return scannedValue;
  }

  // Skip non-printable keys (modifiers, function keys, etc.).
  if (key.length !== 1) return null;

  const gap = buffer.last ? now - buffer.last : 0;
  if (!buffer.start || gap > KEY_GAP_MS || buffer.keys.length >= SCAN_MAX_LENGTH) {
    buffer.keys = [];
    buffer.start = now;
  }

  buffer.keys.push(key);
  buffer.last = now;
  return null;
}