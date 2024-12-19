import { create } from 'zustand';

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

export const useKeywordStore = create<KeywordStore>((set) => ({
  keywords: [
    { id: '1', text: 'Suriname', active: true },
    { id: '2', text: 'Santokhi', active: true },
    { id: '3', text: 'Chan Santokhi', active: true },
  ],
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
}));