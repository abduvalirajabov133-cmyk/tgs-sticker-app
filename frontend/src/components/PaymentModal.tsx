import React, { useState } from 'react';
import type { StickerTemplate, CustomizationState } from '../types';
import { X, CreditCard, Send, CheckCircle, ShieldCheck, Copy, Check } from 'lucide-react';

interface PaymentModalProps {
  template: StickerTemplate;
  customization: CustomizationState;
  onClose: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  template,
  customization,
  onClose
}) => {
  const [receiptInfo, setReceiptInfo] = useState('');
  const [phone, setPhone] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  const cardNumber = "8600 1234 5678 9012";
  const cardHolder = "ABDUVALI R.";

  const handleCopyCard = () => {
    navigator.clipboard.writeText(cardNumber.replace(/\s+/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptInfo.trim()) {
      alert("Iltimos, to'lov cheki yoki tranzaksiya ma'lumotlarini kiriting!");
      return;
    }

    setIsSubmitting(true);

    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

    try {
      const response = await fetch('https://odobli-ai-bot.onrender.com/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          text: customization.text || template.default_text,
          font_type: customization.fontType,
          color_hex: customization.colorHex,
          user_id: tgUser?.id || null,
          user_name: tgUser?.first_name || tgUser?.username || "Foydalanuvchi",
          receipt_info: receiptInfo,
          phone: phone
        })
      });

      const resData = await response.json();
      setIsSubmitting(false);

      if (response.ok) {
        setOrderSubmitted(true);
      } else {
        alert("Buyurtma yuborishda xatolik: " + (resData.detail || "Server xatosi"));
      }
    } catch (err) {
      setIsSubmitting(false);
      alert("Serverga ulanishda xatolik yuz berdi: " + err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-5 border border-slate-700 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {!orderSubmitted ? (
          <form onSubmit={handleSubmitOrder}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Karta Orqali To'lov</h3>
                <p className="text-xs text-slate-400">Admin chekni tekshirib stikerni yuboradi</p>
              </div>
            </div>

            {/* Order Detail Box */}
            <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-800 space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Shablon:</span>
                <span className="font-bold text-slate-200">{template.title}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Stikerdagi Matn:</span>
                <span className="font-bold text-cyan-400">{customization.text || template.default_text}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-200">To'lov Summasi:</span>
                <span className="font-extrabold text-emerald-400 text-base">
                  {template.price_uzs.toLocaleString()} so'm
                </span>
              </div>
            </div>

            {/* Card Information Box */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950/80 rounded-2xl p-3.5 border border-cyan-500/30 mb-4 relative">
              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider mb-1">To'lov uchun plastik karta:</div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-base font-extrabold text-white tracking-widest">{cardNumber}</div>
                  <div className="text-xs text-slate-300 font-semibold mt-0.5">{cardHolder}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCard}
                  className="px-2.5 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1 border border-cyan-500/40"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Nusxalandi' : 'Nusxa'}</span>
                </button>
              </div>
            </div>

            {/* Inputs: Receipt & Phone */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  To'lov Cheki / Tranzaksiya raqami: <span className="text-pink-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={receiptInfo}
                  onChange={(e) => setReceiptInfo(e.target.value)}
                  placeholder="Masalan: 123456789 yoki Payme/Click chek ID"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telefon Raqamingiz (ixtiyoriy):
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Yuborilmoqda...' : 'Chekni Yuborish va Buyurtma Berish'}</span>
            </button>

            <p className="text-[10px] text-center text-slate-400 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>Admin chekni tekshirib, 1-2 daqiqada botingizga stikerni yuboradi.</span>
            </p>
          </form>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-slate-100">Buyurtmangiz Yuborildi!</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Sizning <strong>{customization.text}</strong> stiker buyurtmangiz hamda chek ma'lumotlaringiz adminga yetkazildi.
            </p>

            <div className="bg-slate-900/80 rounded-xl p-3 text-xs text-cyan-300 font-semibold border border-cyan-500/30">
              Admin chekni tekshirib, stikerni Telegram botingizga yuboradi.
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all"
            >
              Yopish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
