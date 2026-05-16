import { PDFDocument } from "pdf-lib";
import type { DoctorTypeData } from "@/types/doctorTypeData";

export type PdfRxItem = {
  drug?: string;
  durationDays?: number;
  timesPerDay?: string;
  timing?: "before" | "after" | "both";
};

export type PdfFormData = {
  name?: string;
  age?: number | string;
  sex?: string;
  mobile?: string;
  weight?: number | string;
  pulse?: string;
  bp?: string;
  sp02?: string;
  date?: string;
  cc?: string[];
  dx?: string[];
  rx?: PdfRxItem[];
  investigations?: string[];
  advice?: string[];
  puid?: number;
  followupDays?: number;
};

export type PdfDoctorData = DoctorTypeData | null;

export async function generatePrescriptionPdfFromElement(
  elementId: string
): Promise<Uint8Array> {
  // Dynamic import so this never runs on the server
  const html2canvas = (await import("html2canvas")).default;

  const element = document.getElementById(elementId);
  if (!element) throw new Error(`#${elementId} not found in DOM`);

  // Let all fonts (including Noto Sans Bengali from Google Fonts) finish loading
  await document.fonts.ready;

  const canvas = await html2canvas(element as HTMLElement, {
    scale: 2,           // 2× for crisp text
    useCORS: true,      // allow cross-origin font resources
    backgroundColor: "#ffffff",
    logging: false,
  });

  // Convert canvas → JPEG bytes
  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const base64 = dataUrl.split(",")[1];
  const jpegBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  // Wrap in a PDF page sized to match the canvas (canvas is 2×, so halve it,
  // then convert px → PDF points: 1 px at 96 dpi = 0.75 pt)
  const ptW = (canvas.width / 2) * 0.75;
  const ptH = (canvas.height / 2) * 0.75;

  const pdfDoc = await PDFDocument.create();
  const img = await pdfDoc.embedJpg(jpegBytes);
  const page = pdfDoc.addPage([ptW, ptH]);
  page.drawImage(img, { x: 0, y: 0, width: ptW, height: ptH });

  return pdfDoc.save();
}
