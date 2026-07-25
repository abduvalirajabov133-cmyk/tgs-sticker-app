import React from 'react';
import type { CustomizationState } from '../types';
import { Type, Palette, Check } from 'lucide-react';

interface CustomizerPanelProps {
  customization: CustomizationState;
  onChange: (updated: Partial<CustomizationState>) => void;
}

const COLOR_PRESETS = [
  { name: 'Oq (White)', hex: '#FFFFFF' },
  { name: 'Oltin (Gold)', hex: '#FFD700' },
  { name: 'Moviy (Cyan)', hex: '#38BDF8' },
  { name: 'Pushti (Pink)', hex: '#EC4899' },
  { name: 'Yashil (Emerald)', hex: '#10B981' },
];

export const CustomizerPanel: React.FC<CustomizerPanelProps> = ({
  customization,
  onChange
}) => {
  return (
    <div className="glass-panel rounded-2xl p-4 my-3 space-y-4 border border-slate-800">
      <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
        <Type className="w-4 h-4 text-cyan-400" />
        <span>Stikerni Shaxsiylashtirish</span>
      </h3>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Stikerdagi Matn (Ism yoki Username):
        </label>
        <div className="relative">
          <input
            type="text"
            value={customization.text}
            onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Masalan: Zuhra yoki @olimova_ai"
            className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Shrift Uslubi (Font Style):
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onChange({ fontType: 'bold' })}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              customization.fontType === 'bold'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span>Qalin (Bold Standard)</span>
            {customization.fontType === 'bold' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button
            type="button"
            onClick={() => onChange({ fontType: 'script' })}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              customization.fontType === 'script'
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="font-serif italic">Husnixat (Script)</span>
            {customization.fontType === 'script' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-cyan-400" />
          <span>Matn Rangi (Color):</span>
        </label>
        <div className="flex items-center gap-2 pt-1">
          {COLOR_PRESETS.map((color) => {
            const isSelected = customization.colorHex === color.hex;
            return (
              <button
                key={color.hex}
                type="button"
                onClick={() => onChange({ colorHex: color.hex })}
                style={{ backgroundColor: color.hex }}
                title={color.name}
                className={`w-7 h-7 rounded-full transition-transform border-2 ${
                  isSelected ? 'border-cyan-400 scale-115 ring-2 ring-cyan-500/50' : 'border-slate-700 hover:scale-105'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
