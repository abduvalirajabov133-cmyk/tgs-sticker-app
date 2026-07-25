import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TemplateShowcase } from './components/TemplateShowcase';
import { LottieCanvas } from './components/LottieCanvas';
import { CustomizerPanel } from './components/CustomizerPanel';
import { PaymentModal } from './components/PaymentModal';
import type { StickerTemplate, CustomizationState } from './types';
import { ShoppingBag, Download, Layers } from 'lucide-react';

const MOCK_TEMPLATES: StickerTemplate[] = [
  {
    id: 'flag',
    title: "To'lqinlanuvchi Bayroq Stiker",
    description: "Yorqin ranglar va to'lqinlanuvchi harakatli bayroq stikeri. Ismingiz yoki brendingiz uchun ideal.",
    category: "Bayroqlar",
    price_stars: 15,
    price_uzs: 10000,
    badge: "Popular",
    icon: "🚩",
    preview_lottie_file: "flag.json",
    default_text: "Zuhra",
    supported_fields: ["text", "font", "color"]
  },
  {
    id: 'heart',
    title: "Urib turuvchi Yurak Stiker",
    description: "Nurlanuvchi va urib turuvchi 3D romantik yurak stikeri. Husnixat va shrift bilan kiritish.",
    category: "Sevgi",
    price_stars: 15,
    price_uzs: 10000,
    badge: "Trending",
    icon: "💖",
    preview_lottie_file: "heart.json",
    default_text: "Zuhra",
    supported_fields: ["text", "font", "color"]
  },
  {
    id: 'instagram',
    title: "Instagram Profil Stiker",
    description: "Rasmiy Instagram logotipi va animatsiyali profilingiz username stikeri.",
    category: "Social",
    price_stars: 10,
    price_uzs: 8000,
    badge: "Hot",
    icon: "📸",
    preview_lottie_file: "instagram.json",
    default_text: "olimova_ai",
    supported_fields: ["text", "font", "color"]
  }
];

export const App: React.FC = () => {
  const [templates, setTemplates] = useState<StickerTemplate[]>(MOCK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<StickerTemplate>(MOCK_TEMPLATES[0]);
  const [lottiePreviewData, setLottiePreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);

  const [customization, setCustomization] = useState<CustomizationState>({
    text: MOCK_TEMPLATES[0].default_text,
    fontType: 'bold',
    colorHex: '#FFFFFF'
  });

  useEffect(() => {
    fetch('http://localhost:8000/api/templates')
      .then(res => res.json())
      .then(data => {
        if (data.templates && data.templates.length > 0) {
          setTemplates(data.templates);
        }
      })
      .catch(err => console.log('Using static fallback templates:', err));
  }, []);

  useEffect(() => {
    if (!selectedTemplate) return;

    setIsLoadingPreview(true);

    fetch('http://localhost:8000/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        template_id: selectedTemplate.id,
        text: customization.text || selectedTemplate.default_text,
        font_type: customization.fontType,
        color_hex: customization.colorHex
      })
    })
      .then(res => res.json())
      .then(data => {
        setLottiePreviewData(data);
        setIsLoadingPreview(false);
      })
      .catch(err => {
        console.error('Preview error:', err);
        setIsLoadingPreview(false);
      });
  }, [selectedTemplate, customization]);

  const handleSelectTemplate = (template: StickerTemplate) => {
    setSelectedTemplate(template);
    setCustomization(prev => ({
      ...prev,
      text: template.default_text
    }));
  };

  const handleDownloadDirect = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selectedTemplate.id,
          text: customization.text || selectedTemplate.default_text,
          font_type: customization.fontType,
          color_hex: customization.colorHex
        })
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate.id}_${customization.text || 'sticker'}.tgs`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert('TGS faylini yuklab olishda xatolik: ' + err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pb-24 pt-2">
        <div className="glass-panel rounded-3xl p-4 my-2 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-indigo-950/30 to-purple-950/40 relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/30">
                MiniApp Sticker Creator
              </span>
              <h2 className="text-xl font-extrabold mt-1 leading-tight gradient-text-cyan">
                O'zingizning Telegram Stikeringizni Yaratasiz
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-md">
                Tayyor shablonni tanlang, ismingizni kiriting va jonli stikerni saqlab oling!
              </p>
            </div>
          </div>
        </div>

        <TemplateShowcase
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={handleSelectTemplate}
        />

        <div className="text-center mt-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tanlangan Shablon Jonli Ko'rinishi</span>
          </h3>
          <LottieCanvas
            lottieData={lottiePreviewData}
            isLoading={isLoadingPreview}
          />
        </div>

        <CustomizerPanel
          customization={customization}
          onChange={(updated) => setCustomization(prev => ({ ...prev, ...updated }))}
        />
      </main>

      <footer className="fixed bottom-0 inset-x-0 z-40 p-3 glass-panel border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadDirect}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 border border-slate-700 active:scale-98"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>.tgs Fayl Yuklash</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 text-white hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-98"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sotib Olish ({selectedTemplate?.price_stars || 15} ⭐)</span>
          </button>
        </div>
      </footer>

      {showPaymentModal && (
        <PaymentModal
          template={selectedTemplate}
          customization={customization}
          onClose={() => setShowPaymentModal(false)}
          onDownloadDirect={() => {
            setShowPaymentModal(false);
            handleDownloadDirect();
          }}
        />
      )}
    </div>
  );
};

export default App;
