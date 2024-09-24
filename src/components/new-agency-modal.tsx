"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { PlusIcon } from 'lucide-react'

export function NewAgencyModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [logo, setLogo] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    if (logo) formData.append('logo', logo)

    const response = await fetch('/api/agencies', {
      method: 'POST',
      body: formData,
    })

    if (response.ok) {
      setIsOpen(false)
      setName('')
      setLogo(null)
      // Optionally, you can trigger a refresh of the agencies list here
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4"><PlusIcon className="mr-2 h-4 w-4" /> New Agency</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agency</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo" className="text-right">
                Logo
              </Label>
              <Input
                id="logo"
                type="file"
                onChange={(e) => setLogo(e.target.files?.[0] || null)}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Create Agency</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}