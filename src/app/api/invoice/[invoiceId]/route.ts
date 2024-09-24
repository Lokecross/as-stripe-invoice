import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import fs from "fs/promises";
import path from "path";

export async function DELETE(req: Request, { params }: { params: { invoiceId: string } }) {
    try {
        const invoiceId = params.invoiceId;

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

        // Delete the associated PDF file if it exists
        const fileName = result.fileName;
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