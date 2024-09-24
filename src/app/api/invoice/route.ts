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
