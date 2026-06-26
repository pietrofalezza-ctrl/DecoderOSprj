import type { StaticStringEvidence, StaticStringMatch } from "@/types/analysis";

export type StaticStringOptions = {
  minLength?: number;
  maxBytes?: number;
  maxStrings?: number;
};

const DEFAULT_MIN_LENGTH = 4;
const DEFAULT_MAX_BYTES = 1_000_000;
const DEFAULT_MAX_STRINGS = 2_000;

function isAsciiPrintable(byte: number): boolean {
  return byte >= 0x20 && byte <= 0x7e;
}

export function extractAsciiStrings(
  bytes: Uint8Array,
  options: StaticStringOptions = {},
): StaticStringEvidence[] {
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;
  const maxBytes = Math.min(bytes.length, options.maxBytes ?? DEFAULT_MAX_BYTES);
  const maxStrings = options.maxStrings ?? DEFAULT_MAX_STRINGS;
  const strings: StaticStringEvidence[] = [];
  let start = -1;
  let chars: number[] = [];

  const flush = (endOffset: number) => {
    if (start >= 0 && chars.length >= minLength && strings.length < maxStrings) {
      strings.push({
        value: String.fromCharCode(...chars),
        offset: start,
        encoding: "ascii",
      });
    }
    start = -1;
    chars = [];
    return endOffset;
  };

  for (let i = 0; i < maxBytes; i++) {
    const byte = bytes[i];
    if (isAsciiPrintable(byte)) {
      if (start < 0) start = i;
      chars.push(byte);
      continue;
    }
    flush(i);
    if (strings.length >= maxStrings) break;
  }
  flush(maxBytes);
  return strings;
}

export function extractUtf16LeStrings(
  bytes: Uint8Array,
  options: StaticStringOptions = {},
): StaticStringEvidence[] {
  const minLength = options.minLength ?? DEFAULT_MIN_LENGTH;
  const maxBytes = Math.min(bytes.length - 1, options.maxBytes ?? DEFAULT_MAX_BYTES);
  const maxStrings = options.maxStrings ?? DEFAULT_MAX_STRINGS;
  const strings: StaticStringEvidence[] = [];
  let start = -1;
  let chars: number[] = [];

  const flush = () => {
    if (start >= 0 && chars.length >= minLength && strings.length < maxStrings) {
      strings.push({
        value: String.fromCharCode(...chars),
        offset: start,
        encoding: "utf16le",
      });
    }
    start = -1;
    chars = [];
  };

  for (let i = 0; i < maxBytes; i += 2) {
    const code = bytes[i];
    const zero = bytes[i + 1];
    if (zero === 0 && isAsciiPrintable(code)) {
      if (start < 0) start = i;
      chars.push(code);
      continue;
    }
    flush();
    if (strings.length >= maxStrings) break;
  }
  flush();
  return strings;
}

export function extractStaticStrings(
  bytes: Uint8Array,
  options: StaticStringOptions = {},
): StaticStringEvidence[] {
  const combined = [
    ...extractAsciiStrings(bytes, options),
    ...extractUtf16LeStrings(bytes, options),
  ];
  return combined
    .sort((a, b) => a.offset - b.offset)
    .slice(0, options.maxStrings ?? DEFAULT_MAX_STRINGS);
}

export function findStringMatches(
  strings: StaticStringEvidence[],
  keywords: string[],
): StaticStringMatch[] {
  const normalized = keywords.map((keyword) => keyword.toLowerCase());
  const matches: StaticStringMatch[] = [];
  for (const entry of strings) {
    const value = entry.value.toLowerCase();
    const keyword = normalized.find((candidate) => value.includes(candidate));
    if (keyword) {
      matches.push({ ...entry, keyword });
    }
  }
  return matches;
}
