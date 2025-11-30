# @convective/gdpr-consent

GDPR-compliant geo-targeted cookie consent for Next.js applications.

[![npm version](https://img.shields.io/npm/v/@convective/gdpr-consent.svg)](https://www.npmjs.com/package/@convective/gdpr-consent)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- Geo-targeted consent (EU/EEA users only see banner)
- CloudFront header support (AWS Amplify, CloudFront)
- Equal Accept/Reject buttons (GDPR 2025 compliant)
- 12-month consent expiration with audit trail
- Privacy-first: configurable default when location unknown
- Fully customizable styling and text
- TypeScript support

## Installation

```bash
npm install @convective/gdpr-consent
```

## Quick Start

### 1. Wrap your app with ConsentProvider

```tsx
// app/layout.tsx
import { headers } from "next/headers";
import { ConsentProvider, CookieBanner } from "@convective/gdpr-consent";

export default async function RootLayout({ children }) {
  const headersList = await headers();

  // Support env var override for testing, fallback to CloudFront header
  const countryCode = process.env.NEXT_PUBLIC_TEST_COUNTRY
    || headersList.get("cloudfront-viewer-country");

  return (
    <html>
      <body>
        <ConsentProvider
          countryCode={countryCode}
          config={{ defaultIsEU: process.env.NODE_ENV === "production" }}
        >
          <CookieBanner privacyPolicyUrl="/privacy" />
          {children}
        </ConsentProvider>
      </body>
    </html>
  );
}
```

### 2. Conditionally load analytics

```tsx
"use client";

import Script from "next/script";
import { useConsent, shouldLoadAnalytics } from "@convective/gdpr-consent";

export function GoogleAnalytics() {
  const { isEU, consentStatus, isLoading } = useConsent();

  if (isLoading) return null;
  if (!shouldLoadAnalytics(isEU, consentStatus)) return null;

  return (
    <Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX" />
  );
}
```

### 3. Add Cookie Preferences button (footer)

```tsx
import { CookiePreferencesButton } from "@convective/gdpr-consent";

// Only shows for EU users
<CookiePreferencesButton className={styles.footerLink} />
```

## Configuration

### ConsentProvider Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `countryCode` | `string \| null` | Yes | ISO 3166-1 alpha-2 country code |
| `config` | `ConsentConfig` | No | Configuration options |

### ConsentConfig Options

```tsx
<ConsentProvider
  countryCode={countryCode}
  config={{
    // List of country codes requiring consent (default: EU/EEA + UK)
    euCountries: ["DE", "FR", "GB", ...],

    // localStorage key (default: "gdpr_cookie_consent")
    storageKey: "my_cookie_consent",

    // Consent expiry in months (default: 12)
    expiryMonths: 6,

    // Default EU status when country code unavailable (default: true)
    // Set to false in development to hide banner during local testing
    defaultIsEU: process.env.NODE_ENV === "production",
  }}
>
```

### CookieBanner Props

| Prop | Type | Default |
|------|------|---------|
| `message` | string | "We use cookies to analyze..." |
| `privacyPolicyUrl` | string | "/privacy" |
| `privacyPolicyText` | string | "Privacy Policy" |
| `acceptText` | string | "Accept" |
| `rejectText` | string | "Reject" |
| `className` | string | - |
| `style` | CSSProperties | - |
| `children` | render function | - |

### Custom Banner Rendering

```tsx
<CookieBanner>
  {({ onAccept, onReject, privacyUrl }) => (
    <div className="my-custom-banner">
      <p>Custom message <a href={privacyUrl}>Privacy</a></p>
      <button onClick={onReject}>No thanks</button>
      <button onClick={onAccept}>OK</button>
    </div>
  )}
</CookieBanner>
```

## useConsent Hook

```tsx
const {
  isEU,           // boolean - is user in EU/EEA
  consentStatus,  // "pending" | "accepted" | "rejected"
  isLoading,      // boolean - still loading from localStorage
  grantConsent,   // () => void - accept cookies
  denyConsent,    // () => void - reject cookies
  resetConsent,   // () => void - show banner again
} = useConsent();
```

## Geo-detection

This package reads the `cloudfront-viewer-country` header, available in:
- AWS Amplify (since August 2024)
- CloudFront distributions with geo headers enabled

### Behavior by Environment

| Environment | Country Code | defaultIsEU | Banner Shown |
|-------------|--------------|-------------|--------------|
| Development | Not available | `false` | No |
| Development | `DE` (via env var) | `false` | Yes |
| Production | `US` (CloudFront) | `true` | No |
| Production | `DE` (CloudFront) | `true` | Yes |
| Production | Not available | `true` | Yes (privacy-first) |

## Local Development Testing

To test the EU cookie banner in local development, add to `.env.local`:

```bash
# Simulate EU location for testing
NEXT_PUBLIC_TEST_COUNTRY=DE
```

Restart the dev server after changing. Remove or set to `US` to hide the banner.

## GDPR 2025 Compliance

- Prior consent required before loading analytics cookies
- Equal prominence Accept/Reject buttons
- Easy consent withdrawal (Cookie Preferences button)
- Consent logging with timestamp
- 12-month expiration (configurable)
- No dark patterns

## License

MIT
