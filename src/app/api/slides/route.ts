import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, title, description, buttonLink, order } = body;

    if (!image || !title || !description || !buttonLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    if (!id) {
      return NextResponse.json(
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    const slide = await prisma.slide.update({
      where: { id: parseInt(id) },
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
    
    console.log('DELETE request received with id:', id);

    if (id === 'all') {
      console.log('Deleting all slides');
      // Delete all slides
      const deleteResult = await prisma.slide.deleteMany({});
      console.log('Delete result:', deleteResult);
      return NextResponse.json({ 
        message: 'All slides deleted successfully',
        count: deleteResult.count 
      });
    }

    if (!id) {
      console.log('No ID provided for deletion');
      return NextResponse.json(
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    console.log('Deleting slide with ID:', id);
    const slide = await prisma.slide.delete({
      where: { id: parseInt(id) },
    });
    console.log('Slide deleted:', slide);

    return NextResponse.json({ 
      message: 'Slide deleted successfully',
      slide 
    });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
} 