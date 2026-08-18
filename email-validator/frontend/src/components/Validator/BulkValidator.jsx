import { useState } from "react";
import {
  Upload, Button, Table, Tag, Progress, Typography,
  Space, Row, Col, Divider, Input,
} from "antd";
import {
  UploadOutlined, ThunderboltOutlined, DownloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, QuestionCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { useBulkValidation } from "../../hooks/useValidation";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_TAG = {
  valid: <Tag icon={<CheckCircleOutlined />} color="success">Valid</Tag>,
  invalid: <Tag icon={<CloseCircleOutlined />} color="error">Invalid</Tag>,
  risky: <Tag icon={<WarningOutlined />} color="warning">Risky</Tag>,
  unknown: <Tag icon={<QuestionCircleOutlined />} color="default">Unknown</Tag>,
};

const TABLE_COLUMNS = [
  {
    title: "#", dataIndex: "index", key: "index", width: 50,
    render: (_, __, i) => <Text style={{ color: "#475569", fontSize: 12 }}>{i + 1}</Text>,
  },
  {
    title: "Email", dataIndex: "email", key: "email",
    render: (email) => (
      <Text copyable style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "#e2e8f0" }}>
        {email}
      </Text>
    ),
  },
  {
    title: "Status", dataIndex: "status", key: "status", width: 110,
    filters: [
      { text: "Valid", value: "valid" },
      { text: "Invalid", value: "invalid" },
      { text: "Risky", value: "risky" },
      { text: "Unknown", value: "unknown" },
    ],
    onFilter: (value, record) => record.status === value,
    render: (status) => STATUS_TAG[status] || STATUS_TAG.unknown,
  },
  {
    title: "Score", dataIndex: ["scoring", "score"], key: "score", width: 110,
    sorter: (a, b) => (a.scoring?.score || 0) - (b.scoring?.score || 0),
    render: (score) => {
      const color = score >= 75 ? "#10b981" : score >= 45 ? "#f59e0b" : "#ef4444";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={score} showInfo={false} strokeColor={color}
            trailColor="#1e1e2e" size="small" style={{ width: 50, margin: 0 }}
          />
          <Text style={{ color, fontSize: 11, fontWeight: 700 }}>{score}</Text>
        </div>
      );
    },
  },
  {
    title: "MX", dataIndex: ["dns", "has_mx_records"], key: "mx", width: 50,
    render: (v) => v ? <Text style={{ color: "#10b981" }}>✓</Text> : <Text style={{ color: "#ef4444" }}>✗</Text>,
  },
  {
    title: "Disposable", dataIndex: ["disposable", "is_disposable"], key: "disposable", width: 90,
    render: (v) => v ? <Tag color="error" style={{ fontSize: 10 }}>Yes</Tag> : <Tag color="green" style={{ fontSize: 10 }}>No</Tag>,
  },
  {
    title: "Time (ms)", dataIndex: "processing_time_ms", key: "time", width: 90,
    sorter: (a, b) => (a.processing_time_ms || 0) - (b.processing_time_ms || 0),
    render: (ms) => <Text style={{ color: "#475569", fontSize: 11 }}>{ms ? ms.toFixed(0) : "—"}</Text>,
  },
];

export default function BulkValidator() {
  const [emailText, setEmailText] = useState("");
  const [fileEmails, setFileEmails] = useState([]);
  const { taskId, status, results, progress, total, startBulk, reset } = useBulkValidation();

  const emailList = [
    ...emailText.split(/[\n,;]/).map((e) => e.trim()).filter(Boolean),
    ...fileEmails,
  ];
  const uniqueEmails = [...new Set(emailList)];

  const handleCSVUpload = (file) => {
    Papa.parse(file, {
      complete: (parsed) => {
        const emails = parsed.data
          .flat()
          .map((v) => String(v).trim().toLowerCase())
          .filter((v) => v.includes("@"));
        setFileEmails(emails);
      },
      error: console.error,
    });
    return false;
  };

  const handleStart = () => {
    if (uniqueEmails.length === 0) return;
    startBulk(uniqueEmails);
  };

  const handleExportCSV = () => {
    if (!results.length) return;
    const csv = Papa.unparse(
      results.map((r) => ({
        email: r.email,
        status: r.status,
        score: r.scoring?.score,
        mx: r.dns?.has_mx_records,
        disposable: r.disposable?.is_disposable,
        catch_all: r.catch_all?.is_catch_all,
        smtp_valid: r.smtp?.verified,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email-validation-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = results.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; },
    { valid: 0, invalid: 0, risky: 0, unknown: 0 }
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <Title level={2} style={{ color: "#f1f5f9", margin: 0 }}>
          📋 Bulk Email Validator
        </Title>
        <Paragraph style={{ color: "#64748b", marginTop: 6 }}>
          Validate thousands of emails simultaneously. Upload CSV or paste directly.
        </Paragraph>
      </motion.div>

      <AnimatePresence mode="wait">
        {status === "idle" || status === "submitting" ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={14}>
                <div style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24 }}>
                  <Text strong style={{ color: "#94a3b8", display: "block", marginBottom: 12 }}>
                    Paste Emails (one per line, comma or semicolon separated)
                  </Text>
                  <TextArea
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    placeholder={`user@example.com\ntest@gmail.com\nadmin@company.io`}
                    rows={10}
                    style={{
                      background: "#0a0a0f", border: "1px solid #2a2a3a",
                      color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace",
                      fontSize: 12, resize: "vertical", borderRadius: 8,
                    }}
                  />
                  <Text style={{ color: "#475569", fontSize: 11, marginTop: 8, display: "block" }}>
                    {emailText.split(/[\n,;]/).filter((e) => e.trim().includes("@")).length} emails detected
                  </Text>
                </div>
              </Col>

              <Col xs={24} md={10}>
                <div style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, height: "100%" }}>
                  <Text strong style={{ color: "#94a3b8", display: "block", marginBottom: 12 }}>
                    Upload CSV / TXT File
                  </Text>
                  <Upload.Dragger
                    accept=".csv,.txt"
                    beforeUpload={handleCSVUpload}
                    showUploadList={false}
                    style={{ background: "#0a0a0f", border: "1px dashed #2a2a3a", borderRadius: 10 }}
                  >
                    <p style={{ color: "#6366f1", fontSize: 28 }}><UploadOutlined /></p>
                    <p style={{ color: "#64748b", fontSize: 13 }}>Drop CSV/TXT file here or click to browse</p>
                    {fileEmails.length > 0 && (
                      <Tag color="geekblue" style={{ marginTop: 8 }}>{fileEmails.length} emails loaded</Tag>
                    )}
                  </Upload.Dragger>

                  <Divider style={{ borderColor: "#1e1e2e" }} />

                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#64748b", fontSize: 13 }}>
                      Total unique emails:{" "}
                      <Text strong style={{ color: "#6366f1" }}>{uniqueEmails.length}</Text>
                    </Text>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    icon={<ThunderboltOutlined />}
                    onClick={handleStart}
                    loading={status === "submitting"}
                    disabled={uniqueEmails.length === 0}
                    block
                    style={{
                      background: uniqueEmails.length === 0 ? undefined : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                      border: "none", fontWeight: 700, height: 48,
                      boxShadow: uniqueEmails.length > 0 ? "0 0 20px rgba(99,102,241,0.4)" : undefined,
                    }}
                  >
                    Start Bulk Validation
                  </Button>
                </div>
              </Col>
            </Row>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {status === "processing" && (
              <div style={{ background: "#13131a", border: "1px solid #2a2a3a", borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <Text strong style={{ color: "#e2e8f0" }}>🔄 Processing {total} emails...</Text>
                  <Button size="small" onClick={reset}>Cancel</Button>
                </div>
                <Progress
                  percent={Math.round((progress / total) * 100) || 0}
                  strokeColor={{ "0%": "#6366f1", "100%": "#10b981" }}
                  trailColor="#1e1e2e"
                  status="active"
                />
              </div>
            )}

            {status === "completed" && results.length > 0 && (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  {[
                    { label: "✅ Valid", key: "valid", color: "#10b981" },
                    { label: "❌ Invalid", key: "invalid", color: "#ef4444" },
                    { label: "⚠️ Risky", key: "risky", color: "#f59e0b" },
                    { label: "❓ Unknown", key: "unknown", color: "#64748b" },
                  ].map(({ label, key, color }) => (
                    <Col xs={12} sm={6} key={key}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                        style={{
                          background: "#13131a", border: `1px solid ${color}30`,
                          borderRadius: 12, padding: "16px 20px", textAlign: "center",
                          boxShadow: `0 0 20px ${color}10`,
                        }}
                      >
                        <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "JetBrains Mono, monospace" }}>
                          {stats[key]}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#475569" }}>
                          {((stats[key] / results.length) * 100).toFixed(1)}%
                        </div>
                      </motion.div>
                    </Col>
                  ))}
                </Row>

                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <Button icon={<DownloadOutlined />} onClick={handleExportCSV} style={{ borderColor: "#2a2a3a", color: "#94a3b8" }}>
                    Export CSV
                  </Button>
                  <Button onClick={reset}>New Validation</Button>
                </div>

                <Table
                  dataSource={results.map((r, i) => ({ ...r, key: `${r.email}-${i}` }))}
                  columns={TABLE_COLUMNS}
                  size="small"
                  scroll={{ x: 800 }}
                  pagination={{ pageSize: 20, showTotal: (t) => `${t} emails`, showSizeChanger: true }}
                  style={{ background: "#13131a", borderRadius: 12, overflow: "hidden", border: "1px solid #2a2a3a" }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
