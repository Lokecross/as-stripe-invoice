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
    const agency = await db.collection('agencies').findOne({ _id: new ObjectId(params.agencyId) })

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    return NextResponse.json(agency)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agency details' }, { status: 500 })
  }
}