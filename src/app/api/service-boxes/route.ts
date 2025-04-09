import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET() {
  try {
    console.log('Attempting to fetch service boxes...');
    const serviceBoxes = await prisma.serviceBox.findMany({
      orderBy: { order: 'asc' }
    });
    console.log('Successfully fetched service boxes:', serviceBoxes);
    return NextResponse.json(serviceBoxes);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error:', {
        code: error.code,
        message: error.message,
        clientVersion: error.clientVersion,
        meta: error.meta
      });
    } else if (error instanceof Error) {
      console.error('Non-Prisma error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else {
      console.error('Unknown error:', error);
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch service boxes', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const serviceBox = await prisma.serviceBox.create({
      data: body
    });
    return NextResponse.json(serviceBox);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create service box', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const serviceBox = await prisma.serviceBox.update({
      where: { id: Number(id) },
      data
    });
    return NextResponse.json(serviceBox);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to update service box', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    await prisma.serviceBox.delete({
      where: { id: parseInt(id) }
    });
    return NextResponse.json({ message: 'Service box deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to delete service box', details: errorMessage },
      { status: 500 }
    );
  }
} 