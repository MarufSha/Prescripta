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
  // Both imports are dynamic so neither pdf-lib nor html2canvas initialises
  // at page load — pdf-lib's colorFromString throws on lab()/oklch() colors
  // it encounters during module init when bundled with the page.
  const [{ PDFDocument }, html2canvas] = await Promise.all([
    import("pdf-lib"),
    import("html2canvas").then((m) => m.default),
  ]);

  const element = document.getElementById(elementId);
  if (!element) throw new Error(`#${elementId} not found in DOM`);

  // Wait for Noto Sans Bengali (and any other fonts) to finish loading
  await document.fonts.ready;

  const canvas = await html2canvas(element as HTMLElement, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const base64 = dataUrl.split(",")[1];
  const jpegBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  // canvas is 2×; halve then convert px → PDF points (96 dpi → 72 pt: ×0.75)
  const ptW = (canvas.width / 2) * 0.75;
  const ptH = (canvas.height / 2) * 0.75;

  const pdfDoc = await PDFDocument.create();
  const img = await pdfDoc.embedJpg(jpegBytes);
  const page = pdfDoc.addPage([ptW, ptH]);
  page.drawImage(img, { x: 0, y: 0, width: ptW, height: ptH });

  return pdfDoc.save();
}
