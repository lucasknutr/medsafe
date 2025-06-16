import { NextResponse } from 'next/server';
import { createPayment, getPaymentStatus } from '@/app/api/insurance-plans/asaas';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Accept email from body if not using session
    let sessionUserEmail = null;
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email) sessionUserEmail = session.user.email;
    } catch (e) {}

    const body = await request.json();
    const { planId, paymentMethod, cardInfoPayload, email, customerId, finalAmount, couponCode, originalAmount } = body;

    let cardInfo = null;
    // WAF WORKAROUND: If cardInfoPayload exists, decode it from Base64.
    if (cardInfoPayload) {
      try {
        const decodedString = Buffer.from(cardInfoPayload, 'base64').toString('utf-8');
        cardInfo = JSON.parse(decodedString);
      } catch (e) {
        console.error("Failed to decode/parse cardInfoPayload:", e);
        return NextResponse.json({ error: 'Invalid card information format' }, { status: 400 });
      }
    }

    if (!planId || !paymentMethod || finalAmount === undefined || finalAmount === null) {
      return NextResponse.json(
        { error: 'Missing required fields (planId, paymentMethod, finalAmount)' },
        { status: 400 }
      );
    }

    // Use customerId from body (user ID) if present, otherwise fall back to session/email
    const userId = customerId || sessionUserEmail || email;
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user identifier (customerId or email)' },
        { status: 400 }
      );
    }

    const payment = await createPayment({
      planId,
      customerId: userId,
      paymentMethod,
      cardInfo,
      finalAmount,
      originalAmount,
      couponCode,
    });

    return NextResponse.json(payment);
  } catch (error: any) {
    console.error('!!! Payment Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('!!! Specific Error Message:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to create payment',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    const status = await getPaymentStatus(paymentId);
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('!!! Payment Status Route Error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('!!! Specific Status Error Message:', errorMessage);
    return NextResponse.json(
      { 
        error: 'Failed to get payment status',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 