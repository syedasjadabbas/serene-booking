import { create } from "zustand";
import type { Customer } from "@/global/api/types";

type AuthStatus = "unknown" | "authenticated" | "guest";

interface AuthState {
  status: AuthStatus;
  accessToken: string | null; // memory only, never persisted
  customer: Customer | null;
  signedOutReason: string | null;
  setSession: (accessToken: string, customer?: Customer | null) => void;
  setCustomer: (customer: Customer) => void;
  clear: (reason?: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "unknown",
  accessToken: null,
  customer: null,
  signedOutReason: null,
  setSession: (accessToken, customer) =>
    set((s) => ({ status: "authenticated", accessToken, customer: customer ?? s.customer, signedOutReason: null })),
  setCustomer: (customer) => set({ customer }),
  clear: (reason = null) => set({ status: "guest", accessToken: null, customer: null, signedOutReason: reason }),
}));
