import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import {
  AuthProvider,
  BootSplash,
  Guard,
  currentRoute,
  navigate,
  useAuth,
  useRoute,
} from "./auth";
import { apiLogin, apiLogout, apiSignup, fetchSessionUser } from "./db";
import { ReactNode } from "react";

vi.mock("./db", async () => {
  const actual = await vi.importActual("./db");
  return {
    ...actual,
    apiLogin: vi.fn(),
    apiSignup: vi.fn(),
    apiLogout: vi.fn(),
    fetchSessionUser: vi.fn(),
    resetDemoData: vi.fn(),
  };
});

beforeEach(() => {
  window.location.hash = "";
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("hash router", () => {
  it("should resolve the default route when no hash is set", () => {
    expect(currentRoute()).toBe("/");
  });

  it("should parse app routes from the hash", () => {
    window.location.hash = "#/app/history";
    expect(currentRoute()).toBe("/app/history");
  });

  it("should treat landing anchors as the landing route", () => {
    window.location.hash = "#features";
    expect(currentRoute()).toBe("/");
  });

  it("should navigate by writing the hash", () => {
    navigate("/login");
    expect(window.location.hash).toBe("#/login");
    expect(currentRoute()).toBe("/login");
  });

  it("should notify useRoute subscribers on hash changes", () => {
    const { result } = renderHook(() => useRoute());
    expect(result.current).toBe("/");
    act(() => {
      window.location.hash = "#/admin/users";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    });
    expect(result.current).toBe("/admin/users");
  });
});

describe("AuthProvider", () => {
  it("should boot and restore session from fetchSessionUser", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 10, createdAt: Date.now() };
    (fetchSessionUser as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.booting).toBe(true);
    expect(result.current.user).toBeNull();

    await waitFor(() => expect(result.current.booting).toBe(false));
    expect(result.current.user).toEqual(mockUser);
  });

  it("should boot with null user when no session", async () => {
    (fetchSessionUser as any).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.booting).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it("should login and set user", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 10, createdAt: Date.now() };
    (apiLogin as any).mockResolvedValue(mockUser);
    (fetchSessionUser as any).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.booting).toBe(false));

    const user = await act(async () => result.current.login("test@x.io", "password123"));
    expect(user).toEqual(mockUser);
    expect(result.current.user).toEqual(mockUser);
    expect(apiLogin).toHaveBeenCalledWith("test@x.io", "password123");
  });

  it("should signup and set user", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 25, createdAt: Date.now() };
    (apiSignup as any).mockResolvedValue(mockUser);
    (fetchSessionUser as any).mockResolvedValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.booting).toBe(false));

    const user = await act(async () => result.current.signup("Test User", "test@x.io", "password123"));
    expect(user).toEqual(mockUser);
    expect(result.current.user).toEqual(mockUser);
    expect(apiSignup).toHaveBeenCalledWith("Test User", "test@x.io", "password123");
  });

  it("should logout, clear user and navigate to landing", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 10, createdAt: Date.now() };
    (fetchSessionUser as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.booting).toBe(false));
    expect(result.current.user).toEqual(mockUser);

    act(() => result.current.logout());
    expect(apiLogout).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
    expect(window.location.hash).toBe("#/");
  });

  it("should refresh user from session", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 10, createdAt: Date.now() };
    (fetchSessionUser as any).mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.booting).toBe(false));

    const updatedUser = { ...mockUser, credits: 50 };
    (fetchSessionUser as any).mockResolvedValue(updatedUser);
    await act(async () => result.current.refresh());
    expect(result.current.user).toEqual(updatedUser);
  });
});

describe("BootSplash", () => {
  it("should render spinner and text", () => {
    render(<BootSplash />);
    expect(screen.getByText("Warming SMTP pools…")).toBeInTheDocument();
    expect(screen.getByText("Warming SMTP pools…").closest("div")).toBeInTheDocument();
  });
});

describe("Guard", () => {
  const renderWithGuard = (children: ReactNode, admin?: boolean) =>
    render(
      <AuthProvider>
        <Guard admin={admin}>{children}</Guard>
      </AuthProvider>
    );

  it("should show BootSplash while booting", () => {
    (fetchSessionUser as any).mockImplementation(() => new Promise(() => {})); // never resolves
    renderWithGuard(<div data-testid="content">Content</div>);
    expect(screen.getByText("Warming SMTP pools…")).toBeInTheDocument();
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
  });

  it("should redirect to login when no user", async () => {
    (fetchSessionUser as any).mockResolvedValue(null);
    renderWithGuard(<div data-testid="content">Content</div>);
    await waitFor(() => expect(window.location.hash).toBe("#/login"));
  });

  it("should render children when user exists", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 10, createdAt: Date.now() };
    (fetchSessionUser as any).mockResolvedValue(mockUser);
    renderWithGuard(<div data-testid="content">Content</div>);
    await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
  });

  it("should redirect non-admin to /app when admin=true", async () => {
    const mockUser = { id: "u_1", name: "Test", email: "test@x.io", role: "user" as const, status: "active" as const, credits: 10, createdAt: Date.now() };
    (fetchSessionUser as any).mockResolvedValue(mockUser);
    renderWithGuard(<div data-testid="content">Admin Content</div>, true);
    await waitFor(() => expect(window.location.hash).toBe("#/app"));
  });

  it("should render children for admin when admin=true", async () => {
    const mockUser = { id: "u_admin", name: "Admin", email: "admin@x.io", role: "admin" as const, status: "active" as const, credits: 99999, createdAt: Date.now() };
    (fetchSessionUser as any).mockResolvedValue(mockUser);
    renderWithGuard(<div data-testid="content">Admin Content</div>, true);
    await waitFor(() => expect(screen.getByTestId("content")).toBeInTheDocument());
  });
});
