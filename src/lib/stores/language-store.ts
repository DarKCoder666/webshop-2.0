import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LanguageCode = 'ru' | 'en' | 'uz';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ru',
      setLanguage: (lang: LanguageCode) => set({ language: lang }),
    }),
    {
      name: 'webshop-language',
    }
  )
);

export const getCurrentLanguage = (): LanguageCode => {
  try {
    // Read from Zustand store state to keep SSR and initial client render consistent
    const state = useLanguageStore.getState();
    return state.language;
  } catch {
    return 'ru';
  }
};


