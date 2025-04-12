import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return NextResponse.json(slides || []);
  } catch (error) {
    console.error('Error fetching slides:', error);
    // Return an empty array instead of an error
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, title, description, buttonLink, order } = body;

    const slide = await prisma.slide.create({
      data: {
        image,
        title,
        description,
        buttonLink,
        order: order || 0,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json(
      { error: 'Failed to create slide' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, image, title, description, buttonLink, order } = body;

    const slide = await prisma.slide.update({
      where: { id },
      data: {
        image,
        title,
        description,
        buttonLink,
        order: order || 0,
      },
    });

    return NextResponse.json(slide);
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json(
      { error: 'Failed to update slide' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id === 'all') {
      // Delete all slides
      await prisma.slide.deleteMany({});
      return NextResponse.json({ message: 'All slides deleted successfully' });
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    await prisma.slide.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Slide deleted successfully' });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
} 