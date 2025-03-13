// lib/useOfflineAuth.ts
import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { cacheAuthSession } from "./auth";

export function useOfflineAuth() {
  const { userId, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && userId) {
      cacheAuthSession(userId);
    }
  }, [isLoaded, userId]);

  return { userId, isLoaded };
}