"use client"

import { CSSProperties, ReactNode, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CopyPlusIcon, ListPlusIcon, PlusCircle, PlusIcon, X } from 'lucide-react'
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"

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

function TableTextPlaceHolder() {
  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ height: 8, width: 30, borderRadius: 4, background: '#eee' }} />
    </div>
  )
}

function TextPlaceHolder() {
  return (
    <div style={{ height: 14, display: 'flex', alignItems: 'center' }}>
      <div style={{ height: 8, width: 150, borderRadius: 4, background: '#eee' }} />
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
      <div className="font-bold" style={{ fontSize: 10, lineHeight: '14px' }}>{props.item.title}:</div>
      {Array(props.item.lines).fill(0).map((_, idx) => (
        <TextPlaceHolder key={idx} />
      ))}
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
              <td key={column.internalId} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}><TableTextPlaceHolder /></td>
            ))}
            <td className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}>$20.00</td>
          </tr>
          <tr style={{ height: 26, borderBottom: '1px solid #e5e7eb' }}>
            <td className="text-left" style={{ fontSize: 10, lineHeight: '14px' }}>Widget B</td>
            {props.columns.map(column => (
              <td key={column.internalId} className="text-right" style={{ fontSize: 10, lineHeight: '14px' }}><TableTextPlaceHolder /></td>
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
  lines: number;
}

interface IColumn {
  internalId: number;
  title: string;
}

export default function Component() {
  const [dropLines, setDropLines] = useState(3);
  const [tableLine, setTableLine] = useState(3);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const droppables = createSequentialArray(dropLines);
  const [firstLines, lastLines] = splitArray(droppables, tableLine);

  const [blocks, setBlocks] = useState<IItem[]>([
    { internalId: 1, title: 'Invoice Number', lines: 1 },
    { internalId: 2, title: 'Invoice Date', lines: 1 },
    { internalId: 3, title: 'Bill To', lines: 3 },
  ]);

  const [columns, setColumns] = useState<IColumn[]>([
    { internalId: 1, title: 'Price' },
    { internalId: 2, title: 'Quantity' },
  ]);

  const [droppableContent, setDroppableContent] = useState<{ [x: number]: number | undefined }>({
    1: 1,
    2: 2,
    3: 3,
  });

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

  const addNew = (dropId: number) => {
    const newInternalId = Math.max(...(blocks.map(item => item.internalId))) + 1;
    const newBlock = { internalId: newInternalId, title: 'New Block', lines: 1 };
    
    setBlocks(prevBlocks => [...prevBlocks, newBlock]);
    setDroppableContent(prevContent => ({
      ...prevContent,
      [dropId]: newInternalId,
    }));
  };

  const addNewColumn = () => {
    const newInternalId = Math.max(...(columns.map(clm => clm.internalId))) + 1;
    const newBlock = { internalId: newInternalId, title: 'New Column' };
    
    setColumns(prevColumns => [...prevColumns, newBlock]);
  };

  const componentMap = (itemId: number | undefined) => {
    const item = blocks.find(it => it.internalId === itemId);
    return item ? <BlockText item={item} /> : null;
  };

  const saveTemplate = () => {
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
      name: templateName,
      description: templateDescription,
      columns: sendColumns,
      lines,
    };

    fetch('/api/template', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateConfig),
    });
  }

  return (
    <div className="w-full">
      <DndContext onDragEnd={handleDragEnd}>
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>A4 Invoice Manager</CardTitle>
              <CardDescription>Preview and manage A4-sized invoice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1 bg-white border rounded-lg overflow-hidden shadow-inner" style={{ width: 595.28, minHeight: 841.89, overflow: 'hidden' }}>
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
                <div className="order-1 lg:order-2">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label>Template Name</Label>
                      <Input
                        value={templateName}
                        onChange={e => setTemplateName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Template Description</Label>
                      <Textarea
                        value={templateDescription}
                        onChange={e => setTemplateDescription(e.target.value)}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Text</Label>
                      {blocks.map((item, index) => (
                        <div key={item.internalId} className="flex items-center space-x-2">
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
                          <Input
                            type="number"
                            placeholder="Number"
                            value={item.lines}
                            disabled={index < 3}
                            onChange={e => {
                              const newValue = e.target.value;
                              const newBlocks = blocks.map(it => {
                                if (it.internalId === item.internalId) {
                                  return { ...it, lines: Number(newValue) };
                                }

                                return it;
                              });

                              setBlocks(newBlocks);
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index < 3}
                            onClick={() => {
                              const newBlocks = blocks.filter(it => it.internalId !== item.internalId);
                              setBlocks(newBlocks);
                              const newDroppableContent = setUndefinedForValue(droppableContent, item.internalId);
                              setDroppableContent(newDroppableContent);
                            }}
                            className="min-w-10"
                          >
                            <X className="h-4 w-4" />
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
                    <Button onClick={saveTemplate}>Submit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DndContext>
    </div>
  )
}