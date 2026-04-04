/** Shared helpers for clinic header lines on @react-pdf slip-style documents. */

export function formatHours(open?: string | null, close?: string | null): string | null {
  const o = open?.trim();
  const c = close?.trim();
  if (o && c) return `${o} – ${c}`;
  if (o) return o;
  if (c) return c;
  return null;
}

export function joinAddress(address?: string | null, city?: string | null): string | null {
  const parts = [address?.trim(), city?.trim()].filter(Boolean) as string[];
  return parts.length ? parts.join(', ') : null;
}

export const THERMAL_WIDTH_PT = Math.round((80 / 25.4) * 72);
