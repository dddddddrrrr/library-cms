import { create } from "zustand";

interface LoginModalState {
  isOpen: boolean;
  onOpen: (isOpen: boolean) => void;
  onClose: (isOpen: boolean) => void;
}

export const useLoginModal = create<LoginModalState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
