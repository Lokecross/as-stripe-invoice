"use client"

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

export function AgenciesList() {
  const [agencies, setAgencies] = useState<Agency[]>([])

  useEffect(() => {
    // Fetch agencies from API
    const fetchAgencies = async () => {
      const response = await fetch('/api/agencies')
      const data = await response.json()
      setAgencies(data)
    }
    fetchAgencies()
  }, [])

  const handleDelete = async (id: string) => {
    await fetch(`/api/agencies/${id}`, { method: 'DELETE' })
    setAgencies(agencies.filter(agency => agency._id !== id))
  }

  return (
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
  )
}