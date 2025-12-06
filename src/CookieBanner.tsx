"use client";

import { CSSProperties, ReactNode } from "react";
import { useConsent } from "./ConsentContext";

export interface CookieBannerTheme {
  /** Banner container styles */
  banner?: {
    background?: string;
    shadow?: string;
  };
  /** Text styles */
  text?: {
    color?: string;
  };
  /** Privacy policy link styles */
  link?: {
    color?: string;
  };
  /** Button styles */
  button?: {
    background?: string;
    color?: string;
  };
}

export interface CookieBannerProps {
  /** Text shown in the banner */
  message?: string;
  /** Privacy policy URL */
  privacyPolicyUrl?: string;
  /** Privacy policy link text */
  privacyPolicyText?: string;
  /** Accept button text */
  acceptText?: string;
  /** Reject button text */
  rejectText?: string;
  /** Custom className for the banner container */
  className?: string;
  /** Custom styles for the banner container */
  style?: CSSProperties;
  /** Theme for customizing colors */
  theme?: CookieBannerTheme;
  /** Custom render function for complete control */
  children?: (props: {
    onAccept: () => void;
    onReject: () => void;
    privacyUrl: string;
  }) => ReactNode;
}

const defaultTheme: CookieBannerTheme = {
  banner: {
    background: "white",
    shadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  text: {
    color: "#444444",
  },
  link: {
    color: "#c15f00",
  },
  button: {
    background: "#a85000",
    color: "white",
  },
};

function mergeTheme(theme?: CookieBannerTheme): CookieBannerTheme {
  if (!theme) return defaultTheme;
  return {
    banner: { ...defaultTheme.banner, ...theme.banner },
    text: { ...defaultTheme.text, ...theme.text },
    link: { ...defaultTheme.link, ...theme.link },
    button: { ...defaultTheme.button, ...theme.button },
  };
}

function getStyles(theme: CookieBannerTheme): Record<string, CSSProperties> {
  return {
    banner: {
      position: "fixed",
      bottom: "1rem",
      left: "50%",
      transform: "translateX(-50%)",
      background: theme.banner?.background,
      boxShadow: theme.banner?.shadow,
      padding: "1rem 1.5rem",
      borderRadius: "8px",
      zIndex: 1000,
      maxWidth: "90%",
    },
    content: {
      display: "flex",
      alignItems: "center",
      gap: "1.5rem",
      flexWrap: "wrap",
    },
    text: {
      fontSize: "0.875rem",
      color: theme.text?.color,
      margin: 0,
      lineHeight: 1.5,
    },
    link: {
      color: theme.link?.color,
      textDecoration: "underline",
      fontWeight: 500,
    },
    buttonGroup: {
      display: "flex",
      gap: "0.75rem",
      flexShrink: 0,
    },
    button: {
      background: theme.button?.background,
      color: theme.button?.color,
      border: "none",
      padding: "0.5rem 1.25rem",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontFamily: "inherit",
      fontWeight: 600,
      whiteSpace: "nowrap",
      borderRadius: "4px",
    },
  };
}

export function CookieBanner({
  message = "We use cookies to analyze site traffic and improve your experience.",
  privacyPolicyUrl = "/privacy",
  privacyPolicyText = "Privacy Policy",
  acceptText = "Accept",
  rejectText = "Reject",
  className,
  style,
  theme,
  children,
}: CookieBannerProps) {
  const { isEU, consentStatus, isLoading, grantConsent, denyConsent } =
    useConsent();

  // Don't show while loading
  if (isLoading) return null;

  // Don't show for non-EU users
  if (!isEU) return null;

  // Don't show if user has already made a choice
  if (consentStatus !== "pending") return null;

  // Custom render
  if (children) {
    return (
      <>
        {children({
          onAccept: grantConsent,
          onReject: denyConsent,
          privacyUrl: privacyPolicyUrl,
        })}
      </>
    );
  }

  const mergedTheme = mergeTheme(theme);
  const styles = getStyles(mergedTheme);

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={className}
      style={{ ...styles.banner, ...style }}
    >
      <div style={styles.content}>
        <p style={styles.text}>
          {message}{" "}
          <a
            href={privacyPolicyUrl}
            style={styles.link}
          >
            {privacyPolicyText}
          </a>
        </p>
        <div style={styles.buttonGroup}>
          <button
            style={styles.button}
            onClick={denyConsent}
            type="button"
          >
            {rejectText}
          </button>
          <button
            style={styles.button}
            onClick={grantConsent}
            type="button"
          >
            {acceptText}
          </button>
        </div>
      </div>
    </div>
  );
}
