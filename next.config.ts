import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("next-pwa")({
  dest: "public", // Where service worker files will be generated
  disable: process.env.NODE_ENV === "development", // Disable PWA in dev mode
  register: true, // Automatically register the service worker
  skipWaiting: true, // Make the new service worker take control immediately
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);