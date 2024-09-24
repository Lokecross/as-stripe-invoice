import { createInvoice } from "./createInvoice";
import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

export const POST = async (req: Request) => {
    try {
        const body = await req.json();
        const fileName = await createInvoice(body);
        
        return NextResponse.json({ ok: true, fileName });
    } catch (error) {
        console.error("Error creating invoice:", error);
        return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }
};

export const GET = async (req: Request) => {
    try {
        const client = await clientPromise;
        const db = client.db("stripe-invoicing");
        const templateCollection = db.collection("invoices");

        const invoices = await templateCollection.find().toArray();

        return NextResponse.json({ invoices });
    } catch (error) {
        console.error("Error in GET /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export async function DELETE(req: Request) {
    try {
        const url = new URL(req.url);
        const invoiceId = url.pathname.split('/').pop();

        if (!invoiceId) {
            return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
        }

        const client = await clientPromise;
        const db = client.db("stripe-invoicing");
        const invoiceCollection = db.collection("invoices");

        const result = await invoiceCollection.findOneAndDelete({ _id: new ObjectId(invoiceId) });

        if (!result) {
            return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
        }

        if (!result.value) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Delete the associated PDF file if it exists
        const fileName = result.value.fileName;
        if (fileName && typeof fileName === 'string') {
            const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);
            try {
                await fs.unlink(filePath);
            } catch (fileError) {
                console.error("Error deleting PDF file:", fileError);
                // We'll continue even if the file deletion fails
            }
        }

        return NextResponse.json({ message: "Invoice deleted successfully" });
    } catch (error) {
        console.error("Error deleting invoice:", error);
        return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
    }
}