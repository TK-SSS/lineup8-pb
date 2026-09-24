import type { Formation } from '@/types'

export interface PositionDef {
  key: string
  label: string
  x: number  // % from left
  y: number  // % from top — 0=center circle end, 100=attacking goal end
}

// Layout: center circle at TOP (center line), goal box at BOTTOM (our goal)
// GK at bottom (defending), FW at top (near center, attacking upward)
export const FORMATIONS: Record<Formation, PositionDef[]> = {
  '3-3-1': [
    { key: 'FW',    label: 'FW', x: 50, y: 11 },
    { key: 'MF-L',  label: 'MF', x: 18, y: 37 },
    { key: 'MF-C',  label: 'MF', x: 50, y: 37 },
    { key: 'MF-R',  label: 'MF', x: 82, y: 37 },
    { key: 'DF-L',  label: 'DF', x: 18, y: 63 },
    { key: 'DF-C',  label: 'DF', x: 50, y: 63 },
    { key: 'DF-R',  label: 'DF', x: 82, y: 63 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
  '2-3-2': [
    { key: 'FW-L',  label: 'FW', x: 30, y: 11 },
    { key: 'FW-R',  label: 'FW', x: 70, y: 11 },
    { key: 'MF-L',  label: 'MF', x: 18, y: 37 },
    { key: 'MF-C',  label: 'MF', x: 50, y: 37 },
    { key: 'MF-R',  label: 'MF', x: 82, y: 37 },
    { key: 'DF-L',  label: 'DF', x: 33, y: 63 },
    { key: 'DF-R',  label: 'DF', x: 67, y: 63 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
  '3-2-2': [
    { key: 'FW-L',  label: 'FW', x: 30, y: 11 },
    { key: 'FW-R',  label: 'FW', x: 70, y: 11 },
    { key: 'MF-L',  label: 'MF', x: 35, y: 37 },
    { key: 'MF-R',  label: 'MF', x: 65, y: 37 },
    { key: 'DF-L',  label: 'DF', x: 18, y: 63 },
    { key: 'DF-C',  label: 'DF', x: 50, y: 63 },
    { key: 'DF-R',  label: 'DF', x: 82, y: 63 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
  '2-4-1': [
    { key: 'FW',    label: 'FW', x: 50, y: 11 },
    { key: 'MF-LL', label: 'MF', x: 14, y: 37 },
    { key: 'MF-L',  label: 'MF', x: 38, y: 37 },
    { key: 'MF-R',  label: 'MF', x: 62, y: 37 },
    { key: 'MF-RR', label: 'MF', x: 86, y: 37 },
    { key: 'DF-L',  label: 'DF', x: 33, y: 63 },
    { key: 'DF-R',  label: 'DF', x: 67, y: 63 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
  '3-1-2-1': [
    { key: 'FW',    label: 'FW', x: 50, y: 10 },
    { key: 'MF-L',  label: 'MF', x: 30, y: 30 },
    { key: 'MF-R',  label: 'MF', x: 70, y: 30 },
    { key: 'DM',    label: 'MF', x: 50, y: 49 },
    { key: 'DF-L',  label: 'DF', x: 18, y: 69 },
    { key: 'DF-C',  label: 'DF', x: 50, y: 69 },
    { key: 'DF-R',  label: 'DF', x: 82, y: 69 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
  '3-2-1-1': [
    { key: 'FW',    label: 'FW', x: 50, y: 10 },
    { key: 'AM',    label: 'MF', x: 50, y: 30 },
    { key: 'MF-L',  label: 'MF', x: 33, y: 49 },
    { key: 'MF-R',  label: 'MF', x: 67, y: 49 },
    { key: 'DF-L',  label: 'DF', x: 18, y: 69 },
    { key: 'DF-C',  label: 'DF', x: 50, y: 69 },
    { key: 'DF-R',  label: 'DF', x: 82, y: 69 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
  '2-1-3-1': [
    { key: 'FW',    label: 'FW', x: 50, y: 10 },
    { key: 'MF-L',  label: 'MF', x: 18, y: 30 },
    { key: 'MF-C',  label: 'MF', x: 50, y: 30 },
    { key: 'MF-R',  label: 'MF', x: 82, y: 30 },
    { key: 'DM',    label: 'MF', x: 50, y: 49 },
    { key: 'DF-L',  label: 'DF', x: 33, y: 69 },
    { key: 'DF-R',  label: 'DF', x: 67, y: 69 },
    { key: 'GK',    label: 'GK', x: 50, y: 88 },
  ],
}

export const POSITION_COLORS: Record<string, string> = {
  GK: '#FCD34D',
  DF: '#60A5FA',
  MF: '#FFFFFF',
  FW: '#FB923C',
}

export function positionColor(label: string): string {
  return POSITION_COLORS[label] ?? '#FFFFFF'
}
