import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const {
  mockGetByBarcode,
  mockGetAll,
  mockCreate,
  mockShowToast,
  mockUseHardwareScanner,
} = vi.hoisted(() => ({
  mockGetByBarcode: vi.fn(),
  mockGetAll: vi.fn(),
  mockCreate: vi.fn(),
  mockShowToast: vi.fn(),
  mockUseHardwareScanner: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Link: "a",
}));

vi.mock("../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../../hooks/useHardwareScanner", () => ({
  useHardwareScanner: mockUseHardwareScanner,
}));

vi.mock("../products/productService", () => ({
  default: {
    getByBarcode: mockGetByBarcode,
    getAll: mockGetAll,
  },
}));

vi.mock("../sales/salesService", () => ({
  default: {
    create: mockCreate,
  },
}));

import { Scanner } from "./Scanner";

const product = {
  id: 1,
  name: "Coffee",
  barcode: "12345",
  unit_price: 100,
};

describe("Scanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHardwareScanner.mockImplementation(() => {});
    mockGetAll.mockResolvedValue({ data: [] });
  });

  it("includes VAT in the total and payment payload", async () => {
    mockGetByBarcode.mockResolvedValueOnce({ data: product });
    mockCreate.mockResolvedValueOnce({
      data: { total_amount: 112, payment_received: 112, change_given: 0 },
    });

    render(<Scanner />);

    fireEvent.change(screen.getByPlaceholderText("Scan or type barcode..."), {
      target: { value: "12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enter" }));

    await waitFor(() => expect(screen.getByText("Coffee")).toBeInTheDocument());
    expect(screen.getByText("VAT (12%)")).toBeInTheDocument();
    expect(screen.getByText("₱12")).toBeInTheDocument();
    expect(screen.getAllByText("₱112").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText("0.00"), {
      target: { value: "112" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Complete Sale/i }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount_paid: 112,
        discount: 0,
        items: [{ product_id: 1, quantity: 1, unit_price: 100 }],
      })
    );
  });

  it("shows a skeleton while product search is loading", async () => {
    let resolveSearch;
    mockGetAll.mockImplementationOnce(() => new Promise((resolve) => {
      resolveSearch = resolve;
    }));

    render(<Scanner />);
    fireEvent.change(screen.getByPlaceholderText("Search products by name or barcode..."), {
      target: { value: "co" },
    });

    await waitFor(() => {
      expect(screen.getByRole("status", { name: "Loading search results" })).toBeInTheDocument();
    }, { timeout: 1000 });

    await act(async () => {
      resolveSearch({ data: [product] });
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading search results" })).not.toBeInTheDocument();
      expect(screen.getByText("Coffee")).toBeInTheDocument();
    });
  });
});
