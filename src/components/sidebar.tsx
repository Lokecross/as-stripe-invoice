"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { FileTextIcon, LayoutListIcon, UserIcon, BuildingIcon } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-md h-screen">
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Invoice Manager</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link href="/templates" 
                className={`flex items-center w-full p-2 rounded-lg ${pathname === '/templates' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <FileTextIcon className="mr-2" />
                Invoice Templates
              </Link>
            </li>
            <li>
              <Link href="/invoice" 
                className={`flex items-center w-full p-2 rounded-lg ${pathname === '/invoice' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <LayoutListIcon className="mr-2" />
                Invoices
              </Link>
            </li>
            <li>
              <Link href="/workers" 
                className={`flex items-center w-full p-2 rounded-lg ${pathname === '/workers' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <UserIcon className="mr-2" />
                Workers
              </Link>
            </li>
            <li>
              <Link href="/agencies" 
                className={`flex items-center w-full p-2 rounded-lg ${pathname === '/agencies' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              >
                <BuildingIcon className="mr-2" />
                Agencies
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  )
}