import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const GAP = 20;
const MARGIN = 50;

interface InvoiceLine {
  type: string;
  blocks?: Block[];
  items?: {
    columns: Column[];
    registers: Record<string, string>[];
    subtotal: number;
    tax: number;
  };
}

interface Block {
  title: string;
  values: string[];
  position: "left" | "right";
}

interface Column {
  field: string;
  display_name: string;
  size: number;
  type?: 'money';
}

interface Invoice {
  lines: InvoiceLine[];
  items: {
    columns: Column[];
    registers: Record<string, string>[];
    subtotal: number;
    tax: number;
  };
}

const helveticaPath = path.join(__dirname, "..", "..", "..", "..", "..", "/public/fonts/Helvetica.ttf");
const helveticaBoldPath = path.join(__dirname, "..", "..", "..", "..", "..", "/public/fonts/Helvetica-Bold.ttf");

function createInvoice(invoice: Invoice, path: string): void {
  invoice = {
    ...invoice,
    items: {
      ...invoice.items,
      registers: invoice.items.registers.map(register => {
        const mappedValues = register;

        invoice.items.columns.forEach(col => {
          if (col.type === 'money') mappedValues[col.field] = formatCurrency(mappedValues[col.field] as any);
        });

        return {
          ...mappedValues,
        }
      }),
    }
  }

  const doc = new PDFDocument({ size: "A4", margin: MARGIN, font: helveticaPath,  });

  const y = generateHeader(doc);
  generateLine(doc, invoice, 0, y);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function generateLine(doc: PDFKit.PDFDocument, invoice: Invoice, idx: number, y: number): number {
  const line = invoice.lines[idx];
  const currentY = y + GAP;
  let nextY = 0;

  if (line.type === "text" && line.blocks) {
    line.blocks.forEach(block => {
      const diff = generateBlockText(doc, currentY, block);
      if (diff > nextY) nextY = diff;
    });
  } else if (line.type === "items") {
    const diff = generateInvoiceTable(doc, invoice, currentY);
    nextY = diff;
  } else {
    nextY = y;
  }

  // Check if the nextY exceeds the page height
  if (nextY > doc.page.height - 2*MARGIN) {
    doc.addPage();
    nextY = MARGIN; // Reset nextY to the top margin of the new page
  }

  if (invoice.lines[idx + 1]) {
    return generateLine(doc, invoice, idx + 1, nextY);
  } else {
    return nextY;
  }
}

function generateBlockText(doc: PDFKit.PDFDocument, y: number, block: Block): number {
  const options = { align: block.position as "left" | "right" };
  const x = block.position === "left" ? MARGIN : 0;

  doc
    .fontSize(10)
    .font(helveticaBoldPath)
    .text(`${block.title}:`, x, y, options)
    .font(helveticaPath);

  block.values.forEach((value, index) => {
    doc.text(value, x, y + (index + 1) * 15, options);
  });

  doc.moveDown();

  return y + block.values.length * 15 + 15;
}

function generateHeader(doc: PDFKit.PDFDocument): number {
  doc
    .fontSize(20)
    .font(helveticaBoldPath)
    .text("Invoice", MARGIN, MARGIN)
    .moveDown();

  return 70;
}

function generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: Invoice, y: number): number {
  const invoiceTableTop = y;

  const itemHeader: Record<string, string> = {};
  invoice.items.columns.forEach(item => {
    itemHeader[item.field] = item.display_name;
  });

  doc.font(helveticaBoldPath);
  generateTableRow(doc, invoiceTableTop, invoice, itemHeader);
  generateHr(doc, invoiceTableTop + 18);
  doc.font(helveticaPath);

  let resultTop = 0;

  for (let i = 0; i < invoice.items.registers.length; i++) {
    const item = invoice.items.registers[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(doc, position, invoice, item);
    generateHr(doc, position + 18);
    resultTop = position + 18;
  }

  const resultTotal = generateInvoiceTotal(doc, invoice, resultTop + GAP);

  return resultTotal;
}

function generateFooter(doc: PDFKit.PDFDocument): void {
  doc
    .fontSize(10)
    .text(
      "Payment is due within 15 days. Thank you for your business.",
      MARGIN,
      779,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  invoice: Invoice,
  item: Record<string, string>
): void {
  const { columns } = invoice.items;
  const columnsGrid = columns.reduce((n, { size }) => n + size, 0);
  const size = 495 / columnsGrid;

  doc.fontSize(10);

  let leftSize = 0;
  for (let j = 0; j < columns.length; j++) {
    const col = columns[j];
    doc.text(item[col.field], MARGIN + leftSize * size, y, { width: col.size * size, align: j === 0 ? "left" : "right" });
    leftSize += col.size;
  }
}

function generateHr(doc: PDFKit.PDFDocument, y: number): void {
  doc
    .strokeColor("#aaaaaa")
    .lineWidth(1)
    .moveTo(MARGIN, y)
    .lineTo(595 - MARGIN, y)
    .stroke();
}

function formatCurrency(cents: number): string {
  return "$" + (cents / 100).toFixed(2);
}

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return year + "/" + month + "/" + day;
}

function generateInvoiceTotal(doc: PDFKit.PDFDocument, invoice: Invoice, top: number): number {
  const customerInformationTop = top;
  const subtotal = invoice.items.subtotal;
  const tax = (invoice.items.tax / 100) * subtotal;

  doc
    .fontSize(10)
    .font(helveticaBoldPath)
    .text("Subtotal:", 430, customerInformationTop)
    .font(helveticaPath)
    .text(formatCurrency(subtotal), 0, customerInformationTop, { align: "right" })
    .font(helveticaBoldPath)
    .text(`Tax (${invoice.items.tax}%):`, 430, customerInformationTop + 15)
    .font(helveticaPath)
    .text(formatCurrency(tax), 0, customerInformationTop + 15, { align: "right" })
    .font(helveticaBoldPath)
    .text("Total", 430, customerInformationTop + 30)
    .text(formatCurrency(subtotal + tax), 0, customerInformationTop + 30, { align: "right" })
    .moveDown();

  return customerInformationTop + 30;
}

export {
  createInvoice
};
