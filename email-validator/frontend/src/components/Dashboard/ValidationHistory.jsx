import { Table, Tag, Typography, Empty, Card } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const STATUS_TAG = {
  valid: <Tag color="success">Valid</Tag>,
  invalid: <Tag color="error">Invalid</Tag>,
  risky: <Tag color="warning">Risky</Tag>,
  unknown: <Tag color="default">Unknown</Tag>,
};

const scoreColor = (score) =>
  score >= 75 ? "#34D399" : score >= 45 ? "#FBBF24" : "#F87171";

const COLUMNS = [
  {
    title: "Email", dataIndex: "email", key: "email",
    render: (email) => <Text style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#E6EDF3" }}>{email}</Text>,
  },
  {
    title: "Status", dataIndex: "status", key: "status", width: 110,
    render: (s) => STATUS_TAG[s] || STATUS_TAG.unknown,
  },
  {
    // B3: /history returns a top-level `score` column (see repo.py VALIDATION_COLUMNS
    // and schema.sql), NOT nested `scoring.score`. Live single results use nested
    // `scoring.score`, so read both defensively.
    title: "Score", key: "score", width: 90,
    render: (_, r) => {
      const score = r.score ?? r.scoring?.score;
      if (score == null) return <Text style={{ color: "#4A5260" }}>—</Text>;
      return <Text style={{ color: scoreColor(score), fontWeight: 700, fontSize: 12 }}>{score}</Text>;
    },
    sorter: (a, b) => (a.score ?? a.scoring?.score ?? 0) - (b.score ?? b.scoring?.score ?? 0),
  },
  {
    title: "Time", dataIndex: "validated_at", key: "time", width: 180,
    render: (ts) => (
      <Text style={{ color: "#4A5260", fontSize: 11 }}>
        {ts ? dayjs(ts).format("MMM D, YYYY HH:mm:ss") : "—"}
      </Text>
    ),
  },
];

export default function ValidationHistory({ results = [], loading = false }) {
  return (
    <Card
      title={<Text style={{ color: "#9AA7B8", fontSize: 13, fontWeight: 600 }}>🕘 Validation History</Text>}
      style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, marginTop: 20 }}
    >
      {results.length === 0 && !loading ? (
        <Empty description="No validations yet" />
      ) : (
        <Table
          dataSource={results.map((r, i) => ({ ...r, key: `${r.email}-${i}` }))}
          columns={COLUMNS}
          size="small"
          loading={loading}
          pagination={{ pageSize: 8, showTotal: (t) => `${t} records` }}
        />
      )}
    </Card>
  );
}
