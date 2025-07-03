import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// Public endpoint - no auth required
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    let planOrPlans: any | any[] | null = null;

    if (id) {
      console.log(`Fetching specific insurance plan with id: ${id}`);
      planOrPlans = await prisma.insurancePlan.findUnique({
        where: { id: id },
      });
      if (!planOrPlans) {
        console.warn(`Plan with id ${id} not found.`);
        return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
      }
    } else {
      console.log('Fetching all insurance plans...');
      planOrPlans = await prisma.insurancePlan.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    console.log('Plan(s) fetched successfully:', planOrPlans);
    return NextResponse.json(planOrPlans);
  } catch (error) {
    console.error('Detailed error fetching insurance plans:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to fetch insurance plans',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// Protected endpoints - assumption: use Prisma for consistency
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('API ROUTE - POST /api/insurance-plans - Received body:', body);

    // Here we will call the new createSubscription function
    // Note: The function name is being kept as createSubscription for consistency
    const { createSubscription } = await import('./asaas'); 

    const result = await createSubscription(body);

    console.log('API ROUTE - POST /api/insurance-plans - Subscription result:', result);
    return NextResponse.json(result);

  } catch (error: any) {
    console.error('!!! API ROUTE - POST /api/insurance-plans - Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process payment',
        details: error.response?.data?.errors?.[0]?.description || error.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  let body: any = {};
  try {
    body = await request.json();
    console.log('Received request body:', body);

    if (!body.id) {
      return NextResponse.json({ error: 'Invalid request', details: 'Missing plan ID' }, { status: 400 });
    }

    const updateData: { [key: string]: any } = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.price !== undefined) updateData.price = Number(body.price);
    if (body.features !== undefined) updateData.features = body.features;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedPlan = await prisma.insurancePlan.update({
      where: { id: body.id },
      data: updateData,
    });

    console.log('Insurance plan updated successfully:', updatedPlan);
    return NextResponse.json(updatedPlan);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.warn(`Update failed: Plan with id ${body.id} not found.`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    console.error('Detailed error updating insurance plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to update insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  try {
    if (!id) {
      return NextResponse.json({ error: 'Invalid request', details: 'Missing plan ID' }, { status: 400 });
    }

    await prisma.insurancePlan.delete({
      where: { id: id },
    });

    console.log('Insurance plan deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      console.warn(`Delete failed: Plan with id ${id} not found.`);
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    console.error('Detailed error deleting insurance plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to delete insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}