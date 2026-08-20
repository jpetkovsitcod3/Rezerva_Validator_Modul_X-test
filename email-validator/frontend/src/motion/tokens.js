// Motion tokens — framer-motion source of truth.
// CSS counterparts live in src/styles/global.css (:root); keep values in sync.
export const DURATIONS = { enter: 0.25, exit: 0.18, hover: 0.15 };

export const EASES = {
  enter: [0.23, 1, 0.32, 1], // out-quint (--ease-out-quint)
  exit: [0.4, 0, 1, 1], // ease-in
  inout: [0.645, 0.045, 0.355, 1], // in-out-cubic (--ease-in-out-cubic)
};

export const STAGGER = 0.06;

export const containerStagger = (stagger = STAGGER) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
});

export const itemEnter = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATIONS.enter, ease: EASES.enter },
  },
};
