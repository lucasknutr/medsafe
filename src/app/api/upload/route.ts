import { NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const slideIndex = formData.get('slideIndex') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use a simple naming convention: slide1.jpg, slide2.jpg, etc.
    const fileName = `slide${slideIndex}.${file.name.split('.').pop()}`;
    const publicDir = join(process.cwd(), 'public', 'slides');
    const filePath = join(publicDir, fileName);
    
    // Delete existing file if it exists
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
    
    // Save the new file
    await writeFile(filePath, buffer);
    
    // Return the URL for the uploaded file
    const imageUrl = `/slides/${fileName}`;
    
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 