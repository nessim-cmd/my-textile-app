// lib/auth.ts
export function cacheAuthSession(userId: string | null) {
    if (userId) {
      localStorage.setItem("clerkUserId", userId);
    }
  }
  
  export function getCachedAuth() {
    return localStorage.getItem("clerkUserId");
  }