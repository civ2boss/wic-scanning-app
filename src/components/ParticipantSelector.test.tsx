import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ParticipantSelector } from "./ParticipantSelector";

describe("ParticipantSelector", () => {
  afterEach(() => {
    cleanup();
  });

  it("prompts for a selection when the Household is empty", () => {
    render(<ParticipantSelector value={[]} onChange={vi.fn()} />);
    expect(screen.getByText("Select Your WIC Participant")).toBeInTheDocument();
  });

  it("summarizes a multi-member Household", () => {
    render(
      <ParticipantSelector
        value={["PREGNANT", "INFANT_6_12"]}
        onChange={vi.fn()}
      />,
    );
    expect(screen.getByText("2 Household Members")).toBeInTheDocument();
  });

  it("adds an unselected member and removes a selected one", () => {
    const handleChange = vi.fn();
    render(
      <ParticipantSelector value={["PREGNANT"]} onChange={handleChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Pregnant/ }));
    fireEvent.click(screen.getByText("Child (1-2 years)"));
    expect(handleChange).toHaveBeenLastCalledWith(["PREGNANT", "CHILD_1_2"]);

    const pregnantOption = screen.getAllByRole("button", {
      name: /Pregnant/,
    })[1];
    fireEvent.click(pregnantOption);
    expect(handleChange).toHaveBeenLastCalledWith([]);
  });

  it("stays open while picking and closes on Done", () => {
    render(<ParticipantSelector value={[]} onChange={vi.fn()} />);

    expect(screen.queryByText("Child (1-2 years)")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Select Your WIC Participant"));
    fireEvent.click(screen.getByText("Child (1-2 years)"));
    expect(screen.getByText("Child (1-2 years)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Done"));
    expect(screen.queryByText("Child (1-2 years)")).not.toBeInTheDocument();
  });
});
