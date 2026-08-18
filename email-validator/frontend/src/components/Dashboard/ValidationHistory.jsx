import { Table, Tag, Typography, Empty, Card } from "antd";
import dayjs from "dayjs";

const { Text } = Typography;

const STATUS_TAG = {
  valid: <Tag color="success">Valid</Tag>,
  invalid: <Tag color="error">Invalid</Tag>,
  risky: <Tag color="warning">Risky</Tag>,
  unknown: <Tag color="default">Unknown</Tag>,
};

const COLUMNS = [
  {
    title: "Email", dataIndex: "email", key: "email",
    render: (email) => <Text style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0" }}>{email}</Text>,
  },
  {
    title: "Status", dataIndex: "status", key: "status", width: 110,
    render: (s) => STATUS_TAG[s] || STATUS_TAG.unknown,
  },
  {
    title: "Score", dataIndex: ["scoring", "score"], key: "score", width: 90,
    render: (score) => {
      const color = score >= 75 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
      return <Text style={{ color, fontWeight: 700, fontSize: 12 }}>{score}</Text>;
    },
  },
  {
    title: "Time", dataIndex: "validated_at", key: "time", width: 180,
    render: (ts) => (
      <Text style={{ color: "#475569", fontSize: 11 }}>
        {ts ? dayjs(ts).format("MMM D, YYYY HH:mm:ss") : "—"}
      </Text>
    ),
  },
];

export default function ValidationHistory({ results = [], loading = false }) {
  return (
    <Card
      title={<Text style={{ color: "#94a3b8", fontSize: 13, fontWeight: 600 }}>🕘 Validation History</Text>}
      style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 16, marginTop: 20 }}
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
