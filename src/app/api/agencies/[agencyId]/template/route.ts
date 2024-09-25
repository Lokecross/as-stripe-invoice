import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export type BlockValue = 
    | "worker.id"
    | "worker.name"
    | "worker.email"
    | "worker.age"
    | "worker.address"
    | "worker.workedHours"
    | "invoice.id"
    | "invoice.date"
    | "agency.name";

export type ColumnValue = 
    | "worker.workedHours"
    | "worker.overdueHours"
    | "worker.totalHours"

export type BlockProps = {
    internalId: number;
    title: string;
    field: BlockValue;
    type: 'vertical';
} | {
    internalId: number;
    type: 'horizontal';
    keyValues: Array<{ key: string; value: BlockValue }>;
}

export interface IColumn {
    internalId: number;
    title: string;
    data: ColumnValue;
}

export interface ITemplate {
    name: string;
    description: string;
    columns: IColumn[];
    lines: Array<{
        type: 'text' | 'items';
        left?: BlockProps;
        right?: BlockProps;
    }>;
    tax: number;
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
