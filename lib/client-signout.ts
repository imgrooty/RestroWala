'use client';

import { signOut } from "next-auth/react";

/**
 * Sign out the current user and invalidate all of their active sessions.
 */
export async function signOutAllSessions(callbackUrl = "/login") {
  try {
    const response = await fetch("/api/auth/logout-all", { method: "POST" });
    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Failed to stop all sessions", errorMessage);
    }
  } catch (error) {
    console.error("Failed to stop all sessions", error);
  } finally {
    await signOut({ callbackUrl });
  }
}
