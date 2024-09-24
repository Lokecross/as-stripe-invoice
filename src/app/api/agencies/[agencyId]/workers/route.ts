import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
  request: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("stripe-invoicing")
    const workers = await db.collection('workers').find({ agency: new ObjectId(params.agencyId) }).toArray()

    return NextResponse.json(workers)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agency workers' }, { status: 500 })
  }
}