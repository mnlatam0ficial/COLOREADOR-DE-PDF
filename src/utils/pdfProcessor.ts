import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PDFPage } from '../types';

// Set up worker source for pdf.js
try {
  // Use official cdnjs worker corresponding to pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('Could not set pdfjs workerSrc:', e);
}

export interface ExtractedDocument {
  fileName: string;
  fileSize: number;
  pages: PDFPage[];
}

/**
 * Loads a PDF file and extracts every page as a high-res image data URL
 */
export async function extractPagesFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ExtractedDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
    cMapPacked: true,
  });

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;
  const pages: PDFPage[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.(pageNum, totalPages);
    const page = await pdfDoc.getPage(pageNum);
    const baseViewport = page.getViewport({ scale: 1.0 });

    // Render at scale 2.0 for crisp retina / high-DPI quality
    const targetScale = Math.min(2.5, Math.max(1.5, 2000 / Math.max(baseViewport.width, baseViewport.height)));
    const viewport = page.getViewport({ scale: targetScale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Canvas 2D context not available');
    }

    // Render page
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    };
    await (page.render(renderContext as any) as any).promise;

    const originalDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    pages.push({
      pageNumber: pageNum,
      width: viewport.width,
      height: viewport.height,
      aspectRatio: viewport.width / viewport.height,
      originalDataUrl,
      colorizedDataUrl: null,
      status: 'idle',
      colorizedBy: null,
      adjustments: {
        style: 'corporate',
        saturation: 25,
        brightness: 0,
        contrast: 15,
        temperature: 5,
        tint: 0,
        vibrance: 30,
        primaryColor: '#2563EB',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        preserveTextSharpness: true,
        textThreshold: 55,
        warmSkinTone: true,
      },
    });
  }

  return {
    fileName: file.name,
    fileSize: file.size,
    pages,
  };
}

/**
 * Handles single image upload (PNG, JPG, WebP) as a 1-page document
 */
export async function extractFromImageFile(file: File): Promise<ExtractedDocument> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const pages: PDFPage[] = [
          {
            pageNumber: 1,
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
            originalDataUrl: dataUrl,
            colorizedDataUrl: null,
            status: 'idle',
            colorizedBy: null,
            adjustments: {
              style: 'photorealistic',
              saturation: 30,
              brightness: 0,
              contrast: 15,
              temperature: 8,
              tint: 0,
              vibrance: 35,
              primaryColor: '#3B82F6',
              secondaryColor: '#10B981',
              accentColor: '#F97316',
              preserveTextSharpness: true,
              textThreshold: 50,
              warmSkinTone: true,
            },
          },
        ];
        resolve({
          fileName: file.name,
          fileSize: file.size,
          pages,
        });
      };
      img.onerror = () => reject(new Error('No se pudo cargar la imagen seleccionada.'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compiles colorized pages back into a PDF download file
 */
export async function exportToPdf(
  pages: PDFPage[],
  options: {
    fileName?: string;
    includeOriginalsIfUncolorized?: boolean;
    onProgress?: (current: number, total: number) => void;
  } = {}
): Promise<Blob> {
  const { fileName = 'documento_a_color.pdf', includeOriginalsIfUncolorized = true, onProgress } = options;

  let doc: jsPDF | null = null;
  const total = pages.length;

  for (let i = 0; i < total; i++) {
    onProgress?.(i + 1, total);
    const p = pages[i];
    const imgData = p.colorizedDataUrl || (includeOriginalsIfUncolorized ? p.originalDataUrl : null);

    if (!imgData) continue;

    // Use points unit (72 dpi) with page's actual dimensions
    const orientation = p.width > p.height ? 'landscape' : 'portrait';
    const targetW = p.width * 0.75;
    const targetH = p.height * 0.75;

    if (!doc) {
      doc = new jsPDF({
        orientation,
        unit: 'pt',
        format: [targetW, targetH],
      });
    } else {
      doc.addPage([targetW, targetH], orientation);
    }

    doc.addImage(imgData, 'JPEG', 0, 0, targetW, targetH, undefined, 'FAST');
  }

  if (!doc) {
    throw new Error('No hay páginas para exportar');
  }

  const blob = doc.output('blob');
  return blob;
}

/**
 * Triggers a file download in the browser
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
