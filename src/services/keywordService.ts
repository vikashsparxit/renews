import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Keyword {
  id: string;
  text: string;
  active: boolean;
}

interface KeywordStore {
  keywords: Keyword[];
  addKeyword: (text: string) => void;
  removeKeyword: (id: string) => void;
  toggleKeyword: (id: string) => void;
}

export const useKeywordStore = create<KeywordStore>()(
  persist(
    (set) => ({
      keywords: [],
      addKeyword: (text) =>
        set((state) => ({
          keywords: [...state.keywords, { id: Date.now().toString(), text, active: true }],
        })),
      removeKeyword: (id) =>
        set((state) => ({
          keywords: state.keywords.filter((k) => k.id !== id),
        })),
      toggleKeyword: (id) =>
        set((state) => ({
          keywords: state.keywords.map((k) =>
            k.id === id ? { ...k, active: !k.active } : k
          ),
        })),
    }),
    {
      name: 'keyword-storage',
    }
  )
);