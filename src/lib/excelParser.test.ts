import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseExcel } from './excelParser';

vi.mock('xlsx', () => ({
  read: vi.fn(),
  utils: {
    sheet_to_json: vi.fn(),
  },
}));

import { read, utils } from 'xlsx';

const mockRead = read as ReturnType<typeof vi.fn>;
const mockSheetToJson = utils.sheet_to_json as ReturnType<typeof vi.fn>;

describe('parseExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw error if Excel file is empty', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([]);

    await expect(parseExcel(new ArrayBuffer(100))).rejects.toThrow(
      'Excel file appears to be empty or missing headers'
    );
  });

  it('should throw error if header row cannot be found', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['Col1', 'Col2'],
      ['Data1', 'Data2'],
    ]);

    await expect(parseExcel(new ArrayBuffer(100))).rejects.toThrow(
      'Could not find header row in Excel file'
    );
  });

  it('should find header row with UPC pattern', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['Some', 'Data'],
      ['UPC', 'Category', 'SubCategory'],
      ['123', 'Milk', 'Whole Milk'],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0].upc).toBe('123');
  });

  it('should parse products with all fields', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['Random', 'Row'],
      ['UPC', 'Category', 'SubCategory', 'Brand', 'Food', 'Size', 'UOM'],
      ['123456789', 'Dairy', 'Milk', 'BrandX', 'Whole Milk', '1', 'Gallon'],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0]).toEqual({
      upc: '123456789',
      categoryDescription: 'Dairy',
      subCategoryDescription: 'Milk',
      brandName: 'BrandX',
      foodDescription: 'Whole Milk',
      packageSize: '1',
      uom: 'Gallon',
    });
  });

  it('should skip rows with empty UPC', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['UPC', 'Category'],
      ['123', 'Milk'],
      ['', 'Cheese'],
      ['456', 'Yogurt'],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(2);
    expect(products[0].upc).toBe('123');
    expect(products[1].upc).toBe('456');
  });

  it('should handle flexible column matching', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['UPC/PLU Number', 'Category Description', 'Sub-Category Description', 'Brand Name', 'Food Description', 'Package Size', 'UOM'],
      ['001', 'Cat', 'Sub', 'B', 'F', 'S', 'U'],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(1);
    expect(products[0].upc).toBe('001');
    expect(products[0].categoryDescription).toBe('Cat');
  });

  it('should throw error if UPC column is missing', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['Category', 'Description'],
      ['Milk', 'Whole'],
    ]);

    await expect(parseExcel(new ArrayBuffer(100))).rejects.toThrow(
      'Could not find header row in Excel file'
    );
  });

  it('should parse multiple products', async () => {
    mockRead.mockReturnValue({
      SheetNames: ['Sheet1'],
      Sheets: { Sheet1: {} },
    });
    mockSheetToJson.mockReturnValue([
      ['UPC', 'Category'],
      ['001', 'Milk'],
      ['002', 'Cheese'],
      ['003', 'Yogurt'],
    ]);

    const products = await parseExcel(new ArrayBuffer(100));
    expect(products).toHaveLength(3);
  });
});
