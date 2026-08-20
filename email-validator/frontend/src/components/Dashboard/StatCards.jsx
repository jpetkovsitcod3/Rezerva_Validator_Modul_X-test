import { Card, Row, Col, Typography } from "antd";
import { motion, useReducedMotion } from "framer-motion";
import CountUp from "react-countup";
import { STATUS_HEX } from "../../theme/darkTheme";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Text } = Typography;

const STATS = [
  { label: "Valid", key: "valid", color: STATUS_HEX.valid, icon: "✅" },
  { label: "Invalid", key: "invalid", color: STATUS_HEX.invalid, icon: "❌" },
  { label: "Risky", key: "risky", color: STATUS_HEX.risky, icon: "⚠️" },
  { label: "Unknown", key: "unknown", color: STATUS_HEX.unknown, icon: "❓" },
];

export default function StatCards({ results = [] }) {
  const reduce = useReducedMotion();
  const counts = results.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    { valid: 0, invalid: 0, risky: 0, unknown: 0 }
  );
  const total = results.length;

  return (
    <Row gutter={[16, 16]}>
      {STATS.map((s) => (
        <Col xs={12} md={6} key={s.key}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
          >
            <Card
              style={{
                background: "#11141B", border: `1px solid ${s.color}30`,
                borderRadius: 14, textAlign: "center",
                boxShadow: `0 0 24px ${s.color}10`,
                transition: "border-color var(--motion-hover) var(--ease-out-quint), transform var(--motion-hover) var(--ease-out-quint)",
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <div style={{
                fontSize: 30, fontWeight: 800, color: s.color,
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: `0 0 16px ${s.color}40`,
              }}>
                {reduce ? counts[s.key] : (
                  <CountUp end={counts[s.key]} duration={0.6} preserveCount separator="," decimals={0} />
                )}
              </div>
              <Text style={{ color: "#6B7785", fontSize: 12, display: "block", marginTop: 4 }}>
                {s.label}
              </Text>
              {total > 0 && (
                <div style={{ fontSize: 11, color: "#4A5260", marginTop: 2 }}>
                  {((counts[s.key] / total) * 100).toFixed(1)}%
                </div>
              )}
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
}
