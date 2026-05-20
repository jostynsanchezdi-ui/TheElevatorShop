import { create } from "zustand";

interface CategoryFilterState {
  selected: string;
  setSelected: (id: string) => void;
}

export const useCategoryFilter = create<CategoryFilterState>((set) => ({
  selected: "all",
  setSelected: (id) => set({ selected: id }),
}));
