import { API_BASE, EP } from "@/global/constants/api";
import { useAuthStore } from "@/global/stores/authStore";
import type { ApiEnvelope, AuthPayload } from "@/global/api/types";

// One in-flight refresh at a time, shared by the app bootstrap and baseApi's 401 handler.
// The refresh token lives in an httpOnly cookie; the server rotates it on every call.
let inflight: Promise<boolean> | null = null;

export function refreshSession(): Promise<boolean> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch(`${API_BASE}${EP.auth.refresh}`, { method: "POST", credentials: "include" });
      const body = (await res.json().catch(() => null)) as ApiEnvelope<AuthPayload> | null;
      if (res.ok && body?.success) {
        useAuthStore.getState().setSession(body.data.accessToken, body.data.customer);
        return true;
      }
      const wasSignedIn = useAuthStore.getState().status === "authenticated";
      useAuthStore.getState().clear(wasSignedIn ? body?.message ?? "Please sign in again." : null);
      return false;
    } catch {
      useAuthStore.getState().clear(null);
      return false;
    } finally {
      // Let late callers in the same tick reuse the result, then allow a new refresh.
      setTimeout(() => (inflight = null), 0);
    }
  })();
  return inflight;
}
