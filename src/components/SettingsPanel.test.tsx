import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import React from 'react';
import { SettingsPanel } from './SettingsPanel';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn();
  const mockSetSelectedParticipant = vi.fn();

  beforeEach(() => {
    // Clear mocks and localStorage before each test
    vi.clearAllMocks();
    localStorage.clear();
    // Reset document.documentElement classList
    document.documentElement.className = '';
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <SettingsPanel 
        isOpen={false} 
        onClose={mockOnClose} 
        selectedParticipant={null} 
        setSelectedParticipant={mockSetSelectedParticipant} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders settings panel when isOpen is true', () => {
    render(
      <SettingsPanel 
        isOpen={true} 
        onClose={mockOnClose} 
        selectedParticipant={null} 
        setSelectedParticipant={mockSetSelectedParticipant} 
      />
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <SettingsPanel 
        isOpen={true} 
        onClose={mockOnClose} 
        selectedParticipant={null} 
        setSelectedParticipant={mockSetSelectedParticipant} 
      />
    );
    
    // Find the close button and click it
    // The close button is the one with the svg and -mr-2 class, let's find it by getting the first button
    // It's technically the only button right under the Settings heading
    const buttons = screen.getAllByRole('button');
    // The close button is the first one
    fireEvent.click(buttons[0]);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('changes theme when a theme button is clicked and calls toast', () => {
    render(
      <SettingsPanel 
        isOpen={true} 
        onClose={mockOnClose} 
        selectedParticipant={null} 
        setSelectedParticipant={mockSetSelectedParticipant} 
      />
    );
    
    // Check initial state (system should be selected, so dark should not be)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click dark mode button
    fireEvent.click(screen.getByText('dark Default'));
    
    // Verify toast was called
    expect(toast.success).toHaveBeenCalledWith('Appearance updated to dark');
    
    // Verify local storage is updated
    expect(localStorage.getItem('theme-preference')).toBe('dark');
    
    // Verify document class list is updated
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    
    // Click light mode button
    fireEvent.click(screen.getByText('light Default'));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('saves participant preference and calls toast when selected', () => {
    render(
      <SettingsPanel 
        isOpen={true} 
        onClose={mockOnClose} 
        selectedParticipant={null} 
        setSelectedParticipant={mockSetSelectedParticipant} 
      />
    );
    
    // Open Participant Selector
    fireEvent.click(screen.getByText('Select Your WIC Participant'));
    
    // Select an option
    fireEvent.click(screen.getByText('Child (1-2 years)'));
    
    expect(mockSetSelectedParticipant).toHaveBeenCalledWith('CHILD_1_2');
    expect(localStorage.getItem('wic-participant')).toBe('CHILD_1_2');
    expect(toast.success).toHaveBeenCalledWith('Participant preferences saved');
  });
});
