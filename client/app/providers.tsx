"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/global/stores/store";
import { refreshSession } from "@/global/api/refresh";
import { useAuthStore } from "@/global/stores/authStore";

function AuthBootstrap() {
  const status = useAuthStore((s) => s.status);
  useEffect(() => {
    // Restore the session from the httpOnly refresh cookie once per page load.
    if (status === "unknown") void refreshSession();
  }, [status]);
  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) storeRef.current = makeStore();
  return (
    <Provider store={storeRef.current}>
      <AuthBootstrap />
      {children}
    </Provider>
  );
}
