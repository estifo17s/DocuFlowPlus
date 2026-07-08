import { Language, TRANSLATIONS } from '../types';

interface PrivacyProps {
  currentLang: Language;
}

export default function Privacy({ currentLang }: PrivacyProps) {
  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';

  return (
    <div className="mx-auto max-w-3xl" id="privacy-section">
      <div className="flex flex-col gap-6 font-sans text-[14.5px] leading-relaxed text-muted">
        <p>
          <strong className="text-ink font-serif text-[16px] block mb-1">
            {currentLang === 'en' && 'Compress PDF, Merge PDF, Split PDF, Image to PDF, PDF to Image, Image Converter, Watermark PDF, Add Page Numbers, and Rotate PDF'}
            {currentLang === 'es' && 'Comprimir PDF, Unir PDF, Dividir PDF, Imagen a PDF, PDF a Imagen, Conversor de Imagen, Marca de Agua, Numeración de Páginas y Rotar PDF'}
            {currentLang === 'fr' && 'Compresser PDF, Fusionner PDF, Diviser PDF, Image vers PDF, PDF vers Image, Convertisseur d\'image, Filigrane PDF, Numérotation des pages et Pivoter PDF'}
            {currentLang === 'de' && 'PDF komprimieren, PDF zusammenführen, PDF teilen, Bild zu PDF, PDF zu Bild, Bildkonverter, PDF Wasserzeichen, Seitenzahlen und PDF drehen'}
            {currentLang === 'pt' && 'Comprimir PDF, Unir PDF, Dividir PDF, Imagem para PDF, PDF para Imagem, Conversor de Imagem, Marca d\'Água, Numeração de Páginas e Girar PDF'}
          </strong>
          {t('privacy_p1')}
        </p>

        <p>
          <strong className="text-ink font-serif text-[16px] block mb-1">
            {currentLang === 'en' && 'PDF to Word and Word to PDF'}
            {currentLang === 'es' && 'PDF a Word y Word a PDF'}
            {currentLang === 'fr' && 'PDF vers Word et Word vers PDF'}
            {currentLang === 'de' && 'PDF zu Word und Word zu PDF'}
            {currentLang === 'pt' && 'PDF para Word e Word para PDF'}
          </strong>
          {t('privacy_p2')}
        </p>

        <p>
          {t('privacy_p3')}
        </p>
      </div>
    </div>
  );
}
