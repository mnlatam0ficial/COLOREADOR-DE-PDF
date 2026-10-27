import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Palette,
  RotateCcw,
  Layers,
  Wand2,
  Check,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Compass,
  Scroll,
  Camera,
  Zap,
  Info
} from 'lucide-react';
import { ColorAdjustments, ColorStyle, PresetConfig } from '../types';
import { PRESETS } from '../utils/colorizerEngine';

interface ColorControlsPanelProps {
  adjustments: ColorAdjustments;
  onChangeAdjustments: (newAdjustments: ColorAdjustments) => void;
  onApplyToAllPages: () => void;
  onResetAdjustments: () => void;
  onTriggerGeminiColorize: (customPrompt?: string) => void;
  isProcessing: boolean;
  totalPages: number;
}

export const ColorControlsPanel: React.FC<ColorControlsPanelProps> = ({
  adjustments,
  onChangeAdjustments,
  onApplyToAllPages,
  onResetAdjustments,
  onTriggerGeminiColorize,
  isProcessing,
  totalPages,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handlePresetSelect = (preset: PresetConfig) => {
    const updated: ColorAdjustments = {
      ...adjustments,
      style: preset.id,
      ...preset.defaultAdjustments,
      geminiPrompt: preset.suggestedPrompt,
    };
    onChangeAdjustments(updated);
  };

  const updateField = <K extends keyof ColorAdjustments>(field: K, val: ColorAdjustments[K]) => {
    onChangeAdjustments({
      ...adjustments,
      [field]: val,
    });
  };

  const getPresetIcon = (id: ColorStyle) => {
    switch (id) {
      case 'corporate':
        return <FileSpreadsheet className="w-4 h-4 text-blue-400" />;
      case 'blueprint':
        return <Compass className="w-4 h-4 text-sky-400" />;
      case 'comic':
        return <Palette className="w-4 h-4 text-pink-400" />;
      case 'vintage':
        return <Scroll className="w-4 h-4 text-amber-400" />;
      case 'photorealistic':
        return <Camera className="w-4 h-4 text-emerald-400" />;
      case 'pastel':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'duotone':
        return <Zap className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sliders className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 bg-slate-900/90 border-l border-slate-800 flex flex-col shrink-0 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-800/80 sticky top-0 bg-slate-900/95 backdrop-blur z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Estudio de Color
            </h3>
          </div>
          <button
            type="button"
            onClick={onResetAdjustments}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
            title="Restablecer valores por defecto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Gemini AI Action Box */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/30 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Colorización Inteligente</span>
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              Gemini Vision
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Genera una interpretación a color con IA o ajusta los controles en tiempo real.
          </p>

          <button
            type="button"
            onClick={() => onTriggerGeminiColorize(customPrompt)}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isProcessing ? 'Procesando color...' : 'Colorear con Gemini AI'}</span>
          </button>

          {/* Toggle custom prompt input */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setShowPromptInput(!showPromptInput)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              <span>{showPromptInput ? 'Ocultar prompt personalizado' : '+ Añadir prompt o indicaciones a la IA'}</span>
            </button>

            {showPromptInput && (
              <div className="mt-2">
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ej: Pintar los títulos en azul rey, diagramas en tonos verdes y amarillos..."
                  rows={2}
                  className="w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>
        </div>

        {/* Style Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Estilos y Paletas Predefinidas
          </label>

          <div className="space-y-2">
            {PRESETS.map((p) => {
              const isSelected = adjustments.style === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handlePresetSelect(p)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 shadow-sm'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-slate-800/80 shrink-0">
                      {getPresetIcon(p.id)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {p.description}
                      </p>
                    </div>
                  </div>

                  {/* Palette dots preview */}
                  <div className="flex items-center gap-1 shrink-0">
                    {p.palette.slice(0, 3).map((c, i) => (
                      <span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full border border-black/30"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 ml-1" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fine Tuning Sliders */}
        <div className="space-y-4 pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Ajustes de Tono y Color
          </label>

          {/* Saturation Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Saturación de Color</span>
              <span className="font-mono text-slate-200">{adjustments.saturation > 0 ? `+${adjustments.saturation}` : adjustments.saturation}%</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={adjustments.saturation}
              onChange={(e) => updateField('saturation', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Contrast Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Contraste</span>
              <span className="font-mono text-slate-200">{adjustments.contrast > 0 ? `+${adjustments.contrast}` : adjustments.contrast}%</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={adjustments.contrast}
              onChange={(e) => updateField('contrast', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Brightness Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Brillo</span>
              <span className="font-mono text-slate-200">{adjustments.brightness > 0 ? `+${adjustments.brightness}` : adjustments.brightness}%</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={adjustments.brightness}
              onChange={(e) => updateField('brightness', Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Temperature Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Temperatura (Frío / Cálido)</span>
              <span className="font-mono text-slate-200">{adjustments.temperature > 0 ? `+${adjustments.temperature}` : adjustments.temperature}</span>
            </div>
            <input
              type="range"
              min={-100}
              max={100}
              value={adjustments.temperature}
              onChange={(e) => updateField('temperature', Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Text Sharpness Preservation */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-200">Preservar nitidez de texto</p>
              <p className="text-[11px] text-slate-400">Mantiene las letras y líneas 100% legibles</p>
            </div>
            <input
              type="checkbox"
              checked={adjustments.preserveTextSharpness}
              onChange={(e) => updateField('preserveTextSharpness', e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Advanced Palette Customizer Accordion */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider py-1 hover:text-white"
          >
            <span>Personalizar Colores Exactos</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 space-y-3 pt-2">
              {/* Primary Color Picker */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Color Primario (Títulos/Focos):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{adjustments.primaryColor}</span>
                  <input
                    type="color"
                    value={adjustments.primaryColor}
                    onChange={(e) => updateField('primaryColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Secondary Color Picker */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Color Secundario (Gráficos/Fills):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{adjustments.secondaryColor}</span>
                  <input
                    type="color"
                    value={adjustments.secondaryColor}
                    onChange={(e) => updateField('secondaryColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>
              </div>

              {/* Accent Color Picker */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Color de Acento (Detalles):</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-slate-400">{adjustments.accentColor}</span>
                  <input
                    type="color"
                    value={adjustments.accentColor}
                    onChange={(e) => updateField('accentColor', e.target.value)}
                    className="w-7 h-7 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Apply to All Pages Button */}
        {totalPages > 1 && (
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onApplyToAllPages}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Aplicar este estilo a todas las páginas</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
