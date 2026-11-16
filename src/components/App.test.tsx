import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadHousehold } from "../lib/db";
import App from "./App";

vi.mock("../lib/convex", () => ({
  convex: {
    watchQuery: vi.fn(),
  },
}));

vi.mock("./LastSyncStatus", () => ({
  default: () => <div>LastSyncStatus Mock</div>,
}));

vi.mock("./SyncManager", () => ({
  default: () => null,
}));

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders default export without element type errors", () => {
    render(<App />);
    expect(screen.getByText("WIC Scanner")).toBeInTheDocument();
    expect(screen.getByText("Tap to Scan")).toBeInTheDocument();
    expect(screen.getByText("Search Manually")).toBeInTheDocument();
    expect(screen.getByText("WIC Foods Guide")).toBeInTheDocument();
  });

  it("keeps every Household member picked in Settings", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Open Settings"));
    fireEvent.click(screen.getByText("Select Your WIC Participant"));
    fireEvent.click(screen.getByText("Pregnant"));
    fireEvent.click(screen.getByText("Infant (6-12 months)"));

    expect(
      screen.getByText("Household Participants (2)", { exact: false }),
    ).toBeInTheDocument();
    expect(loadHousehold()).toEqual(["PREGNANT", "INFANT_6_12"]);
  });

  it.each([
    ["Search Manually", "Search Products"],
    ["WIC Foods Guide", "WIC Foods Guide"],
  ])("closes the %s sheet on Escape and refocuses its opener", (opener, title) => {
    render(<App />);
    const openButton = screen
      .getByText(opener)
      .closest("button") as HTMLElement;
    openButton.focus();

    fireEvent.click(openButton);
    expect(screen.getByRole("dialog", { name: title })).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });
});
