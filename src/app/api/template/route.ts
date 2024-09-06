import { createInvoice } from "./createInvoice";
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
    const body = await req.json();

    createInvoice(body, "invoice.pdf");
    
    return NextResponse.json({ ok: true });
} 