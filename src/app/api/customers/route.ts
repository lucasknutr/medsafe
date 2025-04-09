import { NextResponse } from 'next/server';
import axios from 'axios';
import prisma from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, cpf, phone, address, city, state, zipCode } = await request.json();

    // Create customer in Asaas
    const response = await axios.post('https://sandbox.asaas.com/api/v3/customers', {
      name,
      email,
      cpfCnpj: cpf,
      phone,
      address,
      addressNumber: '1', // You might want to add this to your user model
      complement: '',
      neighborhood: '',
      city,
      state,
      postalCode: zipCode,
      notificationDisabled: false
    }, {
      headers: {
        'access_token': process.env.ASAAS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    // Update user with Asaas customer ID
    await prisma.user.update({
      where: { email },
      data: {
        asaasCustomerId: response.data.id
      }
    });

    return NextResponse.json({
      success: true,
      customerId: response.data.id
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 