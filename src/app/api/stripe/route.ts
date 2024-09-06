import { getUnixTime, parseISO } from "date-fns";
import { NextResponse } from "next/server"

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const POST = async (req: Request) => {
    const body = await req.json();

    const { email, name, dueDate, issueDate, items, notes, terms, tax } = body;

    const due_date = getUnixTime(parseISO(dueDate));
    const issue_date = getUnixTime(parseISO(issueDate));

    const customer = await stripe.customers.create({
        name: name,
        email: email,
        invoice_settings: {
            custom_fields: [{
                name: 'Custom Customer Name Test',
                value: 'Custom Customer Value Teste',
            }],
            footer: 'Test Customer Footer',
            // rendering_options: {
            //     amount_tax_display: 'include_inclusive_tax'
            // }
        },
    });

    const taxRate = await stripe.taxRates.create({
        display_name: 'ANY',
        description: 'Any description',
        percentage: tax,
        jurisdiction: 'DE',
        inclusive: false,
      });

    const invoice = await stripe.invoices.create({
        customer: customer.id,
        collection_method: 'send_invoice',
        footer: `Terms: ${terms}`,
        default_tax_rates: [taxRate.id],
        due_date,
        effective_at: issue_date,
        custom_fields: [
            {
                name: 'Custom Invoice Name Test',
                value: 'Custom Invoice Value Test',
            },
            {
                name: 'Custom Invoice Name Test 2',
                value: 'Custom Invoice Value Test',
            },
            {
                name: 'Custom Invoice Name Test 3',
                value: 'Custom Invoice Value Test',
            },
            {
                name: 'Custom Invoice Name Test 4',
                value: 'Custom Invoice Value Test',
            },
        ],
        description: notes,
    });

    for await (const item of items) {
        const price = await stripe.prices.create({
            currency: 'brl',
            unit_amount: Number(item.price) * 100,
            product_data: {
                name: item.description,
            },
        });

        await stripe.invoiceItems.create({
            customer: customer.id,
            price: price.id,
            quantity: Number(item.quantity),
            invoice: invoice.id,
        });
    }

    return NextResponse.json({ invoiceId: invoice.id });
} 