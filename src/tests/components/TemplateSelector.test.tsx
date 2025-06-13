import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateSelector from '@/components/TemplateSelector';
import { templates } from '@/lib/templates';

describe('TemplateSelector', () => {
  const mockOnSelectTemplate = vi.fn();
  const mockOnPreview = vi.fn();

  beforeEach(() => {
    mockOnSelectTemplate.mockClear();
    mockOnPreview.mockClear();
  });

  it('renders all available templates', () => {
    render(
      <TemplateSelector
        selectedTemplateId="professional"
        onSelectTemplate={mockOnSelectTemplate}
        onPreview={mockOnPreview}
      />
    );

    // Check if all templates are rendered
    templates.forEach(template => {
      expect(screen.getByText(template.name)).toBeInTheDocument();
      expect(screen.getByText(template.description)).toBeInTheDocument();
    });
  });

  it('shows selected template with correct styling', () => {
    render(
      <TemplateSelector
        selectedTemplateId="professional"
        onSelectTemplate={mockOnSelectTemplate}
        onPreview={mockOnPreview}
      />
    );

    // Find the selected template card
    const selectedCard = screen.getByText('Professional').closest('.template-card');
    expect(selectedCard).toHaveClass('border-blue-500');
  });

  it('calls onSelectTemplate when clicking a template', () => {
    render(
      <TemplateSelector
        selectedTemplateId="professional"
        onSelectTemplate={mockOnSelectTemplate}
        onPreview={mockOnPreview}
      />
    );

    // Click the modern template
    const modernTemplate = screen.getByText('Modern').closest('.template-card');
    fireEvent.click(modernTemplate!);

    expect(mockOnSelectTemplate).toHaveBeenCalledWith('modern');
  });

  it('shows preview button on hover and calls onPreview', async () => {
    render(
      <TemplateSelector
        selectedTemplateId="professional"
        onSelectTemplate={mockOnSelectTemplate}
        onPreview={mockOnPreview}
      />
    );

    // Hover over the modern template
    const modernTemplate = screen.getByText('Modern').closest('.template-card');
    fireEvent.mouseEnter(modernTemplate!);

    // Find and click the preview button
    const previewButton = await screen.findByText('Preview');
    fireEvent.click(previewButton);

    expect(mockOnPreview).toHaveBeenCalledWith('modern');
  });

  it('shows ATS optimized badge for compatible templates', () => {
    render(
      <TemplateSelector
        selectedTemplateId="professional"
        onSelectTemplate={mockOnSelectTemplate}
        onPreview={mockOnPreview}
      />
    );

    const atsBadges = screen.getAllByText('ATS Optimized');
    expect(atsBadges.length).toBeGreaterThan(0);
  });
}); 