import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("stripe-invoicing");
    const workers = await db.collection("workers").find({}).toArray();
    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    const client = await clientPromise;
    const db = client.db("stripe-invoicing");
    const result = await db.collection("workers").insertOne({ name, email });
    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create worker" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Worker ID is required" }, { status: 400 });
    }
    const client = await clientPromise;
    const db = client.db("stripe-invoicing");
    const result = await db.collection("workers").deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Worker deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete worker" }, { status: 500 });
  }
}