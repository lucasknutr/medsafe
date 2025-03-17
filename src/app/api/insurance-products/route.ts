import { NextResponse } from 'next/server';

export async function GET() {
  const products = [
    { id: '1', name: 'Seguro Básico', price: 'R$ 50/mês' },
    { id: '2', name: 'Seguro Intermediário', price: 'R$ 100/mês' },
    { id: '3', name: 'Seguro Premium', price: 'R$ 200/mês' },
  ];

  return NextResponse.json(products);
}