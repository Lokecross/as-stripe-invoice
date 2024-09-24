import { AgenciesList } from '@/components/agencies-list'
import { NewAgencyModal } from '@/components/new-agency-modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlusIcon } from 'lucide-react'
import Link from 'next/link'

export default function AgenciesPage() {
  return (
    <Card>
      <CardHeader>
            <div className="flex justify-between items-center mb-6">
                <CardTitle>Agencies</CardTitle>
                <NewAgencyModal />
            </div>
        </CardHeader>
        <CardContent>
          <AgenciesList />
        </CardContent>
    </Card>
  )
}