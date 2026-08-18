import { Card, Row, Col, Statistic, Typography } from "antd";
import { motion } from "framer-motion";

const { Text } = Typography;

const STATS = [
  { label: "Valid", key: "valid", color: "#10b981", icon: "✅" },
  { label: "Invalid", key: "invalid", color: "#ef4444", icon: "❌" },
  { label: "Risky", key: "risky", color: "#f59e0b", icon: "⚠️" },
  { label: "Unknown", key: "unknown", color: "#64748b", icon: "❓" },
];

export default function StatCards({ results = [] }) {
  const counts = results.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    { valid: 0, invalid: 0, risky: 0, unknown: 0 }
  );
  const total = results.length;

  return (
    <Row gutter={[16, 16]}>
      {STATS.map((s, i) => (
        <Col xs={12} md={6} key={s.key}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card
              style={{
                background: "#13131a", border: `1px solid ${s.color}30`,
                borderRadius: 14, textAlign: "center",
                boxShadow: `0 0 24px ${s.color}10`,
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
              <Statistic
                value={counts[s.key]}
                valueStyle={{ color: s.color, fontSize: 30, fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}
              />
              <Text style={{ color: "#64748b", fontSize: 12 }}>{s.label}</Text>
              {total > 0 && (
                <div style={{ fontSize: 11, color: "#475569" }}>
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
