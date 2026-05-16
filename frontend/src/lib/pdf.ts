import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { DoctorTypeData } from "@/types/doctorTypeData";

type PdfBytes = Uint8Array;

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

export async function generatePrescriptionPdfBuffer(
  data: PdfFormData,
  doctor: PdfDoctorData
): Promise<PdfBytes> {
  const pdfDoc = await PDFDocument.create();

  const page = pdfDoc.addPage();
  const { width: W, height: H } = page.getSize();

  const margin = 40;
  const LEAD = 14;
  const SMALL = 10;
  const BODY = 11;
  const H1 = 14;

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const sexLabel =
    data.sex && typeof data.sex === "string"
      ? data.sex.charAt(0).toUpperCase() + data.sex.slice(1)
      : "—";
  let y = H - margin;

  const drawText = (
    text: string,
    x: number,
    yPos: number,
    opts?: {
      size?: number;
      bold?: boolean;
      align?: "left" | "right";
      color?: { r: number; g: number; b: number };
    }
  ) => {
    const size = opts?.size ?? BODY;
    const useBold = opts?.bold ?? false;
    const f = useBold ? fontBold : font;
    const color = opts?.color ?? { r: 0.11, g: 0.11, b: 0.11 };

    let xPos = x;

    if (opts?.align === "right") {
      const width = f.widthOfTextAtSize(text, size);
      xPos = x - width;
    }

    page.drawText(text, {
      x: xPos,
      y: yPos,
      size,
      font: f,
      color: rgb(color.r, color.g, color.b),
    });
  };

  const drawLine = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    w = 0.7,
    color: { r: number; g: number; b: number } = {
      r: 0.67,
      g: 0.67,
      b: 0.67,
    }
  ) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: w,
      color: rgb(color.r, color.g, color.b),
    });
  };

  const drawTriangle = (
    x: number,
    y: number,
    size = 10,
    color: { r: number; g: number; b: number } = { r: 0.11, g: 0.11, b: 0.11 },
    w = 1.8
  ) => {
    const half = size / 2;
    const top = { x, y: y + half };
    const left = { x: x - half, y: y - half };
    const right = { x: x + half, y: y - half };

    drawLine(top.x, top.y, left.x, left.y, w, color);
    drawLine(left.x, left.y, right.x, right.y, w, color);
    drawLine(right.x, right.y, top.x, top.y, w, color);
  };

  const splitText = (text: string, maxWidth: number, size: number) => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      const width = font.widthOfTextAtSize(test, size);

      if (width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }

    if (current) lines.push(current);
    return lines;
  };

  const addDays = (date: Date, days: number): Date => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  };

  const formatFollowupDate = (date: Date): string => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${day}${suffix} ${month}, ${year}`;
  };

  // === Header Start ===

  const DEEP_PURPLE = { r: 0.36, g: 0.22, b: 0.6 };
  const GREEN = { r: 0.020, g: 0.498, b: 0.043 };

  const docName = doctor?.name ?? "";

  const degreesArr = (doctor?.degrees ?? []).filter(Boolean);
  const degLine1 = degreesArr.slice(0, 2).join(", ");
  const degLine2 = degreesArr.slice(2, 4).join(", ");
  const designationLine = doctor?.designation?.trim() ?? "";

  const bmdcLine = doctor?.bmdcNo ? `BMDC Reg. No: ${doctor.bmdcNo}` : "";

  // LEFT COLUMN
  drawText(docName, margin, y, {
    size: H1 + 2,
    bold: true,
    color: GREEN,
  });

  y -= LEAD + 2;

  if (degLine1) {
    drawText(degLine1, margin, y, { size: SMALL + 1 });
    y -= LEAD - 2;
  }

  if (degLine2) {
    drawText(degLine2, margin, y, { size: SMALL + 1 });
    y -= LEAD - 2;
  }

  if (designationLine) {
    drawText(designationLine, margin, y, {
      size: SMALL + 1,
      color: DEEP_PURPLE,
    });
    y -= LEAD - 2;
  }

  if (bmdcLine) {
    drawText(bmdcLine, margin, y, {
      size: SMALL + 1,
      color: GREEN,
    });
    y -= LEAD;
  }

  // RIGHT COLUMN
  let rightY = H - margin - (LEAD + 2);

  const chamberName = doctor?.chamberName ?? "";
  const chamberAddress = doctor?.chamberAddress ?? "";
  const phoneLine = doctor?.mobile ? `Phone: ${doctor.mobile}` : "";

  if (chamberName) {
    drawText(chamberName, W - margin, rightY, {
      size: SMALL + 1,
      align: "right",
    });
    rightY -= LEAD - 2;
  }

  if (chamberAddress) {
    drawText(chamberAddress, W - margin, rightY, {
      size: SMALL + 1,
      align: "right",
    });
    rightY -= LEAD - 2;
  }

  if (phoneLine) {
    drawText(phoneLine, W - margin, rightY, {
      size: SMALL + 1,
      align: "right",
    });
    rightY -= LEAD;
  }

  // HEADER DIVIDER
  const headerBottom = Math.min(y, rightY) + 2;
  drawLine(margin, headerBottom, W - margin, headerBottom, 1);

  // === Header End ===

  const rightColX = W - margin - 360;
  const gap = 110;

  const row1Y = headerBottom - LEAD - 4;
  const row2Y = row1Y - (LEAD + 10);

  drawText("Name:", margin, row1Y, { bold: true });
  drawText(data.name || "—", margin + 40, row1Y);

  const col1X = rightColX;
  const col2X = rightColX + gap;
  const col3X = rightColX + 2 * gap;

  drawText("Sex:", col1X, row1Y, { bold: true });
  drawText(sexLabel, col1X + 30, row1Y);

  drawText("PUID:", col2X, row1Y, { bold: true });
  const puidText =
    typeof data.puid === "number"
      ? `P-${String(data.puid).padStart(4, "0")}`
      : "—";
  drawText(puidText, col2X + 46, row1Y);

  drawText("Mobile:", col3X, row1Y, { bold: true });
  drawText(data.mobile || "—", col3X + 44, row1Y);

  drawText("Age:", col1X, row2Y, { bold: true });
  drawText(`${data.age ?? "—"}`, col1X + 30, row2Y);

  drawText("Weight:", col2X, row2Y, { bold: true });
  drawText(
    data.weight !== undefined && data.weight !== null
      ? String(data.weight)
      : "—",
    col2X + 46,
    row2Y
  );

  drawText("Date:", col3X, row2Y, { bold: true });
  drawText(
    data.date ? new Date(data.date).toLocaleDateString() : "—",
    col3X + 44,
    row2Y
  );

  y = row2Y - (LEAD + 2);
  drawLine(margin, y, W - margin, y, 1);
  y -= 36;

  const GUTTER = 24;
  const splitX = margin + Math.round((W - 2 * margin) * 0.52);
  const leftX = margin;
  const leftW = splitX - margin - GUTTER / 2;
  const rightX = splitX + GUTTER / 2;
  const rightW = W - margin - rightX;

  drawLine(splitX, y + 24, splitX, margin, 0.7);

  let yLeft = y;
  let yRight = y;

  const underlineTitle = (x: number, yTitle: number, label: string) => {
    const size = BODY;
    const width = fontBold.widthOfTextAtSize(label, size);
    drawLine(x, yTitle - 2, x + width, yTitle - 2, 0.6);
  };

  const leftTitle = (label: string) => {
    drawText(label, leftX, yLeft, { bold: true });
    underlineTitle(leftX, yLeft, label);
    yLeft -= LEAD + 4;
  };

  const leftTextLine = (content: string, indent = 14) => {
    drawText(content, leftX + indent, yLeft);
    yLeft -= LEAD;
  };

  drawText("Visit No:", leftX, yLeft, { bold: true });
  drawText("1", leftX + 70, yLeft);
  yLeft -= LEAD + 4;

  leftTitle("C/C");
  const cc = (data.cc ?? []).filter(Boolean);
  const usable = leftW - 14;
  cc.forEach((s) => {
    const lines = splitText(`• ${s}`, usable, BODY);
    lines.forEach((ln) => leftTextLine(ln));
  });
  yLeft -= 6;

  leftTitle("O/E");
  const oe = [
    `BP: ${data.bp || "—"}`,
    `SPO2: ${data.sp02 || "—"}`,
    `Pulse: ${data.pulse || "—"}`,
  ];
  oe.forEach((t) => leftTextLine(t));
  yLeft -= 6;

  leftTitle("Reports:");
  const inv = (data.investigations ?? []).filter(Boolean);
  inv.forEach((s) => {
    const lines = splitText(`• ${s}`, usable, BODY);
    lines.forEach((ln) => leftTextLine(ln));
  });
  yLeft -= 6;

  leftTitle("Plan:");
  const adv = (data.advice ?? []).filter(Boolean);
  adv.forEach((s) => {
    const lines = splitText(`• ${s}`, usable, BODY);
    lines.forEach((ln) => leftTextLine(ln));
  });

  yLeft -= LEAD * 1;
  const followupDays =
    typeof data.followupDays === "number" && data.followupDays > 0
      ? data.followupDays
      : undefined;

  let reviewText = "";
  let reviewDateText = "";

  if (followupDays && data.date) {
    const baseDate = new Date(data.date);
    const nextDate = addDays(baseDate, followupDays);
    reviewText = `Follow Up After ${followupDays} day${
      followupDays > 1 ? "s" : ""
    }`;
    reviewDateText = formatFollowupDate(nextDate);
  }

  const dx = (data.dx ?? []).filter(Boolean);
  dx.forEach((s) => {
    drawTriangle(leftX + 6, yLeft + 3, 8);

    const maxWidth = usable - 20;
    const lines = splitText(s, maxWidth, BODY);

    drawText(lines[0], leftX + 20, yLeft);
    for (let i = 1; i < lines.length; i++) {
      yLeft -= LEAD;
      drawText(lines[i], leftX + 20, yLeft);
    }
    yLeft -= LEAD;
  });

  if (reviewText || reviewDateText) {
    yLeft -= LEAD * 2;

    if (reviewText) {
      drawText(reviewText, leftX, yLeft, {
        size: H1,
        bold: true,
      });
      yLeft -= LEAD + 2;
    }

    if (reviewDateText) {
      drawText(reviewDateText, leftX + 4, yLeft, {
        size: BODY + 1,
        bold: true,
      });
      yLeft -= LEAD;
    }
  }

  drawText("Rx.", rightX, yRight, { bold: true, size: H1 });
  underlineTitle(rightX, yRight, "Rx.");
  yRight -= LEAD + 8;

  const prettyTimes = (t?: string) => {
    if (!t) return "";
    const parts = t.split("+");
    // 0+0+0 means the medicine can be taken anytime
    if (parts.every((p) => p === "0" || p === "")) return "Anytime";
    const [m, e, n] = parts;
    const chip = (f: string, lbl: string) => (f === "1" ? lbl : "");
    return [chip(m, "Morning"), chip(e, "Noon"), chip(n, "Night")]
      .filter(Boolean)
      .join(" + ");
  };

  const rxList = (data.rx ?? []).filter(
    (r) =>
      (r.drug && r.drug.trim()) || r.durationDays || r.timesPerDay || r.timing
  );

  rxList.forEach((r, i) => {
    drawText(`${i + 1}.`, rightX, yRight, { bold: true });

    const drug = r.drug ?? "";
    const drugLines = splitText(drug, rightW - 120, BODY);
    const firstDrugLine = drugLines[0] ?? "";

    drawText(firstDrugLine, rightX + 18, yRight);

    const dur =
      r.durationDays && r.durationDays > 0
        ? `- ${r.durationDays} day${r.durationDays > 1 ? "s" : ""}`
        : "";

    if (dur) {
      drawText(dur, rightX + rightW, yRight, {
        align: "right",
      });
    }

    if (drugLines.length > 1) {
      for (let k = 1; k < drugLines.length; k += 1) {
        yRight -= LEAD;
        drawText(drugLines[k], rightX + 18, yRight);
      }
    }

    yRight -= LEAD;

    const subParts: string[] = [];

    if (r.timesPerDay) {
      subParts.push(prettyTimes(r.timesPerDay));
    }

    if (r.timing) {
      const label =
        r.timing === "before"
          ? "Before meal"
          : r.timing === "after"
          ? "After meal"
          : "Before/After meal";
      subParts.push(label);
    }

    const sub = subParts.filter(Boolean).join("   ::   ");

    if (sub) {
      drawText(sub, rightX + 18, yRight, {
        size: SMALL,
        color: { r: 0.37, g: 0.37, b: 0.37 },
      });
      yRight -= LEAD;
    }

    yRight -= 4;
  });

  drawLine(margin, margin, W - margin, margin, 0.7);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
