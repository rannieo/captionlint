"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export function SignOutEffect() {
  useEffect(() => {
    authClient.signOut().catch(() => {});
  }, []);
  return null;
}
