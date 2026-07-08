import { AlertCircle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface HonestyBannerProps {
  currentLang: Language;
}

export default function HonestyBanner({ currentLang }: HonestyBannerProps) {
  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';

  return (
    <div className="flex gap-3.5 border border-brass-dim bg-brass/5 rounded-md p-5 text-sm leading-relaxed text-ink/90 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <AlertCircle className="h-5 w-5 text-brass shrink-0 mt-0.5" />
      <div>
        <span className="font-semibold text-brass font-mono text-xs uppercase tracking-wider block mb-1">
          {t('honesty_title')}
        </span>
        <p className="font-serif text-[15px] leading-relaxed">
          {t('honesty_body')}
        </p>
      </div>
    </div>
  );
}
