import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BackLink, EmptyState, SearchField, Sheet } from "./Sheet";

function SheetHost({ variant }: { variant?: "page" | "drawer" | "camera" }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setIsOpen(true)}>
        Open
      </button>
      {isOpen && (
        <Sheet
          title="Example"
          closeLabel="Close example"
          variant={variant}
          onClose={() => setIsOpen(false)}
        >
          <button type="button">First action</button>
          <button type="button">Last action</button>
        </Sheet>
      )}
    </div>
  );
}

function WithInitialFocus() {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Sheet title="Search" onClose={() => {}} initialFocusRef={inputRef}>
      <input ref={inputRef} aria-label="Query" />
    </Sheet>
  );
}

describe("Sheet", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it.each([
    "page",
    "drawer",
    "camera",
  ] as const)("is a modal dialog labelled by its title (%s)", (variant) => {
    render(
      <Sheet title="Example" variant={variant} onClose={() => {}}>
        body
      </Sheet>,
    );

    const dialog = screen.getByRole("dialog", { name: "Example" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <Sheet title="Example" onClose={onClose}>
        body
      </Sheet>,
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes from its close button", () => {
    const onClose = vi.fn();
    render(
      <Sheet title="Example" closeLabel="Close example" onClose={onClose}>
        body
      </Sheet>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close example" }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes the drawer when its backdrop is clicked, not its panel", () => {
    const onClose = vi.fn();
    render(
      <Sheet title="Example" variant="drawer" onClose={onClose}>
        body
      </Sheet>,
    );

    fireEvent.click(screen.getByText("body"));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("focuses the dialog on open by default", () => {
    render(
      <Sheet title="Example" onClose={() => {}}>
        body
      </Sheet>,
    );

    expect(screen.getByRole("dialog")).toHaveFocus();
  });

  it("focuses initialFocusRef on open when given", () => {
    render(<WithInitialFocus />);

    expect(screen.getByLabelText("Query")).toHaveFocus();
  });

  it("traps Tab focus inside the dialog", () => {
    render(<SheetHost />);
    fireEvent.click(screen.getByText("Open"));

    const close = screen.getByRole("button", { name: "Close example" });
    const last = screen.getByRole("button", { name: "Last action" });

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(close).toHaveFocus();

    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("pulls Tab focus back inside when it has escaped the dialog", () => {
    render(<SheetHost />);
    fireEvent.click(screen.getByText("Open"));

    screen.getByText("Open").focus();
    fireEvent.keyDown(document, { key: "Tab" });

    expect(screen.getByRole("button", { name: "Close example" })).toHaveFocus();
  });

  it("restores focus to the opener when closed", () => {
    render(<SheetHost />);
    const opener = screen.getByText("Open");
    opener.focus();
    fireEvent.click(opener);
    expect(opener).not.toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
  });

  it("locks body scroll while open and restores it on close", () => {
    document.body.style.overflow = "auto";
    const { unmount } = render(
      <Sheet title="Example" onClose={() => {}}>
        body
      </Sheet>,
    );
    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});

describe("SearchField", () => {
  afterEach(() => cleanup());

  it("reports typed text and offers a clear button only when filled", () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    const { rerender } = render(
      <SearchField
        value=""
        onChange={onChange}
        onClear={onClear}
        placeholder="Find..."
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Find..."), {
      target: { value: "milk" },
    });
    expect(onChange).toHaveBeenCalledWith("milk");

    rerender(
      <SearchField
        value="milk"
        onChange={onChange}
        onClear={onClear}
        placeholder="Find..."
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});

describe("BackLink and EmptyState", () => {
  afterEach(() => cleanup());

  it("BackLink is a button with its label", () => {
    const onClick = vi.fn();
    render(<BackLink onClick={onClick}>Back to results</BackLink>);

    fireEvent.click(screen.getByRole("button", { name: "Back to results" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("EmptyState shows its title and content", () => {
    render(
      <EmptyState icon={<span />} title="No matches found">
        <p>Try again.</p>
      </EmptyState>,
    );

    expect(
      screen.getByRole("heading", { name: "No matches found" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Try again.")).toBeInTheDocument();
  });
});
