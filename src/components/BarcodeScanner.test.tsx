import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import BarcodeScanner from './BarcodeScanner';
import * as BarcodeDetection from '../lib/barcodeDetection';
import * as ProductLookup from '../lib/productLookup';
import * as Eligibility from '../lib/eligibility';

// Mock dependencies
vi.mock('../lib/barcodeDetection', () => ({
  detectBarcodeFromVideo: vi.fn(),
}));

vi.mock('../lib/productLookup', () => ({
  lookupProduct: vi.fn(),
}));

vi.mock('../lib/eligibility', () => ({
  checkEligibility: vi.fn(),
}));

describe('BarcodeScanner', () => {
  let mockGetUserMedia: any;
  let mockAudioContext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetUserMedia = vi.fn().mockResolvedValue({
      getTracks: () => [{ stop: vi.fn() }],
    });

    Object.defineProperty(navigator, 'mediaDevices', {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      configurable: true,
    });
    
    // Mock play to avoid errors and set readyState
    window.HTMLVideoElement.prototype.play = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window.HTMLMediaElement.prototype, 'readyState', 'get').mockReturnValue(4); // HAVE_ENOUGH_DATA is usually 4

    mockAudioContext = vi.fn().mockImplementation(function(this: any) {
      this.state = 'running';
      this.createOscillator = vi.fn().mockReturnValue({
        type: 'sine',
        frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn()
      });
      this.createGain = vi.fn().mockReturnValue({
        gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn()
      });
      this.destination = {};
      this.currentTime = 0;
      this.resume = vi.fn();
      return this;
    });
    window.AudioContext = mockAudioContext;
  });

  afterEach(() => {
    cleanup();
  });

  it('renders and attempts to start camera', async () => {
    render(<BarcodeScanner selectedParticipant={null} onClose={vi.fn()} />);
    
    expect(screen.getByText('Align barcode within frame')).toBeInTheDocument();
    expect(mockGetUserMedia).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(<BarcodeScanner selectedParticipant={null} onClose={onCloseMock} />);
    
    // The close button is the one with aria-label="Close scanner"
    const closeBtn = screen.getByLabelText('Close scanner');
    fireEvent.click(closeBtn);
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('can pause and resume the scanner', () => {
    render(<BarcodeScanner selectedParticipant={null} onClose={vi.fn()} />);
    
    const pauseBtn = screen.getByText('⏸ Pause');
    fireEvent.click(pauseBtn);
    
    expect(screen.getByText('▶ Resume')).toBeInTheDocument();
    fireEvent.click(screen.getByText('▶ Resume'));
    
    expect(screen.getByText('⏸ Pause')).toBeInTheDocument();
  });

  it('displays not WIC approved when an unknown product is scanned', async () => {
    vi.mocked(BarcodeDetection.detectBarcodeFromVideo).mockResolvedValue('123456789012');
    vi.mocked(ProductLookup.lookupProduct).mockResolvedValue(null);

    render(<BarcodeScanner selectedParticipant={null} onClose={vi.fn()} />);

    // Fast-forward or wait by returning promises
    await waitFor(() => {
      expect(screen.getByText('NOT WIC APPROVED')).toBeInTheDocument();
      expect(screen.getByText('Product not found in WIC database')).toBeInTheDocument();
    });
  });

  it('displays product info and check eligibility when a known product is scanned', async () => {
    vi.mocked(BarcodeDetection.detectBarcodeFromVideo).mockResolvedValue('123456789012');
    vi.mocked(ProductLookup.lookupProduct).mockResolvedValue({
      upc: '123456789012',
      categoryDescription: 'Milk',
      subCategoryDescription: 'Whole Milk',
      brandName: 'TestBrand',
      foodDescription: 'Gallon Milk',
      packageSize: '1',
      uom: 'GAL'
    });
    vi.mocked(Eligibility.checkEligibility).mockReturnValue({
      eligible: true,
      reason: 'Allowed for participant'
    });

    render(<BarcodeScanner selectedParticipant="CHILD_1_2" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('TestBrand Gallon Milk')).toBeInTheDocument();
      expect(screen.getByText('WIC APPROVED')).toBeInTheDocument();
    });
  });
  
  it('shows not eligible if product is found but not eligible for participant', async () => {
    vi.mocked(BarcodeDetection.detectBarcodeFromVideo).mockResolvedValue('123456789012');
    vi.mocked(ProductLookup.lookupProduct).mockResolvedValue({
      upc: '123456789012',
      categoryDescription: 'Milk',
      subCategoryDescription: 'Whole Milk',
      brandName: 'TestBrand',
      foodDescription: 'Gallon Milk',
      packageSize: '1',
      uom: 'GAL'
    });
    vi.mocked(Eligibility.checkEligibility).mockReturnValue({
      eligible: false,
      reason: 'Whole milk only allowed for 1 year olds'
    });

    render(<BarcodeScanner selectedParticipant="CHILD_2_5" onClose={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('TestBrand Gallon Milk')).toBeInTheDocument();
      expect(screen.getByText('NOT ELIGIBLE')).toBeInTheDocument();
      expect(screen.getByText('Whole milk only allowed for 1 year olds')).toBeInTheDocument();
    });
  });
});
