import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // For now, return an empty array for testing
    return NextResponse.json([]);
    
    // The code below is commented out until we fix the cookie handling
    /*
    const userId = 1; // Replace with actual user ID from session/auth
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
    return NextResponse.json(paymentMethods);
    */
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment methods' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, cardDetails, isDefault } = body;
    
    // For now, return a mock payment method for testing
    return NextResponse.json({
      id: 1,
      userId: 1,
      type: 'credit_card',
      lastFour: cardDetails.number.slice(-4),
      brand: cardDetails.brand || 'visa',
      holderName: cardDetails.name,
      expiryMonth: cardDetails.expiry.split('/')[0],
      expiryYear: cardDetails.expiry.split('/')[1],
      isDefault: isDefault || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // The code below is commented out until we fix the cookie handling
    /*
    const userId = 1; // Replace with actual user ID from session/auth

    if (type === 'credit_card') {
      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          userId,
          type: 'credit_card',
          lastFour: cardDetails.number.slice(-4),
          brand: cardDetails.brand,
          holderName: cardDetails.name,
          expiryMonth: cardDetails.expiry.split('/')[0],
          expiryYear: cardDetails.expiry.split('/')[1],
          isDefault: isDefault || false
        }
      });

      // If this is the default card, unset other default cards
      if (isDefault) {
        await prisma.paymentMethod.updateMany({
          where: {
            userId,
            id: { not: paymentMethod.id }
          },
          data: { isDefault: false }
        });
      }

      return NextResponse.json(paymentMethod);
    }

    return NextResponse.json(
      { error: 'Invalid payment method type' },
      { status: 400 }
    );
    */
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { error: 'Failed to create payment method' },
      { status: 500 }
    );
  }
} 