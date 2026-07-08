import { useState } from 'react';
import { TOOLS, Language, ToolId, TRANSLATIONS } from './types';
import Header from './components/Header';
import ToolGrid from './components/ToolGrid';
import HonestyBanner from './components/HonestyBanner';
import Workspace from './components/Workspace';
import Pricing from './components/Pricing';
import Privacy from './components/Privacy';

export default function App() {
  const [currentLang, setCurrentLang] = useState<Language>('en');
  const [activeToolId, setActiveToolId] = useState<ToolId | null>(null);

  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';

  const handleSelectTool = (id: string) => {
    setActiveToolId(id as ToolId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBrowseTools = () => {
    setActiveToolId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId: string) => {
    setActiveToolId(null);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const activeTool = TOOLS.find((t) => t.id === activeToolId);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink selection:bg-brass-dim selection:text-ink transition-colors duration-200">
      {/* Global Navigation Header */}
      <Header
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        onBrowseTools={handleBrowseTools}
        onScrollToSection={scrollToSection}
      />

      <main className="flex-1">
        {activeTool ? (
          /* Active Tool Workspace */
          <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
            <Workspace
              tool={activeTool}
              currentLang={currentLang}
              onBack={handleBrowseTools}
            />
          </div>
        ) : (
          /* Main Index View */
          <>
            {/* Hero Section */}
            <section className="pt-20 pb-16 md:pt-24 md:pb-20">
              <div className="mx-auto max-w-7xl px-6 md:px-8">
                <div className="flex flex-col">
                  {/* Eyebrow */}
                  <div className="self-start inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-muted mb-8">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" />
                    <span>{t('hero_eyebrow')}</span>
                  </div>

                  {/* Heading */}
                  <h1
                    className="font-serif text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] max-w-4xl"
                    dangerouslySetInnerHTML={{ __html: t('hero_h1') }}
                  />

                  {/* Subtitle */}
                  <p className="mt-6 max-w-2xl font-sans text-[16px] md:text-[17px] leading-relaxed text-muted">
                    {t('hero_p')}
                  </p>

                  {/* Hero CTAs */}
                  <div className="mt-8 flex flex-wrap gap-4">
                    <button
                      onClick={() => scrollToSection('tools')}
                      className="rounded bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-black transition-colors"
                    >
                      {t('cta_browse')}
                    </button>
                    <button
                      onClick={() => scrollToSection('pricing')}
                      className="rounded border border-line bg-panel px-6 py-3 text-sm font-semibold text-ink hover:border-brass transition-all"
                    >
                      {t('cta_pricing')}
                    </button>
                  </div>

                  {/* Mini Fact strip */}
                  <div className="mt-16 grid grid-cols-1 divide-y divide-line border-t border-line sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                    <div className="py-6 sm:pr-6">
                      <div className="font-mono text-lg font-bold text-ink">9</div>
                      <div className="mt-1 text-xs text-muted">{t('fact_1')}</div>
                    </div>
                    <div className="py-6 sm:px-6">
                      <div className="font-mono text-lg font-bold text-ink">0</div>
                      <div className="mt-1 text-xs text-muted">{t('fact_2')}</div>
                    </div>
                    <div className="py-6 sm:pl-6">
                      <div className="font-mono text-lg font-bold text-ink">2</div>
                      <div className="mt-1 text-xs text-muted">{t('fact_3')}</div>
                    </div>
                  </div>

                  {/* Honesty Banner */}
                  <div className="mt-10">
                    <HonestyBanner currentLang={currentLang} />
                  </div>
                </div>
              </div>
            </section>

            {/* Tools Grid Section */}
            <section id="tools" className="border-t border-line py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6 md:px-8">
                <div className="mb-12">
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[10px] font-semibold tracking-wide text-muted mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                    <span>{t('tools_eyebrow')}</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    {t('tools_h2')}
                  </h2>
                  <p className="mt-3 max-w-xl font-sans text-sm text-muted">
                    {t('tools_p')}
                  </p>
                </div>

                <ToolGrid currentLang={currentLang} onSelectTool={handleSelectTool} />
              </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="border-t border-line py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6 md:px-8">
                <div className="mb-12 text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[10px] font-semibold tracking-wide text-muted mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-brass" />
                    <span>{t('pricing_eyebrow')}</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    {t('pricing_h2')}
                  </h2>
                  <p className="mt-3 mx-auto max-w-xl font-sans text-sm text-muted">
                    {t('pricing_p')}
                  </p>
                </div>

                <Pricing currentLang={currentLang} onBrowseTools={() => scrollToSection('tools')} />
              </div>
            </section>

            {/* Privacy Section */}
            <section id="privacy" className="border-t border-line py-16 md:py-20">
              <div className="mx-auto max-w-7xl px-6 md:px-8">
                <div className="mb-12">
                  <div className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1 font-mono text-[10px] font-semibold tracking-wide text-muted mb-4">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                    <span>{t('privacy_eyebrow')}</span>
                  </div>
                  <h2 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                    {t('privacy_h2')}
                  </h2>
                </div>

                <Privacy currentLang={currentLang} />
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-line bg-panel py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-ink font-serif text-base font-bold text-brass">
                  D
                </div>
                <span className="font-serif text-lg font-bold text-ink">
                  DocuFlow<span className="text-brass">Plus</span>
                </span>
              </div>
              <p className="mt-4 max-w-sm text-sm text-muted">
                {t('footer_tagline')}
              </p>
            </div>
            
            <div>
              <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wider mb-4">
                {t('footer_product')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('tools')}
                    className="text-sm text-muted hover:text-ink transition-colors cursor-pointer text-left"
                  >
                    {t('footer_alltools')}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('pricing')}
                    className="text-sm text-muted hover:text-ink transition-colors cursor-pointer text-left"
                  >
                    {t('footer_pricing')}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-serif text-sm font-semibold text-ink uppercase tracking-wider mb-4">
                {t('footer_company')}
              </h4>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection('privacy')}
                    className="text-sm text-muted hover:text-ink transition-colors cursor-pointer text-left"
                  >
                    {t('footer_privacy')}
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="font-mono text-xs text-muted">
              {t('footer_copy')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
