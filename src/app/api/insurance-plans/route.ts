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
    console.log('Starting POST request...');
    const body = await request.json();
    console.log('Received request body:', body);

    if (!body.name || !body.description || !body.price || !body.features) {
      return NextResponse.json({ error: 'Invalid request', details: 'Missing required fields' }, { status: 400 });
    }
    if (isNaN(Number(body.price))) {
      return NextResponse.json({ error: 'Invalid request', details: 'Price must be a number' }, { status: 400 });
    }
    if (!Array.isArray(body.features)) {
      return NextResponse.json({ error: 'Invalid request', details: 'Features must be an array' }, { status: 400 });
    }

    console.log('Creating insurance plan with data:', {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      features: body.features,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    const newPlan = await prisma.insurancePlan.create({
      data: {
        name: body.name,
        description: body.description,
        price: Number(body.price),
        features: body.features,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    console.log('Insurance plan created successfully:', newPlan);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Detailed error creating insurance plan:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to create insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
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