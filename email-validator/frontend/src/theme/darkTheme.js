import { theme } from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  QuestionCircleFilled,
} from "@ant-design/icons";

/**
 * EmailValidator Pro — dark theme, single token source.
 *
 * Identity: quiet blue-charcoal neutrals + ONE electric-indigo accent.
 * Every value in this file derives from the palette below; the :root block
 * in src/styles/global.css mirrors the same values (keep the two in sync).
 *
 * Contrast (WCAG-AA):
 *   text  #e6e9f0 on bg/surface  ≈ 16:1 / 7.2:1
 *   muted #9aa3b8 on surface     ≈ 7.2:1
 *   faint #5c6577 on bg          ≈ 3.3:1  (secondary/UI text only)
 *   primary button ink #0b0e14 on #7c86ff ≈ 6.4:1
 */

// ─────────────────────────────────────────────────────────────
// 1. Palette — single source of truth
// ─────────────────────────────────────────────────────────────

// Neutral stack (blue-grey, lifted off pure black)
const BG = "#0b0e14";        // app background
const CHROME = "#0e1219";    // header / sider / footer chrome
const SURFACE = "#12161f";   // cards, tables
const ELEVATED = "#181d2a";  // inputs, table headers, segmented tracks
const SPOTLIGHT = "#1e2433"; // popovers, tooltips, notifications
const BORDER = "#242b3d";    // default 1px borders
const BORDER_HOVER = "#333c52";
const DIVIDER = "#1b2133";   // hairlines, row splits

// Ink stack
const TEXT = "#e6e9f0";
const HEADING = "#f2f5fb";
const MUTED = "#9aa3b8";     // ≥3:1 everywhere — safe secondary text
const FAINT = "#5c6577";     // ≥3:1 on bg — labels, placeholders, captions
const QUATERNARY = "#3e4759"; // decorative marks
const DISABLED = "#2f3849";   // disabled ink / scrollbars
const INK_ON_PRIMARY = "#0b0e14"; // readable ink for solid primary buttons

// Brand: ONE electric indigo — all violet/cyan duplicates removed
const PRIMARY = "#7c86ff";
const PRIMARY_TEXT = "#b3baff"; // bright variant for text/link/chart use
const PRIMARY_RGB = "124, 134, 255";
const PRIMARY_SOFT = `rgba(${PRIMARY_RGB}, 0.10)`;   // washes, row hover
const PRIMARY_FAINTER = `rgba(${PRIMARY_RGB}, 0.05)`; // table row hover
const PRIMARY_TINT = `rgba(${PRIMARY_RGB}, 0.14)`;   // selected menu item
const PRIMARY_LINE = `rgba(${PRIMARY_RGB}, 0.28)`;   // focus rings, hairlines
const PRIMARY_EDGE = `rgba(${PRIMARY_RGB}, 0.50)`;   // hover borders

// Semantic status (green / amber / red kept; tuned for dark surfaces)
const SUCCESS = "#34d399";
const WARNING = "#fbbf24";
const ERROR = "#f87171";
const INFO = "#38bdf8";

// Subdued glow variants — STATUS_COLORS.glow values are 6-digit hex on
// purpose: consumers append an alpha suffix (e.g. `${glow}15`).
const SUCCESS_GLOW = "#256f5c";
const ERROR_GLOW = "#7d434a";
const WARNING_GLOW = "#7e6627";
const UNKNOWN = "#5c6577";

// Motion (mirrors src/motion/tokens.js + :root in global.css)
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";     // enter (out-quint)
const EASE_IN = "cubic-bezier(0.4, 0, 1, 1)";          // exit
const EASE_IN_OUT = "cubic-bezier(0.645, 0.045, 0.355, 1)";
const EASE_OUT_BACK = "cubic-bezier(0.34, 1.4, 0.64, 1)";

// Shadows (quiet — no outer glows on chrome)
const SHADOW_SM = "0 1px 2px rgba(4, 8, 18, 0.4)";
const SHADOW_MD = "0 6px 20px rgba(4, 8, 18, 0.45)";

// Fonts — system stacks only (no CDN font imports; falls back cleanly)
const FONT_BODY = "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif";
const FONT_MONO = "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Courier New', monospace";

// ─────────────────────────────────────────────────────────────
// 2. Derived maps
// ─────────────────────────────────────────────────────────────

/** Flat brand/status reference used by ad-hoc inline styles. */
export const THEME = {
  // Brand
  accent: PRIMARY,
  accentHover: PRIMARY_EDGE,
  accentActive: PRIMARY_LINE,
  accentGlow: PRIMARY_LINE,
  accentSoft: PRIMARY_SOFT,
  accentLine: PRIMARY_LINE,

  // Neutrals
  bgBase: BG,
  bgLayout: BG,
  bgContainer: SURFACE,
  bgElevated: ELEVATED,
  bgSpotlight: SPOTLIGHT,
  chrome: CHROME,

  text: TEXT,
  textSecondary: MUTED,
  textTertiary: FAINT,
  textHeading: HEADING,

  border: BORDER,
  borderSecondary: DIVIDER,

  // Functional
  success: SUCCESS,
  warning: WARNING,
  error: ERROR,
  info: INFO,
};

/**
 * Status palette for charts / stat cards.
 * `warning` + `error` kept for dashboard pass-rate encodings.
 */
export const STATUS_HEX = {
  valid: SUCCESS,
  invalid: ERROR,
  risky: WARNING,
  unknown: UNKNOWN,
  warning: WARNING,
  error: ERROR,
};

/**
 * Status skin map (bg/border/text/glow) consumed by ResultCard et al.
 * `glow` stays 6-digit hex: callers append alpha suffixes to it.
 */
export const STATUS_COLORS = {
  valid: {
    bg: "rgba(52, 211, 153, 0.08)",
    border: SUCCESS,
    text: SUCCESS,
    glow: SUCCESS_GLOW,
  },
  invalid: {
    bg: "rgba(248, 113, 113, 0.08)",
    border: ERROR,
    text: ERROR,
    glow: ERROR_GLOW,
  },
  risky: {
    bg: "rgba(251, 191, 36, 0.08)",
    border: WARNING,
    text: WARNING,
    glow: WARNING_GLOW,
  },
  unknown: {
    bg: "rgba(92, 101, 119, 0.10)",
    border: UNKNOWN,
    text: MUTED,
    glow: UNKNOWN,
  },
};

/**
 * Status icons — antd icon COMPONENTS (render as <Icon />; no emoji).
 * Exporting components instead of emoji keeps them colorable via props.
 */
export const STATUS_ICONS = {
  valid: CheckCircleFilled,
  invalid: CloseCircleFilled,
  risky: WarningFilled,
  unknown: QuestionCircleFilled,
};

/** Recharts palette + motion tokens. */
export const CHART = {
  isAnimationActive: true,
  animationDuration: 700,
  animationEasing: "ease-out",
  grid: DIVIDER,
  axis: BORDER_HOVER,
  tick: FAINT,
  // bright accent for line/area strokes; `cyan` kept for back-compat
  cyan: PRIMARY_TEXT,
  primary: PRIMARY_TEXT,
};

// ─────────────────────────────────────────────────────────────
// 3. antd v5 ConfigProvider theme (verified token set only)
// ─────────────────────────────────────────────────────────────

export const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,

  token: {
    // Brand / semantic seeds
    colorPrimary: PRIMARY,
    colorSuccess: SUCCESS,
    colorWarning: WARNING,
    colorError: ERROR,
    colorInfo: INFO,
    colorLink: PRIMARY_TEXT,

    // Backgrounds
    colorBgBase: BG,
    colorBgContainer: SURFACE,
    colorBgElevated: ELEVATED,
    colorBgLayout: "transparent", // lets the quiet body gradient show through
    colorBgSpotlight: SPOTLIGHT,
    colorBgMask: "rgba(4, 7, 14, 0.72)",

    // Ink
    colorTextBase: TEXT,
    colorText: TEXT,
    colorTextSecondary: MUTED,
    colorTextTertiary: FAINT,
    colorTextQuaternary: QUATERNARY,
    colorTextDisabled: DISABLED,
    colorTextHeading: HEADING,
    colorTextLabel: MUTED,

    // Borders & fills
    colorBorder: BORDER,
    colorBorderSecondary: DIVIDER,
    colorSplit: DIVIDER,
    colorFillAlter: "rgba(255, 255, 255, 0.04)",
    colorFillContent: "rgba(255, 255, 255, 0.08)",
    colorFillSecondary: "rgba(255, 255, 255, 0.06)",
    colorFillTertiary: "rgba(255, 255, 255, 0.03)",

    // Type
    fontFamily: FONT_BODY,
    fontFamilyCode: FONT_MONO,
    fontSize: 14,
    fontSizeHeading1: 36,
    fontSizeHeading2: 28,
    fontSizeHeading3: 22,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    lineHeight: 1.6,

    // Geometry
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    borderRadiusOuter: 20,
    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    lineWidth: 1,
    lineType: "solid",

    // Elevation (quiet, no glows)
    boxShadow: SHADOW_SM,
    boxShadowSecondary: SHADOW_MD,

    // Motion — mirrors src/motion/tokens.js + global.css
    motionDurationFast: "0.15s",
    motionDurationMid: "0.25s",
    motionDurationSlow: "0.4s",
    motionEaseInOut: EASE_IN_OUT,
    motionEaseOut: EASE_OUT,
    motionEaseIn: EASE_IN,
    motionEaseOutBack: EASE_OUT_BACK,

    // Rhythm
    padding: 16,
    paddingLG: 24,
    paddingXL: 32,
    paddingSM: 12,
    paddingXS: 8,
    margin: 16,
    marginLG: 24,
    marginXL: 32,
    marginSM: 12,
    marginXS: 8,

    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },

  components: {
    Layout: {
      headerBg: CHROME,
      siderBg: CHROME,
      bodyBg: "transparent",
      footerBg: CHROME,
      triggerBg: ELEVATED,
      triggerColor: MUTED,
      headerColor: MUTED,
    },

    // Sidebar identity moved to tokens — replaces the old !important overrides
    Menu: {
      itemBorderRadius: 8,
      itemColor: MUTED,
      itemHoverColor: TEXT,
      itemHoverBg: `rgba(${PRIMARY_RGB}, 0.06)`,
      itemSelectedColor: PRIMARY_TEXT,
      itemSelectedBg: PRIMARY_TINT,
      itemActiveBg: PRIMARY_LINE,
      itemMarginInline: 8,
      groupTitleColor: FAINT,
    },

    Card: {
      colorBgContainer: SURFACE,
      colorBorderSecondary: BORDER,
      paddingLG: 24,
      borderRadiusLG: 14,
      boxShadow: SHADOW_SM,
    },

    Button: {
      colorPrimary: PRIMARY,
      primaryColor: INK_ON_PRIMARY, // dark ink on electric indigo ≈ 6.4:1
      primaryShadow: `0 4px 14px rgba(${PRIMARY_RGB}, 0.25)`,
      fontWeight: 600,
      borderRadius: 10,
      controlHeight: 44,
      controlHeightLG: 52,
    },

    Input: {
      colorBgContainer: ELEVATED,
      colorBorder: BORDER,
      hoverBorderColor: PRIMARY_EDGE,
      activeBorderColor: PRIMARY,
      activeShadow: `0 0 0 3px rgba(${PRIMARY_RGB}, 0.18)`,
      colorTextPlaceholder: FAINT,
      borderRadius: 10,
      controlHeight: 48,
      fontSize: 15,
      paddingInline: 16,
    },

    Select: {
      colorBgContainer: ELEVATED,
      colorBorder: BORDER,
      hoverBorderColor: PRIMARY_EDGE,
      optionActiveBg: PRIMARY_SOFT,
      optionSelectedBg: PRIMARY_TINT,
    },

    Table: {
      colorBgContainer: SURFACE,
      headerBg: ELEVATED,
      headerColor: FAINT,
      rowHoverBg: PRIMARY_FAINTER,
      borderColor: DIVIDER,
      headerSplitColor: DIVIDER,
    },

    Tag: { borderRadius: 6, fontSizeSM: 11 },

    Progress: { colorSuccess: SUCCESS, colorPrimary: PRIMARY },

    Tabs: {
      colorBorderSecondary: DIVIDER,
      itemColor: FAINT,
      itemHoverColor: TEXT,
      itemSelectedColor: PRIMARY_TEXT,
      inkBarColor: PRIMARY,
    },

    Statistic: {
      colorTextHeading: HEADING,
      colorTextDescription: FAINT,
    },

    Tooltip: { colorBgSpotlight: SPOTLIGHT, colorTextLightSolid: TEXT },

    Timeline: { colorBgContainer: "transparent" },

    Upload: {
      colorBorder: BORDER,
      colorBgContainer: "transparent",
    },

    Notification: { colorBgElevated: SPOTLIGHT, colorBorder: BORDER },
    Message: { colorBgElevated: SPOTLIGHT },
    Spin: { colorPrimary: PRIMARY },

    Alert: {
      colorInfoBg: "rgba(56, 189, 248, 0.08)",
      colorInfoBorder: "rgba(56, 189, 248, 0.18)",
      colorSuccessBg: "rgba(52, 211, 153, 0.08)",
      colorSuccessBorder: "rgba(52, 211, 153, 0.18)",
      colorWarningBg: "rgba(251, 191, 36, 0.08)",
      colorWarningBorder: "rgba(251, 191, 36, 0.18)",
      colorErrorBg: "rgba(248, 113, 113, 0.08)",
      colorErrorBorder: "rgba(248, 113, 113, 0.18)",
    },

    Segmented: {
      trackBg: SURFACE,
      itemSelectedBg: PRIMARY_TINT,
      itemSelectedColor: PRIMARY_TEXT,
    },
  },
};
