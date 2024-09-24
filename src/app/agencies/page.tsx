"use client"

import { NewAgencyModal } from '@/components/new-agency-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface Agency {
  _id: string
  name: string
  createdAt: string
  logo: string
}

const placeholderImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ENo Logo%3C/text%3E%3C/svg%3E"

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const router = useRouter()

  const fetchAgencies = async () => {
    const response = await fetch('/api/agencies')
    const data = await response.json()
    setAgencies(data)
  }

  useEffect(() => {
    fetchAgencies()
  }, [])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Prevent row click event from triggering
    await fetch(`/api/agencies/${id}`, { method: 'DELETE' })
    setAgencies(agencies.filter(agency => agency._id !== id))
  }

  const handleRowClick = (agencyId: string) => {
    router.push(`/agencies/${agencyId}`)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center mb-6">
          <CardTitle>Agencies</CardTitle>
          <NewAgencyModal onAgencyAdded={fetchAgencies} />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agencies.map((agency) => (
              <TableRow 
                key={agency._id} 
                onClick={() => handleRowClick(agency._id)}
                className="cursor-pointer hover:bg-gray-100"
              >
                <TableCell>
                  <Image
                    src={agency.logo || placeholderImage}
                    alt={`${agency.name} logo`}
                    width={50}
                    height={50}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = placeholderImage;
                    }}
                    style={{ objectFit: 'contain' }}
                  />
                </TableCell>
                <TableCell>{agency.name}</TableCell>
                <TableCell>{new Date(agency.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => handleDelete(e, agency._id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}