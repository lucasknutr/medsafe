import { NextResponse } from 'next/server';
import { handlePaymentWebhook } from '@/app/api/insurance-plans/asaas';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Verify webhook signature (you should implement this)
    // const signature = request.headers.get('x-asaas-signature');
    // if (!verifySignature(signature, payload)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    await handlePaymentWebhook(payload);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: 'Failed to handle webhook' },
      { status: 500 }
    );
  }
} 