import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

interface ITemplate {
    name: string;
    description: string;
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

        const templates = await templateCollection.find().toArray();

        return NextResponse.json({ templates });
    } catch (error) {
        console.error("Error in GET /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const DELETE = async (req: Request) => {
    try {
        const client = await clientPromise;
        const db = client.db("stripe-invoicing");
        const templateCollection = db.collection("templates");

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
        }

        const result = await templateCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 1) {
            return NextResponse.json({ ok: true, message: "Template deleted successfully" });
        } else {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }
    } catch (error) {
        console.error("Error in DELETE /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};