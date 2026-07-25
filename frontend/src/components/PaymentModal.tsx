import React, { useState } from 'react';
import type { StickerTemplate, CustomizationState } from '../types';
import { X, Star, Download, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  template: StickerTemplate;
  customization: CustomizationState;
  onClose: () => void;
  onDownloadDirect: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  template,
  customization,
  onClose,
  onDownloadDirect
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleTelegramStarsPayment = () => {
    setIsProcessing(true);
    if (window.Telegram?.WebApp?.openInvoice) {
      window.Telegram.WebApp.openInvoice('https://t.me/invoice/sample_invoice_slug', (status: string) => {
        setIsProcessing(false);
        if (status === 'paid') {
          setPaymentSuccess(true);
        }
      });
    } else {
      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(true);
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-5 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!paymentSuccess ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Buyurtmani Tasdiqlash</h3>
                <p className="text-xs text-slate-400">Telegram Animated Sticker (.tgs)</p>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tanlangan Shablon:</span>
                <span className="font-bold text-slate-200">{template.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stikerdagi Matn:</span>
                <span className="font-bold text-cyan-400">{customization.text || template.default_text}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Format:</span>
                <span className="font-bold text-emerald-400">60 FPS Compliant .tgs</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">Jami Narx:</span>
                <div className="text-right">
                  <div className="flex items-center gap-1 font-extrabold text-amber-400 text-base">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{template.price_stars} Telegram Stars</span>
                  </div>
                  <div className="text-[11px] text-slate-400">({template.price_uzs.toLocaleString()} so'm)</div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleTelegramStarsPayment}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <Star className="w-4 h-4 fill-slate-950" />
                <span>Telegram Stars bilan to'lash ({template.price_stars} ⭐)</span>
              </button>

              <button
                type="button"
                onClick={onDownloadDirect}
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>To'g'ridan-to'g'ri bepul `.tgs` yuklab olish (Test Mode)</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Xavfsiz to'lov va kafolatlangan Telegram stiker fayli</span>
            </p>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-100">To'lov Muvaffaqiyatli Bajarildi!</h3>
            <p className="text-xs text-slate-300">
              Sizning <strong>{customization.text}</strong> stikeringiz tayyorlandi.
            </p>

            <button
              type="button"
              onClick={onDownloadDirect}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-indigo-500 text-white hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25"
            >
              <Download className="w-4 h-4" />
              <span>Tayyor `.tgs` Faylini Yuklab Olish</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
