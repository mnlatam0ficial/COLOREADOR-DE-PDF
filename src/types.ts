export type ColorStyle =
  | 'corporate'
  | 'blueprint'
  | 'vintage'
  | 'comic'
  | 'photorealistic'
  | 'pastel'
  | 'duotone'
  | 'custom';

export interface ColorAdjustments {
  style: ColorStyle;
  saturation: number;      // -100 to 100 (default: 20)
  brightness: number;      // -100 to 100 (default: 0)
  contrast: number;        // -100 to 100 (default: 15)
  temperature: number;     // -100 (cool) to 100 (warm)
  tint: number;            // -100 (green) to 100 (magenta)
  vibrance: number;        // 0 to 100
  primaryColor: string;    // Hex
  secondaryColor: string;  // Hex
  accentColor: string;     // Hex
  preserveTextSharpness: boolean;
  textThreshold: number;   // 0 to 255
  warmSkinTone: boolean;
  geminiPrompt?: string;
}

export interface PDFPage {
  pageNumber: number;
  width: number;
  height: number;
  aspectRatio: number;
  originalDataUrl: string;
  colorizedDataUrl: string | null;
  status: 'idle' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  adjustments: ColorAdjustments;
  colorizedBy: 'algorithm' | 'gemini' | null;
}

export interface DocumentState {
  fileName: string;
  fileSize: number;
  totalPages: number;
  pages: PDFPage[];
  activePageIndex: number;
  isProcessingAll: boolean;
}

export interface PresetConfig {
  id: ColorStyle;
  name: string;
  description: string;
  category: string;
  iconName: string;
  palette: string[];
  defaultAdjustments: Partial<ColorAdjustments>;
  suggestedPrompt: string;
}
