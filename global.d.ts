// global.d.ts
export {};

declare global {
  interface Window {
    refreshClientModelPage?: () => void;
    refreshEtatLivraisonPage?: () => void;
  }
}