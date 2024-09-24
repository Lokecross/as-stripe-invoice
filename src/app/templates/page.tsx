"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { PlusIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface Template {
  _id: string;
  name: string;
  description: string;
}

export default function InvoiceTemplates() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/template')
      const data = await response.json()
      setTemplates(data.templates)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching templates:', error)
      setIsLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        const response = await fetch(`/api/template?id=${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Remove the deleted template from the state
          setTemplates(templates.filter(template => template._id !== id));
        } else {
          console.error('Failed to delete template');
        }
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  }

  if (isLoading) {
    return <div>Loading templates...</div>
  }

  return (
    <Card>
        <CardHeader>
            <div className="flex justify-between items-center mb-6">
                <CardTitle>Invoice Templates</CardTitle>
                <Link href="/new-template">
                    <Button variant="outline" size="sm" className="ml-2">
                        <PlusIcon className="mr-2 h-4 w-4" /> New Template
                    </Button>
                </Link>
            </div>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="w-[300px]">Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredTemplates.map((template) => (
                    <TableRow key={template._id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(template._id)}>
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