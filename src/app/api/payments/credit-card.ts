import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const { amount, cardData, userId, insuranceId } = await request.json();

    // Create payment in Asaas
    const response = await axios.post('https://sandbox.asaas.com/api/v3/payments', {
      customer: userId, // Asaas customer ID
      billingType: 'CREDIT_CARD',
      value: amount,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 24 hours
      description: 'Pagamento de seguro Medsafe',
      externalReference: insuranceId,
      creditCard: {
        holderName: cardData.holderName,
        number: cardData.number,
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        ccv: cardData.cvv
      },
      creditCardHolderInfo: {
        name: cardData.holderName,
        email: cardData.email,
        cpfCnpj: cardData.cpf,
        phone: cardData.phone,
        postalCode: cardData.postalCode,
        addressNumber: cardData.addressNumber,
        addressComplement: cardData.addressComplement,
        notificationDisabled: false
      }
    }, {
      headers: {
        'access_token': process.env.ASAAS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        insuranceId,
        amount,
        status: response.data.status,
        type: 'CREDIT_CARD',
        transactionId: response.data.id
      }
    });

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        status: transaction.status,
        amount: transaction.amount
      }
    });
  } catch (error) {
    console.error('Error processing credit card payment:', error);
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    );
  }
}