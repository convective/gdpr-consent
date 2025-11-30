# @convective/gdpr-consent

GDPR-compliant geo-targeted cookie consent for Next.js applications.

## Features

- Geo-targeted consent (EU/EEA users only see banner)
- CloudFront header support (AWS Amplify, CloudFront)
- Equal Accept/Reject buttons (GDPR 2025 compliant)
- 12-month consent expiration with audit trail
- Privacy-first: defaults to EU treatment if location unknown
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
import { ConsentProvider } from "@convective/gdpr-consent";

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const countryCode = headersList.get("cloudfront-viewer-country");

  return (
    <html>
      <body>
        <ConsentProvider countryCode={countryCode}>
          {children}
        </ConsentProvider>
      </body>
    </html>
  );
}
```

### 2. Add the Cookie Banner

```tsx
// app/layout.tsx or a component
import { CookieBanner } from "@convective/gdpr-consent";

<CookieBanner privacyPolicyUrl="/privacy" />
```

### 3. Conditionally load analytics

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

### 4. Add Cookie Preferences button (footer)

```tsx
import { CookiePreferencesButton } from "@convective/gdpr-consent";

// Only shows for EU users
<CookiePreferencesButton className={styles.footerLink} />
```

## Configuration

### ConsentProvider options

```tsx
<ConsentProvider
  countryCode={countryCode}
  config={{
    // Custom EU country list
    euCountries: ["DE", "FR", "GB"],
    // localStorage key
    storageKey: "my_cookie_consent",
    // Expiry in months
    expiryMonths: 6,
  }}
>
```

### CookieBanner props

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

### Custom banner rendering

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

If the header is missing, it defaults to EU treatment (privacy-first).

## GDPR 2025 Compliance

- Prior consent required before loading analytics cookies
- Equal prominence Accept/Reject buttons
- Easy consent withdrawal (Cookie Preferences button)
- Consent logging with timestamp
- 12-month expiration (configurable)
- No dark patterns

## License

MIT
