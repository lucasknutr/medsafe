import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const PAGARME_API_KEY = process.env.PAGARME_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { amount, customer, insuranceId } = req.body;

  try {
    const response = await axios.post('https://api.pagar.me/1/transactions', {
      api_key: PAGARME_API_KEY,
      amount: amount * 100, // Amount in cents
      payment_method: 'boleto',
      customer: {
        name: customer.name,
        email: customer.email,
        document_number: customer.cpf,
      },
      metadata: {
        insurance_id: insuranceId, // Link payment to insurance
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate boleto' });
  }
}