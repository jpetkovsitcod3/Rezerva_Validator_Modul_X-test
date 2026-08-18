import { useState, useCallback, useRef } from "react";
import { emailApi } from "../services/api";
import { notification } from "antd";

export function useSingleValidation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const abortRef = useRef(null);

  const validate = useCallback(async (email, deep = true) => {
    if (!email?.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await emailApi.validateSingle(email.trim(), deep);
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 50));
      return data;
    } catch (err) {
      const msg = err.message || "Validation failed";
      setError(msg);
      notification.error({
        message: "Validation Error",
        description: msg,
        placement: "topRight",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, history, validate, reset };
}

export function useBulkValidation() {
  const [taskId, setTaskId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const pollRef = useRef(null);

  const startBulk = useCallback(async (emails) => {
    setStatus("submitting");
    setResults([]);
    setProgress(0);
    setTotal(emails.length);

    try {
      const response = await emailApi.validateBulk(emails);
      setTaskId(response.task_id);
      setStatus("processing");

      // Poll for results
      if (response.task_id !== "sync") {
        pollRef.current = setInterval(async () => {
          try {
            const statusData = await emailApi.getBulkStatus(response.task_id);
            if (statusData.progress) setProgress(statusData.progress);

            if (statusData.status === "success" || statusData.status === "completed") {
              clearInterval(pollRef.current);
              setResults(statusData.results || []);
              setStatus("completed");
              notification.success({
                message: "Bulk Validation Complete",
                description: `Processed ${emails.length} emails`,
              });
            } else if (statusData.status === "failure") {
              clearInterval(pollRef.current);
              setStatus("error");
            }
          } catch (err) {
            clearInterval(pollRef.current);
            setStatus("error");
          }
        }, 2000);
      } else if (response.results) {
        setResults(response.results);
        setStatus("completed");
      }
    } catch (err) {
      setStatus("error");
      notification.error({
        message: "Bulk validation failed",
        description: err.message,
      });
    }
  }, []);

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setTaskId(null);
    setStatus("idle");
    setResults([]);
    setProgress(0);
    setTotal(0);
  }, []);

  return {
    taskId, status, results, progress,
    total, startBulk, reset,
  };
}
