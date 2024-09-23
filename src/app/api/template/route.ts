import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

interface ITemplate {
    name: string;
    columns: string[];
    lines: Array<{
        type: 'text' | 'items';
        left?: {
            internalId: number;
            title: string;
            lines: number;
        };
        right?: {
            internalId: number;
            title: string;
            lines: number;
        };
    }>;
}

export const POST = async (req: Request) => {
    try {
        const client = await clientPromise;
        const db = client.db("stripe-invoicing");
        const templateCollection = db.collection("templates");

        const body: ITemplate = await req.json();
        const result = await templateCollection.insertOne(body);

        return NextResponse.json({ ok: true, insertedId: result.insertedId });
    } catch (error) {
        console.error("Error in POST /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const GET = async (req: Request) => {
    try {
        const client = await clientPromise;
        const db = client.db("stripe-invoicing");
        const templateCollection = db.collection("templates");

        const templates = await templateCollection.find({}).toArray();

        return NextResponse.json({ templates });
    } catch (error) {
        console.error("Error in GET /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}