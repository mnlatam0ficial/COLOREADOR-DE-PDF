import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { UploadZone } from './components/UploadZone';
import { PageThumbnailStrip } from './components/PageThumbnailStrip';
import { ComparisonViewer } from './components/ComparisonViewer';
import { ColorControlsPanel } from './components/ColorControlsPanel';
import { ExportModal } from './components/ExportModal';
import { DocumentState, PDFPage, ColorAdjustments } from './types';
import { extractPagesFromPdf, extractFromImageFile } from './utils/pdfProcessor';
import { generateSampleDocument, SAMPLE_DOCS } from './utils/samplePdfs';
import { colorPageWithAlgorithm, colorPageWithGemini, PRESETS } from './utils/colorizerEngine';

export const App: React.FC = () => {
  const [documentState, setDocumentState] = useState<DocumentState | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Procesando archivo...');
  const [isProcessingActivePage, setIsProcessingActivePage] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Debounce ref for live slider adjustments
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Automatically load the architectural blueprint sample on initial visit so the user immediately sees the colorizer in action
  useEffect(() => {
    loadSample('blueprint');
  }, []);

  const loadSample = async (sampleId: string) => {
    setIsLoadingFile(true);
    setLoadingMessage('Generando documento de muestra en alta definición...');

    try {
      const sample = await generateSampleDocument(sampleId);
      const meta = SAMPLE_DOCS.find((s) => s.id === sampleId) || SAMPLE_DOCS[0];
      const preset = PRESETS.find((p) => p.id === meta.suggestedPreset) || PRESETS[0];

      const initialAdjustments: ColorAdjustments = {
        style: preset.id,
        saturation: preset.defaultAdjustments.saturation ?? 35,
        brightness: preset.defaultAdjustments.brightness ?? 0,
        contrast: preset.defaultAdjustments.contrast ?? 20,
        temperature: preset.defaultAdjustments.temperature ?? 10,
        tint: preset.defaultAdjustments.tint ?? 0,
        vibrance: preset.defaultAdjustments.vibrance ?? 40,
        primaryColor: preset.defaultAdjustments.primaryColor ?? '#2563EB',
        secondaryColor: preset.defaultAdjustments.secondaryColor ?? '#10B981',
        accentColor: preset.defaultAdjustments.accentColor ?? '#F59E0B',
        preserveTextSharpness: preset.defaultAdjustments.preserveTextSharpness ?? true,
        textThreshold: preset.defaultAdjustments.textThreshold ?? 55,
        warmSkinTone: true,
        geminiPrompt: preset.suggestedPrompt,
      };

      // Generate the initial colorized version of this page
      const colorized = await colorPageWithAlgorithm(sample.dataUrl, initialAdjustments);

      const firstPage: PDFPage = {
        pageNumber: 1,
        width: sample.width,
        height: sample.height,
        aspectRatio: sample.width / sample.height,
        originalDataUrl: sample.dataUrl,
        colorizedDataUrl: colorized,
        status: 'done',
        colorizedBy: 'algorithm',
        adjustments: initialAdjustments,
      };

      setDocumentState({
        fileName: sample.name,
        fileSize: 1024 * 350,
        totalPages: 1,
        pages: [firstPage],
        activePageIndex: 0,
        isProcessingAll: false,
      });
    } catch (err: any) {
      console.error('Failed to load sample:', err);
      alert('Error al cargar la muestra: ' + err.message);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setIsLoadingFile(true);
    setLoadingMessage(`Cargando ${file.name}...`);

    try {
      let extracted;
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        extracted = await extractPagesFromPdf(file, (curr, tot) => {
          setLoadingMessage(`Extrayendo página ${curr} de ${tot}...`);
        });
      } else {
        extracted = await extractFromImageFile(file);
      }

      if (extracted.pages.length === 0) {
        throw new Error('No se encontraron páginas en el archivo.');
      }

      // Colorize the first page automatically right away
      setLoadingMessage('Colorizando la primera página...');
      const firstPage = extracted.pages[0];
      const colorized = await colorPageWithAlgorithm(firstPage.originalDataUrl, firstPage.adjustments);
      firstPage.colorizedDataUrl = colorized;
      firstPage.status = 'done';
      firstPage.colorizedBy = 'algorithm';

      setDocumentState({
        fileName: extracted.fileName,
        fileSize: extracted.fileSize,
        totalPages: extracted.pages.length,
        pages: extracted.pages,
        activePageIndex: 0,
        isProcessingAll: false,
      });
    } catch (err: any) {
      console.error('Error opening file:', err);
      alert('No se pudo procesar el archivo: ' + (err.message || 'Error desconocido'));
    } finally {
      setIsLoadingFile(false);
    }
  };

  const activePage = documentState?.pages[documentState.activePageIndex];

  // Live adjustments change handler (debounced for smooth slider interaction)
  const handleAdjustmentsChange = useCallback(
    (newAdjustments: ColorAdjustments) => {
      if (!documentState || !activePage) return;

      const pageIdx = documentState.activePageIndex;

      // Update state immediately for UI controls
      setDocumentState((prev) => {
        if (!prev) return null;
        const newPages = [...prev.pages];
        newPages[pageIdx] = {
          ...newPages[pageIdx],
          adjustments: newAdjustments,
        };
        return { ...prev, pages: newPages };
      });

      // Clear existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Re-render colorized image with 100ms debounce
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const colorized = await colorPageWithAlgorithm(
            activePage.originalDataUrl,
            newAdjustments
          );
          setDocumentState((prev) => {
            if (!prev) return null;
            const newPages = [...prev.pages];
            newPages[pageIdx] = {
              ...newPages[pageIdx],
              colorizedDataUrl: colorized,
              status: 'done',
              colorizedBy: 'algorithm',
            };
            return { ...prev, pages: newPages };
          });
        } catch (err) {
          console.error('Error applying live color adjustment:', err);
        }
      }, 100);
    },
    [documentState, activePage]
  );

  // Trigger Gemini AI Colorization
  const handleTriggerGeminiColorize = async (customPrompt?: string) => {
    if (!documentState || !activePage) return;

    const pageIdx = documentState.activePageIndex;
    setIsProcessingActivePage(true);

    // Update status to processing
    setDocumentState((prev) => {
      if (!prev) return null;
      const newPages = [...prev.pages];
      newPages[pageIdx] = { ...newPages[pageIdx], status: 'processing' };
      return { ...prev, pages: newPages };
    });

    try {
      const colorized = await colorPageWithGemini(
        activePage.originalDataUrl,
        activePage.adjustments,
        customPrompt
      );

      setDocumentState((prev) => {
        if (!prev) return null;
        const newPages = [...prev.pages];
        newPages[pageIdx] = {
          ...newPages[pageIdx],
          colorizedDataUrl: colorized,
          status: 'done',
          colorizedBy: 'gemini',
        };
        return { ...prev, pages: newPages };
      });
    } catch (err: any) {
      console.error('Gemini colorization failed:', err);
      // Fallback to algorithm
      const fallbackColorized = await colorPageWithAlgorithm(
        activePage.originalDataUrl,
        activePage.adjustments
      );
      setDocumentState((prev) => {
        if (!prev) return null;
        const newPages = [...prev.pages];
        newPages[pageIdx] = {
          ...newPages[pageIdx],
          colorizedDataUrl: fallbackColorized,
          status: 'done',
          colorizedBy: 'algorithm',
        };
        return { ...prev, pages: newPages };
      });
    } finally {
      setIsProcessingActivePage(false);
    }
  };

  // Batch Colorize All Pages
  const handleBatchColorize = async () => {
    if (!documentState || documentState.isProcessingAll) return;

    setDocumentState((prev) => (prev ? { ...prev, isProcessingAll: true } : null));

    const total = documentState.pages.length;
    const currentAdjustments = activePage?.adjustments;

    for (let i = 0; i < total; i++) {
      const page = documentState.pages[i];
      // Mark current page as processing
      setDocumentState((prev) => {
        if (!prev) return null;
        const newPages = [...prev.pages];
        newPages[i] = { ...newPages[i], status: 'processing' };
        return { ...prev, pages: newPages };
      });

      try {
        const colorized = await colorPageWithAlgorithm(
          page.originalDataUrl,
          currentAdjustments || page.adjustments
        );

        setDocumentState((prev) => {
          if (!prev) return null;
          const newPages = [...prev.pages];
          newPages[i] = {
            ...newPages[i],
            colorizedDataUrl: colorized,
            status: 'done',
            colorizedBy: 'algorithm',
            adjustments: currentAdjustments ? { ...currentAdjustments } : page.adjustments,
          };
          return { ...prev, pages: newPages };
        });
      } catch (err) {
        console.error(`Error colorizing page ${i + 1}:`, err);
      }
    }

    setDocumentState((prev) => (prev ? { ...prev, isProcessingAll: false } : null));
  };

  // Apply current page style to all pages
  const handleApplyToAllPages = () => {
    if (!documentState || !activePage) return;
    const styleToCopy = { ...activePage.adjustments };

    setDocumentState((prev) => {
      if (!prev) return null;
      const newPages = prev.pages.map((p) => ({
        ...p,
        adjustments: { ...styleToCopy },
      }));
      return { ...prev, pages: newPages };
    });

    // Re-colorize all pages with the new style
    handleBatchColorize();
  };

  // Reset active page adjustments
  const handleResetAdjustments = () => {
    if (!documentState || !activePage) return;
    const preset = PRESETS.find((p) => p.id === activePage.adjustments.style) || PRESETS[0];

    handleAdjustmentsChange({
      style: preset.id,
      saturation: preset.defaultAdjustments.saturation ?? 35,
      brightness: preset.defaultAdjustments.brightness ?? 0,
      contrast: preset.defaultAdjustments.contrast ?? 20,
      temperature: preset.defaultAdjustments.temperature ?? 10,
      tint: preset.defaultAdjustments.tint ?? 0,
      vibrance: preset.defaultAdjustments.vibrance ?? 40,
      primaryColor: preset.defaultAdjustments.primaryColor ?? '#2563EB',
      secondaryColor: preset.defaultAdjustments.secondaryColor ?? '#10B981',
      accentColor: preset.defaultAdjustments.accentColor ?? '#F59E0B',
      preserveTextSharpness: preset.defaultAdjustments.preserveTextSharpness ?? true,
      textThreshold: preset.defaultAdjustments.textThreshold ?? 55,
      warmSkinTone: true,
      geminiPrompt: preset.suggestedPrompt,
    });
  };

  // Download active page image
  const handleDownloadPageImage = (format: 'png' | 'jpg') => {
    if (!activePage) return;
    const dataUrl = activePage.colorizedDataUrl || activePage.originalDataUrl;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `pagina_${activePage.pageNumber}_a_color.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        document={documentState}
        onNewUpload={() => setDocumentState(null)}
        onExportClick={() => setIsExportModalOpen(true)}
        onBatchColorize={handleBatchColorize}
        isProcessing={documentState?.isProcessingAll || false}
      />

      {/* Main Workspace Area */}
      {!documentState ? (
        <main className="flex-1 overflow-y-auto">
          <UploadZone
            onFileSelected={handleFileSelected}
            onSampleSelected={loadSample}
            isLoading={isLoadingFile}
            loadingMessage={loadingMessage}
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-col min-h-0">
          {/* Multi-page Thumbnail Strip (if more than 1 page) */}
          {documentState.totalPages > 1 && (
            <PageThumbnailStrip
              pages={documentState.pages}
              activePageIndex={documentState.activePageIndex}
              onSelectPage={(index) =>
                setDocumentState((prev) => (prev ? { ...prev, activePageIndex: index } : null))
              }
              onBatchColorize={handleBatchColorize}
              isProcessingBatch={documentState.isProcessingAll}
            />
          )}

          {/* Interactive Workspace Split: Viewer on Left, Color Studio on Right */}
          <div className="flex-1 flex flex-col lg:flex-row min-h-0">
            {activePage && (
              <ComparisonViewer
                page={activePage}
                totalPages={documentState.totalPages}
                currentPageIndex={documentState.activePageIndex}
                onPageChange={(index) =>
                  setDocumentState((prev) => (prev ? { ...prev, activePageIndex: index } : null))
                }
                onDownloadPageImage={handleDownloadPageImage}
              />
            )}

            {activePage && (
              <ColorControlsPanel
                adjustments={activePage.adjustments}
                onChangeAdjustments={handleAdjustmentsChange}
                onApplyToAllPages={handleApplyToAllPages}
                onResetAdjustments={handleResetAdjustments}
                onTriggerGeminiColorize={handleTriggerGeminiColorize}
                isProcessing={isProcessingActivePage || activePage.status === 'processing'}
                totalPages={documentState.totalPages}
              />
            )}
          </div>
        </main>
      )}

      {/* Export Modal */}
      {documentState && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          pages={documentState.pages}
          fileName={documentState.fileName}
          activePageIndex={documentState.activePageIndex}
        />
      )}
    </div>
  );
};
