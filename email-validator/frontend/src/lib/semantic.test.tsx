import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SuiButton, SuiDivider, SuiMessage, SuiProgress, SuiRating } from "./semantic";

describe("SuiButton", () => {
  it("should render an animated hidden layer as decorative content", () => {
    render(
      <SuiButton hidden={<>25 credits included</>}>Start free</SuiButton>
    );
    expect(screen.getByRole("button", { name: "Start free" })).toBeInTheDocument();
    const hidden = screen.getByText("25 credits included");
    expect(hidden.closest("[aria-hidden]")).not.toBeNull();
  });

  it("should show a working state and disable while loading", () => {
    const onClick = vi.fn();
    render(
      <SuiButton loading onClick={onClick}>
        Save
      </SuiButton>
    );
    const btn = screen.getByRole("button", { name: "Working…" });
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("should render as a link when href is provided", () => {
    render(
      <SuiButton href="#/signup" hidden={<>no card</>}>
        Try it free
      </SuiButton>
    );
    const link = screen.getByRole("link", { name: "Try it free" });
    expect(link).toHaveAttribute("href", "#/signup");
  });
});

describe("SuiRating", () => {
  it("should expose five radio options and report the chosen value", () => {
    const onRate = vi.fn();
    render(<SuiRating value={0} onRate={onRate} />);
    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(5);
    fireEvent.click(radios[2]);
    expect(onRate).toHaveBeenCalledWith(3);
  });

  it("should mark the selected star as checked", () => {
    render(<SuiRating value={4} onRate={() => {}} />);
    const radios = screen.getAllByRole("radio");
    expect(radios[3]).toHaveAttribute("aria-checked", "true");
    expect(radios[4]).toHaveAttribute("aria-checked", "false");
  });
});

describe("SuiProgress", () => {
  it("should publish progressbar semantics with the clamped value", () => {
    render(<SuiProgress value={40} label="processing queue" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("should clamp above-max values to 100", () => {
    render(<SuiProgress value={500} max={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});

describe("SuiMessage", () => {
  it("should announce as an alert with its title", () => {
    render(
      <SuiMessage tone="danger" title="Rate limit">
        slow down
      </SuiMessage>
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Rate limit");
    expect(alert).toHaveTextContent("slow down");
  });

  it("should offer dismissal when onClose is given", () => {
    const onClose = vi.fn();
    render(
      <SuiMessage tone="info" title="Notice" onClose={onClose}>
        body
      </SuiMessage>
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss message" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("SuiDivider", () => {
  it("should render a labelled separator", () => {
    render(<SuiDivider label="one-click demo" />);
    const sep = screen.getByRole("separator");
    expect(sep).toHaveAttribute("aria-label", "one-click demo");
    expect(sep).toHaveTextContent("one-click demo");
  });
});
