import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetAll, mockGetDailySummary, mockGetById, mockShowToast } = vi.hoisted(() => ({
  mockGetAll: vi.fn(),
  mockGetDailySummary: vi.fn(),
  mockGetById: vi.fn(),
  mockShowToast: vi.fn(),
}));

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../salesService", () => ({
  default: {
    getAll: mockGetAll,
    getDailySummary: mockGetDailySummary,
    getById: mockGetById,
    cancel: vi.fn(),
  },
}));

import { Sales } from "../Sales";

const listSale = {
  id: "abc123",
  created_at: "2026-01-05T10:30:00.000Z",
  total_amount: 500,
  status: "completed",
};

describe("Sales details sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({
      data: [listSale],
      pagination: { totalPages: 1, total: 1 },
    });
    mockGetDailySummary.mockResolvedValue({
      data: { total_revenue: 500, sale_count: 1 },
    });
  });

  it("shows a skeleton while the full transaction is loading", async () => {
    let resolveDetails;
    mockGetById.mockImplementationOnce(() => new Promise((resolve) => {
      resolveDetails = resolve;
    }));

    render(<Sales />);

    const viewButton = await screen.findByRole("button", { name: "View transaction details" }, { timeout: 3000 });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByRole("status", { name: "Loading transaction details" })).toBeInTheDocument();
    });

    await act(async () => {
      resolveDetails({
        data: {
          ...listSale,
          items: [{ product_name: "Coffee", unit_price: 250, quantity: 2 }],
        },
      });
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading transaction details" })).not.toBeInTheDocument();
    });
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getAllByText("₱250 x 2").length).toBeGreaterThan(0);
  });

  it("falls back to the list row when the detail fetch fails", async () => {
    mockGetById.mockRejectedValueOnce(new Error("boom"));

    render(<Sales />);

    const viewButton = await screen.findByRole("button", { name: "View transaction details" }, { timeout: 3000 });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading transaction details" })).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Transaction Details/i)).toBeInTheDocument();
  });
});
