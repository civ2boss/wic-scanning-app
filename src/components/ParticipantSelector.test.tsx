import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import React from 'react';
import { ParticipantSelector } from './ParticipantSelector';

describe('ParticipantSelector', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders default text when selectedType is null', () => {
    render(<ParticipantSelector selectedType={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Select Your WIC Participant')).toBeInTheDocument();
  });

  it('renders selected participant label when provided', () => {
    render(<ParticipantSelector selectedType="INFANT_0_6" onSelect={vi.fn()} />);
    const elements = screen.getAllByText('Infant (0-6 months)');
    expect(elements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Scanning for:/)).toBeInTheDocument();
  });

  it('opens options and calls onSelect when an option is clicked', () => {
    const handleSelect = vi.fn();
    render(<ParticipantSelector selectedType={null} onSelect={handleSelect} />);
    
    // Check options are hidden initially
    expect(screen.queryByText('Child (1-2 years)')).not.toBeInTheDocument();
    
    // Click to open
    fireEvent.click(screen.getByText('Select Your WIC Participant'));
    
    // Now options should be visible
    expect(screen.getByText('Child (1-2 years)')).toBeInTheDocument();
    
    // Click an option
    fireEvent.click(screen.getByText('Child (1-2 years)'));
    
    // Check if onSelect was called with correct value
    expect(handleSelect).toHaveBeenCalledWith('CHILD_1_2');
    
    // Options should be hidden again
    expect(screen.queryByText('Child (1-2 years)')).not.toBeInTheDocument();
  });
});
