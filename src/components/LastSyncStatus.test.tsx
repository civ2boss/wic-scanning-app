import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import LastSyncStatus from './LastSyncStatus';
import * as DexieHooks from 'dexie-react-hooks';

// Mock the dexie-react-hooks
vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

// Mock the db just in case
vi.mock('../lib/db', () => ({
  db: {
    syncMetadata: {
      get: vi.fn(),
    }
  }
}));

describe('LastSyncStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  afterEach(() => {
    cleanup();
  });

  it('renders "Never" when metadata is null or undefined', () => {
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue(undefined);

    render(<LastSyncStatus />);

    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.getByText('Never')).toBeInTheDocument();
    
    expect(screen.getByText('Products loaded')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders formatted date and total products when metadata exists', () => {
    const mockDate = new Date('2024-01-01T12:00:00Z');
    
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue({
      id: 'current',
      lastSyncDate: mockDate,
      totalProducts: 1234
    });

    render(<LastSyncStatus />);

    expect(screen.getByText('Last updated')).toBeInTheDocument();
    expect(screen.queryByText('Never')).not.toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument(); // 1234.toLocaleString() defaults to '1,234' usually
  });
});
