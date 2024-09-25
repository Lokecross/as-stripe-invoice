import path from "path";
import PDFDocument from "pdfkit";

const MARGIN = 50;

export const helveticaPath = path.join(process.cwd(), "public/fonts/Helvetica.ttf");
export const helveticaBoldPath = path.join(process.cwd(), "public/fonts/Helvetica-Bold.ttf");

// Utility functions

export function generateHeader(doc: PDFKit.PDFDocument): number {
  doc
    .fontSize(20)
    .font(helveticaBoldPath)
    .text("Invoice", MARGIN, MARGIN)
    .moveDown();

  return 70;
}

export function generateHr(doc: PDFKit.PDFDocument, y: number): void {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(MARGIN, y)
    .lineTo(doc.page.width - MARGIN, y)
    .stroke();
}

export function formatCurrency(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return year + "/" + month + "/" + day;
}

export function generateFooter(doc: PDFKit.PDFDocument): void {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      MARGIN,
      doc.page.height - MARGIN,
      { align: "center", width: doc.page.width - 2 * MARGIN }
    );
}

export function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  columns: string[],
  items: string[],
  isHeader: boolean = false
): void {
  const columnWidth = (doc.page.width - 2 * MARGIN) / columns.length;

  doc.fontSize(10);
  if (isHeader) doc.font(helveticaBoldPath);
  else doc.font(helveticaPath);

  columns.forEach((column, index) => {
    doc.text(items[index], MARGIN + index * columnWidth, y, {
      width: columnWidth,
      align: index === 0 ? "left" : "right"
    });
  });
}

export function calculateInvoiceTotal(subtotal: number, taxRate: number): { tax: number, total: number } {
  const tax = (taxRate / 100) * subtotal;
  const total = subtotal + tax;
  return { tax, total };
}
