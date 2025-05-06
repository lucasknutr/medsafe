import prisma from '@/lib/prisma'; // Adjust the import path if needed

async function createPlan() {
  const planData = {
    name: 'Plano RCP 200k', // Or a name you prefer
    description: 'Cobertura de 200 mil para defesas em processos Éticos, cíveis e criminais, perícias, custas judiciais, honorários sucumbenciais.',
    price: 450.00,
    features: [
        "Cobertura R$ 200.000",
        "Defesa Ética",
        "Defesa Cível",
        "Defesa Criminal",
        "Perícias",
        "Custas Judiciais",
        "Honorários Sucumbenciais"
    ],
    isActive: true,
    // Prisma will automatically generate a unique cuid for 'id'
  };

  try {
    const newPlan = await prisma.insurancePlan.create({
      data: planData,
    });
    console.log('Plan created successfully:', newPlan);
    console.log('------------------------------------');
    console.log('>>> COPY THIS ID: ', newPlan.id, ' <<<');
    console.log('------------------------------------');
  } catch (error) {
    console.error('Error creating plan:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the function
createPlan();
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
    const { planId, paymentMethod, cardInfo, email, customerId } = body;

    if (!planId || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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