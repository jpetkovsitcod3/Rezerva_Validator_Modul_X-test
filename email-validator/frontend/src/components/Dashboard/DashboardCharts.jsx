import { useMemo } from "react";
import dayjs from "dayjs";
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RCTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend as RCLegend,
  BarChart, Bar, BarChart as HBarChart
} from "recharts";
import { motion } from "framer-motion";
import { Card, Row, Col, Space, Typography } from "antd";
import CountUp from "react-countup";
import { CHART, STATUS_HEX } from "../../theme/darkTheme";

const { Text } = Typography;

const ACCENT = CHART.cyan;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: "#171B24", border: "1px solid #222A36",
          borderRadius: 8, padding: "8px 12px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <Text strong style={{ color: "#E6EDF3", fontSize: 11, display: "block", marginBottom: 6 }}>
          {label}
        </Text>
        {payload.map((entry, i) => (
          <Text key={i} style={{ color: entry.color, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: entry.color }} />
            {entry.name}: {entry.value}
          </Text>
        ))}
      </motion.div>
    );
  }
  return null;
};

function StatusDonut({ data, total }) {
  const slices = useMemo(() => [
    { name: "Valid", value: data.valid || 0, color: STATUS_HEX.valid },
    { name: "Invalid", value: data.invalid || 0, color: STATUS_HEX.invalid },
    { name: "Risky", value: data.risky || 0, color: STATUS_HEX.risky },
    { name: "Unknown", value: data.unknown || 0, color: STATUS_HEX.unknown },
  ].filter(d => d.value > 0), [data]);

  return (
    <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, height: "100%" }}>
      <Text style={{ color: "#9AA7B8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
        Status Distribution
      </Text>
      <div style={{ position: "relative", height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={70}
              outerRadius={100}
              paddingAngle={3}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
              stroke="none"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {slices.map(d => <Cell key={d.name} fill={d.color} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, type: "spring", stiffness: 180 }}
          style={{ position: "absolute", textAlign: "center", pointerEvents: "none" }}
        >
          <CountUp end={total} duration={1.4} separator="," decimals={0}
            style={{ fontSize: 28, fontWeight: 800, color: "#F2F6FC", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }} />
          <Text style={{ color: "#6B7785", fontSize: 10, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            VALIDATIONS
          </Text>
        </motion.div>
      </div>
    </Card>
  );
}

function TrendArea({ daily }) {
  // daily: array of { date: "YYYY-MM-DD", valid, invalid, risky, unknown }
  return (
    <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, height: "100%" }}>
      <Text style={{ color: "#9AA7B8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
        14-Day Validation Trend
      </Text>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <defs>
            <linearGradient id="trend-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
            </linearGradient>
          </defs>
          <AreaChart data={daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="trend-cyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#181F2A" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6B7785", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "#181F2A" }}
              tickLine={{ stroke: "#181F2A" }}
              tickFormatter={(v) => dayjs(v).format("MM/DD")}
            />
            <YAxis
              tick={{ fill: "#6B7785", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={false}
              tickLine={false}
              min={0}
            />
            <RCLegend
              formatter={(name) => name.charAt(0).toUpperCase() + name.slice(1)}
              iconSize={8}
              iconType="circle"
              wrapperStyle={{ paddingTop: 4 }}
            />
            <RCTooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="valid"
              name="Valid"
              stroke={STATUS_HEX.valid}
              fill="url(#trend-cyan)"
              strokeWidth={2}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            />
            <Area
              type="monotone"
              dataKey="invalid"
              name="Invalid"
              stroke={STATUS_HEX.invalid}
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            />
            <Area
              type="monotone"
              dataKey="risky"
              name="Risky"
              stroke={STATUS_HEX.risky}
              fillOpacity={0.15}
              strokeWidth={2}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            />
            <Area
              type="monotone"
              dataKey="unknown"
              name="Unknown"
              stroke={STATUS_HEX.unknown}
              fillOpacity={0.1}
              strokeWidth={1}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function LayerPassRate({ layers }) {
  // layers: array of { name, passRate }
  return (
    <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, height: "100%" }}>
      <Text style={{ color: "#9AA7B8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
        7-Layer Pass Rate
      </Text>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <HBarChart layout="vertical" data={layers} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#181F2A" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "#6B7785", fontSize: 10 }}
              axisLine={{ stroke: "#181F2A" }}
              tickLine={{ stroke: "#181F2A" }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "#9AA7B8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "#181F2A" }}
              tickLine={false}
              width={110}
            />
            <RCTooltip content={<CustomTooltip />} labelFormatter={(v) => `${v}%`} />
            <Bar
              dataKey="passRate"
              name="Pass Rate"
              radius={[0, 4, 4, 0]}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            >
              {layers.map((l, i) => (
                <Cell key={i} fill={l.passRate >= 90 ? STATUS_HEX.valid : l.passRate >= 60 ? STATUS_HEX.warning : STATUS_HEX.error} />
              ))}
            </Bar>
          </HBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function ScoreHistogram({ buckets }) {
  // buckets: array of { range, count }
  return (
    <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, height: "100%" }}>
      <Text style={{ color: "#9AA7B8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
        Score Distribution
      </Text>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={buckets} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#181F2A" vertical={false} />
            <XAxis
              dataKey="range"
              tick={{ fill: "#6B7785", fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "#181F2A" }}
              tickLine={{ stroke: "#181F2A" }}
            />
            <YAxis
              tick={{ fill: "#6B7785", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              min={0}
            />
            <RCTooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              name="Count"
              radius={[4, 4, 0, 0]}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            >
              {buckets.map((b, i) => (
                <Cell key={i} fill={i === buckets.length - 1 ? STATUS_HEX.valid : i >= buckets.length - 2 ? STATUS_HEX.warning : STATUS_HEX.error} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

function TopDomains({ domains }) {
  // domains: array of { domain, count }
  return (
    <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, height: "100%" }}>
      <Text style={{ color: "#9AA7B8", fontSize: 12, fontWeight: 600, display: "block", marginBottom: 8 }}>
        Top Validated Domains
      </Text>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <HBarChart layout="vertical" data={domains} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#181F2A" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: "#6B7785", fontSize: 10 }}
              axisLine={{ stroke: "#181F2A" }}
              tickLine={{ stroke: "#181F2A" }}
            />
            <YAxis
              type="category"
              dataKey="domain"
              tick={{ fill: "#9AA7B8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "#181F2A" }}
              tickLine={false}
              width={140}
            />
            <RCTooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              name="Validations"
              radius={[0, 4, 4, 0]}
              fill={ACCENT}
              isAnimationActive={CHART.isAnimationActive}
              animationDuration={CHART.animationDuration}
              animationEasing={CHART.animationEasing}
            >
              {domains.map((_, i) => <Cell key={i} fill={ACCENT} />)}
            </Bar>
          </HBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

// Main export: computes all chart data from raw history rows
export default function DashboardCharts({ history = [] }) {
  const {
    statusCounts,
    dailyTrend,
    layerPassRates,
    scoreBuckets,
    topDomains,
    total,
  } = useMemo(() => {
    if (!history.length) return {
      statusCounts: { valid: 0, invalid: 0, risky: 0, unknown: 0 },
      dailyTrend: [],
      layerPassRates: [],
      scoreBuckets: [
        { range: "0–24", count: 0 }, { range: "25–44", count: 0 },
        { range: "45–74", count: 0 }, { range: "75–100", count: 0 },
      ],
      topDomains: [],
      total: 0,
    };

    const counts = { valid: 0, invalid: 0, risky: 0, unknown: 0 };
    const dailyMap = new Map();
    const layerStats = {
      syntax: { pass: 0, total: 0 },
      dns: { pass: 0, total: 0 },
      mx: { pass: 0, total: 0 },
      disposable: { pass: 0, total: 0 },
      catchAll: { pass: 0, total: 0 },
      smtp: { pass: 0, total: 0 },
      score: { pass: 0, total: 0 },
    };
    const scoreHist = { "0–24": 0, "25–44": 0, "45–74": 0, "75–100": 0 };
    const domainCounts = new Map();

    history.forEach(r => {
      // status counts
      const status = r.status || r.scoring?.risk_level?.toLowerCase() || "unknown";
      if (counts[status] !== undefined) counts[status]++;

      // daily trend (by validated_at or created_at)
      const date = (r.validated_at || r.created_at || "").slice(0, 10);
      if (date && date !== "Invalid Date") {
        if (!dailyMap.has(date)) dailyMap.set(date, { valid: 0, invalid: 0, risky: 0, unknown: 0 });
        const d = dailyMap.get(date);
        if (d[status] !== undefined) d[status]++;
      }

      // layer pass rates
      if (r.syntax?.passed !== undefined) { layerStats.syntax.total++; if (r.syntax.passed) layerStats.syntax.pass++; }
      if (r.dns?.domain_exists !== undefined) { layerStats.dns.total++; if (r.dns.domain_exists) layerStats.dns.pass++; }
      if (r.dns?.has_mx_records !== undefined) { layerStats.mx.total++; if (r.dns.has_mx_records) layerStats.mx.pass++; }
      if (r.disposable?.is_disposable !== undefined) { layerStats.disposable.total++; if (!r.disposable.is_disposable) layerStats.disposable.pass++; }
      if (r.catch_all?.is_catch_all !== undefined) { layerStats.catch_all.total++; if (!r.catch_all.is_catch_all) layerStats.catch_all.pass++; }
      if (r.smtp?.verified !== undefined) { layerStats.smtp.total++; if (r.smtp.verified === true) layerStats.smtp.pass++; }

      // score histogram
      const score = r.score ?? r.scoring?.score ?? 0;
      if (score < 25) scoreHist["0–24"]++;
      else if (score < 45) scoreHist["25–44"]++;
      else if (score < 75) scoreHist["45–74"]++;
      else scoreHist["75–100"]++;

      // top domains
      const dom = r.email?.split("@")[1]?.toLowerCase();
      if (dom) domainCounts.set(dom, (domainCounts.get(dom) || 0) + 1);
    });

    // sort daily last 14 days
    const today = new Date();
    const dailyTrend = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const v = dailyMap.get(key) || { valid: 0, invalid: 0, risky: 0, unknown: 0 };
      dailyTrend.push({ date: key, ...v });
    }

    // layer pass rates
    const layerPassRates = [
      { name: "Syntax", passRate: layerStats.syntax.total ? Math.round((layerStats.syntax.pass / layerStats.syntax.total) * 100) : 0 },
      { name: "DNS Exists", passRate: layerStats.dns.total ? Math.round((layerStats.dns.pass / layerStats.dns.total) * 100) : 0 },
      { name: "MX Records", passRate: layerStats.mx.total ? Math.round((layerStats.mx.pass / layerStats.mx.total) * 100) : 0 },
      { name: "Not Disposable", passRate: layerStats.disposable.total ? Math.round((layerStats.disposable.pass / layerStats.disposable.total) * 100) : 0 },
      { name: "Not Catch-All", passRate: layerStats.catchAll.total ? Math.round((layerStats.catchAll.pass / layerStats.catchAll.total) * 100) : 0 },
      { name: "SMTP Verified", passRate: layerStats.smtp.total ? Math.round((layerStats.smtp.pass / layerStats.smtp.total) * 100) : 0 },
      { name: "Score ≥ 75", passRate: layerStats.score.total ? Math.round((layerStats.score.pass / layerStats.score.total) * 100) : 0 },
    ];

    // score buckets
    const scoreBuckets = [
      { range: "0–24", count: scoreHist["0–24"] },
      { range: "25–44", count: scoreHist["25–44"] },
      { range: "45–74", count: scoreHist["45–74"] },
      { range: "75–100", count: scoreHist["75–100"] },
    ];

    // top 7 domains
    const topDomains = Array.from(domainCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([domain, count]) => ({ domain, count }));

    return { statusCounts: counts, dailyTrend, layerPassRates, scoreBuckets, topDomains, total: history.length };
  }, [history]);

  if (!history.length) {
    return (
      <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16 }}>
        <Space direction="vertical" size="12" style={{ textAlign: "center", padding: 40 }}>
          <Text style={{ color: "#6B7785", fontSize: 14 }}>No validation data yet</Text>
          <Text style={{ color: "#4A5260", fontSize: 12 }}>Run a validation and charts will appear here.</Text>
        </Space>
      </Card>
    );
  }

  return (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12} lg={6}>
          <StatusDonut data={statusCounts} total={total} />
        </Col>
        <Col xs={24} md={12} lg={18}>
          <TrendArea daily={dailyTrend} />
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={12}>
          <LayerPassRate layers={layerPassRates} />
        </Col>
        <Col xs={24} md={12}>
          <ScoreHistogram buckets={scoreBuckets} />
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <TopDomains domains={topDomains} />
        </Col>
      </Row>
    </>
  );
}