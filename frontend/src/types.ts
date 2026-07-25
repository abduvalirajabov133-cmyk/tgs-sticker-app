export interface StickerTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  price_stars: number;
  price_uzs: number;
  badge: string;
  icon: string;
  preview_lottie_file: string;
  default_text: string;
  supported_fields: string[];
}

export interface CustomizationState {
  text: string;
  fontType: 'bold' | 'script';
  colorHex: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any;
    };
  }
}
