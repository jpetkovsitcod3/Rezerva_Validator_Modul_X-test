import axios from "axios";

// Default to a relative base so the Vite dev-server proxy (/api -> backend)
// handles requests in a browser preview. Set VITE_API_URL to an absolute
// backend URL for cross-origin deployments.
const API_BASE = import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

// Request interceptor — add timing
apiClient.interceptors.request.use((config) => {
  config._startTime = Date.now();
  return config;
});

// Response interceptor — log timing
apiClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config._startTime;
    console.debug(
      `[API] ${response.config.method?.toUpperCase()} ${response.config.url} → ${response.status} (${duration}ms)`
    );
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Request failed";
    return Promise.reject(new Error(message));
  }
);

// ---- API Functions --------------------------------------------------
export const emailApi = {
  /** Validate a single email (deep = SMTP) */
  validateSingle: (email, deep = true) =>
    apiClient.post("/validate/single", { email }, { params: { deep } }).then((r) => r.data),

  /** Quick validate (syntax + DNS only) */
  quickValidate: (email) =>
    apiClient.get(`/validate/quick/${encodeURIComponent(email)}`).then((r) => r.data),

  /** Bulk validate */
  validateBulk: (emails, webhookUrl = null) =>
    apiClient.post("/validate/bulk", { emails, webhook_url: webhookUrl }).then((r) => r.data),

  /** Poll bulk task status */
  getBulkStatus: (taskId) =>
    apiClient.get(`/validate/bulk/status/${taskId}`).then((r) => r.data),

  /** Domain info */
  getDomainInfo: (domain) =>
    apiClient.get(`/domain/${domain}`).then((r) => r.data),

  /** Health check */
  health: () =>
    apiClient.get("/health").then((r) => r.data),
};

export default apiClient;
