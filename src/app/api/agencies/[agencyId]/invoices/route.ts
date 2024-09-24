import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { createInvoice } from '@/app/api/invoice/createInvoice'

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

export async function POST(
  request: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { workerIds } = await request.json()
    const client = await clientPromise
    const db = client.db("stripe-invoicing")

    const agency = await db.collection('agencies').findOne({ _id: new ObjectId(params.agencyId) })
    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    const workers = await db.collection('workers').find({
      _id: { $in: workerIds.map((id: string) => new ObjectId(id)) },
      agency: new ObjectId(params.agencyId)
    }).toArray()

    for (const worker of workers) {
      // generate invoice
    }

    return NextResponse.json({ message: 'Invoices generated successfully' })
  } catch (error) {
    console.error('Error generating invoices:', error)
    return NextResponse.json({ error: 'Failed to generate invoices' }, { status: 500 })
  }
}