import { Timeline, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const LayerIcon = ({ passed, loading }) => {
  if (loading) return <LoadingOutlined style={{ color: "#6366f1" }} spin />;
  if (passed === true) return <CheckCircleOutlined style={{ color: "#10b981" }} />;
  if (passed === false) return <CloseCircleOutlined style={{ color: "#ef4444" }} />;
  if (passed === "warn") return <WarningOutlined style={{ color: "#f59e0b" }} />;
  return <QuestionCircleOutlined style={{ color: "#64748b" }} />;
};

export default function LayerTimeline({ result, loading }) {
  if (!result && !loading) return null;

  const layers = [
    {
      label: "Syntax Validation",
      desc: result?.syntax?.passed
        ? `Valid format: ${result?.syntax?.normalized_email || result?.email}`
        : result?.syntax?.error || "Invalid email format",
      passed: result?.syntax?.passed,
      tag: "RFC 5321",
    },
    {
      label: "DNS Resolution",
      desc: result?.dns?.domain_exists
        ? `Domain exists: ${result?.syntax?.domain}`
        : result?.dns?.error || "Domain check pending...",
      passed: result?.dns?.domain_exists,
      tag: "DNS",
    },
    {
      label: "MX Records",
      desc: result?.dns?.has_mx_records
        ? `${result?.dns?.mx_records?.length} MX record(s) found`
        : "No MX records found",
      passed: result?.dns?.has_mx_records,
      tag: "Mail Server",
    },
    {
      label: "Disposable Detection",
      desc: result?.disposable?.is_disposable
        ? "⚠️ Disposable/temporary email detected"
        : result?.disposable?.is_role_based
        ? "⚠️ Role-based email (admin/info/support...)"
        : result?.disposable?.is_free_provider
        ? `Free provider: ${result?.disposable?.provider_name}`
        : "Not disposable",
      passed: result?.disposable ? !result.disposable.is_disposable : undefined,
      tag: "Disposable",
    },
    {
      label: "Catch-All Detection",
      desc: result?.catch_all?.is_catch_all
        ? "⚠️ Catch-all domain — any email accepted"
        : "Not a catch-all domain",
      passed: result?.catch_all ? !result.catch_all.is_catch_all : undefined,
      tag: "Catch-All",
    },
    {
      label: "SMTP Verification",
      desc: result?.smtp?.verified === true
        ? `✅ Mailbox exists (SMTP ${result?.smtp?.smtp_code})`
        : result?.smtp?.verified === false
        ? `❌ Mailbox not found (SMTP ${result?.smtp?.smtp_code})`
        : result?.smtp?.error || "SMTP check inconclusive",
      passed: result?.smtp?.verified,
      tag: "SMTP",
    },
    {
      label: "Deliverability Score",
      desc: result?.scoring
        ? `Score: ${result.scoring.score}/100 — ${result.scoring.risk_level?.toUpperCase()} risk`
        : "Calculating score...",
      passed: result?.scoring?.score >= 75
        ? true
        : result?.scoring?.score >= 45
        ? "warn"
        : result?.scoring
        ? false
        : undefined,
      tag: "Score",
    },
  ];

  const timelineItems = layers.map((layer, i) => ({
    dot: (
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.12, type: "spring" }}>
        <LayerIcon passed={loading ? undefined : layer.passed} loading={loading && !result} />
      </motion.div>
    ),
    children: (
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.12 + 0.1 }}
        style={{ paddingBottom: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Text strong style={{ color: "#e2e8f0", fontSize: 13 }}>{layer.label}</Text>
          <Tag style={{
            fontSize: 10, padding: "0 6px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.25)",
            color: "#818cf8", borderRadius: 4,
          }}>
            {layer.tag}
          </Tag>
        </div>
        <Text style={{ fontSize: 12, color: "#64748b", fontFamily: "JetBrains Mono, monospace" }}>
          {layer.desc}
        </Text>
      </motion.div>
    ),
  }));

  return <Timeline items={timelineItems} style={{ padding: "8px 0" }} />;
}
