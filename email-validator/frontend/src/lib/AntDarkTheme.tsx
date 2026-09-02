/**
 * Ant Design Dark Theme — ColorHunt Navy-Blue
 * Component-level style implementations
 *
 * Usage:
 *   import { colorHuntDarkTheme } from './lib/theme';
 *   import { ConfigProvider } from 'antd';
 *   import './lib/ant-dark-theme.css';
 *
 *   <ConfigProvider theme={colorHuntDarkTheme}>
 *     <App />
 *   </ConfigProvider>
 */

import { ConfigProvider, App as AntApp } from "antd";
import { colorHuntDarkTheme } from "./theme";
import "./ant-dark-theme.css";

/**
 * ThemeProvider wraps the app with Ant Design's ConfigProvider
 * using the ColorHunt Navy-Blue dark theme.
 *
 * All components rendered inside will automatically use
 * the dark theme tokens defined in theme.ts and ant-dark-theme.css.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={colorHuntDarkTheme}
      prefixCls="ant"
      iconPrefixCls="anticon"
    >
      <AntApp>{children}</AntApp>
    </ConfigProvider>
  );
}

/**
 * Theme Toggle Hook
 *
 * Use this to switch between dark and light themes.
 * The dark theme is the ColorHunt Navy-Blue palette.
 * The light theme uses Ant Design's default light algorithm.
 */
export function useThemeToggle() {
  const toggleTheme = () => {
    const html = document.documentElement;
    const current = html.getAttribute("data-theme");
    if (current === "dark") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", "dark");
    }
  };

  return { toggleTheme };
}

/**
 * Motion Presets — Ant Design Motion Spec
 *
 * Use these with Framer Motion for consistent animation
 * that follows Ant Design's Natural/Performant/Concise principles.
 *
 * Duration tiers:
 *   Fast:   100ms — tooltips, small popovers
 *   Normal: 200ms — dropdowns, selects, most UI
 *   Slow:   300ms — modals, drawers, complex transitions
 */
export const antMotion = {
  /* ── Natural: ease-out for entering elements ── */
  enter: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.2,
      ease: [0.215, 0.61, 0.355, 1], // motionEaseOut
    },
  },

  /* ── Performant: fast exit, no lingering ── */
  exit: {
    initial: { opacity: 1, y: 0 },
    animate: { opacity: 0, y: -8 },
    transition: {
      duration: 0.1,
      ease: [0.71, -0.46, 0.88, 0.6], // motionEaseInBack
    },
  },

  /* ── Concise: fade for content changes ── */
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.2,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },

  /* ── Zoom: modals, popovers (origin-aware) ── */
  zoom: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      duration: 0.25,
      ease: [0.08, 0.82, 0.17, 1], // motionEaseOutCirc
    },
  },

  /* ── Spring: interactive elements ── */
  spring: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.8,
    },
  },

  /* ── Stagger: list items ── */
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.06,
      },
    },
  },

  staggerItem: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.2,
      ease: [0.215, 0.61, 0.355, 1],
    },
  },

  /* ── Layout: shared element transitions ── */
  layout: {
    layout: true,
    transition: {
      duration: 0.25,
      ease: [0.645, 0.045, 0.355, 1], // motionEaseInOut
    },
  },
} as const;

/**
 * Component Style Presets
 *
 * Ready-to-use style objects for common dark theme components.
 * These use the CSS variables from ant-dark-theme.css.
 */
export const antStyles = {
  /* ── Card: liquid glass refraction ── */
  card: {
    background: "var(--ant-color-bg-container)",
    border: "1px solid var(--ant-color-border-secondary)",
    borderRadius: "var(--ant-border-radius-lg)",
    boxShadow: "var(--ant-shadow)",
    transition: "border-color 200ms var(--ant-motion-ease-out)",
  },

  cardHover: {
    borderColor: "var(--ant-color-border)",
  },

  /* ── Button: tactile press feedback ── */
  buttonPrimary: {
    background: "var(--ant-color-primary)",
    color: "var(--ant-color-text-on-solid)",
    borderRadius: "var(--ant-border-radius)",
    fontWeight: 500,
    transition: "all 200ms var(--ant-motion-ease-out)",
    boxShadow: "0 2px 8px rgba(110, 172, 218, 0.20)",
  },

  buttonPrimaryHover: {
    background: "var(--ant-color-primary-hover)",
    boxShadow: "0 4px 16px rgba(110, 172, 218, 0.30)",
  },

  buttonPrimaryActive: {
    transform: "scale(0.97)",
  },

  /* ── Input: clean dark field ── */
  input: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid var(--ant-color-border)",
    borderRadius: "var(--ant-border-radius)",
    color: "var(--ant-color-text)",
    transition: "border-color 200ms var(--ant-motion-ease-out), box-shadow 200ms var(--ant-motion-ease-out)",
  },

  inputFocus: {
    borderColor: "var(--ant-color-primary)",
    boxShadow: "0 0 0 2px rgba(110, 172, 218, 0.15)",
  },

  /* ── Table: data-heavy surface ── */
  table: {
    background: "var(--ant-color-bg-container)",
    borderRadius: "var(--ant-border-radius-lg)",
    overflow: "hidden" as const,
  },

  tableHeader: {
    background: "var(--ant-color-bg-elevated)",
    color: "var(--ant-color-text-secondary)",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: "0.05em",
    textTransform: "uppercase" as const,
    borderBottom: "1px solid var(--ant-color-border-secondary)",
  },

  tableRow: {
    borderBottom: "1px solid var(--ant-color-border-tertiary)",
    transition: "background-color 100ms var(--ant-motion-ease-out)",
  },

  tableRowHover: {
    background: "rgba(110, 172, 218, 0.04)",
  },

  /* ── Modal: elevated overlay ── */
  modal: {
    background: "var(--ant-color-bg-container)",
    border: "1px solid var(--ant-color-border-secondary)",
    borderRadius: "var(--ant-border-radius-xl)",
    boxShadow: "var(--ant-shadow-xl)",
  },

  modalMask: {
    background: "var(--ant-color-bg-mask)",
    backdropFilter: "blur(8px)",
  },

  /* ── Tag: status badges ── */
  tagSuccess: {
    background: "var(--ant-color-success-bg)",
    color: "var(--ant-color-success-text)",
    border: "1px solid var(--ant-color-success-border)",
    borderRadius: "var(--ant-border-radius-xs)",
    fontSize: 12,
    fontWeight: 500,
  },

  tagWarning: {
    background: "var(--ant-color-warning-bg)",
    color: "var(--ant-color-warning-text)",
    border: "1px solid var(--ant-color-warning-border)",
    borderRadius: "var(--ant-border-radius-xs)",
    fontSize: 12,
    fontWeight: 500,
  },

  tagError: {
    background: "var(--ant-color-error-bg)",
    color: "var(--ant-color-error-text)",
    border: "1px solid var(--ant-color-error-border)",
    borderRadius: "var(--ant-border-radius-xs)",
    fontSize: 12,
    fontWeight: 500,
  },

  tagInfo: {
    background: "var(--ant-color-info-bg)",
    color: "var(--ant-color-info-text)",
    border: "1px solid var(--ant-color-info-border)",
    borderRadius: "var(--ant-border-radius-xs)",
    fontSize: 12,
    fontWeight: 500,
  },

  /* ── Skeleton: loading state ── */
  skeleton: {
    background: "linear-gradient(90deg, var(--ant-color-fill-tertiary) 25%, var(--ant-color-fill-secondary) 50%, var(--ant-color-fill-tertiary) 75%)",
    backgroundSize: "200% 100%",
    animation: "antSkeletonPulse 1.8s ease-in-out infinite",
    borderRadius: "var(--ant-border-radius)",
  },

  /* ── Tooltip ── */
  tooltip: {
    background: "var(--ant-color-bg-spotlight)",
    color: "var(--ant-color-text)",
    borderRadius: "var(--ant-border-radius-sm)",
    fontSize: 12,
    padding: "6px 10px",
    boxShadow: "var(--ant-shadow-lg)",
  },
} as const;
