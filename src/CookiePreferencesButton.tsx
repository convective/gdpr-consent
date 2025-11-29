"use client";

import { CSSProperties, ReactNode } from "react";
import { useConsent } from "./ConsentContext";

export interface CookiePreferencesButtonProps {
  /** Button text */
  text?: string;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: CSSProperties;
  /** Custom render function */
  children?: (props: { onClick: () => void }) => ReactNode;
}

export function CookiePreferencesButton({
  text = "Cookie Preferences",
  className,
  style,
  children,
}: CookiePreferencesButtonProps) {
  const { isEU, resetConsent } = useConsent();

  // Only show for EU users
  if (!isEU) return null;

  // Custom render
  if (children) {
    return <>{children({ onClick: resetConsent })}</>;
  }

  return (
    <button
      onClick={resetConsent}
      className={className}
      style={style}
      type="button"
    >
      {text}
    </button>
  );
}
