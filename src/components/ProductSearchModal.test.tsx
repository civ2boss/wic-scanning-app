import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductSearchModal } from './ProductSearchModal';
import { searchProducts } from '../lib/productLookup';
import { checkEligibility } from '../lib/eligibility';

vi.mock('../lib/productLookup', () => ({
  searchProducts: vi.fn(),
}));

vi.mock('../lib/eligibility', () => ({
  checkEligibility: vi.fn(),
}));

describe('ProductSearchModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the search modal', () => {
    render(<ProductSearchModal onClose={() => {}} selectedParticipant={null} />);
    expect(screen.getByText('Search Products')).toBeInTheDocument();
  });

  it('should call searchProducts when query is typed', async () => {
    vi.mocked(searchProducts).mockResolvedValue({
      products: [{ upc: '1', brandName: 'BrandX', foodDescription: 'Milk', categoryDescription: 'Dairy', subCategoryDescription: 'Milk', packageSize: '1', uom: 'Gal' }],
      totalCount: 1
    });
    
    render(<ProductSearchModal onClose={() => {}} selectedParticipant={null} />);
    const input = screen.getByPlaceholderText('Type product name or brand...');
    
    fireEvent.change(input, { target: { value: 'milk' } });
    
    await waitFor(() => {
      expect(searchProducts).toHaveBeenCalledWith('milk', 30, 0, null);
    });
    
    await waitFor(() => {
      expect(screen.getByText('BrandX Milk')).toBeInTheDocument();
    });
  });

  it('should show product details when clicked', async () => {
     vi.mocked(searchProducts).mockResolvedValue({
      products: [{ upc: '1', brandName: 'BrandX', foodDescription: 'Milk', categoryDescription: 'Dairy', subCategoryDescription: 'Milk', packageSize: '1', uom: 'Gal' }],
      totalCount: 1
    });
    vi.mocked(checkEligibility).mockReturnValue({ eligible: true, reason: 'Approved' });
    
    render(<ProductSearchModal onClose={() => {}} selectedParticipant="CHILD_1_2" />);
    const input = screen.getByPlaceholderText('Type product name or brand...');
    
    fireEvent.change(input, { target: { value: 'milk' } });
    
    await waitFor(() => {
      expect(screen.getByText('BrandX Milk')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('BrandX Milk'));
    
    await waitFor(() => {
      expect(screen.getByText('Back to results')).toBeInTheDocument();
      expect(screen.getByText('WIC APPROVED')).toBeInTheDocument();
      expect(checkEligibility).toHaveBeenCalledWith('Dairy', 'Milk', 'CHILD_1_2');
    });
  });
});
