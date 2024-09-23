import { createInvoice } from "./createInvoice";
import { NextResponse } from "next/server";

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
        const { searchParams } = new URL(req.url);
        const fileName = searchParams.get('fileName');

        if (!fileName) {
            return NextResponse.json({ error: "File name is required" }, { status: 400 });
        }

        // You might want to add additional security checks here to ensure only authorized users can access invoices

        const invoiceUrl = `/invoices/${fileName}`;
        return NextResponse.json({ ok: true, invoiceUrl });
    } catch (error) {
        console.error("Error fetching invoice:", error);
        return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
    }
};