import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'
import { generateInvoice } from '@/app/api/invoice/generateInvoice'
import { ITemplate } from '../template/route'
import { format } from 'date-fns'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

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
          fileName: 1,
          amount: 1,
          status: 1,
          createdAt: 1,
          'worker.name': 1,
          paymentLink: 1
        }
      }
    ]).toArray()

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error fetching agency invoices:', error)
    return NextResponse.json({ error: 'Failed to fetch agency invoices' }, { status: 500 })
  }
}

// Type guard function to check if a document matches ITemplate interface
function isITemplate(doc: any): doc is ITemplate {
  return (
    doc &&
    typeof doc.name === 'string' &&
    typeof doc.description === 'string' &&
    Array.isArray(doc.columns) &&
    Array.isArray(doc.lines)
  )
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

    // Fetch the agency's template
    const templateDoc = await db.collection('templates').findOne({ _id: new ObjectId(agency.template) })
    if (!templateDoc) {
      return NextResponse.json({ error: 'Template not found for this agency' }, { status: 404 })
    }

    // Check if the template matches our ITemplate interface
    if (!isITemplate(templateDoc)) {
      return NextResponse.json({ error: 'Invalid template structure' }, { status: 500 })
    }

    const template: ITemplate = templateDoc

    const workers = await db.collection('workers').find({
      _id: { $in: workerIds.map((id: string) => new ObjectId(id)) },
      agency: new ObjectId(params.agencyId)
    }).toArray()

    const generatedInvoices = []
    const errors = []

    for (const worker of workers) {
      try {
        const invoiceData = {
          id: new ObjectId().toString(),
          date: format(new Date(), 'MM/dd/yyyy'),
        }

        const fileName = await generateInvoice(
          template,
          {
            id: worker._id.toString(),
            name: worker.name,
            email: worker.email,
            age: worker.age,
            address: worker.address,
            workedHours: worker.workedHours || 0,
            hourlyRate: worker.hourlyRate || 20,
            overdueHours: worker.overdueHours || 0,
          },
          { name: agency.name },
          invoiceData
        )

        // Calculate the total amount for the invoice
        const totalAmount = (worker.workedHours + worker.overdueHours) * worker.hourlyRate

        // Create a Stripe price for this specific invoice
        const price = await stripe.prices.create({
          unit_amount: Math.round(totalAmount * 100), // Stripe expects amount in cents
          currency: 'usd',
          product_data: {
            name: `Invoice for ${worker.name}`,
          },
        })

        // Create a Stripe payment link using the created price
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
        })

        // Save the invoice information along with the payment link
        const invoiceResult = await db.collection('invoices').insertOne({
          fileName,
          worker: worker._id,
          agency: new ObjectId(params.agencyId),
          amount: totalAmount,
          status: 'pending',
          createdAt: new Date(),
          paymentLink: paymentLink.url,
        })

        generatedInvoices.push({
          fileName,
          workerId: worker._id,
          workerName: worker.name,
          paymentLink: paymentLink.url,
          invoiceId: invoiceResult.insertedId,
        })
      } catch (error) {
        console.error(`Error generating invoice for worker ${worker._id}:`, error)
        errors.push({ workerId: worker._id, workerName: worker.name, error: (error as Error).message })
      }
    }

    return NextResponse.json({ 
      message: 'Invoice generation process completed',
      generatedInvoices,
      errors,
      totalWorkers: workers.length
    })
  } catch (error) {
    console.error('Error in invoice generation process:', error)
    return NextResponse.json({ error: 'Failed to complete invoice generation process' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const { invoiceId, status } = await request.json()
    const client = await clientPromise
    const db = client.db("stripe-invoicing")

    const result = await db.collection('invoices').updateOne(
      { _id: new ObjectId(invoiceId), 'worker.agency': new ObjectId(params.agencyId) },
      { $set: { status } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Invoice not found or does not belong to this agency' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Invoice status updated successfully' })
  } catch (error) {
    console.error('Error updating invoice status:', error)
    return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 })
  }
}