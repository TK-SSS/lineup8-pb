export const THEMES = [
  { id: 'violet', label: 'バイオレット', oklch: 'oklch(0.541 0.281 293.009)' },
  { id: 'blue',   label: 'ブルー',       oklch: 'oklch(0.546 0.245 262.881)' },
  { id: 'emerald',label: 'グリーン',     oklch: 'oklch(0.596 0.145 163.225)' },
  { id: 'rose',   label: 'ローズ',       oklch: 'oklch(0.586 0.253 17.585)'  },
  { id: 'amber',  label: 'アンバー',     oklch: 'oklch(0.666 0.179 58.318)'  },
  { id: 'yellow', label: 'イエロー',     oklch: 'oklch(0.681 0.162 75.834)'  },
  { id: 'lime',   label: 'ライム',       oklch: 'oklch(0.648 0.2   131.684)' },
  { id: 'pink',   label: 'ピンク',       oklch: 'oklch(0.592 0.249 0.584)'   },
] as const

export type ThemeId = typeof THEMES[number]['id']

export function applyTheme(id: ThemeId) {
  document.documentElement.setAttribute('data-theme', id)
  localStorage.setItem('lineup8-theme', id)
}

export function getSavedTheme(): ThemeId {
  if (typeof window === 'undefined') return 'violet'
  return (localStorage.getItem('lineup8-theme') as ThemeId) ?? 'violet'
}
