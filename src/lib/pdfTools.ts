import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker to run in a web-worker via a reliable CDN matching our major version
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Convert any File (image) to compatible JPEG bytes via HTML Canvas
 */
async function fileToJpgBytes(file: File, quality = 0.85): Promise<Uint8Array> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create 2D canvas context');
  ctx.drawImage(bitmap, 0, 0);
  
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });
  if (!blob) throw new Error('Could not convert canvas to JPEG');
  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * 1. Compress PDF
 */
export async function compressPDF(
  file: File,
  level: 'light' | 'strong',
  onProgress: (status: string) => void
): Promise<{ blob: Blob; before: number; after: number; note: string }> {
  const before = file.size;
  const bytes = await file.arrayBuffer();
  onProgress('Loading document...');

  if (level === 'light') {
    // Light mode: read and save using Object Streams to compress PDF structure
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    onProgress('Optimizing structures...');
    const out = await doc.save({ useObjectStreams: true });
    const blob = new Blob([out], { type: 'application/pdf' });
    return {
      blob,
      before,
      after: out.byteLength,
      note: 'Text remains fully selectable and searchable.'
    };
  } else {
    // Strong mode: render pages as compressed JPEGs, rebuild PDF from them
    onProgress('Parsing PDF pages...');
    const loadingTask = pdfjsLib.getDocument({ data: bytes });
    const pdf = await loadingTask.promise;
    const outDoc = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      onProgress(`Rendering page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const baseViewport = page.getViewport({ scale: 1 });
      
      // Keep dimensions responsive, cap large dimensions to prevent browser crash
      const maxDim = Math.max(baseViewport.width, baseViewport.height);
      const scale = Math.min(1.6, 1600 / maxDim);
      const viewport = page.getViewport({ scale: Math.max(scale, 0.8) });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context failure during strong compression');

      await page.render({ canvasContext: ctx, viewport } as any).promise;
      
      const jpgBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.5); // high compression
      });
      if (!jpgBlob) throw new Error(`Could not compress page ${i}`);
      
      const jpgBytes = new Uint8Array(await jpgBlob.arrayBuffer());
      const embedded = await outDoc.embedJpg(jpgBytes);
      const outPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
      outPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: baseViewport.width,
        height: baseViewport.height
      });
    }

    onProgress('Bundling new PDF...');
    const out = await outDoc.save();
    const blob = new Blob([out], { type: 'application/pdf' });
    return {
      blob,
      before,
      after: out.byteLength,
      note: 'Text is no longer selectable — pages were rebuilt as optimized images.'
    };
  }
}

/**
 * 2. Merge PDFs
 */
export async function mergePDFs(
  files: File[],
  onProgress: (status: string) => void
): Promise<Blob> {
  onProgress('Initializing merger...');
  const merged = await PDFDocument.create();

  for (let idx = 0; idx < files.length; idx++) {
    const f = files[idx];
    onProgress(`Importing file ${idx + 1} of ${files.length}: ${f.name}...`);
    const bytes = await f.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  onProgress('Assembling merged PDF...');
  const out = await merged.save();
  return new Blob([out], { type: 'application/pdf' });
}

/**
 * 3. Split PDF
 */
export async function splitPDF(
  file: File,
  onProgress: (status: string) => void
): Promise<{ blob: Blob; count: number }> {
  onProgress('Loading document...');
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const count = doc.getPageCount();
  
  if (count < 2) {
    throw new Error('This PDF has only 1 page — nothing to split.');
  }

  const zip = new JSZip();
  for (let i = 0; i < count; i++) {
    onProgress(`Extracting page ${i + 1} of ${count}...`);
    const single = await PDFDocument.create();
    const [p] = await single.copyPages(doc, [i]);
    single.addPage(p);
    const b = await single.save();
    zip.file(`page-${i + 1}.pdf`, b);
  }

  onProgress('Creating ZIP archive...');
  const blob = await zip.generateAsync({ type: 'blob' });
  return { blob, count };
}

/**
 * 4. Image to PDF
 */
export async function imgToPDF(
  files: File[],
  onProgress: (status: string) => void
): Promise<Blob> {
  onProgress('Initializing builder...');
  const doc = await PDFDocument.create();

  for (let idx = 0; idx < files.length; idx++) {
    const f = files[idx];
    onProgress(`Processing image ${idx + 1} of ${files.length}...`);
    
    // Convert to compatible format
    const jpgBytes = await fileToJpgBytes(f);
    const img = await doc.embedJpg(jpgBytes);
    
    const page = doc.addPage([img.width, img.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: img.width,
      height: img.height
    });
  }

  onProgress('Saving PDF...');
  const out = await doc.save();
  return new Blob([out], { type: 'application/pdf' });
}

/**
 * 5. PDF to Image
 */
export async function pdfToImages(
  file: File,
  onProgress: (status: string) => void
): Promise<{ blob: Blob; count: number; singlePage: boolean }> {
  onProgress('Loading PDF document...');
  const bytes = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
  const count = pdf.numPages;

  if (count === 1) {
    onProgress('Rendering page 1...');
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not prepare canvas context');

    await page.render({ canvasContext: ctx, viewport } as any).promise;
    
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (!blob) throw new Error('Could not render page to image');
    return { blob, count, singlePage: true };
  } else {
    const zip = new JSZip();
    for (let i = 1; i <= count; i++) {
      onProgress(`Rendering page ${i} of ${count}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not prepare canvas context');

      await page.render({ canvasContext: ctx, viewport } as any).promise;
      
      const pageBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });
      if (!pageBlob) throw new Error(`Could not render page ${i}`);
      zip.file(`page-${i}.png`, pageBlob);
    }

    onProgress('Compressing images to ZIP...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    return { blob: zipBlob, count, singlePage: false };
  }
}

/**
 * 6. Image Converter
 */
export async function convertImage(
  file: File,
  targetFormat: 'image/png' | 'image/jpeg' | 'image/webp',
  onProgress: (status: string) => void
): Promise<Blob> {
  onProgress('Loading source image...');
  const img = await createImageBitmap(file);
  onProgress('Converting formats...');
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare canvas context');
  
  ctx.drawImage(img, 0, 0);
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, targetFormat, 0.92);
  });
  if (!blob) throw new Error('Format conversion failed. Browser does not support ' + targetFormat);
  return blob;
}

/**
 * 7. Watermark PDF
 */
export async function watermarkPDF(
  file: File,
  text: string,
  onProgress: (status: string) => void
): Promise<Blob> {
  onProgress('Loading document...');
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  onProgress('Embedding fonts...');
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();

  pages.forEach((page, idx) => {
    onProgress(`Watermarking page ${idx + 1} of ${pages.length}...`);
    const { width, height } = page.getSize();
    // Dynamically size text relative to page size
    const fontSize = Math.max(20, Math.min(width, height) / 10);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    
    // Draw diagonal text at 45 degrees
    page.drawText(text, {
      x: width / 2 - (textWidth / 2) * Math.cos(Math.PI / 4),
      y: height / 2 - (textWidth / 2) * Math.sin(Math.PI / 4),
      size: fontSize,
      font,
      color: rgb(0.55, 0.55, 0.55),
      opacity: 0.25,
      rotate: degrees(45)
    });
  });

  onProgress('Saving document...');
  const out = await doc.save();
  return new Blob([out], { type: 'application/pdf' });
}

/**
 * 8. Add Page Numbers
 */
export async function addPageNumbers(
  file: File,
  onProgress: (status: string) => void
): Promise<Blob> {
  onProgress('Loading document...');
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  onProgress('Embedding fonts...');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  const total = pages.length;

  pages.forEach((page, i) => {
    onProgress(`Numbering page ${i + 1} of ${total}...`);
    const { width } = page.getSize();
    const label = `Page ${i + 1} of ${total}`;
    const fontSize = 10;
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    
    page.drawText(label, {
      x: width / 2 - textWidth / 2,
      y: 24,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4)
    });
  });

  onProgress('Saving document...');
  const out = await doc.save();
  return new Blob([out], { type: 'application/pdf' });
}

/**
 * 9. Rotate PDF
 */
export async function rotatePDF(
  file: File,
  angle: 90 | 180 | 270,
  onProgress: (status: string) => void
): Promise<Blob> {
  onProgress('Loading document...');
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = doc.getPages();

  pages.forEach((page, idx) => {
    onProgress(`Rotating page ${idx + 1} of ${pages.length}...`);
    const currentRotation = page.getRotation().angle;
    page.setRotation(degrees((currentRotation + angle) % 360));
  });

  onProgress('Saving document...');
  const out = await doc.save();
  return new Blob([out], { type: 'application/pdf' });
}
