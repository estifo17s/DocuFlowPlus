import { Check } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface PricingProps {
  currentLang: Language;
  onBrowseTools: () => void;
}

export default function Pricing({ currentLang, onBrowseTools }: PricingProps) {
  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';

  return (
    <div className="mx-auto max-w-3xl" id="pricing-section">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Free Plan */}
        <div className="flex flex-col justify-between border border-line rounded-lg p-8 bg-panel hover:border-muted/30 transition-all duration-300">
          <div>
            <span className="font-mono text-xs font-semibold tracking-wider text-muted uppercase">
              {t('price_free_tier')}
            </span>
            <div className="mt-4 flex items-baseline text-ink">
              <span className="font-serif text-5xl font-bold tracking-tight">$0</span>
            </div>
            
            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_free_1')}</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_free_2')}</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_free_3')}</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_free_4')}</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onBrowseTools}
            className="mt-8 w-full rounded bg-ink py-3 text-center text-sm font-semibold text-paper hover:bg-black transition-colors"
          >
            {t('price_free_btn')}
          </button>
        </div>

        {/* Premium Plan */}
        <div className="flex flex-col justify-between border-2 border-brass rounded-lg p-8 bg-panel shadow-sm">
          <div>
            <div className="flex justify-between items-center">
              <span className="font-mono text-xs font-semibold tracking-wider text-brass uppercase">
                {t('price_premium_tier')}
              </span>
              <span className="bg-brass/10 text-brass font-mono text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded">
                Soon
              </span>
            </div>
            <div className="mt-4 flex items-baseline text-ink">
              <span className="font-serif text-5xl font-bold tracking-tight">$6</span>
              <span className="ml-1 font-sans text-sm text-muted">/mo</span>
            </div>

            <ul className="mt-8 space-y-4">
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_premium_1')}</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_premium_2')}</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_premium_3')}</span>
              </li>
              <li className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                <Check className="h-5 w-5 text-teal shrink-0 mt-0.5" />
                <span>{t('price_premium_4')}</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 w-full rounded bg-line/50 py-3 text-center text-sm font-semibold text-muted">
            {t('price_premium_btn')}
          </div>
        </div>
      </div>
    </div>
  );
}
