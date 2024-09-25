import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from 'uuid';
import clientPromise from "@/lib/mongodb";
import { ITemplate, BlockProps, BlockValue, IColumn } from "../agencies/[agencyId]/template/route";
import {
  generateHeader,
  generateHr,
  formatCurrency,
  formatDate,
  generateFooter,
  generateTableRow,
  calculateInvoiceTotal,
  helveticaBoldPath,
  helveticaPath,
} from "./createInvoice";
import { ObjectId } from "mongodb";

const GAP = 20;
const MARGIN = 50;

interface Worker {
  id: string;
  name: string;
  email: string;
  age: number;
  address: string;
  workedHours: number;
  overdueHours: number;
  hourlyRate: number;
}

interface Agency {
  name: string;
}

interface InvoiceData {
  id: string;
  date: string;
}



async function generateInvoice(template: ITemplate, worker: Worker, agency: Agency, invoiceData: InvoiceData): Promise<string> {
  const fileName = `invoice_${uuidv4()}.pdf`;
  const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);

  const doc = new PDFDocument({ size: "A4", margin: MARGIN, font: helveticaPath });

  try {
    let y = generateHeader(doc, agency.name);

    y += GAP;

    for (const line of template.lines) {
      if (line.type === 'text') {
        let yLeft = y;
        let yRight = y;
        if (line.left) {
          yLeft = generateBlock(doc, line.left, { worker, agency, invoice: invoiceData }, y, 'left');
        }
        if (line.right) {
          yRight = generateBlock(doc, line.right, { worker, agency, invoice: invoiceData }, y, 'right');
        }

        y = Math.max(yLeft, yRight);
      } else if (line.type === 'items') {
        y = generateItemsTable(doc, template, template.columns, worker, y);
      }

      y += GAP;

      if (y > doc.page.height - 2 * MARGIN) {
        doc.addPage();
        y = MARGIN;
      }
    }

    doc.end();
    doc.pipe(fs.createWriteStream(filePath));

    // Store invoice details in the database
    const client = await clientPromise;
    const db = client.db("stripe-invoicing");
    const invoiceCollection = db.collection("invoices");

    await invoiceCollection.insertOne({
      fileName,
      createdAt: new Date(),
      worker: new ObjectId(worker.id),
      agency: agency.name,
      template: template.name,
      amount: worker.workedHours * (worker.hourlyRate || 50), // Calculate total amount
      status: 'Pending' // Set initial status
    });

    return fileName;
  } catch (error) {
    console.error("Error generating invoice:", error);
    throw new Error("Failed to generate invoice");
  }
}

function generateBlock(doc: PDFKit.PDFDocument, block: BlockProps, data: { worker: Worker; agency: Agency; invoice: InvoiceData }, y: number, position: 'left' | 'right'): number {
  const x = MARGIN;
  const align = position === 'left' ? 'left' : 'right';

  doc.font(helveticaBoldPath).fontSize(10);

  if (block.type === 'vertical') {
    doc.text(block.title, x, y, { align });
    y += 15;
    doc.font(helveticaPath);
    const value = getBlockValue(block.field, data);
    doc.text(value, x, y, { align });
    y += 15;
  } else if (block.type === 'horizontal') {
    for (const kv of block.keyValues) {
        const value = getBlockValue(kv.value, data);

        if (align === "left") {
            doc.font(helveticaBoldPath).fontSize(10);

            doc.text(`${kv.key}: `, x, y, { continued: true });
    
            doc.font(helveticaPath).fontSize(10);
    
            doc.text(value, { align });
        } else {
            // Bold key
            doc.font(helveticaBoldPath).fontSize(10);
    
            const keyText = `${kv.key}: `; // format key with colon
            const keyWidth = doc.widthOfString(keyText); // get width of the key
    
            // Regular value
            doc.font(helveticaPath).fontSize(10);
    
            const valueText = value; // the value text
            const valueWidth = doc.widthOfString(valueText); // get width of the value
    
            // Calculate the position to right-align the text
            const totalTextWidth = keyWidth + valueWidth;
            const xPosition = doc.page.width - MARGIN - totalTextWidth; // right align based on page width
    
            doc.font(helveticaBoldPath).fontSize(10);
    
            // Draw the key (bold) and value (normal) on the same line
            doc.text(keyText, xPosition, y, { continued: true }) // keep the cursor on the same line
                .font(helveticaPath) // switch to regular font
                .text(valueText);  // render the value
        }

        y += 15;
    }
  }

  return y;
}

function getBlockValue(field: BlockValue, data: { worker: Worker; agency: Agency; invoice: InvoiceData }): string {
  const [category, property] = field.split('.');
  switch (category) {
    case 'worker':
      return String(data.worker[property as keyof Worker] || '');
    case 'agency':
      return String(data.agency[property as keyof Agency] || '');
    case 'invoice':
      return String(data.invoice[property as keyof InvoiceData] || '');
    default:
      return '';
  }
}

function generateItemsTable(doc: PDFKit.PDFDocument, template: ITemplate, columns: IColumn[], worker: Worker, y: number): number {
  const tableTop = y;

  const newColumns = ['Item', ...columns.map(item => item.title), 'Total']

  // Generate header
  generateTableRow(doc, y, newColumns, newColumns, true);

  y += 20;
  generateHr(doc, y);
  y += 10;

  // Generate row
  const hourlyRate = worker.hourlyRate;
  const amount = worker.workedHours * hourlyRate;

  const extraRowData = columns.map(column => {
    switch (column.data) {
      case 'worker.workedHours':
        return `${worker.workedHours.toString()}h` // Convert to cents for formatCurrency
      case 'worker.overdueHours':
        return `${worker.overdueHours.toString()}h`
      case 'worker.totalHours':
        return `${(worker.overdueHours + worker.workedHours).toString()}h`
      default:
        return '';
    }
  });

  const rowData = ['Firefighter', ...extraRowData, formatCurrency(amount * 100)]

  generateTableRow(doc, y, newColumns, rowData);

  y += 20;
  generateHr(doc, y);
  y += 10;

  // Generate total
  const { total } = calculateInvoiceTotal(amount * 100, 0); // Assuming no tax, convert to cents

  const taxAmount = template.tax / 100 * total;

  doc.font(helveticaBoldPath).fontSize(10);
  doc.text('Subtotal:', 430, y);
  doc.font(helveticaPath).fontSize(10);
  doc.text(formatCurrency(total), MARGIN, y, { align: 'right' });

  y+=15;

  doc.font(helveticaBoldPath).fontSize(10);
  doc.text(`Tax (${template.tax}%):`, 430, y);
  doc.font(helveticaPath).fontSize(10);
  doc.text(formatCurrency(taxAmount), MARGIN, y, { align: 'right' });

  y+=15;

  doc.font(helveticaBoldPath).fontSize(10);
  doc.text('Total:', 430, y);
  doc.font(helveticaPath).fontSize(10);
  doc.text(formatCurrency(total + taxAmount), MARGIN, y, { align: 'right' });

  return y + GAP;
}

export { generateInvoice };