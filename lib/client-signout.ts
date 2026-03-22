'use client';

import { signOut } from "next-auth/react";

/**
 * Sign out the current user and invalidate all of their active sessions.
 */
export async function signOutEverywhere(callbackUrl = "/login") {
  try {
    await fetch("/api/auth/logout-all", { method: "POST" });
  } catch (error) {
    console.error("Failed to stop all sessions", error);
  } finally {
    await signOut({ callbackUrl });
  }
}
