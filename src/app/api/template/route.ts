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
    }
];

export const POST = async (req: Request) => {
    const body = await req.json();

    templates.push(body);

    console.log(templates.length);
    
    return NextResponse.json({ ok: true });
} 

export const GET = async (req: Request) => {
    return NextResponse.json({ templates });
} 