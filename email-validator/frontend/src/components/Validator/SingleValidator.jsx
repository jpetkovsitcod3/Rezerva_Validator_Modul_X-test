import { useState } from "react";
import {
  Input, Button, Switch, Space, Typography, Tooltip, Alert,
} from "antd";
import {
  SearchOutlined, ThunderboltOutlined,
  SafetyCertificateOutlined, InfoCircleOutlined, ClearOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useSingleValidation } from "../../hooks/useValidation";
import ResultCard from "./ResultCard";
import BridgeMark from "../Common/BridgeMark";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Title, Text, Paragraph } = Typography;

const EXAMPLE_EMAILS = [
  "test@gmail.com",
  "user@outlook.com",
  "contact@example.com",
  "admin@company.io",
  "info@startup.dev",
];

const historyContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const historyItem = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATIONS.enter, ease: EASES.enter } },
};

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
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
        style={{ textAlign: "center", marginBottom: 32 }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <BridgeMark size={64} />
        </div>

        <Title
          level={1}
          style={{
            background: "linear-gradient(120deg, #F2F6FC 0%, #56D6EF 60%, #2CC9E8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: 0, fontSize: 44, fontWeight: 800, letterSpacing: -1.2,
          }}
        >
          BRIDGE Modul - X
        </Title>
        <Paragraph style={{ color: "#6B7785", fontSize: 15, marginTop: 8, marginBottom: 0, letterSpacing: 0.3 }}>
          7-layer email verification · Syntax · DNS · MX · Disposable · Catch-All · SMTP · Scoring
        </Paragraph>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
      >
        <div style={{
          background: "#11141B", border: "1px solid #222A36",
          borderRadius: 20, padding: "28px 32px", marginBottom: 24,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address to validate..."
              prefix={<SearchOutlined style={{ color: "#2CC9E8", fontSize: 18, marginRight: 4 }} />}
              suffix={
                email ? (
                  <ClearOutlined
                    onClick={() => { setEmail(""); reset(); }}
                    style={{ color: "#4A5260", cursor: "pointer" }}
                  />
                ) : null
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
                fontWeight: 700, fontSize: 15,
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
              <ThunderboltOutlined style={{ color: "#2CC9E8" }} />
              <Text style={{ color: "#9AA7B8", fontSize: 13 }}>Deep SMTP Verification</Text>
              <Tooltip title="Performs an SMTP handshake to verify mailbox existence. Slower but more accurate.">
                <InfoCircleOutlined style={{ color: "#4A5260" }} />
              </Tooltip>
              <Switch checked={deep} onChange={setDeep} size="small" style={{ background: deep ? "#2CC9E8" : undefined }} />
            </Space>

            <Space wrap size={6}>
              <Text style={{ color: "#4A5260", fontSize: 11 }}>Try:</Text>
              {EXAMPLE_EMAILS.slice(0, 3).map((ex) => (
                <motion.span
                  key={ex}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ duration: DURATIONS.hover, ease: EASES.enter }}
                  onClick={() => setEmail(ex)}
                  style={{
                    cursor: "pointer", fontSize: 11, color: "#2CC9E8",
                    fontFamily: "'JetBrains Mono', monospace", padding: "2px 8px",
                    background: "rgba(44,201,232,0.08)", borderRadius: 4,
                    border: "1px solid rgba(44,201,232,0.2)", userSelect: "none",
                  }}
                >
                  {ex}
                </motion.span>
              ))}
            </Space>
          </div>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {error && !loading && (
          <motion.div
            key="validation-error"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: { duration: DURATIONS.exit, ease: EASES.exit } }}
          >
            <Alert
              type="error"
              showIcon
              message="Validation failed"
              description={error}
              style={{ marginBottom: 16, borderRadius: 10 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

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
              color: "#4A5260", fontSize: 12,
              textTransform: "uppercase", letterSpacing: 1,
              display: "block", marginBottom: 10,
            }}>
              Recent Validations
            </Text>
            <motion.div
              variants={historyContainer}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              {history.slice(1, 6).map((h, i) => {
                const c = {
                  valid: "#34D399", invalid: "#F87171",
                  risky: "#FBBF24", unknown: "#6B7785",
                }[h.status] || "#6B7785";
                return (
                  <motion.div
                    key={`${h.email}-${i}`}
                    variants={historyItem}
                    onClick={() => setEmail(h.email)}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "8px 14px", background: "#11141B",
                      border: "1px solid #181F2A", borderRadius: 10,
                      cursor: "pointer", transition: "border-color var(--motion-hover) var(--ease-out-quint), background var(--motion-hover) var(--ease-out-quint)",
                    }}
                    whileHover={{ borderColor: "#222A36", background: "#171B24" }}
                  >
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: c, boxShadow: `0 0 6px ${c}80`,
                    }} />
                    <Text style={{
                      fontSize: 12, color: "#9AA7B8",
                      fontFamily: "'JetBrains Mono', monospace", flex: 1,
                    }}>
                      {h.email}
                    </Text>
                    <Text style={{ fontSize: 11, color: c, fontWeight: 600 }}>
                      {h.status?.toUpperCase()}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#4A5260" }}>
                      {h.scoring?.score}/100
                    </Text>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

