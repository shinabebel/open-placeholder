import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SettingsState = {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  width: string;
  setWidth: (width: string) => void;
  height: string;
  setHeight: (height: string) => void;
  text: string;
  setText: (text: string) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  font: string;
  setFont: (font: string) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      width: '512',
      setWidth: (value) => set({ width: value }),
      height: '512',
      setHeight: (value) => set({ height: value }),
      text: 'placeholder',
      setText: (value) => set({ text: value }),
      backgroundColor: 'black',
      setBackgroundColor: (value) => set({ backgroundColor: value }),
      textColor: 'white',
      setTextColor: (value) => set({ textColor: value }),
      font: 'IBM+Plex+Sans+JP:700',
      setFont: (value) => set({ font: value }),
      fontScale: 1,
      setFontScale: (value) => set({ fontScale: value }),
    }),
    {
      name: 'settings-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
