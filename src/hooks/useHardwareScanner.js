import { useEffect, useRef } from "react";

const MIN_LEN = 4;
const MAX_LEN = 128;
const KEY_GAP = 100; // ms between keystrokes
const TOTAL_MS = 1000; // max total burst duration

/**
 * Detects barcode scans from USB/Bluetooth keyboard-wedge scanners.
 * Wedge scanners act as keyboards: they "type" the barcode very quickly
 * and then send Enter. We detect that fast burst and call `onScan`,
 * while ignoring normal (slower) human typing.
 *
 * @param {(barcode: string, target: EventTarget | null) => void} onScan
 *        Called when a scanned barcode is detected.
 */
export function useHardwareScanner(onScan) {
  const latestScanRef = useRef(onScan);

  useEffect(() => {
    latestScanRef.current = onScan;
  });

  useEffect(() => {
    const buffer = { keys: [], start: 0, last: 0 };

    const onKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const now = Date.now();

      if (e.key === "Enter") {
        const isScan =
          buffer.keys.length >= MIN_LEN &&
          buffer.keys.length <= MAX_LEN &&
          now - buffer.start <= TOTAL_MS &&
          (now - buffer.start) / buffer.keys.length <= KEY_GAP;
        const scannedValue = isScan ? buffer.keys.join("") : null;

        buffer.keys = [];
        buffer.start = 0;
        buffer.last = 0;

        if (scannedValue) {
          e.preventDefault();
          latestScanRef.current(scannedValue, e.target);
        }
        return;
      }

      if (e.key.length !== 1) return;

      const gap = buffer.last ? now - buffer.last : 0;
      if (!buffer.start || gap > KEY_GAP || buffer.keys.length >= MAX_LEN) {
        buffer.keys = [];
        buffer.start = now;
      }
      buffer.keys.push(e.key);
      buffer.last = now;
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, []);
}