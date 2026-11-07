import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { listAplCategories } from "../lib/aplCategories";
import type { Product } from "../lib/db";
import { searchProducts } from "../lib/productLookup";
import { ProductSearchModal } from "./ProductSearchModal";

vi.mock("../lib/productLookup", () => ({
  searchProducts: vi.fn(),
}));

vi.mock("../lib/aplCategories", () => ({
  listAplCategories: vi.fn(),
}));

const wholeMilk: Product = {
  upc: "1",
  brandName: "BrandX",
  foodDescription: "BrandX Milk",
  categoryDescription: "MILK WHOLE",
  subCategoryDescription: "MILK WHOLE",
  packageSize: "1",
  uom: "Gal",
};

function returns(products: Product[], matchCount = products.length) {
  vi.mocked(searchProducts).mockResolvedValue({
    products,
    totalCount: products.length,
    matchCount,
  });
}

describe("ProductSearchModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listAplCategories).mockResolvedValue([]);
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ status: 0 }),
      } as Response),
    );
  });

  afterEach(() => {
    cleanup();
  });

  it("should render the search modal", () => {
    render(
      <ProductSearchModal onClose={() => {}} selectedParticipant={null} />,
    );
    expect(screen.getByText("Search Products")).toBeInTheDocument();
  });

  it("should search for typed text", async () => {
    returns([wholeMilk]);

    render(
      <ProductSearchModal onClose={() => {}} selectedParticipant={null} />,
    );
    const input = screen.getByPlaceholderText("Type product name or brand...");

    fireEvent.change(input, { target: { value: "milk" } });

    await waitFor(() => {
      expect(searchProducts).toHaveBeenCalledWith(
        expect.objectContaining({ text: "milk" }),
        30,
        0,
      );
    });

    await waitFor(() => {
      expect(screen.getByText("BrandX Milk")).toBeInTheDocument();
    });
  });

  it("should show product details when clicked", async () => {
    returns([wholeMilk]);

    render(
      <ProductSearchModal onClose={() => {}} selectedParticipant="CHILD_1_2" />,
    );
    const input = screen.getByPlaceholderText("Type product name or brand...");

    fireEvent.change(input, { target: { value: "milk" } });

    await waitFor(() => {
      expect(screen.getByText("BrandX Milk")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("BrandX Milk"));

    await waitFor(() => {
      expect(screen.getByText("Back to results")).toBeInTheDocument();
      expect(screen.getByText("WIC APPROVED")).toBeInTheDocument();
    });
  });

  describe("browsing without a name", () => {
    it("loads nothing until the shopper taps Browse all products", async () => {
      returns([wholeMilk]);

      render(<ProductSearchModal onClose={() => {}} household={[]} />);

      expect(
        screen.getByText("Search by name, brand or UPC, or pick a category."),
      ).toBeInTheDocument();
      expect(searchProducts).not.toHaveBeenCalled();

      fireEvent.click(
        screen.getByRole("button", { name: "Browse all products" }),
      );

      await waitFor(() => {
        expect(screen.getByText("BrandX Milk")).toBeInTheDocument();
      });
    });

    it("lists an APL Category's Products as soon as it is picked", async () => {
      vi.mocked(listAplCategories).mockResolvedValue([
        { key: "BREAKFAST CEREAL", label: "Breakfast Cereal" },
        { key: "MILK WHOLE", label: "Milk, Whole" },
      ]);
      returns([wholeMilk]);

      render(<ProductSearchModal onClose={() => {}} household={[]} />);

      const picker = screen.getByLabelText("Category");
      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Milk, Whole" }),
        ).toBeInTheDocument();
      });
      expect(
        Array.from((picker as HTMLSelectElement).options, (o) => o.text),
      ).toEqual(["All", "Breakfast Cereal", "Milk, Whole"]);

      fireEvent.change(picker, { target: { value: "MILK WHOLE" } });

      await waitFor(() => {
        expect(searchProducts).toHaveBeenCalledWith(
          expect.objectContaining({ category: "MILK WHOLE" }),
          30,
          0,
        );
        expect(screen.getByText("BrandX Milk")).toBeInTheDocument();
      });
    });

    it("keeps browsing after the shopper types and then clears the text", async () => {
      returns([wholeMilk]);

      render(<ProductSearchModal onClose={() => {}} household={[]} />);
      fireEvent.click(
        screen.getByRole("button", { name: "Browse all products" }),
      );
      const input = screen.getByPlaceholderText(
        "Type product name or brand...",
      );
      fireEvent.change(input, { target: { value: "x" } });
      fireEvent.change(input, { target: { value: "" } });

      await waitFor(() => {
        expect(screen.getByText("BrandX Milk")).toBeInTheDocument();
      });
      expect(
        screen.queryByRole("button", { name: "Browse all products" }),
      ).not.toBeInTheDocument();
    });

    it("browses only Products the whole Household can use when eligible only is checked", async () => {
      returns([wholeMilk]);

      render(
        <ProductSearchModal
          onClose={() => {}}
          household={["PREGNANT", "INFANT_6_12"]}
        />,
      );

      fireEvent.click(screen.getByLabelText("Show WIC eligible only"));
      fireEvent.click(
        screen.getByRole("button", { name: "Browse all eligible products" }),
      );

      await waitFor(() => {
        expect(searchProducts).toHaveBeenCalledWith(
          { text: "", category: null, household: ["PREGNANT", "INFANT_6_12"] },
          30,
          0,
        );
      });
    });
  });

  it("badges a result APPROVED when any Household member is eligible, not just the first", async () => {
    returns([
      {
        upc: "2",
        brandName: "Gerber",
        foodDescription: "Gerber Oatmeal Cereal",
        categoryDescription: "INFANT CEREAL",
        subCategoryDescription: "INFANT CEREAL",
        packageSize: "8",
        uom: "OZ",
      },
    ]);

    render(
      <ProductSearchModal
        onClose={() => {}}
        selectedParticipant="PREGNANT"
        household={["PREGNANT", "INFANT_6_12"]}
      />,
    );
    fireEvent.change(
      screen.getByPlaceholderText("Type product name or brand..."),
      { target: { value: "oatmeal" } },
    );

    await waitFor(() => {
      expect(screen.getByText("Gerber Oatmeal Cereal")).toBeInTheDocument();
    });
    expect(screen.getByText("APPROVED")).toBeInTheDocument();
    expect(screen.queryByText("NOT ELIGIBLE")).not.toBeInTheDocument();
  });

  describe("empty results", () => {
    it("says how many Products matched when none are eligible for the Household", async () => {
      returns([], 3);

      render(
        <ProductSearchModal onClose={() => {}} household={["PREGNANT"]} />,
      );
      fireEvent.click(screen.getByLabelText("Show WIC eligible only"));
      fireEvent.change(
        screen.getByPlaceholderText("Type product name or brand..."),
        { target: { value: "infant" } },
      );

      await waitFor(() => {
        expect(screen.getByText("No eligible products")).toBeInTheDocument();
      });
      expect(
        screen.getByText(
          /3 products match, but none are eligible for your household/i,
        ),
      ).toBeInTheDocument();
      expect(screen.queryByText("No matches found")).not.toBeInTheDocument();
    });

    it("blames the search, not Eligibility, when nothing matches at all", async () => {
      returns([], 0);

      render(
        <ProductSearchModal onClose={() => {}} household={["PREGNANT"]} />,
      );
      fireEvent.click(screen.getByLabelText("Show WIC eligible only"));
      fireEvent.change(
        screen.getByPlaceholderText("Type product name or brand..."),
        { target: { value: "cheerois" } },
      );

      await waitFor(() => {
        expect(screen.getByText("No matches found")).toBeInTheDocument();
      });
      expect(
        screen.queryByText("No eligible products"),
      ).not.toBeInTheDocument();
    });
  });

  it("names produce by its description, not the APL's 'Not Available' brand", async () => {
    returns([
      {
        upc: "4131",
        brandName: "Not Available",
        foodDescription: "Apples; Alkmene",
        categoryDescription: "FRUITS AND VEGETABLES CASH VALUE BENEFIT",
        subCategoryDescription: "FRESH FRUITS",
        packageSize: "1",
        uom: "LB",
      },
    ]);

    render(
      <ProductSearchModal onClose={() => {}} selectedParticipant={null} />,
    );
    fireEvent.change(
      screen.getByPlaceholderText("Type product name or brand..."),
      { target: { value: "apples" } },
    );

    await waitFor(() => {
      expect(screen.getByText("Apples; Alkmene")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Apples; Alkmene"));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Apples; Alkmene" }),
      ).toBeInTheDocument();
    });
  });
});
