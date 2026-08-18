import { useState } from "react";
import {
  Input, Button, Switch, Space, Typography, Tooltip,
} from "antd";
import {
  SearchOutlined, ThunderboltOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined, ClearOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSingleValidation } from "../../hooks/useValidation";
import ResultCard from "./ResultCard";

const { Title, Text, Paragraph } = Typography;

const EXAMPLE_EMAILS = [
  "test@gmail.com",
  "user@outlook.com",
  "contact@example.com",
  "admin@company.io",
  "info@startup.dev",
];

export default function SingleValidator() {
  const [email, setEmail] = useState("");
  const [deep, setDeep] = useState(true);
  const { result, loading, error, history, validate, reset } = useSingleValidation();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim()) return;
    await validate(email.trim(), deep);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          style={{ fontSize: 56, marginBottom: 12, display: "inline-block" }}
        >
          🔍
        </motion.div>

        <Title
          level={1}
          style={{
            background: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #a855f7 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0, fontSize: 42, fontWeight: 800, letterSpacing: -1,
          }}
        >
          Email Validator Pro
        </Title>
        <Paragraph style={{ color: "#64748b", fontSize: 16, marginTop: 8, marginBottom: 0 }}>
          7-layer validation engine · Syntax · DNS · MX · Disposable · Catch-All · SMTP · Scoring
        </Paragraph>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div style={{
          background: "#13131a", border: "1px solid #2a2a3a",
          borderRadius: 20, padding: "28px 32px", marginBottom: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address to validate..."
              prefix={<SearchOutlined style={{ color: "#6366f1", fontSize: 18, marginRight: 4 }} />}
              suffix={
                email && (
                  <ClearOutlined
                    onClick={() => { setEmail(""); reset(); }}
                    style={{ color: "#475569", cursor: "pointer" }}
                  />
                )
              }
              size="large"
              style={{ flex: 1, minWidth: 280 }}
              disabled={loading}
            />

            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              loading={loading}
              icon={<SafetyCertificateOutlined />}
              style={{
                minWidth: 140,
                background: loading ? undefined : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none", fontWeight: 700, fontSize: 15,
                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              }}
            >
              {loading ? "Validating..." : "Validate"}
            </Button>
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
          }}>
            <Space size={8}>
              <ThunderboltOutlined style={{ color: "#6366f1" }} />
              <Text style={{ color: "#94a3b8", fontSize: 13 }}>Deep SMTP Verification</Text>
              <Tooltip title="Performs SMTP handshake to verify mailbox existence. Slower but more accurate.">
                <InfoCircleOutlined style={{ color: "#475569" }} />
              </Tooltip>
              <Switch checked={deep} onChange={setDeep} size="small" style={{ background: deep ? "#6366f1" : undefined }} />
            </Space>

            <Space wrap size={6}>
              <Text style={{ color: "#475569", fontSize: 11 }}>Try:</Text>
              {EXAMPLE_EMAILS.slice(0, 3).map((ex) => (
                <motion.span
                  key={ex}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setEmail(ex)}
                  style={{
                    cursor: "pointer", fontSize: 11, color: "#6366f1",
                    fontFamily: "JetBrains Mono, monospace", padding: "2px 8px",
                    background: "rgba(99,102,241,0.08)", borderRadius: 4,
                    border: "1px solid rgba(99,102,241,0.2)", userSelect: "none",
                  }}
                >
                  {ex}
                </motion.span>
              ))}
            </Space>
          </div>
        </div>
      </motion.div>

      {error && !loading && (
        <AlertStyle message={error} />
      )}

      <ResultCard result={result} loading={loading} />

      <AnimatePresence>
        {history.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            style={{ marginTop: 24 }}
          >
            <Text style={{
              color: "#475569", fontSize: 12,
              textTransform: "uppercase", letterSpacing: 1,
              display: "block", marginBottom: 10,
            }}>
              Recent Validations
            </Text>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {history.slice(1, 6).map((h, i) => {
                const c = {
                  valid: "#10b981", invalid: "#ef4444",
                  risky: "#f59e0b", unknown: "#64748b",
                }[h.status] || "#64748b";
                return (
                  <motion.div
                    key={`${h.email}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setEmail(h.email)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "8px 14px", background: "#13131a",
                      border: "1px solid #1e1e2e", borderRadius: 10,
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                    whileHover={{ borderColor: "#2a2a3a", background: "#1a1a2e" }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: c, boxShadow: `0 0 6px ${c}80`,
                    }} />
                    <Text style={{
                      fontSize: 12, color: "#94a3b8",
                      fontFamily: "JetBrains Mono, monospace", flex: 1,
                    }}>
                      {h.email}
                    </Text>
                    <Text style={{ fontSize: 11, color: c, fontWeight: 600 }}>
                      {h.status?.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#475569" }}>
                      {h.scoring?.score}/100
                    </Text>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AlertStyle({ message }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div style={{
        padding: "12px 16px", marginBottom: 16, borderRadius: 10,
        background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
        color: "#f87171", fontSize: 13,
      }}>
        {message}
      </div>
    </motion.div>
  );
}
