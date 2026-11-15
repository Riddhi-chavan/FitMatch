'use client';
import { create } from 'zustand';
import type { Profile } from '@/types';

type TryOnState = {
  topId: string | null;
  bottomId: string | null;
};

type Store = {
  profile: Profile | null;
  setProfile: (p: Profile) => void;
  clearProfile: () => void;
  tryOn: TryOnState;
  setTryOnTop: (id: string) => void;
  setTryOnBottom: (id: string) => void;
  clearTryOn: () => void;
};

export const useStore = create<Store>((set) => ({
  profile: null,
  setProfile: (p) => set({ profile: p }),
  clearProfile: () => set({ profile: null }),
  tryOn: { topId: null, bottomId: null },
  setTryOnTop: (id) => set((s) => ({ tryOn: { ...s.tryOn, topId: id } })),
  setTryOnBottom: (id) => set((s) => ({ tryOn: { ...s.tryOn, bottomId: id } })),
  clearTryOn: () => set({ tryOn: { topId: null, bottomId: null } }),
}));

