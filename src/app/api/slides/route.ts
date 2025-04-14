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
    
    // Log the size of the image data
    const imageLength = body.image ? body.image.length : 0;
    console.log('Received slide data:', {
      imageLength,
      title: body.title,
      description: body.description ? body.description.substring(0, 50) + '...' : '',
      buttonLink: body.buttonLink,
      order: body.order
    });

    const { image, title, description, buttonLink, order } = body;

    if (!image || !title || !description || !buttonLink) {
      console.error('Missing required fields:', { 
        hasImage: !!image, 
        hasTitle: !!title, 
        hasDescription: !!description, 
        hasButtonLink: !!buttonLink 
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate image URL format - allow base64 data URLs
    if (!image.startsWith('data:') && !image.startsWith('http')) {
      try {
        new URL(image);
      } catch (e) {
        console.error('Invalid image URL:', image);
        return NextResponse.json(
          { error: 'Invalid image URL format' },
          { status: 400 }
        );
      }
    }

    // Create the slide with a retry mechanism for prepared statement errors
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        const slide = await prisma.slide.create({
          data: {
            image,
            title,
            description,
            buttonLink,
            order: order || 0,
          },
        });

        console.log('Slide created successfully:', { id: slide.id, title: slide.title });
        return NextResponse.json(slide);
      } catch (dbError) {
        lastError = dbError;
        console.error(`Database error creating slide (attempt ${4 - retries}/3):`, dbError);
        
        // Check if it's a prepared statement error
        const errorMessage = dbError instanceof Error ? dbError.message : '';
        if (errorMessage.includes('prepared statement') && errorMessage.includes('already exists')) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
          continue;
        }
        
        // If it's not a prepared statement error, break the retry loop
        break;
      }
    }
    
    // If we've exhausted all retries or encountered a different error
    console.error('Failed to create slide after retries:', lastError);
    return NextResponse.json(
      { error: 'Database error creating slide', details: lastError instanceof Error ? lastError.message : 'Unknown error' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in POST endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to create slide', details: error instanceof Error ? error.message : 'Unknown error' },
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

    // Update the slide with a retry mechanism for prepared statement errors
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        const slide = await prisma.slide.update({
          where: { id },
          data: {
            image,
            title,
            description,
            buttonLink,
            order,
          },
        });

        return NextResponse.json(slide);
      } catch (dbError) {
        lastError = dbError;
        console.error(`Database error updating slide (attempt ${4 - retries}/3):`, dbError);
        
        // Check if it's a prepared statement error
        const errorMessage = dbError instanceof Error ? dbError.message : '';
        if (errorMessage.includes('prepared statement') && errorMessage.includes('already exists')) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
          continue;
        }
        
        // If it's not a prepared statement error, break the retry loop
        break;
      }
    }
    
    // If we've exhausted all retries or encountered a different error
    console.error('Failed to update slide after retries:', lastError);
    return NextResponse.json(
      { error: 'Database error updating slide', details: lastError instanceof Error ? lastError.message : 'Unknown error' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in PUT endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to update slide', details: error instanceof Error ? error.message : 'Unknown error' },
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
        { error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    // Delete the slide with a retry mechanism for prepared statement errors
    let retries = 3;
    let lastError = null;
    
    while (retries > 0) {
      try {
        await prisma.slide.delete({
          where: { id: parseInt(id) },
        });

        return NextResponse.json({ success: true });
      } catch (dbError) {
        lastError = dbError;
        console.error(`Database error deleting slide (attempt ${4 - retries}/3):`, dbError);
        
        // Check if it's a prepared statement error
        const errorMessage = dbError instanceof Error ? dbError.message : '';
        if (errorMessage.includes('prepared statement') && errorMessage.includes('already exists')) {
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries--;
          continue;
        }
        
        // If it's not a prepared statement error, break the retry loop
        break;
      }
    }
    
    // If we've exhausted all retries or encountered a different error
    console.error('Failed to delete slide after retries:', lastError);
    return NextResponse.json(
      { error: 'Database error deleting slide', details: lastError instanceof Error ? lastError.message : 'Unknown error' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Error in DELETE endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to delete slide', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 