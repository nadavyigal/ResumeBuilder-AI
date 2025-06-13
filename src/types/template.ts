export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  isAtsOptimized: boolean;
  styles: TemplateStyles;
  layout: TemplateLayout;
  customizationOptions: CustomizationOptions;
}

export interface TemplateStyles {
  fontFamily: string;
  fontSize: {
    base: string;
    heading1: string;
    heading2: string;
    heading3: string;
  };
  colors: {
    primary: string;
    secondary: string;
    text: string;
    background: string;
    accent: string;
  };
  spacing: {
    section: string;
    paragraph: string;
    line: string;
  };
  borders?: {
    style: string;
    width: string;
    color: string;
  };
}

export interface TemplateLayout {
  columns: 1 | 2;
  sectionOrder: string[];
  headerPosition: 'top' | 'left' | 'right';
  margins: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
}

export interface CustomizationOptions {
  allowColorChange: boolean;
  allowFontChange: boolean;
  allowLayoutChange: boolean;
  colorPresets?: string[];
  fontPresets?: string[];
}

export interface TemplatePreviewProps {
  template: ResumeTemplate;
  resumeData: any;
  customizations?: Partial<TemplateStyles>;
} 