import {
  Card, Row, Col, Tag, Typography,
  Divider, Space, Alert, Spin,
} from "antd";
import {
  CheckCircleFilled,
  CloseCircleFilled,
  WarningFilled,
  QuestionCircleFilled,
  MailOutlined,
  GlobalOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import ScoreGauge from "./ScoreGauge";
import LayerTimeline from "./LayerTimeline";
import { STATUS_COLORS } from "../../theme/darkTheme";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Text, Title } = Typography;

const resultVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: DURATIONS.enter, ease: EASES.enter },
  },
  exit: {
    opacity: 0, y: -16, scale: 0.97,
    transition: { duration: DURATIONS.exit, ease: EASES.exit },
  },
};

const warningVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATIONS.enter, ease: EASES.enter } },
};

const StatusIcon = ({ status, size = 24 }) => {
  const icons = {
    valid: <CheckCircleFilled style={{ fontSize: size, color: STATUS_COLORS.valid.text }} />,
    invalid: <CloseCircleFilled style={{ fontSize: size, color: STATUS_COLORS.invalid.text }} />,
    risky: <WarningFilled style={{ fontSize: size, color: STATUS_COLORS.risky.text }} />,
    unknown: <QuestionCircleFilled style={{ fontSize: size, color: STATUS_COLORS.unknown.text }} />,
  };
  return icons[status] || icons.unknown;
};

const CheckRow = ({ label, value, icon, positive }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "8px 12px",
    background: positive === undefined
      ? "rgba(255,255,255,0.02)"
      : positive ? "rgba(52,211,153,0.04)" : "rgba(248,113,113,0.04)",
    borderRadius: 8, marginBottom: 6,
    border: "1px solid",
    borderColor: positive === undefined
      ? "#181F2A"
      : positive ? "rgba(52,211,153,0.15)" : "rgba(248,113,113,0.15)",
  }}>
    <Space size={8}>
      {icon}
      <Text style={{ fontSize: 12, color: "#9AA7B8" }}>{label}</Text>
    </Space>
    <Text style={{
      fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
      color: positive === undefined ? "#6B7785" : positive ? "#34D399" : "#F87171",
      fontWeight: 600,
    }}>
      {value}
    </Text>
  </div>
);

export default function ResultCard({ result, loading }) {
  if (!result && !loading) return null;

  // Loading with no result yet: render a placeholder card so the layout
  // doesn't jump while the validation is in flight.
  if (!result) {
    return (
      <Card
        style={{
          background: "#13131a",
          border: "1px solid #2a2a3a",
          borderRadius: 20,
          marginBottom: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: 12, padding: "48px 0",
        }}>
          <Spin />
          <Text style={{ color: "#6B7785", fontSize: 13 }}>Analyzing…</Text>
        </div>
      </Card>
    );
  }

  const colors = STATUS_COLORS[result.status] || STATUS_COLORS.unknown;
  const score = result?.scoring?.score ?? 0;
  const domain = result?.syntax?.domain;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={result?.email || "loading"}
        variants={resultVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Card
          style={{
            background: "#11141B",
            border: `1px solid ${colors.border}40`,
            borderRadius: 20,
            marginBottom: 20,
            boxShadow: `0 0 40px ${colors.glow}15, 0 8px 32px rgba(0,0,0,0.5)`,
            overflow: "hidden",
          }}
          styles={{ body: { padding: 0 } }}
        >
          <div style={{
            height: 4,
            background: `linear-gradient(90deg, ${colors.glow}, ${colors.border}80, transparent)`,
          }} />

          <div style={{ padding: "28px 32px" }}>
            <Row gutter={[32, 24]} align="middle">
              <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                <ScoreGauge score={score} />
              </Col>

              <Col xs={24} sm={16}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
                >
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 10,
                    padding: "6px 16px", background: `${colors.bg}`,
                    border: `1px solid ${colors.border}60`,
                    borderRadius: 50, marginBottom: 16,
                  }}>
                    <StatusIcon status={result?.status} size={16} />
                    <Text style={{
                      color: colors.text, fontWeight: 700, fontSize: 13,
                      textTransform: "uppercase", letterSpacing: 2,
                    }}>
                      {result?.status || "Analyzing..."}
                    </Text>
                  </div>
                </motion.div>

                <Title
                  level={3}
                  style={{
                    color: "#F2F6FC", margin: "0 0 8px", wordBreak: "break-all",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {result?.email || "Validating..."}
                </Title>

                <Space wrap style={{ marginBottom: 16 }}>
                  {result?.disposable?.provider_name && (
                    <Tag icon={<MailOutlined />} color="geekblue">
                      {result.disposable.provider_name}
                    </Tag>
                  )}
                  {domain && (
                    <Tag icon={<GlobalOutlined />} color="default">{domain}</Tag>
                  )}
                  {result?.disposable?.is_disposable && <Tag color="error">Disposable</Tag>}
                  {result?.disposable?.is_role_based && <Tag color="warning">Role-Based</Tag>}
                  {result?.catch_all?.is_catch_all && <Tag color="warning">Catch-All</Tag>}
                  {result?.smtp?.via_proxy && <Tag color="purple">Via Proxy</Tag>}
                  {result?.smtp?.supports_tls && (
                    <Tag icon={<SecurityScanOutlined />} color="green">TLS Supported</Tag>
                  )}
                </Space>

                {result?.processing_time_ms && (
                  <Text style={{ color: "#4A5260", fontSize: 11 }}>
                    <ThunderboltOutlined /> Validated in {result.processing_time_ms.toFixed(0)}ms
                  </Text>
                )}
              </Col>
            </Row>

            <Divider style={{ borderColor: "#181F2A", margin: "20px 0" }} />

            <Row gutter={[16, 0]}>
              <Col xs={24} md={12}>
                <CheckRow label="Syntax Valid" value={result?.syntax?.passed ? "PASS" : "FAIL"} positive={result?.syntax?.passed} />
                <CheckRow label="Domain Exists" value={result?.dns?.domain_exists ? "YES" : "NO"} positive={result?.dns?.domain_exists} />
                <CheckRow label="MX Records" value={result?.dns?.has_mx_records ? `${result.dns.mx_records?.length || 0} found` : "None"} positive={result?.dns?.has_mx_records} />
                <CheckRow label="SPF Record" value={result?.dns?.has_spf ? "Present" : "Missing"} positive={result?.dns?.has_spf} />
              </Col>
              <Col xs={24} md={12}>
                <CheckRow label="DMARC Record" value={result?.dns?.has_dmarc ? "Present" : "Missing"} positive={result?.dns?.has_dmarc} />
                <CheckRow label="DKIM Record" value={result?.dns?.has_dkim ? "Found" : "Not found"} positive={result?.dns?.has_dkim} />
                <CheckRow label="Disposable" value={result?.disposable?.is_disposable ? "YES ⚠️" : "NO"} positive={!result?.disposable?.is_disposable} />
                <CheckRow label="SMTP Verified" value={result?.smtp?.verified === true ? "PASS" : result?.smtp?.verified === false ? "FAIL" : "UNKNOWN"} positive={result?.smtp?.verified} />
              </Col>
            </Row>

            {result?.scoring?.warnings?.length > 0 && (
              <>
                <Divider style={{ borderColor: "#181F2A", margin: "20px 0 16px" }} />
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
                  style={{ display: "flex", flexDirection: "column", gap: 8 }}
                >
                  {result.scoring.warnings.map((warn, i) => (
                    <motion.div key={i} variants={warningVariants}>
                      <Alert
                        message={warn}
                        type="warning"
                        showIcon
                        style={{
                          background: "rgba(251,191,36,0.06)",
                          border: "1px solid rgba(251,191,36,0.2)",
                          borderRadius: 8, fontSize: 12,
                        }}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}
          </div>
        </Card>

        <Card
          title={<Text style={{ color: "#9AA7B8", fontSize: 13, fontWeight: 600 }}>
            🔬 Validation Layer Analysis
          </Text>}
          style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16 }}
        >
          <LayerTimeline result={result} loading={loading} />
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
