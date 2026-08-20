import { useEffect, useState } from "react";
import {
  Typography, Alert, Spin, Card, Badge, Space, Button, Tabs,
} from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { emailApi } from "../../services/api";
import StatCards from "./StatCards";
import ValidationHistory from "./ValidationHistory";
import DashboardCharts from "./DashboardCharts";

const { Title, Paragraph, Text } = Typography;

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [db, setDb] = useState(null);

  const refresh = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [h, status] = await Promise.all([
        emailApi.getHistory(500),
        emailApi.getDbStatus(),
      ]);
      setHistory(Array.isArray(h) ? h : []);
      setDb(status);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const dbReady = db?.tables_ready === true && db?.reachable === true;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ color: "#F2F6FC", margin: 0 }}>
            📊 Dashboard
          </Title>
          <Paragraph style={{ color: "#6B7785", marginTop: 6, marginBottom: 0 }}>
            Validation statistics & history persisted in Supabase.
          </Paragraph>
        </div>

        <Card size="small" style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 12, minWidth: 220 }}>
          <Space direction="vertical" size={4}>
            <Space size={6}>
              <DatabaseOutlined style={{ color: dbReady ? "#34D399" : "#FBBF24" }} />
              <Text strong style={{ color: "#E6EDF3", fontSize: 12 }}>Supabase</Text>
              <Badge status={dbReady ? "success" : "warning"} text={dbReady ? "Online" : (db?.reachable ? "No tables" : "Offline")} />
            </Space>
            <Text style={{ color: "#4A5260", fontSize: 11 }}>
              {db?.detail || "Checking connection..."}
            </Text>
          </Space>
        </Card>
      </div>

      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16, borderRadius: 10 }} />}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
      ) : (
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: "overview",
              tab: <TabLabel label="Overview" icon="📈" />,
              children: (
                <>
                  <StatCards results={history} />
                  {history.length === 0 && (
                    <Paragraph style={{ color: "#4A5260", marginTop: 16, textAlign: "center" }}>
                      No validations yet — run a validation and it will appear here automatically.
                    </Paragraph>
                  )}
                </>
              ),
            },
            {
              key: "charts",
              tab: <TabLabel label="Charts" icon="📊" />,
              children: (
                <DashboardCharts history={history} />
              ),
            },
            {
              key: "history",
              tab: <TabLabel label="History" icon="🕘" />,
              children: (
                <ValidationHistory results={history} loading={loading} />
              ),
            },
          ]}
        />
      )}

      <div style={{ marginTop: 24 }}>
        <Button type="link" onClick={() => refresh(true)}>↻ Refresh</Button>
      </div>
    </div>
  );
}

function TabLabel({ label, icon }) {
  return (
    <Space size={6} style={{ color: "#9AA7B8", fontWeight: 500 }}>
      <span>{icon}</span>
      <span>{label}</span>
    </Space>
  );
}