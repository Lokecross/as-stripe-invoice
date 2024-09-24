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

    const invoices = await db.collection('invoices').aggregate([
      {
        $lookup: {
          from: 'workers',
          localField: 'worker',
          foreignField: '_id',
          as: 'worker'
        }
      },
      {
        $unwind: '$worker'
      },
      {
        $match: {
          'worker.agency': new ObjectId(params.agencyId)
        }
      },
      {
        $project: {
          _id: 1,
          number: 1,
          client: 1,
          amount: 1,
          status: 1,
          workerId: 1,
          'worker.name': 1
        }
      }
    ]).toArray()

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching agency invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch agency invoices' }, { status: 500 })
  }
}