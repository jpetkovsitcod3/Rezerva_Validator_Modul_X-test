import { useEffect, useState } from "react";
import {
  Typography, Alert, Spin, Row, Col, Card, Badge, Space, Button,
} from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { emailApi } from "../../services/api";
import StatCards from "./StatCards";
import ValidationHistory from "./ValidationHistory";

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
        emailApi.getHistory(200),
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
          <Title level={2} style={{ color: "#f1f5f9", margin: 0 }}>
            📊 Dashboard
          </Title>
          <Paragraph style={{ color: "#64748b", marginTop: 6, marginBottom: 0 }}>
            Validation statistics &amp; history persisted in Supabase.
          </Paragraph>
        </div>

        <Card size="small" style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 12, minWidth: 220 }}>
          <Space direction="vertical" size={4}>
            <Space size={6}>
              <DatabaseOutlined style={{ color: dbReady ? "#10b981" : "#f59e0b" }} />
              <Text strong style={{ color: "#e2e8f0", fontSize: 12 }}>Supabase</Text>
              <Badge status={dbReady ? "success" : "warning"} text={dbReady ? "Online" : (db?.reachable ? "No tables" : "Offline")} />
            </Space>
            <Text style={{ color: "#475569", fontSize: 11 }}>
              {db?.detail || "Checking connection..."}
            </Text>
          </Space>
        </Card>
      </div>

      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}><Spin size="large" /></div>
      ) : (
        <>
          <StatCards results={history} />
          <Row style={{ marginTop: 24 }}>
            <Col span={24}>
              <ValidationHistory results={history} loading={loading} />
            </Col>
          </Row>
          {history.length === 0 && (
            <Paragraph style={{ color: "#475569", marginTop: 16, textAlign: "center" }}>
              No validations yet — run a validation and it will appear here automatically.
            </Paragraph>
          )}
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <Button type="link" onClick={() => refresh(true)}>↻ Refresh</Button>
      </div>
    </div>
  );
}