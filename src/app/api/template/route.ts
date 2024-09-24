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
            field: string;
            type: 'vertical' | 'horizontal';
        };
        right?: {
            internalId: number;
            title: string;
            field: string;
            type: 'vertical' | 'horizontal';
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

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const template = await templateCollection.findOne({ _id: new ObjectId(id) });
            if (!template) {
                return NextResponse.json({ error: "Template not found" }, { status: 404 });
            }
            return NextResponse.json(template);
        } else {
            const templates = await templateCollection.find().toArray();
            return NextResponse.json({ templates });
        }
    } catch (error) {
        console.error("Error in GET /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const PUT = async (req: Request) => {
    try {
        const client = await clientPromise;
        const db = client.db("stripe-invoicing");
        const templateCollection = db.collection("templates");

        const body: ITemplate & { _id?: string } = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
        }

        const result = await templateCollection.updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json({ ok: true, message: "Template updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/template:", error);
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