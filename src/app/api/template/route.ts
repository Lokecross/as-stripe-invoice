import { NextResponse } from "next/server"

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

const templates: ITemplate[] = [
    {
        "name": "Default",
        "columns": [
            "Quantity",
            "Price"
        ],
        "lines": [
            {
                "type": "text",
                "left": {
                    "internalId": 1,
                    "title": "Invoice Number",
                    "lines": 1
                },
                "right": {
                    "internalId": 2,
                    "title": "Invoice Date",
                    "lines": 1
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 3,
                    "title": "Bill To",
                    "lines": 3
                }
            },
            {
                "type": "items"
            }
        ]
    },
    {
        "name": "Big template",
        "columns": [
            "Quantity",
            "Price"
        ],
        "lines": [
            {
                "type": "text",
                "left": {
                    "internalId": 1,
                    "title": "Invoice Number",
                    "lines": 1
                },
                "right": {
                    "internalId": 2,
                    "title": "Invoice Date",
                    "lines": 1
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 3,
                    "title": "Bill To",
                    "lines": 3
                }
            },
            {
                "type": "items"
            },
            {
                "type": "text",
                "left": {
                    "internalId": 4,
                    "title": "New Block",
                    "lines": 1
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 5,
                    "title": "New Block",
                    "lines": 5
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 6,
                    "title": "New Block",
                    "lines": 4
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 7,
                    "title": "New Block",
                    "lines": 3
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 8,
                    "title": "New Block",
                    "lines": 4
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 9,
                    "title": "New Block",
                    "lines": 5
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 10,
                    "title": "New Block",
                    "lines": 3
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 11,
                    "title": "New Block",
                    "lines": 4
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 12,
                    "title": "New Block",
                    "lines": 3
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 13,
                    "title": "New Block",
                    "lines": 5
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 14,
                    "title": "New Block",
                    "lines": 1
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 15,
                    "title": "New Block",
                    "lines": 1
                }
            },
            {
                "type": "text",
                "left": {
                    "internalId": 16,
                    "title": "New Block",
                    "lines": 1
                }
            }
        ]
    }
];

export const POST = async (req: Request) => {
    const body = await req.json();

    templates.push(body);
    
    return NextResponse.json({ ok: true });
} 

export const GET = async (req: Request) => {
    return NextResponse.json({ templates });
} 