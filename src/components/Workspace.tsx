import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { ArrowLeft, Upload, X, Check, Loader2, AlertCircle, FileText, Download } from 'lucide-react';
import { Tool, Language, TRANSLATIONS } from '../types';
import {
  compressPDF,
  mergePDFs,
  splitPDF,
  imgToPDF,
  pdfToImages,
  convertImage,
  watermarkPDF,
  addPageNumbers,
  rotatePDF,
  formatBytes
} from '../lib/pdfTools';

interface WorkspaceProps {
  tool: Tool;
  currentLang: Language;
  onBack: () => void;
}

const WS_TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    back: '← Back to all tools',
    drop_hint: 'Drop file here, or click to browse',
    drop_hint_multi: 'Drop files here, or click to browse',
    process: 'Process File',
    processing: 'Processing...',
    download: 'Download Result',
    compress_light: 'Light — keep text selectable',
    compress_strong: 'Strong — max size reduction',
    compress_warning: 'Strong mode rebuilds each page as a compressed image. Text will no longer be selectable or searchable in the output file. Use Light mode if you need to keep working with the text.',
    watermark_label: 'Watermark Text',
    rotate_90: '90° clockwise',
    rotate_180: '180°',
    rotate_270: '270° clockwise',
    success_msg: 'File processed successfully!',
    empty_error: 'Please add a file to process.',
    merge_error: 'Please add at least 2 PDF files to merge.'
  },
  es: {
    back: '← Volver a las herramientas',
    drop_hint: 'Arrastra el archivo aquí, o haz clic para buscar',
    drop_hint_multi: 'Arrastra los archivos aquí, o haz clic para buscar',
    process: 'Procesar archivo',
    processing: 'Procesando...',
    download: 'Descargar resultado',
    compress_light: 'Ligero — mantiene texto seleccionable',
    compress_strong: 'Fuerte — reducción máxima de tamaño',
    compress_warning: 'El modo fuerte reconstruye cada página como una imagen comprimida. El texto ya no se podrá seleccionar ni buscar en el archivo resultante. Usa el modo ligero si necesitas seguir trabajando con el texto.',
    watermark_label: 'Texto de la Marca de Agua',
    rotate_90: '90° en sentido horario',
    rotate_180: '180°',
    rotate_270: '270° en sentido horario',
    success_msg: '¡Archivo procesado con éxito!',
    empty_error: 'Por favor, añade un archivo para procesar.',
    merge_error: 'Por favor, añade al menos 2 archivos PDF para unir.'
  },
  fr: {
    back: '← Retour aux outils',
    drop_hint: 'Déposez le fichier ici, ou cliquez pour parcourir',
    drop_hint_multi: 'Déposez les fichiers ici, ou cliquez pour parcourir',
    process: 'Traiter le fichier',
    processing: 'Traitement...',
    download: 'Télécharger le résultat',
    compress_light: 'Léger — texte sélectionnable',
    compress_strong: 'Fort — réduction de taille max',
    compress_warning: 'Le mode fort reconstruit chaque page sous forme d\'image compressée. Le texte ne sera plus sélectionnable ni recherchable dans le fichier de sortie. Utilisez le mode léger si vous devez continuer à travailler avec le texte.',
    watermark_label: 'Texte du Filigrane',
    rotate_90: '90° sens horaire',
    rotate_180: '180°',
    rotate_270: '270° sens horaire',
    success_msg: 'Fichier traité avec succès !',
    empty_error: 'Veuillez ajouter un fichier à traiter.',
    merge_error: 'Veuillez ajouter au moins 2 fichiers PDF à fusionner.'
  },
  de: {
    back: '← Zurück zu allen Werkzeugen',
    drop_hint: 'Datei hier ablegen oder zum Durchsuchen klicken',
    drop_hint_multi: 'Dateien hier ablegen oder zum Durchsuchen klicken',
    process: 'Datei verarbeiten',
    processing: 'Verarbeiten...',
    download: 'Ergebnis herunterladen',
    compress_light: 'Leicht — Text bleibt auswählbar',
    compress_strong: 'Stark — maximale Verkleinerung',
    compress_warning: 'Der starke Modus baut jede Seite als komprimiertes Bild neu auf. Der Text ist im Ergebnisdokument nicht mehr auswählbar oder durchsuchbar. Verwenden Sie den leichten Modus, wenn Sie weiterhin mit dem Text arbeiten möchten.',
    watermark_label: 'Wasserzeichentext',
    rotate_90: '90° im Uhrzeigersinn',
    rotate_180: '180°',
    rotate_270: '270° im Uhrzeigersinn',
    success_msg: 'Datei erfolgreich verarbeitet!',
    empty_error: 'Bitte fügen Sie eine Datei zur Verarbeitung hinzu.',
    merge_error: 'Bitte fügen Sie mindestens 2 PDF-Dateien zum Zusammenführen hinzu.'
  },
  pt: {
    back: '← Voltar para todas as ferramentas',
    drop_hint: 'Arraste o arquivo aqui, ou clique para navegar',
    drop_hint_multi: 'Arraste os arquivos aqui, ou clique para navegar',
    process: 'Processar arquivo',
    processing: 'Processando...',
    download: 'Baixar resultado',
    compress_light: 'Leve — mantém texto selecionável',
    compress_strong: 'Forte — redução máxima de tamanho',
    compress_warning: 'O modo forte reconstrói cada página como uma imagem comprimida. O texto não será mais selecionável ou pesquisável no arquivo de saída. Use o modo leve se precisar continuar trabalhando com o texto.',
    watermark_label: 'Texto da Marca d\'Água',
    rotate_90: '90° sentido horário',
    rotate_180: '180°',
    rotate_270: '270° sentido horário',
    success_msg: 'Arquivo processado com sucesso!',
    empty_error: 'Por favor, adicione um arquivo para processar.',
    merge_error: 'Por favor, adicione pelo menos 2 arquivos PDF para unir.'
  }
};

// Workspace FAQs corresponding to the ones in HTML
const WS_FAQS: Record<string, Record<Language, Array<[string, string]>>> = {
  compress: {
    en: [
      ['What\'s the difference between Light and Strong?', 'Light re-packs the PDF\'s internal structure — text stays fully selectable and searchable, but size reduction is modest. Strong renders each page as a compressed image and rebuilds the PDF from those — this shrinks image-heavy and scanned PDFs a lot more, but the text is no longer selectable or searchable afterward.'],
      ['Which should I use?', 'Use Light for reports, contracts, or anything where you need to select/search text later. Use Strong for scanned documents or image-heavy files where you just need a smaller file to share or email.'],
      ['Does this touch my images?', 'Light mode does not recompress embedded images. Strong mode recompresses everything, since it rebuilds each page as a single image.']
    ],
    es: [
      ['¿Cuál es la diferencia entre Ligero y Fuerte?', 'El modo ligero reestructura internamente el PDF: el texto sigue siendo totalmente seleccionable y buscable, pero la reducción de tamaño es modesta. El modo fuerte renderiza cada página como una imagen comprimida y reconstruye el PDF a partir de ellas; esto reduce mucho más los PDF con muchas imágenes o escaneados, pero el texto ya no se puede seleccionar ni buscar después.'],
      ['¿Cuál debería usar?', 'Usa Ligero para informes, contratos o cualquier cosa donde necesites seleccionar/buscar texto más adelante. Usa Fuerte para documentos escaneados o archivos con muchas imágenes donde solo necesitas un archivo más pequeño para compartir o enviar por correo.'],
      ['¿Esto afecta a mis imágenes?', 'El modo ligero no vuelve a comprimir las imágenes incrustadas. El modo fuerte comprime todo, ya que reconstruye cada página como una sola imagen.']
    ],
    fr: [
      ['Quelle est la différence entre Léger et Fort ?', 'Le mode léger réorganise la structure interne du PDF — le texte reste entièrement sélectionnable et recherchable, mais la réduction de taille est modeste. Le mode fort génère chaque page sous forme d\'image compressée et reconstruit le PDF à partir de celles-ci — cela réduit beaucoup plus les PDF volumineux contenant des images ou scannés, mais le texte n\'est plus sélectionnable ni recherchable par la suite.'],
      ['Lequel dois-je utiliser ?', 'Utilisez le mode léger pour les rapports, les contrats ou tout ce pour quoi vous aurez besoin de sélectionner/rechercher du texte plus tard. Utilisez le mode fort pour les documents scannés ou les fichiers contenant beaucoup d\'images lorsque vous avez juste besoin d\'un fichier plus petit à partager ou à envoyer par e-mail.'],
      ['Cela touche-t-il mes images ?', 'Le mode léger ne recompresse pas les images intégrées. Le mode fort recompresse tout, car il reconstruit chaque page sous forme d\'une seule image.']
    ],
    de: [
      ['Was ist der Unterschied zwischen Leicht und Stark?', 'Der leichte Modus packt die interne Struktur des PDFs neu — der Text bleibt vollständig auswählbar und durchsuchbar, aber die Größenreduktion ist moderat. Der starke Modus rendert jede Seite als komprimiertes Bild und baut das PDF daraus neu auf — dies verkleinert bildintensive und gescannte PDFs wesentlich mehr, aber der Text ist danach nicht mehr auswählbar oder durchsuchbar.'],
      ['Welchen Modus sollte ich verwenden?', 'Verwenden Sie den leichten Modus für Berichte, Verträge oder alles, bei dem Sie später Text auswählen/suchen müssen. Verwenden Sie den starken Modus für gescannte Dokumente oder bildintensive Dateien, bei denen Sie lediglich eine kleinere Datei zum Teilen oder Versenden per E-Mail benötigen.'],
      ['Berührt dies meine Bilder?', 'Der leichte Modus komprimiert eingebettete Bilder nicht neu. Der starke Modus komprimiert alles neu, da er jede Seite als einzelnes Bild neu aufbaut.']
    ],
    pt: [
      ['Qual é a diferença entre Leve e Forte?', 'O modo leve reestrutura o PDF internamente: o texto permanece totalmente selecionável e pesquisável, mas a redução de tamanho é modesta. O modo forte renderiza cada página como uma imagem comprimida e reconstrói o PDF a partir delas; isso reduz muito mais PDFs escaneados ou com muitas imagens, mas o texto não pode ser selecionado ou pesquisado posteriormente.'],
      ['Qual devo usar?', 'Use Leve para relatórios, contratos ou qualquer documento no qual você precise selecionar/pesquisar texto mais tarde. Use Forte para documentos escaneados ou arquivos com muitas imagens nos quais você só precisa de um arquivo menor para compartilhar ou enviar por e-mail.'],
      ['Isso altera minhas imagens?', 'O modo leve não comprime novamente as imagens incorporadas. O modo forte comprime tudo novamente, pois reconstrói cada página como uma única imagem.']
    ]
  },
  merge: {
    en: [
      ['Can I control the order?', 'Files are merged in the order you upload them. Remove and re-add a file to change its position.'],
      ['Is there a file limit?', 'No hard limit — your browser\'s available memory is the only constraint.']
    ],
    es: [
      ['¿Puedo controlar el orden?', 'Los archivos se fusionan en el orden en que los subes. Elimina y vuelve a añadir un archivo para cambiar su posición.'],
      ['¿Hay un límite de archivos?', 'No hay un límite estricto: la memoria disponible de tu navegador es la única limitación.']
    ],
    fr: [
      ['Puis-je contrôler l\'ordre ?', 'Les fichiers sont fusionnés dans l\'ordre dans lequel vous les téléchargez. Supprimez et réajoutez un fichier pour changer sa position.'],
      ['Y a-t-il une limite de fichiers ?', 'Pas de limite stricte — la mémoire disponible de votre navigateur est la seule contrainte.']
    ],
    de: [
      ['Kann ich die Reihenfolge steuern?', 'Dateien werden in der Reihenfolge zusammengeführt, in der Sie sie hochladen. Entfernen Sie eine Datei und fügen Sie sie erneut hinzu, um ihre Position zu ändern.'],
      ['Gibt es ein Dateilimit?', 'Keine feste Begrenzung — der verfügbare Arbeitsspeicher Ihres Browsers ist die einzige Einschränkung.']
    ],
    pt: [
      ['Posso controlar a ordem?', 'Os arquivos são combinados na ordem em que você os envia. Remova e adicione novamente um arquivo para alterar sua posição.'],
      ['Existe um limite de arquivos?', 'Sem limite rígido — a memória disponível do seu navegador é a única restrição.']
    ]
  },
  split: {
    en: [
      ['What do I get back?', 'A ZIP file containing one PDF per page, named page-1.pdf, page-2.pdf, etc.']
    ],
    es: [
      ['¿Qué obtengo de vuelta?', 'Un archivo ZIP que contiene un PDF por página, llamado page-1.pdf, page-2.pdf, etc.']
    ],
    fr: [
      ['Qu\'est-ce que je récupère ?', 'Un fichier ZIP contenant un PDF par page, nommé page-1.pdf, page-2.pdf, etc.']
    ],
    de: [
      ['Was bekomme ich zurück?', 'Eine ZIP-Datei, die ein PDF pro Seite enthält, benannt mit page-1.pdf, page-2.pdf, usw.']
    ],
    pt: [
      ['O que eu recebo de volta?', 'Um arquivo ZIP contendo um PDF por página, nomeado page-1.pdf, page-2.pdf, etc.']
    ]
  },
  img2pdf: {
    en: [
      ['Can I mix JPG and PNG?', 'Yes — any combination of JPG and PNG files can be combined into one PDF.']
    ],
    es: [
      ['¿Puedo mezclar JPG y PNG?', 'Sí, cualquier combinación de archivos JPG y PNG se puede combinar en un solo PDF.']
    ],
    fr: [
      ['Puis-je mélanger JPG et PNG ?', 'Oui — n\'importe quelle combinaison de fichiers JPG et PNG peut être combinée en un seul PDF.']
    ],
    de: [
      ['Kann ich JPG und PNG mischen?', 'Ja — jede Kombination aus JPG- und PNG-Dateien kann in einem PDF zusammengefasst werden.']
    ],
    pt: [
      ['Posso misturar JPG e PNG?', 'Sim — qualquer combinação de arquivos JPG e PNG pode ser combinada em um único PDF.']
    ]
  },
  pdf2img: {
    en: [
      ['What resolution are the images?', 'Pages render at 2x scale for good print/screen quality.']
    ],
    es: [
      ['¿Qué resolución tienen las imágenes?', 'Las páginas se renderizan a escala 2x para una buena calidad de impresión y pantalla.']
    ],
    fr: [
      ['Quelle est la résolution des images ?', 'Les pages sont générées à l\'échelle 2x pour une bonne qualité d\'impression ou d\'écran.']
    ],
    de: [
      ['Welche Auflösung haben die Bilder?', 'Seiten werden im 2-fachen Maßstab gerendert, um eine gute Druck-/Bildschirmqualität zu gewährleisten.']
    ],
    pt: [
      ['Qual é a resolução das imagens?', 'As páginas são renderizadas em escala 2x para uma boa qualidade de impressão/tela.']
    ]
  },
  imgconv: {
    en: [
      ['Will image quality change?', 'PNG and WEBP are near-lossless. Converting to JPG uses a high-quality setting (92%) but is a lossy format by nature.']
    ],
    es: [
      ['¿Cambiará la calidad de la imagen?', 'PNG y WEBP casi no tienen pérdidas. Convertir a JPG utiliza una configuración de alta calidad (92%) pero es un formato con pérdidas por naturaleza.']
    ],
    fr: [
      ['La qualité de l\'image changera-t-elle ?', 'PNG et WEBP sont presque sans perte. La conversion en JPG utilise un réglage de haute qualité (92 %) mais est un format avec perte par nature.']
    ],
    de: [
      ['Ändert sich die Bildqualität?', 'PNG und WEBP sind nahezu verlustfrei. Die Konvertierung in JPG verwendet eine hohe Qualitätseinstellung (92 %), ist aber von Natur aus ein verlustbehaftetes Format.']
    ],
    pt: [
      ['A qualidade da imagem vai mudar?', 'PNG e WEBP são quase sem perdas. A conversão para JPG usa uma configuração de alta qualidade (92%), mas é um formato com perdas por natureza.']
    ]
  },
  watermark: {
    en: [
      ['Can I control the position or angle?', 'The current version places a diagonal watermark across the center of each page at a fixed angle and opacity.'],
      ['Does this affect the original file?', 'No — you get a new file back. Your original upload is untouched and never leaves your browser.']
    ],
    es: [
      ['¿Puedo controlar la posición o el ángulo?', 'La versión actual coloca una marca de agua diagonal en el centro de cada página a un ángulo y opacidad fijos.'],
      ['¿Afecta esto al archivo original?', 'No, obtienes un archivo nuevo de vuelta. Tu archivo subido original permanece intacto y nunca sale de tu navegador.']
    ],
    fr: [
      ['Puis-je contrôler la position ou l\'angle ?', 'La version actuelle place un filigrane diagonal au centre de chaque page à un angle et une opacité fixes.'],
      ['Cela affecte-t-il le fichier original ?', 'Non — vous récupérez un nouveau fichier. Votre document d\'origine n\'est pas touché et ne quitte jamais votre navigateur.']
    ],
    de: [
      ['Kann ich die Position oder den Winkel steuern?', 'Die aktuelle Version platziert ein diagonales Wasserzeichen in der Mitte jeder Seite mit einem festen Winkel und einer festen Deckkraft.'],
      ['Betrifft dies die Originaldatei?', 'Nein — Sie erhalten eine neue Datei zurück. Ihr ursprünglicher Upload bleibt unberührt und verlässt Ihren Browser nie.']
    ],
    pt: [
      ['Posso controlar a posição ou o ângulo?', 'A versão atual coloca uma marca d\'água diagonal no centro de cada página com um ângulo e opacidade fixos.'],
      ['Isso afeta o arquivo original?', 'Não — você recebe um novo arquivo de volta. Seu envio original permanece intocado e nunca sai do seu navegador.']
    ]
  },
  pagenum: {
    en: [
      ['Can I change the position or format?', 'The current version places numbers bottom-center in the format "Page X of N".']
    ],
    es: [
      ['¿Puedo cambiar la posición o el formato?', 'La versión actual coloca los números en el centro inferior en el formato "Página X de N".']
    ],
    fr: [
      ['Puis-je changer la position ou le format ?', 'La version actuelle place les numéros en bas au centre au format « Page X sur N ».']
    ],
    de: [
      ['Kann ich die Position oder das Format ändern?', 'Die aktuelle Version platziert Seitenzahlen unten in der Mitte im Format „Seite X von N“.']
    ],
    pt: [
      ['Posso alterar a posição ou formato?', 'A versão atual coloca os números no centro inferior no formato "Página X de N".']
    ]
  },
  rotate: {
    en: [
      ['Does this rotate every page the same way?', 'Yes, the current version applies one rotation angle to all pages in the file.'],
      ['Is this reversible?', 'Yes — just re-run the tool and choose the opposite rotation to undo it.']
    ],
    es: [
      ['¿Esto rota todas las páginas de la misma manera?', 'Sí, la versión actual aplica un único ángulo de rotación a todas las páginas del archivo.'],
      ['¿Es esto reversible?', 'Sí, solo vuelve a pasar el archivo por la herramienta y elige la rotación opuesta para deshacerlo.']
    ],
    fr: [
      ['Cela fait-il pivoter chaque page de la même manière ?', 'Oui, la version actuelle applique un angle de rotation unique à toutes les pages du fichier.'],
      ['Est-ce réversible ?', 'Oui — repassez simplement le fichier dans l\'outil et choisissez la rotation opposée pour l\'annuler.']
    ],
    de: [
      ['Werden alle Seiten gleich gedreht?', 'Ja, die aktuelle Version wendet einen festen Drehwinkel auf alle Seiten der Datei an.'],
      ['Ist dies umkehrbar?', 'Ja — lassen Sie das Tool einfach erneut laufen und wählen Sie die entgegengesetzte Drehung, um es rückgängig zu machen.']
    ],
    pt: [
      ['Isso gira todas as páginas da mesma forma?', 'Sim, a versão atual aplica um ângulo de rotação único a todas as páginas do arquivo.'],
      ['Isso é reversível?', 'Sim — basta passar o arquivo novamente pela ferramenta e escolher a rotação oposta para desfazer.']
    ]
  }
};

export default function Workspace({ tool, currentLang, onBack }: WorkspaceProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [result, setResult] = useState<{ blob: Blob; filename: string; summary: string } | null>(null);

  // Settings states
  const [compressLevel, setCompressLevel] = useState<'light' | 'strong'>('light');
  const [imageFormat, setImageFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [rotateAngle, setRotateAngle] = useState<90 | 180 | 270>(90);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = (key: string) => TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || '';
  const wsT = (key: string) => WS_TRANSLATIONS[currentLang]?.[key] || WS_TRANSLATIONS.en[key] || '';

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Check extension filters
    const accepts = tool.accept ? tool.accept.toLowerCase().split(',') : [];
    const filtered = newFiles.filter((file) => {
      if (accepts.length === 0) return true;
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      return accepts.includes(extension) || accepts.includes(file.type.toLowerCase());
    });

    if (tool.multi) {
      setFiles((prev) => [...prev, ...filtered]);
    } else {
      setFiles(filtered.slice(0, 1));
    }
    // Reset previous result & errors
    setResult(null);
    setErrorText('');
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const triggerBrowse = () => {
    fileInputRef.current?.click();
  };

  const downloadResult = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const processTool = async () => {
    if (files.length === 0) {
      setErrorText(wsT('empty_error'));
      return;
    }

    setProcessing(true);
    setErrorText('');
    setResult(null);

    try {
      if (tool.id === 'compress') {
        const res = await compressPDF(files[0], compressLevel, setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.pdf$/i, '');
        setResult({
          blob: res.blob,
          filename: `${nameWithoutExt}-compressed.pdf`,
          summary: `${formatBytes(res.before)} → ${formatBytes(res.after)} (${Math.max(0, Math.round((1 - res.after / res.before) * 100))}% reduction). ${res.note}`
        });
      } else if (tool.id === 'merge') {
        if (files.length < 2) {
          throw new Error(wsT('merge_error'));
        }
        const blob = await mergePDFs(files, setStatusText);
        setResult({
          blob,
          filename: 'merged.pdf',
          summary: `Successfully merged ${files.length} PDF files into a single document.`
        });
      } else if (tool.id === 'split') {
        const res = await splitPDF(files[0], setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.pdf$/i, '');
        setResult({
          blob: res.blob,
          filename: `${nameWithoutExt}-split.zip`,
          summary: `Split PDF into ${res.count} pages. Delivered as a ZIP archive.`
        });
      } else if (tool.id === 'img2pdf') {
        const blob = await imgToPDF(files, setStatusText);
        setResult({
          blob,
          filename: 'images-combined.pdf',
          summary: `Combined ${files.length} image(s) into a single PDF document.`
        });
      } else if (tool.id === 'pdf2img') {
        const res = await pdfToImages(files[0], setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.pdf$/i, '');
        if (res.singlePage) {
          setResult({
            blob: res.blob,
            filename: `${nameWithoutExt}.png`,
            summary: `Successfully rendered 1 PDF page as a high-quality PNG.`
          });
        } else {
          setResult({
            blob: res.blob,
            filename: `${nameWithoutExt}-images.zip`,
            summary: `Successfully rendered ${res.count} pages to PNG. Delivered as a ZIP archive.`
          });
        }
      } else if (tool.id === 'imgconv') {
        const blob = await convertImage(files[0], imageFormat, setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.[^.]+$/, '');
        const ext = imageFormat.split('/')[1].replace('jpeg', 'jpg');
        setResult({
          blob,
          filename: `${nameWithoutExt}.${ext}`,
          summary: `Converted image to ${ext.toUpperCase()} format (${formatBytes(blob.size)}).`
        });
      } else if (tool.id === 'watermark') {
        const blob = await watermarkPDF(files[0], watermarkText, setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.pdf$/i, '');
        setResult({
          blob,
          filename: `${nameWithoutExt}-watermarked.pdf`,
          summary: `Added watermarks across ${files.length} page(s) with text "${watermarkText}".`
        });
      } else if (tool.id === 'pagenum') {
        const blob = await addPageNumbers(files[0], setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.pdf$/i, '');
        setResult({
          blob,
          filename: `${nameWithoutExt}-numbered.pdf`,
          summary: `Successfully added "Page X of Y" page numbers to footer of all pages.`
        });
      } else if (tool.id === 'rotate') {
        const blob = await rotatePDF(files[0], rotateAngle, setStatusText);
        const nameWithoutExt = files[0].name.replace(/\.pdf$/i, '');
        setResult({
          blob,
          filename: `${nameWithoutExt}-rotated.pdf`,
          summary: `Rotated all pages in PDF by ${rotateAngle} degrees.`
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'Something went wrong processing this file. Make sure it is a valid, uncorrupted file.');
    } finally {
      setProcessing(false);
      setStatusText('');
    }
  };

  const toolName = t(tool.nameKey);
  const toolDesc = t(tool.descKey);
  const faqs = WS_FAQS[tool.id]?.[currentLang] || WS_FAQS[tool.id]?.en || [];

  return (
    <div className="mx-auto max-w-3xl py-10" id={`workspace-${tool.id}`}>
      {/* Back navigation */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-mono text-muted hover:text-ink cursor-pointer mb-6 outline-none transition-colors"
        id="ws-back-btn"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{wsT('back')}</span>
      </button>

      <div className="mb-8">
        <h2 className="font-serif text-3xl font-bold text-ink mb-2">
          {toolName}
        </h2>
        <p className="font-sans text-sm text-muted">
          {toolDesc}
        </p>
      </div>

      {/* Upload Dropzone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={triggerBrowse}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-brass bg-brass/5'
            : 'border-line bg-panel hover:bg-paper/50'
        }`}
        id="dropzone-area"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={tool.multi}
          accept={tool.accept}
          onChange={handleFileChange}
          className="hidden"
          id="file-input-field"
        />
        <Upload className="h-8 w-8 text-muted mb-4" />
        <p className="font-serif text-[16px] text-ink mb-1">
          {tool.multi ? wsT('drop_hint_multi') : wsT('drop_hint')}
        </p>
        <p className="font-mono text-xs text-muted">
          {tool.accept ? tool.accept.split(',').join(' · ') : ''}
        </p>
      </div>

      {/* Selected Files List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-2.5" id="selected-files-list">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between border border-line bg-panel rounded p-3 text-sm animate-in fade-in slide-in-from-top-1 duration-150"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted shrink-0" />
                <span className="font-mono text-xs text-ink font-medium truncate max-w-[280px] sm:max-w-[420px]">
                  {file.name}
                </span>
                <span className="font-mono text-[10px] text-muted shrink-0">
                  ({formatBytes(file.size)})
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="text-muted hover:text-red transition-colors p-1"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tool Specific Config Settings */}
      {files.length > 0 && (
        <div className="mt-8 border-t border-line pt-6" id="tool-settings-block">
          {/* 1. Compress Settings */}
          {tool.id === 'compress' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => setCompressLevel('light')}
                  className={`px-4 py-2 text-xs font-mono rounded-full border transition-all ${
                    compressLevel === 'light'
                      ? 'bg-ink border-ink text-paper font-semibold'
                      : 'border-line text-ink hover:border-muted'
                  }`}
                >
                  {wsT('compress_light')}
                </button>
                <button
                  onClick={() => setCompressLevel('strong')}
                  className={`px-4 py-2 text-xs font-mono rounded-full border transition-all ${
                    compressLevel === 'strong'
                      ? 'bg-ink border-ink text-paper font-semibold'
                      : 'border-line text-ink hover:border-muted'
                  }`}
                >
                  {wsT('compress_strong')}
                </button>
              </div>
              {compressLevel === 'strong' && (
                <div className="flex gap-2.5 border border-brass-dim bg-brass/5 rounded p-4 text-xs text-ink/90 font-serif leading-relaxed">
                  <AlertCircle className="h-4 w-4 text-brass shrink-0 mt-0.5" />
                  <p>{wsT('compress_warning')}</p>
                </div>
              )}
            </div>
          )}

          {/* 6. Image Converter Settings */}
          {tool.id === 'imgconv' && (
            <div className="space-y-2">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-2">
                Convert To Format
              </label>
              <div className="flex gap-2.5">
                {(['image/png', 'image/jpeg', 'image/webp'] as const).map((fmt) => {
                  const ext = fmt.split('/')[1].replace('jpeg', 'jpg').toUpperCase();
                  return (
                    <button
                      key={fmt}
                      onClick={() => setImageFormat(fmt)}
                      className={`px-5 py-2 text-xs font-mono rounded-full border transition-all ${
                        imageFormat === fmt
                          ? 'bg-ink border-ink text-paper font-semibold'
                          : 'border-line text-ink hover:border-muted'
                      }`}
                    >
                      {ext}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Watermark Settings */}
          {tool.id === 'watermark' && (
            <div className="space-y-2.5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-muted font-medium">
                {wsT('watermark_label')}
              </label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="e.g. DRAFT"
                className="w-full border border-line bg-panel text-ink rounded px-4 py-3 font-mono text-sm leading-relaxed outline-none focus:border-brass transition-all"
              />
            </div>
          )}

          {/* 9. Rotation Settings */}
          {tool.id === 'rotate' && (
            <div className="space-y-2">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-muted mb-2">
                Rotation Angle
              </label>
              <div className="flex flex-wrap gap-2.5">
                {([90, 180, 270] as const).map((angle) => (
                  <button
                    key={angle}
                    onClick={() => setRotateAngle(angle)}
                    className={`px-5 py-2 text-xs font-mono rounded-full border transition-all ${
                      rotateAngle === angle
                        ? 'bg-ink border-ink text-paper font-semibold'
                        : 'border-line text-ink hover:border-muted'
                    }`}
                  >
                    {angle === 90 ? wsT('rotate_90') : angle === 180 ? wsT('rotate_180') : wsT('rotate_270')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Trigger Button */}
      {files.length > 0 && !result && (
        <button
          onClick={processTool}
          disabled={processing}
          className="mt-8 w-full flex items-center justify-center gap-2 rounded bg-ink py-4 font-semibold text-paper hover:bg-black transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brass disabled:opacity-50"
          id="ws-process-btn"
        >
          {processing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-paper" />
              <span>{wsT('processing')}</span>
            </>
          ) : (
            <span>{wsT('process')}</span>
          )}
        </button>
      )}

      {/* Status Log */}
      {processing && statusText && (
        <p className="mt-4 font-mono text-xs text-muted text-center animate-pulse" id="processing-status-log">
          {statusText}
        </p>
      )}

      {/* Error Output */}
      {errorText && (
        <div className="mt-6 flex items-start gap-3 border border-red/30 bg-red/5 text-red rounded p-4 text-sm font-sans" id="ws-error-block">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Error:</strong> {errorText}
          </p>
        </div>
      )}

      {/* Success Result Container */}
      {result && (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border border-teal bg-teal/5 text-ink rounded-lg p-6 animate-in fade-in slide-in-from-bottom-2 duration-300" id="ws-result-box">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-teal text-paper">
                <Check className="h-3 w-3" />
              </div>
              <strong className="font-serif text-[17px] font-bold text-ink">
                {wsT('success_msg')}
              </strong>
            </div>
            <p className="font-sans text-sm text-muted">
              {result.summary}
            </p>
            <p className="font-mono text-xs text-ink/70 truncate max-w-[280px] sm:max-w-md">
              {result.filename}
            </p>
          </div>

          <button
            onClick={downloadResult}
            className="flex items-center justify-center gap-2 rounded bg-teal px-5 py-3 text-sm font-semibold text-paper hover:bg-teal/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{wsT('download')}</span>
          </button>
        </div>
      )}

      {/* FAQ Accordions for Specific Tool */}
      {faqs.length > 0 && (
        <div className="mt-12 border-t border-line pt-8" id="tool-faqs-block">
          <h4 className="font-serif text-lg font-bold text-ink mb-4">
            Frequently Asked Questions
          </h4>
          <div className="space-y-1">
            {faqs.map(([q, a], idx) => (
              <details
                key={idx}
                className="group border-b border-line py-3.5 outline-none"
              >
                <summary className="flex items-center justify-between font-serif text-[15px] font-semibold text-ink hover:text-brass cursor-pointer list-none">
                  <span>{q}</span>
                  <span className="font-mono text-xs text-muted group-open:rotate-180 transition-transform">
                    ▾
                  </span>
                </summary>
                <p className="mt-2.5 font-sans text-sm leading-relaxed text-muted">
                  {a}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
