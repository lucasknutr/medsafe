import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { subscriptionId, status } = await request.json();

    // Basic validation
    if (!subscriptionId || !status) {
      return NextResponse.json(
        { error: 'Missing subscriptionId or status' },
        { status: 400 }
      );
    }

    // Ensure status is one of the allowed values
    if (!['ACTIVE', 'CANCELED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const updatedSubscription = await prisma.insurance.update({
      where: {
        id: subscriptionId,
      },
      data: {
        status: status,
      },
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Failed to update subscription status:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription status' },
      { status: 500 }
    );
  }
}