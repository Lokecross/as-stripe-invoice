import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('Stripe-Signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    try {
      const client = await clientPromise
      const db = client.db("stripe-invoicing")

      // Find the invoice with the matching payment link
      const invoice = await db.collection('invoices').findOne({
        paymentLink: session.payment_link
      })

      if (invoice) {
        // Update the invoice status to 'Paid'
        await db.collection('invoices').updateOne(
          { _id: new ObjectId(invoice._id) },
          { $set: { status: 'Paid' } }
        )

        console.log(`Updated invoice ${invoice._id} status to Paid`)
      } else {
        console.error(`No invoice found for payment link: ${session.payment_link}`)
      }
    } catch (error) {
      console.error('Error updating invoice status:', error)
      return NextResponse.json({ error: 'Failed to update invoice status' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}