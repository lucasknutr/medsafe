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
    
    if (id === 'all') {
      // Delete all slides
      try {
        await prisma.slide.deleteMany({});
        return NextResponse.json({ 
          message: 'All slides deleted successfully'
        });
      } catch (deleteError) {
        console.error('Error deleting all slides:', deleteError);
        // If deletion fails, try to fetch existing slides
        const existingSlides = await prisma.slide.findMany();
        if (existingSlides.length === 0) {
          // If no slides exist, consider it a success
          return NextResponse.json({ 
            message: 'No slides to delete'
          });
        }
        throw deleteError;
      }
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    try {
      await prisma.slide.delete({
        where: { id: parseInt(id) },
      });

      return NextResponse.json({ 
        message: 'Slide deleted successfully'
      });
    } catch (deleteError) {
      console.error(`Error deleting slide with ID ${id}:`, deleteError);
      // Check if the slide exists
      const slide = await prisma.slide.findUnique({
        where: { id: parseInt(id) },
      });
      
      if (!slide) {
        // If slide doesn't exist, consider it a success
        return NextResponse.json({ 
          message: 'Slide not found, nothing to delete'
        });
      }
      
      throw deleteError;
    }
  } catch (error) {
    console.error('Error in DELETE endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide' },
      { status: 500 }
    );
  }
} 