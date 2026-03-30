import type { ToothCondition } from '@dental-ms/shared-types';

/** FDI tooth numbers: 11-18 (UR), 21-28 (UL), 31-38 (LL), 41-48 (LR) */
export const FDI_UPPER_RIGHT = [11, 12, 13, 14, 15, 16, 17, 18] as const;
export const FDI_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28] as const;
export const FDI_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38] as const;
export const FDI_LOWER_RIGHT = [41, 42, 43, 44, 45, 46, 47, 48] as const;

export const ALL_FDI: number[] = [
  ...FDI_UPPER_RIGHT,
  ...FDI_UPPER_LEFT,
  ...FDI_LOWER_LEFT,
  ...FDI_LOWER_RIGHT,
];

export const TOOTH_CONDITIONS: { value: ToothCondition; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: '#E8F5E9' },
  { value: 'caries', label: 'Caries', color: '#FFCDD2' },
  { value: 'filling', label: 'Filling', color: '#B3E5FC' },
  { value: 'crown', label: 'Crown', color: '#FFF9C4' },
  { value: 'rct', label: 'RCT', color: '#D1C4E9' },
  { value: 'extraction', label: 'Extraction', color: '#B0BEC5' },
  { value: 'implant', label: 'Implant', color: '#C5CAE9' },
  { value: 'bridge', label: 'Bridge', color: '#FFECB3' },
  { value: 'missing', label: 'Missing', color: '#CFD8DC' },
];

export function getConditionColor(tag: ToothCondition | null | undefined): string {
  if (!tag) return '#ffffff';
  const c = TOOTH_CONDITIONS.find((x) => x.value === tag);
  return c?.color ?? '#f5f5f5';
}
