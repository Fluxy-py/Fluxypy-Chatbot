'use client';

import { create } from 'zustand';

interface ThemeState {
  dark: boolean;
  setDark: (dark: boolean) => void;
  toggleTheme: () => void;
  hydrated: boolean;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  dark: true,
  hydrated: false,

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('fluxypy-theme');
    set({ dark: saved ? saved === 'dark' : true, hydrated: true });
  },

  setDark: (dark: boolean) => {
    set({ dark });
    if (typeof window !== 'undefined') {
      localStorage.setItem('fluxypy-theme', dark ? 'dark' : 'light');
    }
  },

  toggleTheme: () => {
    const next = !get().dark;
    set({ dark: next });
    if (typeof window !== 'undefined') {
      localStorage.setItem('fluxypy-theme', next ? 'dark' : 'light');
    }
  },
}));

export function getTokens(dark: boolean) {
  return {
    bg:        dark ? '#080808'                    : '#f5f5f7',
    bgSecond:  dark ? '#0f0f0f'                    : '#ebebed',
    text:      dark ? '#ffffff'                    : '#0a0a0a',
    textMuted: dark ? 'rgba(255,255,255,0.4)'      : 'rgba(0,0,0,0.45)',
    textDim:   dark ? 'rgba(255,255,255,0.2)'      : 'rgba(0,0,0,0.25)',
    cardBg:    dark ? 'rgba(255,255,255,0.04)'     : 'rgba(255,255,255,0.92)',
    cardBd:    dark ? 'rgba(255,255,255,0.08)'     : 'rgba(0,0,0,0.09)',
    inBg:      dark ? 'rgba(255,255,255,0.05)'     : 'rgba(0,0,0,0.04)',
    inBd:      dark ? 'rgba(255,255,255,0.1)'      : 'rgba(0,0,0,0.12)',
    divider:   dark ? 'rgba(255,255,255,0.07)'     : 'rgba(0,0,0,0.07)',
    shadow:    dark ? 'none'                       : '0 2px 20px rgba(0,0,0,0.07)',
    btnPrimary:dark ? 'white'                      : '#0a0a0a',
    btnText:   dark ? '#0a0a0a'                    : 'white',
    sidebarBg: dark ? 'rgba(255,255,255,0.02)'     : 'rgba(255,255,255,0.7)',
  };
}
