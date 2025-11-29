"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Default EU/EEA country codes (ISO 3166-1 alpha-2)
const DEFAULT_EU_COUNTRIES = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
  "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
  "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "IS", "LI", "NO", // EEA
  "GB", // UK GDPR
];

const DEFAULT_CONSENT_KEY = "gdpr_cookie_consent";
const DEFAULT_EXPIRY_MONTHS = 12;

interface ConsentData {
  consent: "accepted" | "rejected";
  timestamp: string;
  expires: string;
}

export interface ConsentContextType {
  /** Whether the user is in an EU/EEA country */
  isEU: boolean;
  /** Current consent status: pending, accepted, or rejected */
  consentStatus: "pending" | "accepted" | "rejected";
  /** Whether the consent state is still loading */
  isLoading: boolean;
  /** Grant consent for analytics cookies */
  grantConsent: () => void;
  /** Deny consent for analytics cookies */
  denyConsent: () => void;
  /** Reset consent (shows banner again for EU users) */
  resetConsent: () => void;
}

export interface ConsentConfig {
  /** List of country codes to treat as EU (default: EU/EEA + UK) */
  euCountries?: string[];
  /** localStorage key for storing consent (default: "gdpr_cookie_consent") */
  storageKey?: string;
  /** Months until consent expires (default: 12) */
  expiryMonths?: number;
  /** Default EU status when country code is unavailable (default: true for privacy-first) */
  defaultIsEU?: boolean;
}

export interface ConsentProviderProps {
  children: ReactNode;
  /** Country code from CloudFront header or other geo-detection */
  countryCode: string | null;
  /** Configuration options */
  config?: ConsentConfig;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

function isConsentExpired(data: ConsentData): boolean {
  return new Date(data.expires) < new Date();
}

function getStoredConsent(storageKey: string): ConsentData | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;

    const data: ConsentData = JSON.parse(stored);

    if (isConsentExpired(data)) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

function saveConsent(
  consent: "accepted" | "rejected",
  storageKey: string,
  expiryMonths: number
): void {
  const now = new Date();
  const expires = new Date();
  expires.setMonth(expires.getMonth() + expiryMonths);

  const data: ConsentData = {
    consent,
    timestamp: now.toISOString(),
    expires: expires.toISOString(),
  };

  localStorage.setItem(storageKey, JSON.stringify(data));
}

export function ConsentProvider({
  children,
  countryCode,
  config = {},
}: ConsentProviderProps) {
  const {
    euCountries = DEFAULT_EU_COUNTRIES,
    storageKey = DEFAULT_CONSENT_KEY,
    expiryMonths = DEFAULT_EXPIRY_MONTHS,
    defaultIsEU = true,
  } = config;

  const [consentStatus, setConsentStatus] = useState<
    "pending" | "accepted" | "rejected"
  >("pending");
  const [isLoading, setIsLoading] = useState(true);

  // Determine if user is in EU (uses defaultIsEU when country code unavailable)
  const isEU = countryCode
    ? euCountries.includes(countryCode.toUpperCase())
    : defaultIsEU;

  // Load stored consent on mount
  useEffect(() => {
    const stored = getStoredConsent(storageKey);
    if (stored) {
      setConsentStatus(stored.consent);
    }
    setIsLoading(false);
  }, [storageKey]);

  const grantConsent = () => {
    saveConsent("accepted", storageKey, expiryMonths);
    setConsentStatus("accepted");
  };

  const denyConsent = () => {
    saveConsent("rejected", storageKey, expiryMonths);
    setConsentStatus("rejected");
  };

  const resetConsent = () => {
    localStorage.removeItem(storageKey);
    setConsentStatus("pending");
  };

  return (
    <ConsentContext.Provider
      value={{
        isEU,
        consentStatus,
        isLoading,
        grantConsent,
        denyConsent,
        resetConsent,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent(): ConsentContextType {
  const context = useContext(ConsentContext);
  if (context === undefined) {
    throw new Error("useConsent must be used within a ConsentProvider");
  }
  return context;
}
