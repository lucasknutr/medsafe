import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      const users = await prisma.user.findMany();
      res.status(200).json(users);
      break;
    case 'POST':
      const { name, email, cpf, profession, phone, address, city, state, zip_code } = req.body;
      const newUser = await prisma.user.create({
        data: { name, email, cpf, profession, phone, address, city, state, zip_code },
      });
      res.status(201).json(newUser);
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}