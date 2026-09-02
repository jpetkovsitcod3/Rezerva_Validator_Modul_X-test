import { theme } from "antd";
import type { ThemeConfig } from "antd";

const { darkAlgorithm } = theme;

/**
 * ColorHunt Navy-Blue Dark Theme for Ant Design v6
 *
 * Seed Tokens map to ColorHunt palette:
 *   #021526 (Deep Navy)   → backgrounds
 *   #03346e (Royal Blue)  → surfaces, secondary
 *   #6eacda (Light Blue)  → primary accent
 *   #e2e2b6 (Cream)       → text
 *
 * Motion tokens follow Ant Design spec:
 *   Natural (ease-out), Performant (fast exit), Concise (minimal)
 */

export const colorHuntDarkTheme: ThemeConfig = {
  algorithm: darkAlgorithm,

  token: {
    /* ── Seed Tokens ── */
    colorPrimary: "#6eacda",
    colorSuccess: "#5cb85c",
    colorWarning: "#e2e2b6",
    colorError: "#e74c3c",
    colorInfo: "#6eacda",

    colorBgBase: "#021526",
    colorTextBase: "#e2e2b6",

    fontFamily:
      "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyCode:
      "'JetBrains Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",

    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,

    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    borderRadiusXS: 4,

    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,

    lineWidth: 1,
    lineType: "solid",

    motion: true,
    motionBase: 0,
    motionUnit: 0.1,

    /* Ant Design motion curves — Natural, Performant, Concise */
    motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
    motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
    motionEaseOutBack: "cubic-bezier(0.12, 0.4, 0.29, 1.46)",
    motionEaseOutCirc: "cubic-bezier(0.08, 0.82, 0.17, 1)",
    motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
    motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
    motionEaseInBack: "cubic-bezier(0.71, -0.46, 0.88, 0.6)",
    motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)",

    wireframe: false,
    zIndexBase: 0,
    zIndexPopupBase: 1000,
  },

  components: {
    Button: {
      /* Liquid Glass refraction on primary buttons */
      primaryShadow: "0 2px 8px rgba(110, 172, 218, 0.25)",
      defaultShadow: "0 1px 4px rgba(0, 0, 0, 0.15)",
      contentFontSize: 14,
      contentFontSizeLG: 16,
      contentFontSizeSM: 13,
      paddingInline: 16,
      paddingInlineLG: 20,
      paddingInlineSM: 12,
    },

    Card: {
      colorBgContainer: "#0a1f3a",
      colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
      paddingLG: 24,
      borderRadiusLG: 12,
      headerFontSize: 16,
    },

    Input: {
      colorBgContainer: "#0d2847",
      colorBorder: "rgba(255, 255, 255, 0.12)",
      colorBorderHover: "rgba(110, 172, 218, 0.4)",
      colorBorderFocused: "#6eacda",
      activeShadow: "0 0 0 2px rgba(110, 172, 218, 0.15)",
    },

    Select: {
      colorBgContainer: "#0d2847",
      colorBorder: "rgba(255, 255, 255, 0.12)",
      colorBorderHover: "rgba(110, 172, 218, 0.4)",
      optionSelectedBg: "rgba(110, 172, 218, 0.15)",
    },

    Table: {
      colorBgContainer: "#0a1f3a",
      headerBg: "#0d2847",
      headerColor: "#a8b8c8",
      headerSortActiveBg: "#0f2d4a",
      headerSortHoverBg: "#0f2d4a",
      rowHoverBg: "rgba(110, 172, 218, 0.06)",
      colorBorderSecondary: "rgba(255, 255, 255, 0.06)",
      borderColor: "rgba(255, 255, 255, 0.08)",
    },

    Modal: {
      contentBg: "#0a1f3a",
      headerBg: "#0a1f3a",
      titleColor: "#e2e2b6",
      colorIcon: "#a8b8c8",
      colorIconHover: "#e2e2b6",
      borderRadiusLG: 16,
    },

    Menu: {
      colorBgContainer: "#021526",
      colorItemBgSelected: "rgba(110, 172, 218, 0.12)",
      colorItemBgActive: "rgba(110, 172, 218, 0.08)",
      colorItemText: "#a8b8c8",
      colorItemTextSelected: "#6eacda",
      colorItemTextActive: "#6eacda",
      itemBorderRadius: 8,
      itemMarginInline: 4,
    },

    Dropdown: {
      colorBgElevated: "#0d2847",
      controlItemBgHover: "rgba(110, 172, 218, 0.08)",
      controlItemBgActive: "rgba(110, 172, 218, 0.12)",
    },

    Tooltip: {
      colorBgSpotlight: "rgba(13, 40, 71, 0.95)",
      colorTextLightSolid: "#e2e2b6",
      borderRadiusSM: 6,
    },

    Tag: {
      defaultBg: "rgba(110, 172, 218, 0.12)",
      defaultColor: "#6eacda",
    },

    Switch: {
      colorPrimary: "#6eacda",
      colorPrimaryHover: "#89bde4",
      colorBgContainer: "rgba(255, 255, 255, 0.08)",
    },

    Progress: {
      colorInfo: "#6eacda",
      colorSuccess: "#5cb85c",
      colorWarning: "#e2e2b6",
      colorError: "#e74c3c",
    },

    Tabs: {
      inkBarColor: "#6eacda",
      itemActiveColor: "#6eacda",
      itemHoverColor: "#89bde4",
      itemSelectedColor: "#6eacda",
      colorBgContainer: "#0a1f3a",
    },

    Notification: {
      colorInfo: "#0d2847",
      colorSuccess: "rgba(92, 184, 92, 0.12)",
      colorWarning: "rgba(226, 226, 182, 0.12)",
      colorError: "rgba(231, 76, 60, 0.12)",
    },

    Alert: {
      colorInfoBg: "rgba(110, 172, 218, 0.10)",
      colorInfoBorder: "rgba(110, 172, 218, 0.25)",
      colorSuccessBg: "rgba(92, 184, 92, 0.10)",
      colorSuccessBorder: "rgba(92, 184, 92, 0.25)",
      colorWarningBg: "rgba(226, 226, 182, 0.10)",
      colorWarningBorder: "rgba(226, 226, 182, 0.25)",
      colorErrorBg: "rgba(231, 76, 60, 0.10)",
      colorErrorBorder: "rgba(231, 76, 60, 0.25)",
    },

    Drawer: {
      colorBgElevated: "#0a1f3a",
    },

    Breadcrumb: {
      separatorColor: "#5a7a94",
      itemColor: "#a8b8c8",
      lastItemColor: "#e2e2b6",
      linkColor: "#6eacda",
      linkHoverColor: "#89bde4",
    },

    Pagination: {
      colorBgContainer: "#0d2847",
      colorBorder: "rgba(255, 255, 255, 0.12)",
      itemActiveBg: "rgba(110, 172, 218, 0.15)",
      itemActiveColor: "#6eacda",
    },

    Form: {
      labelColor: "#a8b8c8",
      itemMarginBottom: 20,
    },

    Typography: {
      colorText: "#e2e2b6",
      colorTextSecondary: "#a8b8c8",
      colorTextTertiary: "#5a7a94",
      colorLink: "#6eacda",
      colorLinkHover: "#89bde4",
    },

    Skeleton: {
      colorFill: "rgba(255, 255, 255, 0.04)",
      colorFillContent: "rgba(255, 255, 255, 0.06)",
    },

    Spin: {
      colorPrimary: "#6eacda",
    },

    Badge: {
      colorError: "#e74c3c",
    },

    Message: {
      contentBg: "#0d2847",
    },
  },
};
