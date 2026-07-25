import React from 'react';
import type { StickerTemplate } from '../types';
import { Star, CheckCircle2, Sparkles } from 'lucide-react';

interface TemplateShowcaseProps {
  templates: StickerTemplate[];
  selectedTemplate: StickerTemplate | null;
  onSelectTemplate: (template: StickerTemplate) => void;
}

export const TemplateShowcase: React.FC<TemplateShowcaseProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate
}) => {
  return (
    <section className="my-4">
      <div className="flex items-center justify-between px-1 mb-3">
        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Tayyor Shablonlar Catalog</span>
        </h2>
        <span className="text-xs text-slate-400 font-medium">
          {templates.length} ta shablon mavjud
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {templates.map((tpl) => {
          const isSelected = selectedTemplate?.id === tpl.id;
          return (
            <div
              key={tpl.id}
              onClick={() => onSelectTemplate(tpl)}
              className={`glass-card relative p-3.5 rounded-2xl cursor-pointer transition-all ${
                isSelected
                  ? 'border-cyan-400/80 bg-slate-900/90 ring-2 ring-cyan-500/40 shadow-lg shadow-cyan-500/10'
                  : 'hover:border-slate-700/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{tpl.icon}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  tpl.badge === 'Popular' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                  tpl.badge === 'Trending' ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {tpl.badge}
                </span>
              </div>

              <h3 className="font-bold text-sm text-slate-100 mb-1 flex items-center gap-1.5">
                <span>{tpl.title}</span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                {tpl.description}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{tpl.price_stars} Stars</span>
                  <span className="text-[10px] text-slate-400 font-normal">({tpl.price_uzs.toLocaleString()} so'm)</span>
                </div>
                <button
                  type="button"
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {isSelected ? 'Tanlandi' : 'Tanlash'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
