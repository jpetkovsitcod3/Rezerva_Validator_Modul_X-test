import { useEffect, useState } from "react";
import { Layout, Menu, Badge, Typography, Space, Tooltip } from "antd";
import {
  MailOutlined, DatabaseOutlined, GlobalOutlined, GithubOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined, DashboardOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { emailApi } from "../../services/api";
import BridgeMark from "../Common/BridgeMark";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: "dashboard", icon: <DashboardOutlined />, label: "Dashboard" },
  { key: "single", icon: <MailOutlined />, label: "Single Validate" },
  { key: "bulk", icon: <DatabaseOutlined />, label: "Bulk Validate" },
  { key: "domain", icon: <GlobalOutlined />, label: "Domain Info" },
];

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATIONS.enter, ease: EASES.inout } },
  exit: { opacity: 0, y: -8, transition: { duration: DURATIONS.exit, ease: EASES.exit } },
};

export default function AppLayout({ activePage, setActivePage, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [apiStatus, setApiStatus] = useState({ loading: true, healthy: false, db: { loading: true, reachable: false, tablesReady: false } });

  // Live backend + Supabase status badge
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const health = await emailApi.health();
        if (!cancelled) {
          const db = health?.database || {};
          setApiStatus({
            loading: false,
            healthy: health?.status === "healthy",
            db: {
              loading: false,
              reachable: db.reachable === true,
              tablesReady: db.tables_ready === true,
            },
          });
        }
      } catch {
        if (!cancelled) setApiStatus((s) => ({ ...s, loading: false, healthy: false }));
      }
    };
    check();
    const t = setInterval(check, 30000);
    return () => { cancelled = true; clearInterval(t); };
  }, []);

  const apiOnline = apiStatus.healthy;
  const dbState = apiStatus.db;
  const dbOnline = dbState.reachable && dbState.tablesReady;

  return (
    <Layout style={{ minHeight: "100vh", background: "#0A0B0E" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{
          background: "#0C0F15", borderRight: "1px solid #181F2A",
          position: "sticky", top: 0, height: "100vh", overflow: "auto",
        }}
      >
        <div
          style={{
            padding: collapsed ? "20px 16px" : "20px 24px",
            borderBottom: "1px solid #181F2A",
            display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            transition: "padding var(--motion-enter) var(--ease-in-out-cubic), border-color var(--motion-enter) var(--ease-in-out-cubic)",
          }}
        >
          <BridgeMark size={36} />

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
                style={{ overflow: "hidden" }}
              >
                <Text strong style={{ color: "#F2F6FC", fontSize: 15, display: "block", whiteSpace: "nowrap", letterSpacing: -0.3 }}>
                  BRIDGE
                </Text>
                <Text style={{ color: "#2CC9E8", fontSize: 10, fontWeight: 600, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>
                  MODUL — X
                </Text>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[activePage]}
          onClick={({ key }) => setActivePage(key)}
          style={{ background: "transparent", border: "none", padding: "12px 0" }}
          items={NAV_ITEMS.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            style: { color: "#6B7785", borderRadius: 8, margin: "2px 8px", width: "auto" },
          }))}
        />

        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute", bottom: 24, left: 0, right: 0,
            display: "flex", justifyContent: "center", cursor: "pointer",
          }}
        >
          <div style={{ padding: "8px 12px", background: "rgba(44,201,232,0.08)", borderRadius: 8, color: "#2CC9E8", fontSize: 16, transition: "background 0.2s" }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>
      </Sider>

      <Layout style={{ background: "#0A0B0E" }}>
        <Header style={{
          background: "#0C0F15", borderBottom: "1px solid #181F2A",
          padding: "0 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 56, position: "sticky",
          top: 0, zIndex: 100,
        }}>
          <Space size={16} wrap>
            <Badge status={apiStatus.loading ? "processing" : (apiOnline ? "success" : "error")}
              color={apiStatus.loading ? "#2CC9E8" : (apiOnline ? "#34D399" : "#F87171")}
              text={<Text style={{ color: "#6B7785", fontSize: 12 }}>
                API {apiStatus.loading ? "…" : (apiOnline ? "Online" : "Offline")}
              </Text>} />
            <Badge status={dbState.loading ? "processing" : (dbOnline ? "success" : "warning")}
              color={dbState.loading ? "#2CC9E8" : (dbOnline ? "#34D399" : "#FBBF24")}
              text={<Text style={{ color: "#6B7785", fontSize: 12 }}>
                Supabase {dbState.loading ? "…" : (dbOnline ? "Online" : (dbState.reachable ? "No tables" : "Offline"))}
              </Text>} />
          </Space>

          <Space>
            <Tooltip title="View on GitHub">
              <GithubOutlined
                style={{ color: "#6B7785", fontSize: 18, cursor: "pointer" }}
                onClick={() => window.open("https://github.com", "_blank")}
              />
            </Tooltip>
          </Space>
        </Header>

        <Content style={{
          padding: "32px 32px", minHeight: "calc(100vh - 56px - 48px)",
          maxWidth: 1200, width: "100%", margin: "0 auto", boxSizing: "border-box",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePage}
              variants={pageVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Content>

        <Footer style={{
          background: "#0C0F15", borderTop: "1px solid #181F2A",
          textAlign: "center", padding: "12px 24px", height: 48,
        }}>
          <Text style={{ color: "#353B47", fontSize: 11 }}>
            BRIDGE Modul - X · 7-Layer Email Validation Engine · Built with FastAPI + Ant Design 5
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
