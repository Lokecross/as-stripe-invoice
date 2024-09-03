'use client'

import { ChangeEventHandler, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface IFormFieldItem { 
  description: string;
  quantity: number;
  price: number
}

interface IFormFields {
  personName: string;
  email: string;
  invoiceDate: Date;
  dueDate: Date;
  items: Array<IFormFieldItem>;
  notes: string;
  terms: string;
  taxRate: number;
}

export default function Component() {
  const { register, control, handleSubmit, formState: { errors } } = useForm<IFormFields>({
    defaultValues: {
      personName: '',
      email: '',
      invoiceDate: new Date(),
      dueDate: new Date(),
      items: [{ description: '', quantity: 0, price: 0 }],
      notes: '',
      terms: '',
      taxRate: 0
    }
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  })

  const calculateSubtotal = (items: IFormFieldItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTax = (subtotal: number, taxRate: number) => {
    return subtotal * (taxRate / 100)
  }

  const calculateTotal = (subtotal: number, tax: number) => {
    return subtotal + tax
  }

  const onSubmit = async (data: IFormFields) => {
    const subtotal = calculateSubtotal(data.items)
    const tax = calculateTax(subtotal, data.taxRate)
    const total = calculateTotal(subtotal, tax)
    console.log({ ...data, subtotal, tax, total });

    const stripeData = {
      name: data.personName,
      email: data.email,
      dueDate: data.dueDate,
      issueDate: data.invoiceDate,
      items: data.items,
      notes: data.notes,
      terms: data.terms,
      tax: data.taxRate,
    }

    const response = await fetch('/api/stripe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stripeData),
    });

    const result = await response.json();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="container mx-auto p-6 space-y-6 bg-background">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="person-name">Person Name</Label>
          <Input 
            {...register("personName", { required: "Person name is required" })} 
            id="person-name" 
            placeholder="Enter person's name" 
          />
          {errors.personName && <p className="text-red-500 text-sm">{errors.personName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="person-email">Email</Label>
          <Input 
            {...register("email", { 
              required: "Email is required", 
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })} 
            id="person-email" 
            type="email" 
            placeholder="Enter email address" 
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="invoice-date">Invoice Date</Label>
          <Controller
            control={control}
            name="invoiceDate"
            rules={{ required: "Invoice date is required" }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${errors.invoiceDate ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.invoiceDate && <p className="text-red-500 text-sm">{errors.invoiceDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-date">Due Date</Label>
          <Controller
            control={control}
            name="dueDate"
            rules={{ required: "Due date is required" }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-full justify-start text-left font-normal ${errors.dueDate ? 'border-red-500' : ''}`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate.message}</p>}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Total</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell>
                <Input
                  {...register(`items.${index}.description`, { required: "Description is required" })}
                  placeholder="Item description"
                />
                {errors.items?.[index]?.description && <p className="text-red-500 text-sm absolute">{errors.items[index]?.description?.message}</p>}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  {...register(`items.${index}.quantity`, { 
                    required: "Quantity is required",
                    min: { value: 1, message: "Quantity must be at least 1" }
                  })}
                  placeholder="Quantity"
                />
                {errors.items?.[index]?.quantity && <p className="text-red-500 text-sm absolute">{errors.items[index]?.quantity?.message}</p>}
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  {...register(`items.${index}.price`, { 
                    required: "Price is required",
                    min: { value: 0, message: "Price must be non-negative" }
                  })}
                  placeholder="Price"
                />
                {errors.items?.[index]?.price && <p className="text-red-500 text-sm absolute">{errors.items[index]?.price?.message}</p>}
              </TableCell>
              <TableCell>
                {(item.quantity * item.price).toFixed(2)}
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Button type="button" onClick={() => append({ description: '', quantity: 0, price: 0 })}>
        <PlusIcon className="mr-2 h-4 w-4" /> Add Item
      </Button>

      <div className="flex gap-4">
        <div className="w-2/3 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea {...register("notes")} id="notes" placeholder="Notes - any relevant information not already covered" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="terms">Terms</Label>
            <Textarea {...register("terms")} id="terms" placeholder="Terms and conditions" />
          </div>
        </div>
        <div className="w-1/3 space-y-2 flex flex-col justify-end">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${calculateSubtotal(fields).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <Label htmlFor="tax-rate">Tax Rate (%):</Label>
            <Input
              id="tax-rate"
              type="number"
              {...register("taxRate", { 
                required: "Tax rate is required",
                min: { value: 0, message: "Tax rate must be non-negative" },
                max: { value: 100, message: "Tax rate must not exceed 100%" }
              })}
              className="w-20"
            />
          </div>
          {errors.taxRate && <p className="text-red-500 text-sm">{errors.taxRate.message}</p>}
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>${calculateTax(calculateSubtotal(fields), control._formValues.taxRate).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${calculateTotal(calculateSubtotal(fields), calculateTax(calculateSubtotal(fields), control._formValues.taxRate)).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">Generate Invoice</Button>
    </form>
  )
}