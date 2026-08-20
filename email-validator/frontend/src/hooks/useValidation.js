import { useState, useCallback, useRef, useEffect } from "react";
import { notification } from "antd";
import { emailApi } from "../services/api";

export function useSingleValidation() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  // B5: guard against out-of-order responses so a quick re-validate can't
  // overwrite a fresh result with a stale one that resolved later.
  const reqIdRef = useRef(0);

  const validate = useCallback(async (email, deep = true) => {
    if (!email?.trim()) return;
    const myId = ++reqIdRef.current;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await emailApi.validateSingle(email.trim(), deep);
      if (myId !== reqIdRef.current) return; // a newer request superseded this one
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 50));
      return data;
    } catch (err) {
      if (myId !== reqIdRef.current) return;
      const msg = err.message || "Validation failed";
      setError(msg);
      notification.error({
        message: "Validation Error",
        description: msg,
        placement: "topRight",
        duration: 4,
      });
    } finally {
      if (myId === reqIdRef.current) setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    reqIdRef.current++;
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

  // B4: clear the polling interval on unmount so we never setState on an
  // unmounted component or leave a zombie timer.
  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

  const startBulk = useCallback(async (emails) => {
    setStatus("submitting");
    setResults([]);
    setProgress(0);
    setTotal(emails.length);

    try {
      const response = await emailApi.validateBulk(emails);
      setTaskId(response.task_id);
      setStatus("processing");

      if (response.task_id !== "sync") {
        pollRef.current = setInterval(async () => {
          try {
            const statusData = await emailApi.getBulkStatus(response.task_id);
            if (statusData.total) setTotal(statusData.total);
            if (statusData.progress != null) setProgress(statusData.progress);

            if (statusData.status === "success" || statusData.status === "completed") {
              if (pollRef.current) clearInterval(pollRef.current);
              setResults(statusData.results || []);
              setStatus("completed");
              notification.success({
                message: "Bulk Validation Complete",
                description: `Processed ${emails.length} emails`,
              });
            } else if (statusData.status === "failure") {
              if (pollRef.current) clearInterval(pollRef.current);
              setStatus("error");
            }
          } catch {
            if (pollRef.current) clearInterval(pollRef.current);
            setStatus("error");
          }
        }, 2000);
      } else if (response.results) {
        setResults(response.results);
        setProgress(response.results.length);
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
