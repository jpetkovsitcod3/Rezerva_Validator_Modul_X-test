import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../lib/auth";
import { ToastProvider } from "./ui";
import { LoginPage } from "./Auth";

function renderLogin() {
  return render(
    <AuthProvider>
      <ToastProvider>
        <LoginPage />
      </ToastProvider>
    </AuthProvider>
  );
}

beforeEach(() => {
  window.location.hash = "";
  localStorage.clear();
});

describe("LoginPage", () => {
  it("should expose accessible email and password fields", () => {
    renderLogin();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in to dashboard/i })).toBeInTheDocument();
  });

  it("should fill credentials from the one-click demo buttons", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /demo admin/i }));
    expect(screen.getByLabelText("Email")).toHaveValue("admin@bridge.demo");
    expect(screen.getByLabelText("Password")).toHaveValue("demo1234");
  });

  it("should show a visible error for invalid credentials", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.type(screen.getByLabelText("Email"), "user@bridge.demo");
    await user.type(screen.getByLabelText("Password"), "definitely-wrong");
    await user.click(screen.getByRole("button", { name: /sign in to dashboard/i }));
    const alert = await screen.findByRole("alert", {}, { timeout: 4000 });
    expect(alert).toHaveTextContent(/invalid email or password/i);
  });

  it("should route an admin to the admin console on success", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /demo admin/i }));
    await user.click(screen.getByRole("button", { name: /sign in to dashboard/i }));
    await waitFor(() => expect(window.location.hash).toBe("#/admin"), { timeout: 4000 });
  });

  it("should route a regular user to the dashboard on success", async () => {
    const user = userEvent.setup();
    renderLogin();
    await user.click(screen.getByRole("button", { name: /^demo user/i }));
    await user.click(screen.getByRole("button", { name: /sign in to dashboard/i }));
    await waitFor(() => expect(window.location.hash).toBe("#/app"), { timeout: 4000 });
  });
});
