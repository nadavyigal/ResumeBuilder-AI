import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TemplateCustomizer from '@/components/TemplateCustomizer';
import { templates } from '@/lib/templates';
import { ResumeTemplate } from '@/types/template';

describe('TemplateCustomizer', () => {
  const mockOnCustomizationChange = vi.fn();
  const template = templates[0]; // Professional template
  const customizations = {};

  beforeEach(() => {
    mockOnCustomizationChange.mockClear();
  });

  it('renders color customization options when allowed', () => {
    render(
      <TemplateCustomizer
        template={template}
        customizations={customizations}
        onCustomizationChange={mockOnCustomizationChange}
      />
    );

    // Check if color tab is present
    expect(screen.getByText('Colors')).toBeInTheDocument();
    
    // Check if color inputs are present
    expect(screen.getByLabelText('Primary Color')).toBeInTheDocument();
    expect(screen.getByLabelText('Accent Color')).toBeInTheDocument();
  });

  it('renders font customization options when allowed', () => {
    render(
      <TemplateCustomizer
        template={template}
        customizations={customizations}
        onCustomizationChange={mockOnCustomizationChange}
      />
    );

    // Click on Fonts tab
    fireEvent.click(screen.getByText('Fonts'));

    // Check if font selector is present
    expect(screen.getByLabelText('Font Family')).toBeInTheDocument();
    
    // Check if font preview is shown
    expect(screen.getByText(/This is a preview of your selected font/)).toBeInTheDocument();
  });

  it('updates colors when color input changes', () => {
    render(
      <TemplateCustomizer
        template={template}
        customizations={customizations}
        onCustomizationChange={mockOnCustomizationChange}
      />
    );

    // Change primary color
    const primaryColorInput = screen.getByLabelText('Primary Color');
    fireEvent.change(primaryColorInput, { target: { value: '#ff0000' } });

    expect(mockOnCustomizationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        colors: expect.objectContaining({
          primary: '#ff0000',
          secondary: template.styles.colors.secondary,
          text: template.styles.colors.text,
          background: template.styles.colors.background,
          accent: template.styles.colors.accent,
        })
      })
    );
  });

  it('updates font when font selection changes', () => {
    render(
      <TemplateCustomizer
        template={template}
        customizations={customizations}
        onCustomizationChange={mockOnCustomizationChange}
      />
    );

    // Switch to Fonts tab
    fireEvent.click(screen.getByText('Fonts'));

    // Change font
    const fontSelect = screen.getByLabelText('Font Family');
    fireEvent.change(fontSelect, { target: { value: 'Times New Roman, serif' } });

    expect(mockOnCustomizationChange).toHaveBeenCalledWith(
      expect.objectContaining({
        fontFamily: 'Times New Roman, serif'
      })
    );
  });

  it('resets customizations when clicking reset button', () => {
    render(
      <TemplateCustomizer
        template={template}
        customizations={{
          colors: { 
            primary: '#ff0000',
            secondary: template.styles.colors.secondary,
            text: template.styles.colors.text,
            background: template.styles.colors.background,
            accent: template.styles.colors.accent,
          },
          fontFamily: 'Times New Roman, serif'
        }}
        onCustomizationChange={mockOnCustomizationChange}
      />
    );

    // Click reset button
    fireEvent.click(screen.getByText('Reset to Default'));

    expect(mockOnCustomizationChange).toHaveBeenCalledWith({});
  });

  it('does not render if template does not allow customization', () => {
    const nonCustomizableTemplate: ResumeTemplate = {
      ...template,
      customizationOptions: {
        allowColorChange: false,
        allowFontChange: false,
        allowLayoutChange: false,
      }
    };

    const { container } = render(
      <TemplateCustomizer
        template={nonCustomizableTemplate}
        customizations={customizations}
        onCustomizationChange={mockOnCustomizationChange}
      />
    );

    expect(container.firstChild).toBeNull();
  });
}); 