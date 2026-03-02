import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import SyncManager from './SyncManager';
import * as ConvexReact from 'convex/react';
import * as DexieHooks from 'dexie-react-hooks';

vi.mock('convex/react', () => ({
  useQuery: vi.fn(),
}));

vi.mock('dexie-react-hooks', () => ({
  useLiveQuery: vi.fn(),
}));

vi.mock('../../convex/_generated/api', () => ({
  api: {
    sync: {
      getSyncMetadata: 'mockGetSyncMetadata',
    }
  }
}));

describe('SyncManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when there is no update available', () => {
    vi.mocked(ConvexReact.useQuery).mockReturnValue({ lastSyncDate: '2024-01-01T10:00:00Z' });
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue({ lastSyncDate: '2024-01-01T10:00:00Z' });

    const { container } = render(<SyncManager syncStatus="idle" onSync={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders update banner when remote is newer', () => {
    vi.mocked(ConvexReact.useQuery).mockReturnValue({ lastSyncDate: '2024-01-01T11:00:00Z' }); // Newer
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue({ lastSyncDate: '2024-01-01T10:00:00Z' }); // Older

    render(<SyncManager syncStatus="idle" onSync={vi.fn()} />);
    
    expect(screen.getByText('Update Available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Now/i })).toBeInTheDocument();
  });

  it('renders update banner when there is remote data but no local data', () => {
    vi.mocked(ConvexReact.useQuery).mockReturnValue({ lastSyncDate: '2024-01-01T11:00:00Z' });
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue(undefined); // No local data

    render(<SyncManager syncStatus="idle" onSync={vi.fn()} />);
    
    expect(screen.getByText('Update Available')).toBeInTheDocument();
  });

  it('calls onSync when update button is clicked', () => {
    vi.mocked(ConvexReact.useQuery).mockReturnValue({ lastSyncDate: '2024-01-01T11:00:00Z' });
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue(undefined);

    const onSyncMock = vi.fn().mockResolvedValue(undefined);
    render(<SyncManager syncStatus="idle" onSync={onSyncMock} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Update Now/i }));
    expect(onSyncMock).toHaveBeenCalledTimes(1);
  });

  it('disables the update button while syncing', () => {
    vi.mocked(ConvexReact.useQuery).mockReturnValue({ lastSyncDate: '2024-01-01T11:00:00Z' });
    vi.mocked(DexieHooks.useLiveQuery).mockReturnValue(undefined);

    render(<SyncManager syncStatus="loading" onSync={vi.fn()} />);
    
    const button = screen.getByRole('button', { name: /Updating.../i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
