import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductForm } from '../ProductForm';

vi.mock('../productService', () => ({
  default: {
    getCategories: vi.fn().mockResolvedValue({ data: [] }),
    uploadImages: vi.fn().mockResolvedValue({}),
  },
}));

describe('ProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly for new product', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={false} />);
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Product/i)).toBeInTheDocument();
    await act(async () => {});
  });

  it('fills data when editing a product', async () => {
    const product = { name: 'Test Product', price: 50, stock: 10 };
    render(<ProductForm product={product} onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={false} />);
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    await act(async () => {});
  });

  it('calls onSubmit with form data', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={false} />);
    
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '99.99' } });
    fireEvent.change(screen.getByLabelText(/Initial Stock/i), { target: { value: '10' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /Save Product/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'New Item',
        unit_price: '99.99',
        stock_quantity: '10'
      }));
    });
  });

  it('updates button text and disables it when loading', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={true} />);
    const submitButton = screen.getByRole('button', { name: /Save Product/i });
    expect(submitButton).toBeDisabled();
    await act(async () => {});
  });
});
