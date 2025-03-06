import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public", // Where service worker files are generated
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  register: true, // Auto-register the service worker
  skipWaiting: true, // Activate new service worker immediately
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);