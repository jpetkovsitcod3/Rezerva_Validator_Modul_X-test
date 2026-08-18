import { theme } from "antd";

/**
 * EmailValidator Pro — Custom Dark Theme
 * Built on Ant Design 5 darkAlgorithm with custom tokens
 */

export const darkThemeConfig = {
  algorithm: theme.darkAlgorithm,

  token: {
    colorPrimary: "#6366f1",
    colorSuccess: "#10b981",
    colorWarning: "#f59e0b",
    colorError: "#ef4444",
    colorInfo: "#3b82f6",
    colorLink: "#818cf8",

    colorBgBase: "#0a0a0f",
    colorBgContainer: "#13131a",
    colorBgElevated: "#1a1a2e",
    colorBgLayout: "#0a0a0f",
    colorBgSpotlight: "#16213e",
    colorBgMask: "rgba(0, 0, 0, 0.75)",

    colorTextBase: "#e2e8f0",
    colorText: "#e2e8f0",
    colorTextSecondary: "#94a3b8",
    colorTextTertiary: "#64748b",
    colorTextQuaternary: "#475569",
    colorTextDisabled: "#334155",
    colorTextHeading: "#f1f5f9",
    colorTextLabel: "#94a3b8",

    colorBorder: "#2a2a3a",
    colorBorderSecondary: "#1e1e2e",
    colorSplit: "#1e1e2e",

    colorFillAlter: "rgba(99, 102, 241, 0.06)",
    colorFillContent: "rgba(255, 255, 255, 0.04)",
    colorFillSecondary: "rgba(255, 255, 255, 0.06)",
    colorFillTertiary: "rgba(255, 255, 255, 0.03)",

    fontFamily: "'Inter', 'JetBrains Mono', -apple-system, BlinkMacSystemFont, sans-serif",
    fontFamilyCode: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeLG: 16,
    fontSizeSM: 12,
    fontSizeXL: 20,
    lineHeight: 1.6,
    lineHeightHeading1: 1.2,

    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 8,
    borderRadiusXS: 4,
    borderRadiusOuter: 20,

    boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.5)",
    boxShadowSecondary: "0 4px 16px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)",

    motionDurationFast: "0.15s",
    motionDurationMid: "0.25s",
    motionDurationSlow: "0.40s",
    motionEaseInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
    motionEaseOut: "cubic-bezier(0, 0, 0.2, 1)",
    motionEaseIn: "cubic-bezier(0.4, 0, 1, 1)",
    motionEaseOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",

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

    controlHeight: 40,
    controlHeightLG: 48,
    controlHeightSM: 32,
    lineWidth: 1,
    lineType: "solid",

    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },

  components: {
    Layout: {
      headerBg: "#0d0d17",
      siderBg: "#0d0d17",
      bodyBg: "#0a0a0f",
      footerBg: "#0d0d17",
      triggerBg: "#1a1a2e",
    },
    Card: {
      colorBgContainer: "#13131a",
      colorBorderSecondary: "#2a2a3a",
      paddingLG: 24,
      borderRadiusLG: 16,
      boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.05)",
    },
    Button: {
      colorPrimary: "#6366f1",
      colorPrimaryHover: "#818cf8",
      colorPrimaryActive: "#4f46e5",
      borderRadius: 10,
      controlHeight: 44,
      controlHeightLG: 52,
      fontWeight: 600,
      primaryShadow: "0 0 20px rgba(99,102,241,0.4), 0 4px 14px rgba(99,102,241,0.3)",
    },
    Input: {
      colorBgContainer: "#1a1a2e",
      colorBorder: "#2a2a3a",
      colorBorderHover: "#6366f1",
      activeBorderColor: "#6366f1",
      activeShadow: "0 0 0 3px rgba(99,102,241,0.2)",
      borderRadius: 10,
      controlHeight: 48,
      fontSize: 15,
      colorTextPlaceholder: "#475569",
      paddingInline: 16,
    },
    Table: {
      colorBgContainer: "#13131a",
      headerBg: "#1a1a2e",
      rowHoverBg: "rgba(99,102,241,0.06)",
      borderColor: "#2a2a3a",
      headerSplitColor: "#2a2a3a",
    },
    Tag: { borderRadius: 6, fontSizeSM: 11 },
    Progress: { colorSuccess: "#10b981" },
    Tabs: {
      colorBorderSecondary: "#2a2a3a",
      itemColor: "#64748b",
      itemHoverColor: "#94a3b8",
      itemSelectedColor: "#6366f1",
      inkBarColor: "#6366f1",
    },
    Statistic: {
      colorTextHeading: "#e2e8f0",
      colorTextDescription: "#64748b",
    },
    Tooltip: { colorBgSpotlight: "#1e1e3a", colorTextLightSolid: "#e2e8f0" },
    Select: {
      colorBgContainer: "#1a1a2e",
      colorBorder: "#2a2a3a",
      colorBorderHover: "#6366f1",
      optionActiveBg: "rgba(99,102,241,0.1)",
      optionSelectedBg: "rgba(99,102,241,0.15)",
    },
    Timeline: { colorBgContainer: "transparent" },
    Upload: { colorBorder: "#2a2a3a", colorBgContainer: "#1a1a2e" },
    Notification: { colorBgElevated: "#1a1a2e", colorBorder: "#2a2a3a" },
    Message: { colorBgElevated: "#1a1a2e" },
    Spin: { colorPrimary: "#6366f1" },
    Alert: {
      colorInfoBg: "rgba(59,130,246,0.08)",
      colorInfoBorder: "rgba(59,130,246,0.2)",
      colorSuccessBg: "rgba(16,185,129,0.08)",
      colorSuccessBorder: "rgba(16,185,129,0.2)",
      colorWarningBg: "rgba(245,158,11,0.08)",
      colorWarningBorder: "rgba(245,158,11,0.2)",
      colorErrorBg: "rgba(239,68,68,0.08)",
      colorErrorBorder: "rgba(239,68,68,0.2)",
    },
  },
};

// Status color map used across components
export const STATUS_COLORS = {
  valid: { bg: "#10b98115", border: "#10b981", text: "#34d399", glow: "#10b981" },
  invalid: { bg: "#ef444415", border: "#ef4444", text: "#f87171", glow: "#ef4444" },
  risky: { bg: "#f59e0b15", border: "#f59e0b", text: "#fbbf24", glow: "#f59e0b" },
  unknown: { bg: "#64748b15", border: "#64748b", text: "#94a3b8", glow: "#64748b" },
};

export const STATUS_ICONS = {
  valid: "✅",
  invalid: "❌",
  risky: "⚠️",
  unknown: "❓",
};
