import { useState } from "react";
import {
  Input, Button, Card, Descriptions, Tag, Typography, Spin, Empty, Alert,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";
import { emailApi } from "../../services/api";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Text } = Typography;

export default function DomainInfo() {
  const [domain, setDomain] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await emailApi.getDomainInfo(domain.trim().toLowerCase());
      setData(res);
    } catch (err) {
      setData(null);
      setError(err.message || "Domain lookup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
      >
        <Text style={{ color: "#F2F6FC", fontSize: 24, fontWeight: 700, display: "block", marginBottom: 4 }}>
          🌐 Domain Intelligence
        </Text>
        <Text style={{ color: "#6B7785", fontSize: 14, display: "block", marginBottom: 20 }}>
          Inspect MX, SPF, DMARC and DKIM records for any domain.
        </Text>
      </motion.div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          onPressEnter={lookup}
          placeholder="e.g. gmail.com"
          prefix={<SearchOutlined style={{ color: "#2CC9E8" }} />}
          size="large"
          style={{ flex: 1 }}
        />
        <Button type="primary" size="large" loading={loading} onClick={lookup}>
          Lookup
        </Button>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40 }}><Spin /></div>}

      {error && !loading && (
        <Alert
          type="error" showIcon message="Domain lookup failed"
          description={error} style={{ marginBottom: 16, borderRadius: 10 }}
        />
      )}

      {!loading && data && (
        <Card style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16 }}>
          <Descriptions column={1} colon={false} size="small"
            labelStyle={{ color: "#6B7785", width: 150 }}
            contentStyle={{ color: "#E6EDF3" }}
          >
            <Descriptions.Item label="Domain">
              <Text strong style={{ color: "#E6EDF3" }}>{domain.toLowerCase()}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Domain Exists">
              {data.domain_exists ? <Tag color="success">YES</Tag> : <Tag color="error">NO</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="MX Records">
              {data.has_mx_records ? <Tag color="success">{data.mx_records.length} found</Tag> : <Tag color="error">None</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="SPF">
              {data.has_spf ? <Tag color="success">Present</Tag> : <Tag>Missing</Tag>}
              {data.spf_record && <Text style={{ display: "block", color: "#9AA7B8", fontSize: 11 }}>{data.spf_record}</Text>}
            </Descriptions.Item>
            <Descriptions.Item label="DMARC">
              {data.has_dmarc ? <Tag color="success">Present</Tag> : <Tag>Missing</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="DKIM">
              {data.has_dkim ? <Tag color="success">Present</Tag> : <Tag>Not found</Tag>}
            </Descriptions.Item>
          </Descriptions>

          {data.mx_records?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <Text style={{ color: "#9AA7B8", fontSize: 12, display: "block", marginBottom: 8 }}>MX Records:</Text>
              {data.mx_records.map((mx, i) => (
                <div key={i} style={{
                  padding: "6px 12px", marginBottom: 4, background: "#0A0B0E",
                  border: "1px solid #181F2A", borderRadius: 8,
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#9AA7B8",
                }}>
                  <Tag color="geekblue" style={{ marginRight: 8 }}>{mx.priority}</Tag>
                  {mx.host}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {!loading && !data && !error && (
        <Empty description="Enter a domain to inspect" style={{ marginTop: 40 }} />
      )}
    </div>
  );
}
