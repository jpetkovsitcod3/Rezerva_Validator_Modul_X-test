import { motion } from "framer-motion";

const getScoreColor = (score) => {
  if (score >= 75) return "#10b981";
  if (score >= 45) return "#f59e0b";
  return "#ef4444";
};

const getScoreLabel = (score) => {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 45) return "Risky";
  if (score >= 25) return "Poor";
  return "Invalid";
};

export default function ScoreGauge({ score = 0 }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = 70;
  const stroke = 10;
  const normalRadius = radius - stroke / 2;
  const circumference = normalRadius * 2 * Math.PI;
  const pct = score / 100;
  const dashOffset = circumference - pct * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 160, height: 160 }}>
        <svg width="160" height="160" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="80" cy="80" r={normalRadius} fill="none" stroke="#1e1e2e" strokeWidth={stroke} />
          <motion.circle
            cx="80" cy="80" r={normalRadius} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
          <motion.circle
            cx="80" cy="80" r={normalRadius} fill="none"
            stroke={color} strokeWidth={2}
            strokeDasharray={circumference} strokeDashoffset={dashOffset}
            style={{ opacity: 0.3, filter: `blur(4px)` }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            style={{
              fontSize: 32, fontWeight: 800, color, lineHeight: 1,
              fontFamily: "JetBrains Mono, monospace",
              textShadow: `0 0 20px ${color}60`,
            }}
          >
            {score}
          </motion.div>
          <div style={{
            fontSize: 11, color: "#64748b", fontWeight: 600,
            textTransform: "uppercase", letterSpacing: 1, marginTop: 4,
          }}>
            / 100
          </div>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        style={{
          fontSize: 13, fontWeight: 700, color,
          textTransform: "uppercase", letterSpacing: 2,
          textShadow: `0 0 10px ${color}60`,
        }}
      >
        {label}
      </motion.div>
    </div>
  );
}
