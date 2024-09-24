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

export const PUT = async (req: Request, { params }: { params: { agencyId: string } }) => {
    try {
        const client = await clientPromise;
        const db = client.db("stripe-invoicing");

        const agencyCollection = db.collection("agencies");
        const agency = await agencyCollection.findOne({ _id: new ObjectId(params.agencyId) });
        if (!agency) {
            return NextResponse.json({ error: "Agency not found" }, { status: 404 });
        }

        const templateCollection = db.collection("templates");

        const body: ITemplate = await req.json();

        if (agency.template) {
            await templateCollection.updateOne(
                { _id: new ObjectId(agency.template) },
                { $set: body }
            );
        } else {
            const template = await templateCollection.insertOne(body);

            const { _id, ...agencyData } = agency;

            await agencyCollection.updateOne(
                { _id: new ObjectId(_id) },
                { $set: { ...agencyData, template: template.insertedId } }
            );
        }

        return NextResponse.json({ ok: true, message: "Template updated successfully" });
    } catch (error) {
        console.error("Error in PUT /api/template:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
