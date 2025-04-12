import { NextResponse } from 'next/server';
import { getAsaasClient } from '@/lib/asaas';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { value, description } = body;

    if (!value || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, cpf: true, phone: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const asaas = getAsaasClient();

    // Create or get customer in Asaas
    let customer;
    try {
      customer = await asaas.createCustomer({
        name: user.name || 'Unknown',
        cpfCnpj: user.cpf || '',
        email: user.email,
        phone: user.phone || ''
      });
    } catch (error: any) {
      console.error('Error creating/getting customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer in payment system' },
        { status: 500 }
      );
    }

    // Create payment
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Due in 3 days

    try {
      const payment = await asaas.createPayment({
        customer: customer.id,
        billingType: 'BOLETO',
        dueDate: dueDate.toISOString().split('T')[0],
        value: value,
        description: description
      });

      // Save transaction record in database
      const savedTransaction = await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: value,
          status: payment.status,
          type: 'BOLETO',
          transactionId: payment.id,
          boletoUrl: payment.invoiceUrl
        }
      });

      return NextResponse.json({
        success: true,
        transaction: savedTransaction
      });
    } catch (error: any) {
      console.error('Error creating payment:', error);
      return NextResponse.json(
        { error: 'Failed to create payment' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 