import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching insurance plans...');
    const plans = await prisma.insurancePlan.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('Successfully fetched plans:', plans?.length);
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching insurance plans:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch insurance plans',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, description, price, features, isActive } = await request.json();
    console.log('Creating plan with data:', { name, description, price, features, isActive });

    // Validate required fields with specific error messages
    if (!name) {
      return NextResponse.json(
        { error: 'Nome do plano é obrigatório' },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { error: 'Descrição do plano é obrigatória' },
        { status: 400 }
      );
    }
    if (!price) {
      return NextResponse.json(
        { error: 'Preço do plano é obrigatório' },
        { status: 400 }
      );
    }
    if (!features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json(
        { error: 'Pelo menos uma característica do plano é obrigatória' },
        { status: 400 }
      );
    }

    // Create plan using Prisma
    const plan = await prisma.insurancePlan.create({
      data: {
        name,
        description,
        price,
        features,
        isActive: isActive ?? true,
      }
    });

    console.log('Successfully created plan:', plan);
    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating insurance plan:', error);
    return NextResponse.json(
      { 
        error: 'Falha ao criar plano de seguro',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, name, description, price, features, isActive } = body;

    if (!id || !name || !description || !price || !features) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const plan = await prisma.insurancePlan.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        features,
        isActive: isActive ?? true,
        updatedAt: new Date(),
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to update insurance plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    await prisma.insurancePlan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting insurance plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete insurance plan' },
      { status: 500 }
    );
  }
} 