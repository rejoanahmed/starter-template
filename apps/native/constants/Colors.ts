// @/constants/Colors.ts

// ---------- Types ----------
export type ThemeState = {
  hover: string;
  pressed: string;
  focus: string;
  disabledContent: string;
  disabledBg: string;
};

export type ThemeElevation = {
  e1: string;
  e2: string;
  e3: string;
};

export type ThemePalette = {
  // Core
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;

  // Surfaces
  surface: string;
  surface2?: string;
  surface3?: string;

  // Borders/Dividers
  border: string;
  borderStrong?: string;
  divider?: string;

  // Controls
  primaryButton?: string;
  inputBg?: string;

  // Semantics
  success?: string;
  warning?: string;
  error?: string;

  // Muted text
  muted?: string;
  mutedStrong?: string;

  // Skeletons
  skeletonBase?: string;
  skeletonHighlight?: string;

  // State & Elevation
  state?: ThemeState;
  elevation?: ThemeElevation;
};

// ---------- Helpers ----------
const withAlpha = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const ai = Math.round(Math.min(1, Math.max(0, a)) * 255);
  const aa = ai.toString(16).padStart(2, "0");
  return `#${full}${aa}`;
};

// ---------- Palettes ----------
export const Colors: Record<"light" | "dark", ThemePalette> = {
  light: {
    // Core
    text: "#11181C",
    background: "#FFFFFF",
    tint: "#0A7EA4",
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: "#0A7EA4",

    // Surfaces
    surface: "#F7F9FA",
    surface2: "#FFFFFF",
    surface3: "#FFFFFF",

    // Borders/Dividers
    border: "rgba(0,0,0,0.12)",
    borderStrong: "rgba(0,0,0,0.18)",
    divider: "rgba(0,0,0,0.12)",

    // Controls
    primaryButton: "#3F6D85", // from your reference image
    inputBg: "#FFFFFF",

    // Semantics
    success: "#1F9D55",
    warning: "#B7791F",
    error: "#DC2626",

    // Muted
    muted: "#5F6A6E",
    mutedStrong: "#3C464A",

    // Skeletons
    skeletonBase: "#E9EEF0",
    skeletonHighlight: "#F6F8F9",

    // States & Elevation
    state: {
      hover: withAlpha("#0A7EA4", 0.08),
      pressed: withAlpha("#0A7EA4", 0.14),
      focus: withAlpha("#0A7EA4", 0.24),
      disabledContent: "rgba(17,24,28,0.38)",
      disabledBg: "rgba(17,24,28,0.08)",
    },
    elevation: {
      e1: "rgba(0,0,0,0.06)",
      e2: "rgba(0,0,0,0.10)",
      e3: "rgba(0,0,0,0.14)",
    },
  },

  dark: {
    // Core (neutral “standard” dark)
    background: "#0D1117", // app scaffold
    text: "#E6EEF2",
    tint: "#95C6E2", // brand accent
    icon: "#A5ADB5",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#95C6E2",

    // Surfaces (layered elevation)
    surface: "#111827", // cards / lists
    surface2: "#15202B", // sheets / menus
    surface3: "#1F2937", // dialogs / toasts

    // Borders/Dividers
    border: "rgba(255,255,255,0.12)",
    borderStrong: "rgba(255,255,255,0.20)",
    divider: "rgba(255,255,255,0.12)",

    // Controls
    primaryButton: "#3F6D85", // keep same as light for identity
    inputBg: withAlpha("#FFFFFF", 0.06),

    // Semantics
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",

    // Muted
    muted: "#9AA3AD",
    mutedStrong: "#C5CDD4",

    // Skeletons
    skeletonBase: "#0F1419",
    skeletonHighlight: "#15202B",

    // States & Elevation
    state: {
      hover: "rgba(255,255,255,0.06)",
      pressed: "rgba(255,255,255,0.10)",
      focus: "rgba(149,198,226,0.28)",
      disabledContent: "rgba(230,238,242,0.38)",
      disabledBg: "rgba(230,238,242,0.10)",
    },
    elevation: {
      e1: withAlpha("#FFFFFF", 0.04),
      e2: withAlpha("#FFFFFF", 0.06),
      e3: withAlpha("#FFFFFF", 0.08),
    },
  },
} as const;

// Optional: default export for convenience
export default Colors;
