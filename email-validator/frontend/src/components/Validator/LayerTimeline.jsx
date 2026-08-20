import { Timeline, Tag, Typography } from "antd";
import { motion } from "framer-motion";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
  LoadingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Text } = Typography;

const LayerIcon = ({ passed, loading }) => {
  if (loading) return <LoadingOutlined style={{ color: "#2CC9E8" }} spin />;
  if (passed === true) return <CheckCircleOutlined style={{ color: "#34D399" }} />;
  if (passed === false) return <CloseCircleOutlined style={{ color: "#F87171" }} />;
  if (passed === "warn") return <WarningOutlined style={{ color: "#FBBF24" }} />;
  return <QuestionCircleOutlined style={{ color: "#6B7785" }} />;
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
      <motion.div
        custom={i}
        variants={{
          hidden: { scale: 0 },
          visible: (index) => ({ scale: 1, transition: { delay: index * 0.08, duration: DURATIONS.enter, ease: EASES.enter } }),
        }}
        initial="hidden"
        animate="visible"
      >
        <LayerIcon passed={loading ? undefined : layer.passed} loading={loading && !result} />
      </motion.div>
    ),
    children: (
      <motion.div
        custom={i}
        variants={{
          hidden: { opacity: 0, x: -16 },
          visible: (index) => ({ opacity: 1, x: 0, transition: { delay: index * 0.08 + 0.05, duration: DURATIONS.enter, ease: EASES.enter } }),
        }}
        initial="hidden"
        animate="visible"
        style={{ paddingBottom: 8 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <Text strong style={{ color: "#E6EDF3", fontSize: 13 }}>{layer.label}</Text>
          <Tag style={{
            fontSize: 10, padding: "0 6px",
            background: "rgba(44,201,232,0.1)",
            border: "1px solid rgba(44,201,232,0.25)",
            color: "#56D6EF", borderRadius: 4,
          }}>
            {layer.tag}
          </Tag>
        </div>
        <Text style={{ fontSize: 12, color: "#6B7785", fontFamily: "'JetBrains Mono', monospace" }}>
          {layer.desc}
        </Text>
      </motion.div>
    ),
  }));

  return <Timeline items={timelineItems} style={{ padding: "8px 0" }} />;
}
