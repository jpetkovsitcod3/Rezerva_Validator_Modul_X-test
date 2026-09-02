import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Collapse, MReveal, Stagger, MItem } from "./motion";

describe("Collapse", () => {
  it("should keep children mounted and visible when open", () => {
    render(
      <Collapse open>
        <p>expanded content</p>
      </Collapse>
    );
    expect(screen.getByText("expanded content")).toBeInTheDocument();
  });

  it("should exclude closed content from the accessibility tree and tab order", () => {
    render(
      <Collapse open={false}>
        <button>hidden action</button>
      </Collapse>
    );
    const btn = screen.getByRole("button", { name: "hidden action", hidden: true });
    const wrapper = btn.closest("[aria-hidden]") ?? btn.parentElement;
    expect(wrapper).not.toBeNull();
    const inert = (wrapper as HTMLElement).getAttribute("inert");
    expect(inert !== null || (wrapper as HTMLDivElement).inert === true).toBe(true);
  });
});

describe("MReveal / Stagger", () => {
  it("should render children for scroll-triggered reveals", () => {
    render(
      <MReveal delay={0.1}>
        <p>revealed</p>
      </MReveal>
    );
    expect(screen.getByText("revealed")).toBeInTheDocument();
  });

  it("should render all stagger items", () => {
    render(
      <Stagger stagger={0.08}>
        <MItem>
          <p>one</p>
        </MItem>
        <MItem>
          <p>two</p>
        </MItem>
      </Stagger>
    );
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
  });
});
