import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockGetAll, mockGetById, mockGetCategories, mockGetLowStock, mockGetInventory, mockAddStock, mockShowToast } =
  vi.hoisted(() => ({
    mockGetAll: vi.fn(),
    mockGetById: vi.fn(),
    mockGetCategories: vi.fn(),
    mockGetLowStock: vi.fn(),
    mockGetInventory: vi.fn(),
    mockAddStock: vi.fn(),
    mockShowToast: vi.fn(),
  }));

vi.mock("../../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

vi.mock("../../../hooks/useHardwareScanner", () => ({
  useHardwareScanner: () => {},
}));

vi.mock("../productService", () => ({
  default: {
    getAll: mockGetAll,
    getById: mockGetById,
    getCategories: mockGetCategories,
    getLowStock: mockGetLowStock,
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    bulkImport: vi.fn(),
    uploadImages: vi.fn(),
  },
}));

vi.mock("../../inventory/inventoryService", () => ({
  default: {
    getAll: mockGetInventory,
    addStock: mockAddStock,
  },
}));

import { Products } from "../Products";

const listProduct = {
  id: 7,
  name: "Cold Brew",
  barcode: "111",
  category: "Drinks",
  unit_price: 150,
  stock_quantity: 4,
  low_stock_threshold: 5,
  unit: "pcs",
};

const openEditSheet = async () => {
  const trigger = await screen.findByRole("button", { name: "Product actions" }, { timeout: 3000 });
  fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
  const editItem = await screen.findByRole("menuitem", { name: /Edit/i });
  await act(async () => {
    fireEvent.click(editItem);
  });
};

describe("Products edit sheet", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({
      data: [listProduct],
      pagination: { totalPages: 1, total: 1 },
    });
    mockGetInventory.mockResolvedValue({ data: [] });
    mockGetCategories.mockResolvedValue({ data: ["Drinks"] });
  });

  it("shows a form skeleton while the product details are loading", async () => {
    let resolveDetails;
    mockGetById.mockImplementationOnce(() => new Promise((resolve) => {
      resolveDetails = resolve;
    }));

    render(<Products />);
    await openEditSheet();

    await waitFor(() => {
      expect(screen.getByRole("status", { name: "Loading product details" })).toBeInTheDocument();
    });

    await act(async () => {
      resolveDetails({ data: { ...listProduct, description: "Slow-steeped" } });
    });

    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading product details" })).not.toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Cold Brew")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Slow-steeped")).toBeInTheDocument();
  });

  it("falls back to the list row when the detail fetch fails", async () => {
    mockGetById.mockRejectedValueOnce(new Error("boom"));

    render(<Products />);
    await openEditSheet();

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith("Failed to fetch product details", "error");
    });
    await waitFor(() => {
      expect(screen.queryByRole("status", { name: "Loading product details" })).not.toBeInTheDocument();
    });
    expect(screen.getByDisplayValue("Cold Brew")).toBeInTheDocument();
  });
});
