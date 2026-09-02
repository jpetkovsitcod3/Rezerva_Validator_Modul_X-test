import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Modal, Pagination, StatusBadge } from "./ui";

describe("Modal", () => {
  it("should render title and children when open", () => {
    render(
      <Modal open onClose={() => {}} title="Trace details">
        <p>layer breakdown</p>
      </Modal>
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Trace details")).toBeInTheDocument();
    expect(screen.getByText("layer breakdown")).toBeInTheDocument();
  });

  it("should render nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Hidden">
        <p>body</p>
      </Modal>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("should call onClose when Escape is pressed", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Esc test">
        <p>body</p>
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when the backdrop is clicked and lock body scroll", () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Backdrop test">
        <p>body</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Pagination", () => {
  it("should disable Prev on the first page and advance forward", () => {
    const onPage = vi.fn();
    render(<Pagination page={1} pages={3} onPage={onPage} />);
    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onPage).toHaveBeenCalledWith(2);
  });

  it("should disable Next on the last page", () => {
    render(<Pagination page={3} pages={3} onPage={() => {}} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("should render nothing for single-page results", () => {
    const { container } = render(<Pagination page={1} pages={1} onPage={() => {}} />);
    expect(container.firstChild).toBeNull();
  });
});

describe("StatusBadge", () => {
  it("should label each verdict status", () => {
    render(
      <>
        <StatusBadge status="valid" />
        <StatusBadge status="risky" />
        <StatusBadge status="invalid" />
      </>
    );
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(screen.getByText("Risky")).toBeInTheDocument();
    expect(screen.getByText("Invalid")).toBeInTheDocument();
  });
});
