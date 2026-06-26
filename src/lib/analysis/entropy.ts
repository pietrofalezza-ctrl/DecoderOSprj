import { shannonEntropy, shannonEntropySliding } from "@/lib/static-risk.server";
import type { PeSection } from "@/types/analysis";

export function calculateEntropy(bytes: Uint8Array): number {
  return shannonEntropy(bytes);
}

export function calculateMaxWindowEntropy(bytes: Uint8Array, window = 4096, step = 1024): number {
  return shannonEntropySliding(bytes, window, step);
}

export function calculateSectionEntropy(bytes: Uint8Array, section: PeSection): number {
  if (section.rawSize <= 0 || section.rawOffset < 0 || section.rawOffset >= bytes.length) {
    return 0;
  }
  const end = Math.min(bytes.length, section.rawOffset + section.rawSize);
  return calculateEntropy(bytes.subarray(section.rawOffset, end));
}
