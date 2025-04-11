import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAsaasClient } from '@/lib/asaas';

export async function POST(request: Request) {
  try {
    console.log('Received boleto payment request');
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { amount, customerData, insuranceId } = body;

    if (!amount || !customerData || !insuranceId) {
      console.error('Missing required fields:', { amount, customerData, insuranceId });
      return NextResponse.json(
        { error: 'Missing required fields', details: { amount, customerData, insuranceId } },
        { status: 400 }
      );
    }

    // Calculate due date in a consistent way
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Add 3 days
    const formattedDueDate = dueDate.toISOString().split('T')[0];
    console.log('Calculated due date:', formattedDueDate);

    // Log environment variables (without sensitive data)
    console.log('Environment variables check:');
    console.log('- ASAAS_API_URL:', process.env.ASAAS_API_URL);
    console.log('- ASAAS_API_KEY exists:', !!process.env.ASAAS_API_KEY);
    console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);

    const asaasClient = getAsaasClient();
    console.log('Asaas client initialized');

    try {
      // Create customer in Asaas if not already created
      let asaasCustomerId = customerData.asaasCustomerId;
      console.log('Customer Asaas ID:', asaasCustomerId);
      
      if (!asaasCustomerId) {
        console.log('Creating customer in Asaas');
        console.log('Customer data for Asaas:', {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          cpfCnpj: customerData.cpfCnpj || customerData.cpf
        });
        
        const asaasCustomer = await asaasClient.createCustomer({
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone || '',
          cpfCnpj: customerData.cpfCnpj || customerData.cpf
        });
        console.log('Customer created in Asaas:', asaasCustomer);
        asaasCustomerId = asaasCustomer.id;
      }

      // Create payment in Asaas
      console.log('Creating boleto payment in Asaas');
      console.log('Payment data for Asaas:', {
        customer: asaasCustomerId,
        billingType: 'BOLETO',
        value: amount,
        dueDate: formattedDueDate,
        description: 'Pagamento de seguro'
      });
      
      const payment = await asaasClient.createPayment({
        customer: asaasCustomerId,
        billingType: 'BOLETO',
        value: amount,
        dueDate: formattedDueDate,
        description: 'Pagamento de seguro'
      });
      console.log('Boleto payment created in Asaas:', payment);

      // Create payment method and transaction records
      console.log('Creating payment method and transaction records in database');
      console.log('Transaction data:', {
        userId: customerData.userId || customerData.id,
        insuranceId,
        amount,
        status: payment.status,
        type: 'PAYMENT',
        transactionId: payment.id,
        boletoUrl: payment.invoiceUrl,
        boletoCode: payment.barCode
      });
      
      const transaction = await prisma.transaction.create({
        data: {
          user: {
            connect: { id: customerData.userId || customerData.id }
          },
          insurance: {
            connect: { id: parseInt(insuranceId) }
          },
          amount,
          status: payment.status,
          type: 'PAYMENT',
          transactionId: payment.id,
          boletoUrl: payment.invoiceUrl,
          boletoCode: payment.barCode,
          paymentMethod: {
            create: {
              user: {
                connect: { id: customerData.userId || customerData.id }
              },
              type: 'BOLETO',
              isDefault: false
            }
          }
        }
      });
      console.log('Transaction created in database:', transaction);

      return NextResponse.json({ 
        success: true, 
        transaction,
        boletoUrl: payment.invoiceUrl,
        boletoCode: payment.barCode
      });
    } catch (asaasError: any) {
      console.error('Error in Asaas API:', asaasError);
      console.error('Full error details:', JSON.stringify(asaasError, null, 2));
      if (asaasError.response) {
        console.error('Response data:', asaasError.response.data);
        console.error('Response status:', asaasError.response.status);
        console.error('Response headers:', asaasError.response.headers);
      }
      return NextResponse.json(
        { error: 'Failed to process payment with Asaas', details: asaasError.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating boleto:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    return NextResponse.json(
      { error: 'Failed to generate boleto', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 