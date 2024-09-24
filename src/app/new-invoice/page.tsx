"use client"

import { ReactNode, ReducerAction, useEffect, useReducer, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PrinterIcon, DownloadIcon, RefreshCwIcon, X, PlusCircle } from 'lucide-react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Controller, FormState, useForm } from 'react-hook-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type FormData = {
  invoiceNumber: string
  invoiceDate: string
  customerName: string
  addressLine1: string
  addressLine2: string
  subtotal: number
  taxRate: number
}

interface ITemplate {
  name: string;
  columns: string[];
  lines: Array<{
      type: 'text' | 'items';
      left?: {
          internalId: number;
          title: string;
          lines: number;
      };
      right?: {
          internalId: number;
          title: string;
          lines: number;
      };
  }>;
}

interface TransformedLine {
  type: 'text' | 'items';
  side: 'left' | 'right';
  internalId: number;
  title: string;
  lines: number;
  values: string[],
  line: number;
}

function transformTemplate(template: ITemplate): TransformedLine[] {
  const transformedLines: TransformedLine[] = [];

  template.lines.forEach((line, index) => {
    if (line.left) {
      transformedLines.push({
        type: line.type,
        side: 'left',
        internalId: line.left.internalId,
        title: line.left.title,
        lines: line.left.lines,
        values: Array(line.left.lines).fill('Fill me'),
        line: index + 1,
      });
    }

    if (line.right) {
      transformedLines.push({
        type: line.type,
        side: 'right',
        internalId: line.right.internalId,
        title: line.right.title,
        lines: line.right.lines,
        values: Array(line.right.lines).fill('Fill me'),
        line: index + 1,
      });
    }
  });

  return transformedLines;
}

function currencyFormat(price: number) {
  const USDollar = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return USDollar.format(price);
}

function BlockText(props: { item: TransformedLine }) {
  return (
    <div>
      <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>{props.item.title}:</div>
      {props.item.values.map((value, idx) => (
        <div key={idx} style={{ fontSize: 10, lineHeight: '14px' }}>{value}</div>
      ))}
    </div>
  )
}


function Table(props: { columns: string[], rows: IRow[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr style={{ height: 26, borderBottom: '1px solid #e5e7eb' }}>
          <th className="text-left" style={{ fontSize: 10, lineHeight: '14px' }}>Item</th>
          {props.columns.map((column) => (
            <th key={column} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>{column}</th>
          ))}
          <th className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>Total</th>
        </tr>
      </thead>
      <tbody>
        {props.rows.map(row => (
          <tr key={row.id} style={{ height: 26, borderBottom: '1px solid #e5e7eb' }}>
            <td className="" style={{ fontSize: 10, lineHeight: '14px' }}>{row.name}</td>
            {props.columns.map((column) => (
              <td key={column} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>{row[column]}</td>
            ))}
            <td className="text-right " style={{ fontSize: 10, lineHeight: '14px' }}>{currencyFormat(row.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function Total(props: { subtotal: number, taxRate: number }) {
  const subtotal = props.subtotal||0;
  const taxTotal = (props.taxRate||0) / 100 * subtotal;
  const total = subtotal + taxTotal;

  return (
    <div>
      <div className="w-1/2 min-w-28">
        <div className="flex justify-between">
          <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>Subtotal:</div>
          <div style={{ fontSize: 10, lineHeight: '14px' }}>{currencyFormat(subtotal)}</div>
        </div>
        <div className="flex justify-between">
          <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>Tax ({props.taxRate}%):</div>
          <div style={{ fontSize: 10, lineHeight: '14px' }}>{currencyFormat(taxTotal)}</div>
        </div>
        <div className="flex justify-between font-bold">
          <div style={{ fontSize: 10, lineHeight: '14px' }}>Total:</div>
          <div style={{ fontSize: 10, lineHeight: '14px' }}>{currencyFormat(total)}</div>
        </div>
      </div>
    </div>
  )
}

interface IRow {
  [x: string]: string | number;
  id: number;
  name: string;
  price: number;
}

export default function Component() {
  const [templates, setTemplates] = useState<ITemplate[] | null>(null)
  const [templateIndex, setTemplateIndex] = useState<number | "none">("none")
  const [lines, setLines] = useState<TransformedLine[]>([])
 
  useEffect(() => {
    async function fetchPosts() {
      let res = await fetch('/api/template')
      let data = await res.json()
      setTemplates(data.templates)
    }
    fetchPosts()
  }, [])

  const [rows, setRows] = useState<IRow[]>([
    { id: 0, name: 'New Item', price: 0 }
  ]);
  const [taxRate, setTaxRate] = useState(0);

  const addNewColumn = () => {
    const newInternalId = (rows.length > 0 ? Math.max(...(rows.map(clm => clm.id))) : 0) + 1;
    const newRow: IRow = { id: newInternalId, name: 'New Item', price: 0 };
    
    setRows(prevRows => [...prevRows, newRow]);
  };


  if (!templates) return <div>Loading...</div>

  if (templateIndex === "none") return (
    <div className="w-full flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Select value={(templateIndex || 0)?.toString()} onValueChange={(newValue) => {
            setTemplateIndex(Number(newValue));
            setLines(transformTemplate(templates[Number(newValue)]));
          }}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((temp, index) => (
                <SelectItem key={index} value={index.toString()}>{temp.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )

  const template = templates[templateIndex];

  const subtotal = rows.reduce((n, row) => row.price + n, 0);

  const generateInvoice = () => {
    type BlockProps = {
      title: string;
      values: string[];
    }

    const apiLines = template.lines.map((line, index) => {
      if (line.type === 'items') return { type: 'items' };

      const blocks = [];

      if (line.left) {
        const transformedLeft = lines.find(li => li.side === "left" && li.line === index + 1);
        blocks.push({ position: 'left', title: line.left.title, values: transformedLeft?.values });
      }

      if (line.right) {
        const transformedRight = lines.find(li => li.side === "right" && li.line === index + 1);
        blocks.push({ position: 'right', title: line.right.title, values: transformedRight?.values });
      }

      return {
        type: line.type,
        blocks,
      }
    });

    const invoiceData = {
      lines: apiLines,
      items: {
        subtotal: subtotal * 100,
        tax: taxRate,
        columns: [
          { display_name: 'Item', field: 'name', size: 1 },
          ...template.columns.map(column => ({ display_name: column, field: column, size: 1 })),
          { display_name: 'Total', field: 'total', size: 1, type: 'money' },
        ],
        registers: rows.map(row => {
          const basicInfo: { [x: string]: string | number } = {
            name: row.name,
            total: row.price * 100,
          };

          template.columns.forEach(column => {
            basicInfo[column] = row[column];
          })

          return basicInfo;
        }),
      },
      invoiceNr: 123,
    };

    fetch('/api/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    console.log(invoiceData)
  }

  return (
    <div className="w-full">
      <Card className="w-full mx-auto">
        <CardHeader>
          <CardTitle>A4 Invoice Manager</CardTitle>
          <CardDescription>Preview and manage A4-sized invoice</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="order-2 lg:order-1">
                <div className="bg-white border rounded-lg overflow-hidden shadow-inner" style={{ width: 595.28, minHeight: 841.89, overflow: 'hidden' }}>
                  <div className="w-full h-full overflow-auto text-sm flex flex-col" style={{ padding: 50, overflow: 'hidden', gap: 20 }}>
                    <div className="font-bold" style={{ fontSize: 20 }}>Invoice</div>
                    {template.lines.map((line, index) => {
                      if (line.type === 'items') return (
                        <>
                          <div>
                            <Table columns={template.columns} rows={rows} />
                          </div>
                          <div className="flex justify-end">
                            <Total taxRate={taxRate} subtotal={subtotal} />
                          </div>
                        </>
                      )

                      const transformedLeft = lines.find(li => li.side === "left" && li.line === index + 1);
                      const transformedRight = lines.find(li => li.side === "right" && li.line === index + 1);

                      return (
                        <div className="flex justify-between">
                          {line.left && transformedLeft ? <BlockText item={transformedLeft} /> : <div />}
                          {line.right && transformedRight ? <BlockText item={transformedRight} /> : <div />}
                        </div>
                      )
                    })}
                  </div>
                </div>
            </div>
            <div className="order-1 lg:order-2">
            <div>
                <div className="space-y-4 mb-4">
                  <div className="space-y-4 mb-4">
                    {lines.map((line, idx) => (
                      <div key={idx}>
                        <Label>{line.title}</Label>
                        {line.values.map((value, valueIdx) => (
                          <Input
                            key={valueIdx}
                            placeholder="String"
                            className="mt-1"
                            value={value}
                            onChange={e => {
                              const newValue = e.target.value;
                              const newLines = lines.map((li, liIdx) => {
                                if (idx === liIdx) {
                                  return { ...li, values: li.values.map((va, vaIdx) => {
                                    if (vaIdx === valueIdx) return newValue;
                                    return va;
                                  }) };
                                }

                                return li;
                              });

                              setLines(newLines);
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <Label>Items</Label>
                  {rows.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Input
                        placeholder="String"
                        value={item.name}
                        onChange={e => {
                          const newValue = e.target.value;
                          const newRows = rows.map(it => {
                            if (it.id === item.id) {
                              return { ...it, name: newValue };
                            }

                            return it;
                          });

                          setRows(newRows);
                        }}
                      />
                      {template.columns.map((column) => (
                        <Input
                          key={column}
                          placeholder="String"
                          value={item[column]}
                          onChange={e => {
                            const newValue = e.target.value;
                            const newRows = rows.map(it => {
                              if (it.id === item.id) {
                                return { ...it, [column]: newValue };
                              }

                              return it;
                            });

                            setRows(newRows);
                          }}
                        />
                      ))}
                      <Input
                        type="number"
                        placeholder="Number"
                        value={item.price}
                        onChange={e => {
                          const newValue = e.target.value;
                          const newRows = rows.map(it => {
                            if (it.id === item.id) {
                              return { ...it, price: Number(newValue) };
                            }

                            return it;
                          });

                          setRows(newRows);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newRows = rows.filter(it => it.id !== item.id);
                          setRows(newRows);
                        }}
                        className="min-w-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={rows.length > 0 ? "mt-2" : "ml-2"}
                    onClick={addNewColumn}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Column
                  </Button>
                </div>
                <Label>Tax Rate</Label>
                <Input
                  className='mt-2'
                  type='number'
                  value={taxRate}
                  onChange={e => setTaxRate(Number(e.target.value))}
                />

                <Button className='mt-10' onClick={generateInvoice}>Submit</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}