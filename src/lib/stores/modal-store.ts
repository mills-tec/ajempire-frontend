import { create } from "zustand";

export type ModalType =
  | "cart"
  | "checkout"
  | "authwrapper"
  | "signout-confirm"
  | null;
type ModalStore = {
  activeModal: ModalType;
  modalData?: any;

  openModal: (modal: ModalType, data?: any) => void;
  closeModal: () => void;
};

export const useModalStore = create<ModalStore>((set) => ({
  activeModal: null,
  modalData: null,

  openModal: (modal, data) =>
    set({
      activeModal: modal,
      modalData: data ?? null,
    }),

  closeModal: () =>
    set({
      activeModal: null,
      modalData: null,
    }),
}));