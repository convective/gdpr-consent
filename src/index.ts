// Context and hooks
export {
  ConsentProvider,
  useConsent,
  type ConsentContextType,
  type ConsentConfig,
  type ConsentProviderProps,
} from "./ConsentContext";

// Components
export { CookieBanner, type CookieBannerProps } from "./CookieBanner";
export {
  CookiePreferencesButton,
  type CookiePreferencesButtonProps,
} from "./CookiePreferencesButton";

// Utility: Check if analytics should load
export function shouldLoadAnalytics(
  isEU: boolean,
  consentStatus: "pending" | "accepted" | "rejected"
): boolean {
  return !isEU || consentStatus === "accepted";
}

// Default EU countries list for reference
export const EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO", // EEA
  "GB", // UK GDPR
] as const;
