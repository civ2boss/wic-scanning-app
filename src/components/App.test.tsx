import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("renders default export without element type errors", () => {
    render(<App />);
    expect(screen.getByText("WIC Scanner")).toBeInTheDocument();
    expect(screen.getByText("Tap to Scan")).toBeInTheDocument();
    expect(screen.getByText("Search Manually")).toBeInTheDocument();
    expect(screen.getByText("WIC Foods Guide")).toBeInTheDocument();
  });
});
