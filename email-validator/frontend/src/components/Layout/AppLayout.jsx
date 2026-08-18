import { useState } from "react";
import { Layout, Menu, Badge, Typography, Space, Tooltip } from "antd";
import {
  MailOutlined, DatabaseOutlined, GlobalOutlined, GithubOutlined,
  MenuFoldOutlined, MenuUnfoldOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";

const { Header, Sider, Content, Footer } = Layout;
const { Text } = Typography;

const NAV_ITEMS = [
  { key: "single", icon: <MailOutlined />, label: "Single Validate" },
  { key: "bulk", icon: <DatabaseOutlined />, label: "Bulk Validate" },
  { key: "domain", icon: <GlobalOutlined />, label: "Domain Info" },
];

export default function AppLayout({ activePage, setActivePage, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh", background: "#0a0a0f" }}>
      <Sider
        collapsible
        collapsed={collapsed}
        trigger={null}
        width={220}
        style={{
          background: "#0d0d17", borderRight: "1px solid #1e1e2e",
          position: "sticky", top: 0, height: "100vh", overflow: "auto",
        }}
      >
        <div style={{
          padding: collapsed ? "20px 16px" : "20px 24px",
          borderBottom: "1px solid #1e1e2e",
          display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
          transition: "all 0.3s",
        }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #6366f1, #a855f7)",
              borderRadius: 10, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 18, flexShrink: 0,
              boxShadow: "0 0 16px rgba(99,102,241,0.5)",
            }}
          >
            🔍
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: "hidden" }}
              >
                <Text strong style={{ color: "#e2e8f0", fontSize: 14, display: "block", whiteSpace: "nowrap" }}>
                  EmailValidator
                </Text>
                <Text style={{ color: "#6366f1", fontSize: 10, fontWeight: 600 }}>PRO v2.0</Text>
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
            style: { color: "#64748b", borderRadius: 8, margin: "2px 8px", width: "auto" },
          }))}
        />

        <div
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: "absolute", bottom: 24, left: 0, right: 0,
            display: "flex", justifyContent: "center", cursor: "pointer",
          }}
        >
          <div style={{ padding: "8px 12px", background: "rgba(99,102,241,0.08)", borderRadius: 8, color: "#6366f1", fontSize: 16 }}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </div>
        </div>
      </Sider>

      <Layout style={{ background: "#0a0a0f" }}>
        <Header style={{
          background: "#0d0d17", borderBottom: "1px solid #1e1e2e",
          padding: "0 32px", display: "flex", alignItems: "center",
          justifyContent: "space-between", height: 56, position: "sticky",
          top: 0, zIndex: 100,
        }}>
          <Space>
            <Badge status="processing" color="#10b981"
              text={<Text style={{ color: "#64748b", fontSize: 12 }}>API Online</Text>} />
          </Space>

          <Space>
            <Tooltip title="View on GitHub">
              <GithubOutlined
                style={{ color: "#64748b", fontSize: 18, cursor: "pointer" }}
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
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Content>

        <Footer style={{
          background: "#0d0d17", borderTop: "1px solid #1e1e2e",
          textAlign: "center", padding: "12px 24px", height: 48,
        }}>
          <Text style={{ color: "#334155", fontSize: 11 }}>
            EmailValidator Pro v2.0 · Built with FastAPI + Ant Design 5 · 7-Layer Validation Engine
          </Text>
        </Footer>
      </Layout>
    </Layout>
  );
}
