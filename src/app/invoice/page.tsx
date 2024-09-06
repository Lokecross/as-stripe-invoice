"use client"

import { ReactNode, ReducerAction, useEffect, useReducer, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PrinterIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Controller, FormState, useForm } from 'react-hook-form'

type FormData = {
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  addressLine1: string
  addressLine2: string
  subtotal: number
  taxRate: number
}

function currencyFormat(price: number) {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return USDollar.format(price);
}

function Droppable(props: { children: ReactNode, num: number }) {
  const {isOver, setNodeRef} = useDroppable({
    id: props.num,
  });
  const style = {
    color: isOver ? 'green' : undefined,
  };
  
  
  return (
    <div ref={setNodeRef} style={style}>
      {props.children}
    </div>
  );
}

function InvoiceNumber(props: { formData: FormData }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'number',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="font-bold">Invoice Number:</div>
      <div>{props.formData.invoiceNumber}</div>
    </div>
  )
}

function InvoiceDate(props: { formData: FormData }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'date',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="font-bold">Date:</div>
      <div>{props.formData.invoiceDate}</div>
    </div>
  )
}

function BillTo(props: { formData: FormData }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: 'billto',
  });
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <div className="font-bold mb-2">Bill To:</div>
      <div>{props.formData.customerName}</div>
      <div>{props.formData.addressLine1}</div>
      <div>{props.formData.addressLine2}</div>
    </div>
  )
}

function Table() {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b-2 border-gray-300">
          <th className="text-left p-2">Item</th>
          <th className="text-right p-2">Quantity</th>
          <th className="text-right p-2">Price</th>
          <th className="text-right p-2">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-gray-200">
          <td className="p-2">Widget A</td>
          <td className="text-right p-2">2</td>
          <td className="text-right p-2">$10.00</td>
          <td className="text-right p-2">$20.00</td>
        </tr>
        <tr className="border-b border-gray-200">
          <td className="p-2">Widget B</td>
          <td className="text-right p-2">1</td>
          <td className="text-right p-2">$15.00</td>
          <td className="text-right p-2">$15.00</td>
        </tr>
      </tbody>
    </table>
  )
}

function Total(props: { formData: FormData }) {
  const subtotal = props.formData.subtotal||0;
  const taxTotal = (props.formData.taxRate||0) / 100 * subtotal;
  const total = subtotal + taxTotal;

  return (
    <div>
      <div className="w-1/2 min-w-44">
        <div className="flex justify-between py-1">
          <div className="font-bold">Subtotal:</div>
          <div>{currencyFormat(subtotal)}</div>
        </div>
        <div className="flex justify-between py-1">
          <div className="font-bold">Tax ({props.formData.taxRate}%):</div>
          <div>{currencyFormat(taxTotal)}</div>
        </div>
        <div className="flex justify-between font-bold py-1">
          <div>Total:</div>
          <div>{currencyFormat(total)}</div>
        </div>
      </div>
    </div>
  )
}

export default function Component() {
  const [droppableContent, setDroppableContent] = useState<{ [x: number]: string }>({
    1: 'number',
    2: 'date',
    3: 'billto',
  });

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      invoiceNumber: 'INV-001',
      invoiceDate: '2023-07-01',
      customerName: 'John Doe',
      addressLine1: '123 Main St.',
      addressLine2: '',
      subtotal: 35,
      taxRate: 10
    }
  })

  const watchedFields = watch();

  const componentMap: { [x: string]: JSX.Element } = {
    'number': <InvoiceNumber formData={watchedFields} />,
    'date': <InvoiceDate formData={watchedFields} />,
    'billto': <BillTo formData={watchedFields} />,
  }

  const onSubmit = (data: FormData) => {
    type BlockProps = {
      title: string;
      values: string[];
  }

    const numberBlock: BlockProps = { title: 'Invoice Number', values: [data.invoiceNumber] };
    const dateBlock: BlockProps = { title: 'Date', values: [data.invoiceDate] };
    const billtoBlock: BlockProps = { title: 'Bill To', values: [data.customerName, data.addressLine1, data.addressLine2] };

    const mapBlocks: { [x: string]: BlockProps } = {
      'number': numberBlock,
      'date': dateBlock,
      'billto': billtoBlock,
    }
    
    const invoiceData = {
      lines: [
        {
          type: 'text',
          blocks: [
            { position: 'left', ...mapBlocks[droppableContent[1]] },
            { position: 'right', ...mapBlocks[droppableContent[2]] },
          ]
        },
        {
          type: 'text',
          blocks: [
            { position: 'left', ...mapBlocks[droppableContent[3]] },
          ]
        },
        {
          type: 'items',
        },
      ],
      items: {
        subtotal: data.subtotal * 100,
        tax: data.taxRate,
        columns: [
          { display_name: 'Item', field: 'name', size: 1 },
          { display_name: 'Quantity', field: 'quantity', size: 1 },
          { display_name: 'Price', field: 'price', size: 1, type: 'money' },
          { display_name: 'Total', field: 'total', size: 1, type: 'money' },
        ],
        registers: [
          {
            name: "TC 100",
            quantity: 2,
            price: 6000,
            total: 12000,
          },
          {
            name: "USB_EXT",
            quantity: 1,
            price: 2000,
            total: 2000,
          },
        ],
      },
      invoiceNr: data.invoiceNumber
    };

    fetch('/api/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    console.log(invoiceData)
  }

  function handleDragEnd(event: DragEndEvent) {
    if (event.over) {
      let fromId = 0;
      const toId = event.over.id as number;
      const fromValue = event.active.id as string;
      const toValue = droppableContent[toId];

      for (const [key, value] of Object.entries(droppableContent)) {
        if (fromValue === value) fromId = Number(key);
      }

      if (fromValue === 'table' || toValue === 'table') return;

      setDroppableContent({
        ...droppableContent,
        [fromId]: toValue,
        [toId]: fromValue,
      })
    }
  }

  return (
    <div>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="container mx-auto p-4">
          <Card className="w-full max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle>A4 Invoice Manager</CardTitle>
              <CardDescription>Preview and manage A4-sized invoice {watchedFields.invoiceNumber}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="order-2 lg:order-1">
                  <div className="bg-white border rounded-lg overflow-hidden shadow-inner" style={{ width: '210mm', height: '297mm', maxWidth: '100%', maxHeight: '80vh', overflow: 'hidden' }}>
                    <div className="w-full h-full overflow-auto text-sm" style={{ zoom: 0.75, padding: '18mm', overflow: 'hidden' }}>
                      {/* A4-sized Invoice Preview */}
                      <div className="text-3xl font-bold mb-8">Invoice</div>
                      <div className="flex justify-between mb-8">
                        <Droppable num={1}>
                          {componentMap[droppableContent[1]]}
                        </Droppable>
                        <Droppable num={2}>
                          {componentMap[droppableContent[2]]}
                        </Droppable>
                      </div>
                      <div className="mb-8">
                        <Droppable num={3}>
                          {componentMap[droppableContent[3]]}
                        </Droppable>
                      </div>
                      <div className="mb-8">
                        <Table />
                      </div>
                      <div className="flex justify-end">
                        <Total formData={watchedFields} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">Invoice Number</Label>
                      <Controller
                        name="invoiceNumber"
                        control={control}
                        rules={{ required: 'Invoice number is required' }}
                        render={({ field }) => <Input {...field} />}
                      />
                      {errors.invoiceNumber && <p className="text-red-500 text-sm">{errors.invoiceNumber.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceDate">Invoice Date</Label>
                      <Controller
                        name="invoiceDate"
                        control={control}
                        rules={{ required: 'Invoice date is required' }}
                        render={({ field }) => <Input type="date" {...field} />}
                      />
                      {errors.invoiceDate && <p className="text-red-500 text-sm">{errors.invoiceDate.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Controller
                        name="customerName"
                        control={control}
                        rules={{ required: 'Customer name is required' }}
                        render={({ field }) => <Input {...field} />}
                      />
                      {errors.customerName && <p className="text-red-500 text-sm">{errors.customerName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine1">Address Line 1</Label>
                      <Controller
                        name="addressLine1"
                        control={control}
                        rules={{ required: 'Address is required' }}
                        render={({ field }) => <Input {...field} />}
                      />
                      {errors.addressLine1 && <p className="text-red-500 text-sm">{errors.addressLine1.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="addressLine2">Address Line 2</Label>
                      <Controller
                        name="addressLine2"
                        control={control}
                        render={({ field }) => <Input {...field} />}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subtotal">Subtotal</Label>
                      <Controller
                        name="subtotal"
                        control={control}
                        rules={{ required: 'Subtotal is required', min: 0 }}
                        render={({ field }) => <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
                      />
                      {errors.subtotal && <p className="text-red-500 text-sm">{errors.subtotal.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxRate">Tax Rate (%)</Label>
                      <Controller
                        name="taxRate"
                        control={control}
                        rules={{ required: 'Tax rate is required', min: 0, max: 100 }}
                        render={({ field }) => <Input type="number" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />}
                      />
                      {errors.taxRate && <p className="text-red-500 text-sm">{errors.taxRate.message}</p>}
                    </div>
                    <Button type="submit">
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </form>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DndContext>
    </div>
  )
}