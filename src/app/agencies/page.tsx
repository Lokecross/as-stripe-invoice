"use client"

import { NewAgencyModal } from '@/components/new-agency-modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { TrashIcon } from 'lucide-react'

interface Agency {
  _id: string
  name: string
  createdAt: string
  logo: string
}


export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])

  const fetchAgencies = async () => {
    const response = await fetch('/api/agencies')
    const data = await response.json()
    setAgencies(data)
  }

  useEffect(() => {
    fetchAgencies()
  }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/agencies/${id}`, { method: 'DELETE' })
    setAgencies(agencies.filter(agency => agency._id !== id))
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
                <TableHead>Name</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencies.map((agency) => (
                <TableRow key={agency._id}>
                  <TableCell>{agency.name}</TableCell>
                  <TableCell>{new Date(agency.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(agency._id)}>
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