import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { SyncButton } from './SyncButton';

describe('SyncButton', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders idle state correctly', () => {
    render(<SyncButton syncStatus="idle" syncMessage="" productCount={null} onSync={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Sync Database/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sync Database/i })).not.toBeDisabled();
  });

  it('renders loading state correctly', () => {
    render(<SyncButton syncStatus="loading" syncMessage="" productCount={null} onSync={vi.fn()} />);
    const button = screen.getByRole('button', { name: /Syncing/i });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  it('shows error state message', () => {
    render(<SyncButton syncStatus="error" syncMessage="Sync failed!" productCount={null} onSync={vi.fn()} />);
    expect(screen.getByText('Sync failed!')).toBeInTheDocument();
  });

  it('shows success state and product count', () => {
    render(<SyncButton syncStatus="success" syncMessage="Sync complete!" productCount={4500} onSync={vi.fn()} />);
    expect(screen.getByText('Sync complete!')).toBeInTheDocument();
    expect(screen.getByText('New count: 4500 products')).toBeInTheDocument();
  });

  it('calls onSync when clicked', () => {
    const handleSync = vi.fn();
    render(<SyncButton syncStatus="idle" syncMessage="" productCount={null} onSync={handleSync} />);
    
    fireEvent.click(screen.getByRole('button', { name: /Sync Database/i }));
    expect(handleSync).toHaveBeenCalledTimes(1);
  });
});
