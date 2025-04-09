import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { event, data } = req.body;

  if (event === 'transaction_status_changed') {
    const { status, metadata } = data;

    // Update insurance status based on payment
    if (status === 'paid') {
      await prisma.insurance.update({
        where: { id: metadata.insurance_id },
        data: { status: 'active' },
      });
    } else if (status === 'failed') {
      await prisma.insurance.update({
        where: { id: metadata.insurance_id },
        data: { status: 'inactive' },
      });
    }
  }

  res.status(200).json({ message: 'Webhook received' });
}