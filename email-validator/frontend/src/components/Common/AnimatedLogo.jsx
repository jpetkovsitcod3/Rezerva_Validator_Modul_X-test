import { motion } from "framer-motion";

export default function AnimatedLogo({ size = 36 }) {
  return (
    <motion.div
      animate={{ rotate: [0, 360] }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, #6366f1, #a855f7)",
        borderRadius: size * 0.28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.5,
        flexShrink: 0,
        boxShadow: "0 0 16px rgba(99,102,241,0.5)",
      }}
    >
      🔍
    </motion.div>
  );
}
