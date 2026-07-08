import { useState, useEffect } from 'react';
import { Sun, Moon, Languages, ChevronDown } from 'lucide-react';
import { Language, LANG_NAMES, TRANSLATIONS } from '../types';

interface HeaderProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
  onBrowseTools: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export default function Header({
  currentLang,
  onLanguageChange,
  onBrowseTools,
  onScrollToSection
}: HeaderProps) {
  const [dark, setDark] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial dark theme
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    setDark(isDark);
  };

  const selectLanguage = (lang: Language) => {
    onLanguageChange(lang);
    setLangMenuOpen(false);
  };

  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/95 backdrop-blur-sm transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <button
            onClick={onBrowseTools}
            className="flex items-center gap-3 text-left focus:outline-none"
            id="logo-button"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded bg-ink font-serif text-lg font-bold text-brass transition-all hover:opacity-95">
              D
            </div>
            <span className="font-serif text-xl font-bold tracking-tight text-ink">
              DocuFlow<span className="text-brass">Plus</span>
            </span>
          </button>

          {/* Navigation & Controls */}
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => onScrollToSection('tools')}
                className="text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer"
                id="nav-tools"
              >
                {t('nav_tools')}
              </button>
              <button
                onClick={() => onScrollToSection('pricing')}
                className="text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer"
                id="nav-pricing"
              >
                {t('nav_pricing')}
              </button>
              <button
                onClick={() => onScrollToSection('privacy')}
                className="text-sm font-medium text-muted hover:text-ink transition-colors cursor-pointer"
                id="nav-privacy"
              >
                {t('nav_privacy')}
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-panel text-ink hover:border-brass transition-all"
                aria-label="Toggle Theme"
                id="theme-toggle"
              >
                {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="flex h-10 items-center gap-2 rounded-full border border-line bg-panel px-4 font-mono text-xs text-ink hover:border-brass transition-all"
                  id="language-dropdown"
                >
                  <Languages className="h-4 w-4 text-muted" />
                  <span>{LANG_NAMES[currentLang]}</span>
                  <ChevronDown className={`h-3 w-3 text-muted transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {langMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setLangMenuOpen(false)}
                    />
                    <div
                      className="absolute right-0 mt-2 w-44 origin-top-right rounded-md border border-line bg-panel p-1.5 shadow-lg ring-1 ring-black/5 focus:outline-none z-20 animate-in fade-in slide-in-from-top-2 duration-150"
                      role="menu"
                      id="language-menu"
                    >
                      {(Object.keys(LANG_NAMES) as Language[]).map((lang) => (
                        <button
                          key={lang}
                          onClick={() => selectLanguage(lang)}
                          className={`w-full text-left rounded px-3 py-2 text-sm font-sans transition-colors ${
                            currentLang === lang
                              ? 'bg-ink text-paper font-medium'
                              : 'text-ink hover:bg-paper'
                          }`}
                          role="menuitem"
                        >
                          {LANG_NAMES[lang]}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Action CTA */}
              <button
                onClick={onBrowseTools}
                className="hidden sm:inline-flex items-center justify-center rounded bg-ink px-5 py-2.5 text-sm font-semibold text-paper hover:bg-black transition-colors"
                id="browse-tools-cta"
              >
                {t('nav_browse')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
