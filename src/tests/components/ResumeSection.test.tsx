import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import ResumeSection, { ResumeSectionData } from '@/components/ResumeSection';

// Mock the WYSIWYGEditor component
vi.mock('@/components/WYSIWYGEditor', () => ({
  __esModule: true,
  default: ({ content, onChange }: any) => (
    <div data-testid="wysiwyg-editor">
      <div>{content}</div>
      <button onClick={() => onChange('new content')}>Change Content</button>
    </div>
  ),
}));

describe('ResumeSection', () => {
  const mockSection: ResumeSectionData = {
    id: '1',
    title: 'Work Experience',
    type: 'experience',
    content: '<p>Test experience content</p>',
  };

  const mockOnContentChange = vi.fn();
  const mockOnRegenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section with title and content', () => {
    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
      />
    );

    expect(screen.getByText('Work Experience')).toBeInTheDocument();
    expect(screen.getByTestId('wysiwyg-editor')).toBeInTheDocument();
  });

  it('applies correct styling based on section type', () => {
    const { container } = render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
      />
    );

    const sectionDiv = container.querySelector('.resume-section');
    expect(sectionDiv).toHaveClass('border-blue-200');
    expect(sectionDiv).toHaveClass('bg-blue-50/30');
  });

  it('handles collapse/expand functionality', () => {
    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
      />
    );

    const collapseButton = screen.getByLabelText('Collapse section');
    
    // Initially expanded
    expect(screen.getByTestId('wysiwyg-editor')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(collapseButton);
    expect(screen.queryByTestId('wysiwyg-editor')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(screen.getByLabelText('Expand section'));
    expect(screen.getByTestId('wysiwyg-editor')).toBeInTheDocument();
  });

  it('handles content change', () => {
    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
      />
    );

    const changeButton = screen.getByText('Change Content');
    fireEvent.click(changeButton);

    expect(mockOnContentChange).toHaveBeenCalledWith('1', 'new content');
  });

  it('handles regenerate with job description', async () => {
    mockOnRegenerate.mockResolvedValue(undefined);

    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
        jobDescription="Test job description"
      />
    );

    const regenerateButton = screen.getByText('Regenerate');
    fireEvent.click(regenerateButton);

    expect(regenerateButton).toBeDisabled();
    expect(screen.getByText('Regenerating...')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockOnRegenerate).toHaveBeenCalledWith('1');
    });
  });

  it('shows alert when regenerating without job description', () => {
    window.alert = vi.fn();

    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
      />
    );

    const regenerateButton = screen.getByText('Regenerate');
    fireEvent.click(regenerateButton);

    expect(window.alert).toHaveBeenCalledWith(
      'Please provide a job description to regenerate this section.'
    );
    expect(mockOnRegenerate).not.toHaveBeenCalled();
  });

  it('handles regenerate error gracefully', async () => {
    window.alert = vi.fn();
    mockOnRegenerate.mockRejectedValue(new Error('API Error'));

    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
        jobDescription="Test job description"
      />
    );

    const regenerateButton = screen.getByText('Regenerate');
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        'Failed to regenerate section. Please try again.'
      );
    });
  });

  it('shows loading state during regeneration', async () => {
    mockOnRegenerate.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(
      <ResumeSection
        section={mockSection}
        onContentChange={mockOnContentChange}
        onRegenerate={mockOnRegenerate}
        jobDescription="Test job description"
      />
    );

    const regenerateButton = screen.getByText('Regenerate');
    fireEvent.click(regenerateButton);

    expect(screen.getByText('Regenerating section content...')).toBeInTheDocument();
    expect(screen.queryByTestId('wysiwyg-editor')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId('wysiwyg-editor')).toBeInTheDocument();
    });
  });
}); 