"use client";

import { CSSProperties, ReactNode } from "react";
import { useConsent } from "./ConsentContext";

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
  /** Custom render function for complete control */
  children?: (props: {
    onAccept: () => void;
    onReject: () => void;
    privacyUrl: string;
  }) => ReactNode;
}

const defaultStyles: Record<string, CSSProperties> = {
  banner: {
    position: "fixed",
    bottom: "1rem",
    left: "50%",
    transform: "translateX(-50%)",
    background: "white",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
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
    color: "#444444",
    margin: 0,
    lineHeight: 1.5,
  },
  link: {
    color: "#c15f00",
    textDecoration: "underline",
    fontWeight: 500,
  },
  buttonGroup: {
    display: "flex",
    gap: "0.75rem",
    flexShrink: 0,
  },
  button: {
    background: "#a85000",
    color: "white",
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

export function CookieBanner({
  message = "We use cookies to analyze site traffic and improve your experience.",
  privacyPolicyUrl = "/privacy",
  privacyPolicyText = "Privacy Policy",
  acceptText = "Accept",
  rejectText = "Reject",
  className,
  style,
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

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className={className}
      style={{ ...defaultStyles.banner, ...style }}
    >
      <div style={defaultStyles.content}>
        <p style={defaultStyles.text}>
          {message}{" "}
          <a
            href={privacyPolicyUrl}
            style={defaultStyles.link}
          >
            {privacyPolicyText}
          </a>
        </p>
        <div style={defaultStyles.buttonGroup}>
          <button
            style={defaultStyles.button}
            onClick={denyConsent}
            type="button"
          >
            {rejectText}
          </button>
          <button
            style={defaultStyles.button}
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
