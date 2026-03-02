import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupProduct, isWICApproved } from './productLookup';
import { db } from './db';

vi.mock('./db', () => ({
  db: {
    products: {
      get: vi.fn(),
    },
  },
}));

const mockDb = db as ReturnType<typeof vi.fn> & {
  products: {
    get: ReturnType<typeof vi.fn>;
  };
};

describe('lookupProduct', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return product when found', async () => {
    const mockProduct = {
      upc: '123456789',
      categoryDescription: 'Dairy',
      subCategoryDescription: 'Milk',
      brandName: 'BrandX',
      foodDescription: 'Whole Milk',
      packageSize: '1',
      uom: 'Gallon',
    };

    mockDb.products.get.mockResolvedValue(mockProduct);

    const result = await lookupProduct('123456789');
    expect(result).toEqual(mockProduct);
    expect(mockDb.products.get).toHaveBeenCalledWith('123456789');
  });

  it('should return null when product not found', async () => {
    mockDb.products.get.mockResolvedValue(undefined);

    const result = await lookupProduct('999999999');
    expect(result).toBeNull();
  });

  it('should return null on error', async () => {
    mockDb.products.get.mockRejectedValue(new Error('Database error'));

    const result = await lookupProduct('123456789');
    expect(result).toBeNull();
  });
});

describe('isWICApproved', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when product exists', async () => {
    mockDb.products.get.mockResolvedValue({
      upc: '123456789',
      categoryDescription: 'Dairy',
      subCategoryDescription: 'Milk',
      brandName: 'BrandX',
      foodDescription: 'Whole Milk',
      packageSize: '1',
      uom: 'Gallon',
    });

    const result = await isWICApproved('123456789');
    expect(result).toBe(true);
  });

  it('should return false when product does not exist', async () => {
    mockDb.products.get.mockResolvedValue(undefined);

    const result = await isWICApproved('999999999');
    expect(result).toBe(false);
  });

  it('should return false on error', async () => {
    mockDb.products.get.mockRejectedValue(new Error('Database error'));

    const result = await isWICApproved('123456789');
    expect(result).toBe(false);
  });
});
