import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    console.log('Fetching insurance plans...');
    const plans = await prisma.insurancePlan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('Plans fetched successfully:', plans);
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching insurance plans:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch insurance plans',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in to create an insurance plan' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);

    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.features) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Missing required fields',
          required: ['name', 'description', 'price', 'features'],
          received: Object.keys(body),
        },
        { status: 400 }
      );
    }

    // Validate price is a number
    if (isNaN(Number(body.price))) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Price must be a number',
          received: body.price,
        },
        { status: 400 }
      );
    }

    // Validate features is an array
    if (!Array.isArray(body.features)) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: 'Features must be an array',
          received: body.features,
        },
        { status: 400 }
      );
    }

    console.log('Creating insurance plan with data:', {
      id: uuidv4(),
      name: body.name,
      description: body.description,
      price: Number(body.price),
      features: body.features,
    });

    const plan = await prisma.insurancePlan.create({
      data: {
        id: uuidv4(),
        name: body.name,
        description: body.description,
        price: Number(body.price),
        features: body.features,
      },
    });

    console.log('Insurance plan created successfully:', plan);
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to create insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined,
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in to update an insurance plan' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Received request body:', body);

    if (!body.id) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing plan ID' },
        { status: 400 }
      );
    }

    const plan = await prisma.insurancePlan.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        features: body.features,
        isActive: body.isActive,
        updatedAt: new Date(),
      },
    });

    console.log('Insurance plan updated successfully:', plan);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating insurance plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to update insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized', details: 'You must be logged in to delete an insurance plan' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Invalid request', details: 'Missing plan ID' },
        { status: 400 }
      );
    }

    await prisma.insurancePlan.delete({
      where: { id },
    });

    console.log('Insurance plan deleted successfully:', id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance plan:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete insurance plan',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined,
      },
      { status: 500 }
    );
  }
} 