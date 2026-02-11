import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductForm } from '../ProductForm';

describe('ProductForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  it('renders correctly for new product', () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={false} />);
    expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Save Product/i)).toBeInTheDocument();
  });

  it('fills data when editing a product', () => {
    const product = { name: 'Test Product', price: 50, stock: 10 };
    render(<ProductForm product={product} onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={false} />);
    expect(screen.getByDisplayValue('Test Product')).toBeInTheDocument();
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
  });

  it('calls onSubmit with form data', async () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={false} />);
    
    fireEvent.change(screen.getByLabelText(/Product Name/i), { target: { value: 'New Item' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '99.99' } });
    fireEvent.change(screen.getByLabelText(/Initial Stock/i), { target: { value: '10' } });
    
    fireEvent.submit(screen.getByRole('button', { name: /Save Product/i }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Item',
      price: '99.99',
      stock: '10'
    }));
  });

  it('updates button text and disables it when loading', () => {
    render(<ProductForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} loading={true} />);
    const submitButton = screen.getByRole('button', { name: /Save Product/i });
    expect(submitButton).toBeDisabled();
  });
});
