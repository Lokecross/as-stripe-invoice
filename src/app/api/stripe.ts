import type { NextApiRequest, NextApiResponse } from 'next';

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Access the data sent in the POST request
    const { name } = req.body;

    // const { email, name, dueDate, items, notes, terms, tax } = req.body;

    // const customer = await stripe.customers.create({
    //     name: name,
    //     email: email,
    // });

    // const taxRate = await stripe.taxRates.create({
    //     display_name: 'VAT',
    //     description: 'VAT Germany',
    //     percentage: tax,
    //     jurisdiction: 'DE',
    //     inclusive: false,
    //   });

    // for await (const item of items) {
    //     const price = await stripe.prices.create({
    //         currency: 'usd',
    //         unit_amount: item.price,
    //         product_data: {
    //           name: item.description,
    //         },
    //     });
    
    //     await stripe.invoiceItems.create({
    //         customer: customer.id,
    //         price: price.id,
    //         quantity: item.quantity,
    //     });
    // }

    // const invoice = await stripe.invoices.create({
    //     customer: customer.id,
    //     collection_method: 'send_invoice',
    //     due_date: dueDate.getDate(),
    //     footer: `Notes: ${notes}; Terms: ${terms}`,
    //     default_tax_rates: [taxRate.id],
    // });

    // Respond with a JSON object
    res.status(200).json({ message: `Hello, ${name}!` });
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}