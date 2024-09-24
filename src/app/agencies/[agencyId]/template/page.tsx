"use client"

import { CSSProperties, ReactNode, useState, useEffect } from 'react'
import { useSearchParams, useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyPlusIcon, ListPlusIcon, PlusCircle, PlusIcon, X } from 'lucide-react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

function splitArray(arr: number[], n: number): [number[], number[]] {
    const firstPart = arr.slice(0, n - 1);
    const secondPart = arr.slice(n - 1);
    return [firstPart, secondPart];
  }
  
  function createSequentialArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }
  
  function setUndefinedForValue(obj: { [x: number]: number | undefined }, targetValue: number): { [x: number]: number | undefined } {
    const result: { [x: number]: number | undefined } = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const numKey = Number(key);
        result[numKey] = obj[numKey] === targetValue ? undefined : obj[numKey];
      }
    }
    
    return result;
  }
  
  interface IItem {
    internalId: number;
    title: string;
    field: string;
    type: 'vertical' | 'horizontal';
    keyValues?: { key: string; value: string }[];
  }
  
  function TableTextPlaceHolder() {
    return (
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ height: 8, width: 30, borderRadius: 4, background: '#eee' }} />
      </div>
    )
  }
  
  function TextPlaceHolder({ field }: { field: string }) {
    return (
      <div style={{ height: 14, display: 'flex', alignItems: 'center' }}>
        <div style={{ height: 8, fontSize: 10, lineHeight: '9px' }}>
          [{field}]
        </div>
      </div>
    )
  }
  
  function currencyFormat(price: number) {
    const USDollar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  
    return USDollar.format(price);
  }
  
  function Droppable(props: { children: ReactNode, num: number, addNew: (dropId: number) => void }) {
    const {isOver, setNodeRef, active, over} = useDroppable({
      id: props.num,
    });
    const style: CSSProperties = {
      color: isOver ? 'green' : undefined,
      borderRadius: 8,
      border: '1px solid',
      borderColor: isOver ? '#b3b3b3' : '#ddd',
      minWidth: 260,
      padding: '5px 10px',
      minHeight: 40,
    };
    
    
    return (
      <div ref={setNodeRef} style={style}>
        {props.children}
        {!props.children && !active?.id && over?.id !== props.num && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => props.addNew(props.num)}>
              <CopyPlusIcon className="h-4 w-4"/>
            </Button>
          </div>
        )}
      </div>
    );
  }
  
  function BlockText(props: { item: IItem }) {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
      id: props.item.internalId,
    });
    const style = transform ? {
      transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;
  
    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
        {props.item.type === 'vertical' ? (
          <>
            <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>{props.item.title}:</div>
            <TextPlaceHolder field={props.item.field} />
          </>
        ) : (
          <div>
            {props.item.keyValues?.map((kv, index) => (
              <div key={index} style={{ fontSize: 10, lineHeight: '14px' }}>
                <b>{kv.key}:</b> [{kv.value}]
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  function Table(props: { columns: IColumn[] }) {
    return (
      <div style={{ width: '100%', padding: '0 10px' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ height: 26, borderBottom: '1px solid #e5e7eb' }}>
              <th className="text-left" style={{ fontSize: 10, lineHeight: '14px' }}>Item</th>
              {props.columns.map(column => (
                <th key={column.internalId} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>{column.title}</th>
              ))}
              <th className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ height: 26, borderBottom: '1px solid #e5e7eb' }}>
              <td className="text-left" style={{ fontSize: 10, lineHeight: '14px' }}>Widget A</td>
              {props.columns.map(column => (
                <td key={column.internalId} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>[{column.data}]</td>
              ))}
              <td className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>$20.00</td>
            </tr>
            <tr style={{ height: 26, borderBottom: '1px solid #e5e7eb' }}>
              <td className="text-left" style={{ fontSize: 10, lineHeight: '14px' }}>Widget B</td>
              {props.columns.map(column => (
                <td key={column.internalId} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>[{column.data}]</td>
              ))}
              <td className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>$15.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
  
  function Total() {
    const taxRate = 2;
    const subtotal = 35;
    const taxTotal = taxRate / 100 * subtotal;
    const total = subtotal + taxTotal;
  
    return (
      <div style={{ padding: '0 10px' }}>
        <div className="w-1/2 min-w-28">
          <div className="flex justify-between">
            <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>Subtotal:</div>
            <div style={{ fontSize: 10, lineHeight: '14px' }}>{currencyFormat(subtotal)}</div>
          </div>
          <div className="flex justify-between">
            <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>Tax ({taxRate}%):</div>
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
  
  interface IItem {
    internalId: number;
    title: string;
    field: string;
    type: 'vertical' | 'horizontal';
  }
  
  interface IColumn {
    internalId: number;
    title: string;
    data: string;
  }
  
  const workerFields = [
    "worker.name",
    "worker.email",
    "worker.phone",
    "worker.address",
    "worker.age",
    "invoice.id",
    "invoice.date",
  ];
  
  const columnDataOptions = [
    "REG hours",
    "OT hours",
    "Total hours"
  ];

export default function EditTemplate() {
  const params = useParams();
  const searchParams = useSearchParams()
  const router = useRouter()
  const templateId = searchParams.get('id')
  const { toast } = useToast()

  const [dropLines, setDropLines] = useState(3);
  const [tableLine, setTableLine] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [currentDropId, setCurrentDropId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const droppables = createSequentialArray(dropLines);
  const [firstLines, lastLines] = splitArray(droppables, tableLine);

  const [blocks, setBlocks] = useState<IItem[]>([
    { internalId: 1, title: 'Invoice Number', field: 'invoice.id', type: 'vertical' },
    { internalId: 2, title: 'Invoice Date', field: 'invoice.date', type: 'vertical' },
    { internalId: 3, title: 'Bill To', field: 'worker.name', type: 'vertical' },
  ]);

  const [columns, setColumns] = useState<IColumn[]>([
    { internalId: 1, title: 'REG Hours', data: 'REG hours' },
    { internalId: 2, title: 'OT Hours', data: 'OT hours' },
  ]);

  const [droppableContent, setDroppableContent] = useState<{ [x: number]: number | undefined }>({
    1: 1,
    2: 2,
    3: 3,
  });

  useEffect(() => {
    fetchTemplateData();
  }, []);

  const fetchTemplateData = async () => {
    try {
      setIsLoading(true);
      const responseAgency = await fetch(`/api/agencies/${params.agencyId}`);
      const agencyData = await responseAgency.json();

      const response = await fetch(`/api/template?id=${agencyData.template || ''}`);
      if (response.ok) {
        const templateData = await response.json();
        if (templateData) {
          setColumns(templateData.columns.map((col: string, index: number) => ({
            internalId: index + 1,
            title: col,
            data: col
          })));
          
          const newBlocks: IItem[] = [];
          const newDroppableContent: { [x: number]: number | undefined } = {};
          templateData.lines.filter((line: any) => line.type !== "items").forEach((line: any, index: number) => {
            if (line.type === 'text') {
              if (line.left) {
                const newId = newBlocks.length + 1;
                newBlocks.push({
                  internalId: newId,
                  title: line.left.title,
                  field: line.left.field,
                  type: line.left.type,
                  keyValues: line.left.keyValues,
                });
                newDroppableContent[(index * 2) + 1] = newId;
              }
              if (line.right) {
                const newId = newBlocks.length + 1;
                newBlocks.push({
                  internalId: newId,
                  title: line.right.title,
                  field: line.right.field,
                  type: line.right.type,
                  keyValues: line.right.keyValues,
                });
                newDroppableContent[(index * 2) + 2] = newId;
              }
            } else if (line.type === 'items') {
              setTableLine(index + 1);
            }
          });
          setBlocks(newBlocks);
          setDroppableContent(newDroppableContent);
          setDropLines(Math.max(3, templateData.lines.length - 1));
        }
      }
    } catch (error) {
      console.error('Error fetching template data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over) {
      const fromId = Object.entries(droppableContent).find(([, value]) => value === event.active.id)?.[0];
      const toId = event.over.id as number;
      
      if (fromId) {
        setDroppableContent(prevContent => ({
          ...prevContent,
          [fromId]: prevContent[toId],
          [toId]: event.active.id as number,
        }));
      }
    }
  };

  const handleDataTypeSelection = (type: 'vertical' | 'horizontal') => {
    if (currentDropId !== null) {
      const newInternalId = Math.max(...(blocks.map(item => item.internalId))) + 1;
      const newBlock: IItem = type === 'vertical'
        ? { internalId: newInternalId, title: 'New Block', field: workerFields[0], type }
        : { internalId: newInternalId, title: 'New Block', field: '', type, keyValues: [{ key: 'New Key', value: workerFields[0] }] };
      
      setBlocks(prevBlocks => [...prevBlocks, newBlock]);
      setDroppableContent(prevContent => ({
        ...prevContent,
        [currentDropId]: newInternalId,
      }));
    }
    setShowModal(false);
    setCurrentDropId(null);
  };

  const addNew = (dropId: number) => {
    setCurrentDropId(dropId);
    setShowModal(true);
  };

  const addNewColumn = () => {
    const newInternalId = Math.max(...(columns.map(clm => clm.internalId))) + 1;
    const newColumn = { internalId: newInternalId, title: 'New Column', data: columnDataOptions[0] };
    
    setColumns(prevColumns => [...prevColumns, newColumn]);
  };

  const componentMap = (itemId: number | undefined) => {
    const item = blocks.find(it => it.internalId === itemId);
    return item ? <BlockText item={item} /> : null;
  };

  const saveTemplate = async () => {
    const sendColumns = columns.toReversed().map(column => column.title);
    const beforeTableLines = firstLines.map(line => {
      const leftNum = droppableContent[(line - 1)*2 + 1];
      const rightNum = droppableContent[(line - 1)*2 + 2];

      const left = blocks.find(block => block.internalId === leftNum);
      const right = blocks.find(block => block.internalId === rightNum);

      return {
        type: 'text',
        left,
        right,
      }
    }).filter(line => line.left || line.right);
    const afterTableLines = lastLines.map(line => {
      const leftNum = droppableContent[(line - 1)*2 + 1];
      const rightNum = droppableContent[(line - 1)*2 + 2];

      const left = blocks.find(block => block.internalId === leftNum);
      const right = blocks.find(block => block.internalId === rightNum);

      return {
        type: 'text',
        left,
        right,
      }
    }).filter(line => line.left || line.right);

    const lines = [...beforeTableLines, { type: 'items' }, ...afterTableLines];

    const templateConfig = {
      columns: sendColumns,
      lines,
    };

    try {
      const response = await fetch(`/api/agencies/${params.agencyId}/template`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateConfig),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Template updated successfully",
        });
        router.push(`/agencies/${params.agencyId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update template');
        toast({
          title: "Error",
          description: errorData.error || 'Failed to update template',
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating template:', error);
      setError('Error updating template');
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the template",
        variant: "destructive",
      });
    }
  }

  if (isLoading) {
    return <div>Loading template data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
<div className="w-full">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Edit A4 Invoice Template</CardTitle>
              <CardDescription>Edit and manage your A4-sized invoice template</CardDescription>
            </CardHeader>
            <CardContent>
            <div style={{ display: 'flex', gap: 20 }}>
              <div className=" bg-white border rounded-lg overflow-hidden shadow-inner" style={{ minWidth: 595.28, minHeight: 841.89, overflow: 'hidden' }}>
                    <div className="w-full h-full overflow-auto text-sm flex flex-col" style={{ padding: '50px 30px', overflow: 'hidden', gap: 14 }}>
                      <div className="font-bold" style={{ fontSize: 20, padding: '0 10px' }}>Invoice</div>
                      {firstLines.map((num) => (
                        <div key={num} className="flex justify-between">
                          <Droppable num={(num - 1)*2 + 1} addNew={addNew}>
                            {componentMap(droppableContent[(num - 1)*2 + 1])}
                          </Droppable>
                          <Droppable num={(num - 1)*2 + 2} addNew={addNew}>
                            {componentMap(droppableContent[(num - 1)*2 + 2])}
                          </Droppable>
                        </div>
                      ))}
                      <Button size="icon" variant="outline" className='size-8' onClick={() => {
                        setDropLines(dropLines + 1);
                        setTableLine(tableLine + 1);
                      }}>
                        <ListPlusIcon className="h-4 w-4"/>
                      </Button>
                      <div className="">
                        <Table columns={columns.toReversed()} />
                      </div>
                      <div className="flex justify-end">
                        <Total />
                      </div>
                      {lastLines.map((num) => (
                        <div key={num} className="flex justify-between">
                          <Droppable num={(num - 1)*2 + 1} addNew={addNew}>
                            {componentMap(droppableContent[(num - 1)*2 + 1])}
                          </Droppable>
                          <Droppable num={(num - 1)*2 + 2} addNew={addNew}>
                            {componentMap(droppableContent[(num - 1)*2 + 2])}
                          </Droppable>
                        </div>
                      ))}
                      <Button size="icon" variant="outline" className='size-8' onClick={() => {
                        setDropLines(dropLines + 1);
                      }}>
                        <ListPlusIcon className="h-4 w-4"/>
                      </Button>
                    </div>
                </div>
              <div style={{ flex: 1 }}>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label>Text</Label>
                    {blocks.map((item, index) => (
                      <div key={item.internalId} className="space-y-2">
                        {item.type === 'vertical' ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              placeholder="String"
                              value={item.title}
                              disabled={index < 3}
                              onChange={e => {
                                const newValue = e.target.value;
                                const newBlocks = blocks.map(it => {
                                  if (it.internalId === item.internalId) {
                                    return { ...it, title: newValue };
                                  }
                                  return it;
                                });
                                setBlocks(newBlocks);
                              }}
                            />
                            <Select
                              value={item.field}
                              disabled={index < 3}
                              onValueChange={(value) => {
                                const newBlocks = blocks.map(it => {
                                  if (it.internalId === item.internalId) {
                                    return { ...it, field: value };
                                  }
                                  return it;
                                });
                                setBlocks(newBlocks);
                              }}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a field" />
                              </SelectTrigger>
                              <SelectContent>
                                {workerFields.map((field) => (
                                  <SelectItem key={field} value={field}>
                                    {field}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {item.keyValues?.map((kv, kvIndex) => (
                              <div key={kvIndex} className="flex items-center space-x-2">
                                <Input
                                  placeholder="Key"
                                  value={kv.key}
                                  onChange={e => {
                                    const newValue = e.target.value;
                                    const newBlocks = blocks.map(it => {
                                      if (it.internalId === item.internalId) {
                                        const newKeyValues = [...(it.keyValues || [])];
                                        newKeyValues[kvIndex] = { ...newKeyValues[kvIndex], key: newValue };
                                        return { ...it, keyValues: newKeyValues };
                                      }
                                      return it;
                                    });
                                    setBlocks(newBlocks);
                                  }}
                                />
                                <Select
                                  value={kv.value}
                                  onValueChange={(value) => {
                                    const newBlocks = blocks.map(it => {
                                      if (it.internalId === item.internalId) {
                                        const newKeyValues = [...(it.keyValues || [])];
                                        newKeyValues[kvIndex] = { ...newKeyValues[kvIndex], value };
                                        return { ...it, keyValues: newKeyValues };
                                      }
                                      return it;
                                    });
                                    setBlocks(newBlocks);
                                  }}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select a field" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {workerFields.map((field) => (
                                      <SelectItem key={field} value={field}>
                                        {field}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    const newBlocks = blocks.map(it => {
                                      if (it.internalId === item.internalId) {
                                        const newKeyValues = (it.keyValues || []).filter((_, i) => i !== kvIndex);
                                        return { ...it, keyValues: newKeyValues };
                                      }
                                      return it;
                                    });
                                    setBlocks(newBlocks);
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
                              onClick={() => {
                                const newBlocks = blocks.map(it => {
                                  if (it.internalId === item.internalId) {
                                    const newKeyValues = [...(it.keyValues || []), { key: 'New Key', value: workerFields[0] }];
                                    return { ...it, keyValues: newKeyValues };
                                  }
                                  return it;
                                });
                                setBlocks(newBlocks);
                              }}
                            >
                              Add Key-Value Pair
                            </Button>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={index < 3}
                          onClick={() => {
                            const newBlocks = blocks.filter(it => it.internalId !== item.internalId);
                            setBlocks(newBlocks);
                            const newDroppableContent = setUndefinedForValue(droppableContent, item.internalId);
                            setDroppableContent(newDroppableContent);
                          }}
                          className="min-w-10"
                        >
                          <X className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div>
                      <Label>Columns</Label>
                      {columns.map((item, index) => (
                        <div key={item.internalId} className="flex items-center space-x-2 my-2">
                          <Input
                            placeholder="Name"
                            value={item.title}
                            onChange={e => {
                              const newValue = e.target.value;
                              const newColumns = columns.map(it => {
                                if (it.internalId === item.internalId) {
                                  return { ...it, title: newValue };
                                }
                                return it;
                              });
                              setColumns(newColumns);
                            }}
                          />
                          <Select
                            value={item.data}
                            onValueChange={(value) => {
                              const newColumns = columns.map(it => {
                                if (it.internalId === item.internalId) {
                                  return { ...it, data: value };
                                }
                                return it;
                              });
                              setColumns(newColumns);
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select column data" />
                            </SelectTrigger>
                            <SelectContent>
                              {columnDataOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newColumns = columns.filter(it => it.internalId !== item.internalId);
                              setColumns(newColumns);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={columns.length > 0 ? "mt-2" : "ml-2"}
                        onClick={addNewColumn}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Column
                      </Button>
                    </div>
                    <Button onClick={saveTemplate}>Save</Button>
                    </div>
                  </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DndContext>
      <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Data Type</DialogTitle>
            <DialogDescription>
              Choose the type of data for the new block
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-around mt-4">
            <Button onClick={() => handleDataTypeSelection('vertical')}>
              Vertical Key Value
            </Button>
            <Button onClick={() => handleDataTypeSelection('horizontal')}>
              Horizontal Key Values
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}