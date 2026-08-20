import { useState } from "react";
import {
  Upload, Button, Table, Tag, Progress, Typography,
  Row, Col, Divider, Input, Empty, Spin,
} from "antd";
import {
  UploadOutlined, ThunderboltOutlined, DownloadOutlined,
  CheckCircleOutlined, CloseCircleOutlined,
  WarningOutlined, QuestionCircleOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { useBulkValidation } from "../../hooks/useValidation";
import { DURATIONS, EASES } from "../../motion/tokens";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const STATUS_TAG = {
  valid: <Tag icon={<CheckCircleOutlined />} color="success">Valid</Tag>,
  invalid: <Tag icon={<CloseCircleOutlined />} color="error">Invalid</Tag>,
  risky: <Tag icon={<WarningOutlined />} color="warning">Risky</Tag>,
  unknown: <Tag icon={<QuestionCircleOutlined />} color="default">Unknown</Tag>,
};

const scoreColor = (score) =>
  score >= 75 ? "#34D399" : score >= 45 ? "#FBBF24" : "#F87171";

const TABLE_COLUMNS = [
  {
    title: "#", dataIndex: "index", key: "index", width: 50,
    render: (_, __, i) => <Text style={{ color: "#4A5260", fontSize: 12 }}>{i + 1}</Text>,
  },
  {
    title: "Email", dataIndex: "email", key: "email",
    render: (email) => (
      <Text copyable style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#E6EDF3" }}>
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
      const color = scoreColor(score);
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Progress
            percent={score} showInfo={false} strokeColor={color}
            trailColor="#181F2A" size="small" style={{ width: 50, margin: 0 }}
          />
          <Text style={{ color, fontSize: 11, fontWeight: 700 }}>{score}</Text>
        </div>
      );
    },
  },
  {
    title: "MX", dataIndex: ["dns", "has_mx_records"], key: "mx", width: 50,
    render: (v) => v ? <Text style={{ color: "#34D399" }}>✓</Text> : <Text style={{ color: "#F87171" }}>✗</Text>,
  },
  {
    title: "Disposable", dataIndex: ["disposable", "is_disposable"], key: "disposable", width: 90,
    render: (v) => v ? <Tag color="error" style={{ fontSize: 10 }}>Yes</Tag> : <Tag color="green" style={{ fontSize: 10 }}>No</Tag>,
  },
  {
    title: "Time (ms)", dataIndex: "processing_time_ms", key: "time", width: 90,
    sorter: (a, b) => (a.processing_time_ms || 0) - (b.processing_time_ms || 0),
    render: (ms) => <Text style={{ color: "#4A5260", fontSize: 11 }}>{ms ? ms.toFixed(0) : "—"}</Text>,
  },
];

export default function BulkValidator() {
  const [emailText, setEmailText] = useState("");
  const [fileEmails, setFileEmails] = useState([]);
  const { status, results, progress, total, startBulk, reset } = useBulkValidation();

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
        <Title level={2} style={{ color: "#F2F6FC", margin: 0 }}>
          📋 Bulk Email Validator
        </Title>
        <Paragraph style={{ color: "#6B7785", marginTop: 6 }}>
          Validate thousands of emails simultaneously. Upload CSV or paste directly.
        </Paragraph>
      </motion.div>

      <AnimatePresence mode="wait">
        {status === "idle" || status === "submitting" ? (
          <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Row gutter={[20, 20]}>
              <Col xs={24} md={14}>
                <div style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, padding: 24 }}>
                  <Text strong style={{ color: "#9AA7B8", display: "block", marginBottom: 12 }}>
                    Paste Emails (one per line, comma or semicolon separated)
                  </Text>
                  <TextArea
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    placeholder={`user@example.com\ntest@gmail.com\nadmin@company.io`}
                    rows={10}
                    style={{
                      background: "#0A0B0E", border: "1px solid #222A36",
                      color: "#E6EDF3", fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12, resize: "vertical", borderRadius: 8,
                    }}
                  />
                  <Text style={{ color: "#4A5260", fontSize: 11, marginTop: 8, display: "block" }}>
                    {/* B10: use uniqueEmails (text + file) so the hint matches the actual count */}
                    {uniqueEmails.length} emails detected
                  </Text>
                </div>
              </Col>

              <Col xs={24} md={10}>
                <div style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, padding: 24, height: "100%" }}>
                  <Text strong style={{ color: "#9AA7B8", display: "block", marginBottom: 12 }}>
                    Upload CSV / TXT File
                  </Text>
                  <Upload.Dragger
                    accept=".csv,.txt"
                    beforeUpload={handleCSVUpload}
                    showUploadList={false}
                    style={{ background: "#0A0B0E", border: "1px dashed #222A36", borderRadius: 10 }}
                  >
                    <p style={{ color: "#2CC9E8", fontSize: 28 }}><UploadOutlined /></p>
                    <p style={{ color: "#6B7785", fontSize: 13 }}>Drop CSV/TXT file here or click to browse</p>
                    {fileEmails.length > 0 && (
                      <Tag color="geekblue" style={{ marginTop: 8 }}>{fileEmails.length} emails loaded</Tag>
                    )}
                  </Upload.Dragger>

                  <Divider style={{ borderColor: "#181F2A" }} />

                  <div style={{ marginBottom: 16 }}>
                    <Text style={{ color: "#6B7785", fontSize: 13 }}>
                      Total unique emails:{" "}
                      <Text strong style={{ color: "#2CC9E8" }}>{uniqueEmails.length}</Text>
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
                      fontWeight: 700, height: 48,
                    }}
                  >
                    Start Bulk Validation
                  </Button>
                </div>
              </Col>
            </Row>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: DURATIONS.exit, ease: EASES.exit } }}
          >
            {status === "processing" && (
              <div style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Spin size="small" />
                    <Text strong style={{ color: "#E6EDF3" }}>Processing {total} emails...</Text>
                  </div>
                  <Button size="small" onClick={reset}>Cancel</Button>
                </div>
                <Progress
                  percent={Math.round((progress / total) * 100) || 0}
                  strokeColor={{ "0%": "#2CC9E8", "100%": "#34D399" }}
                  trailColor="#181F2A"
                  status="active"
                />
                <Text style={{ color: "#6B7785", fontSize: 12, display: "block", marginBottom: 12 }}>
                  Validating layer by layer — {progress} of {total} processed
                </Text>
                {/* Placeholder rows so the results area has visual weight while processing */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 44, borderRadius: 8,
                        background: "#181F2A", border: "1px solid #222A36",
                        opacity: 1 - i * 0.25,
                        position: "relative", overflow: "hidden",
                      }}
                    >
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(90deg, transparent, rgba(44,201,232,0.06), transparent)",
                        animation: `shimmer 1.6s ${i * 0.15}s infinite`,
                      }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === "completed" && results.length === 0 && (
              <div style={{ background: "#11141B", border: "1px solid #222A36", borderRadius: 16, padding: "40px 24px" }}>
                <Empty description="No results returned" />
                <div style={{ textAlign: "center", marginTop: 16 }}>
                  <Button icon={<ThunderboltOutlined />} onClick={reset}>New Validation</Button>
                </div>
              </div>
            )}

            {status === "completed" && results.length > 0 && (
              <>
                <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                  {[
                    { label: "✅ Valid", key: "valid", color: "#34D399" },
                    { label: "❌ Invalid", key: "invalid", color: "#F87171" },
                    { label: "⚠️ Risky", key: "risky", color: "#FBBF24" },
                    { label: "❓ Unknown", key: "unknown", color: "#6B7785" },
                  ].map(({ label, key, color }) => (
                    <Col xs={12} sm={6} key={key}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: DURATIONS.enter, ease: EASES.enter }}
                        style={{
                          background: "#11141B", border: `1px solid ${color}30`,
                          borderRadius: 12, padding: "16px 20px", textAlign: "center",
                          boxShadow: `0 0 20px ${color}10`,
                        }}
                      >
                        <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'JetBrains Mono', monospace" }}>
                          {stats[key]}
                        </div>
                        <div style={{ fontSize: 11, color: "#6B7785", marginTop: 4 }}>{label}</div>
                        <div style={{ fontSize: 11, color: "#4A5260" }}>
                          {((stats[key] / results.length) * 100).toFixed(1)}%
                        </div>
                      </motion.div>
                    </Col>
                  ))}
                </Row>

                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <Button icon={<DownloadOutlined />} onClick={handleExportCSV} style={{ borderColor: "#222A36", color: "#9AA7B8" }}>
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
                  style={{ background: "#11141B", borderRadius: 12, overflow: "hidden", border: "1px solid #222A36" }}
                />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
