import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("stripe-invoicing")
    const agencies = await db.collection('agencies').find({}).toArray()
    return NextResponse.json(agencies)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("stripe-invoicing")
    const formData = await request.formData()
    const name = formData.get('name')
    const logo = formData.get('logo')

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required and must be a string' }, { status: 400 })
    }

    const newAgency = {
      name,
      logo: logo instanceof File ? await saveLogoAndGetUrl(logo) : null,
      createdAt: new Date(),
    }

    const result = await db.collection('agencies').insertOne(newAgency)
    return NextResponse.json({ id: result.insertedId, ...newAgency })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create agency' }, { status: 500 })
  }
}

async function saveLogoAndGetUrl(logo: File): Promise<string> {
  // Implement logo saving logic here
  // For now, we'll just return a placeholder URL
  return '/placeholder-logo.png'
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("stripe-invoicing")
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 })
    }

    const result = await db.collection('agencies').deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Agency deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete agency' }, { status: 500 })
  }
}