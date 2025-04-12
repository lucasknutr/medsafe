import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAsaasClient } from '@/lib/asaas';

export async function POST(request: Request) {
  try {
    console.log('Received credit card payment request');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { amount, customerData, insuranceId, creditCard } = body;

    if (!amount || !customerData || !insuranceId || !creditCard) {
      console.error('Missing required fields:', { amount, customerData, insuranceId, creditCard });
      return NextResponse.json(
        { error: 'Missing required fields', details: { amount, customerData, insuranceId, creditCard } },
        { status: 400 }
      );
    }

    const asaasClient = getAsaasClient();

    try {
      // Create customer in Asaas
      console.log('Creating customer in Asaas');
      const asaasCustomer = await asaasClient.createCustomer({
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        cpfCnpj: customerData.cpfCnpj
      });
      console.log('Customer created in Asaas:', asaasCustomer);

      // Create payment in Asaas
      console.log('Creating payment in Asaas');
      const payment = await asaasClient.createPayment({
        customer: asaasCustomer.id,
        billingType: 'CREDIT_CARD',
        value: amount,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: `Insurance payment for ${insuranceId}`
      });
      console.log('Payment created in Asaas:', payment);

      // Create transaction record in database
      console.log('Creating transaction record in database');
      const transaction = await prisma.transaction.create({
        data: {
          userId: customerData.userId,
          amount,
          status: payment.status,
          type: 'CREDIT_CARD',
          transactionId: payment.id,
          insuranceId
        }
      });
      console.log('Transaction created in database:', transaction);

      return NextResponse.json({
        success: true,
        transaction
      });
    } catch (asaasError: any) {
      console.error('Error in Asaas API:', asaasError);
      return NextResponse.json(
        { error: 'Failed to process payment with Asaas', details: asaasError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing credit card payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment', details: error.message },
      { status: 500 }
    );
  }
} 