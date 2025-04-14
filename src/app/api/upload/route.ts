import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const uniqueId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExtension}`;
    
    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Ensure the uploads directory exists
    const publicDir = join(process.cwd(), 'public');
    const uploadsDir = join(publicDir, 'uploads');
    
    if (!existsSync(uploadsDir)) {
      console.log('Creating uploads directory:', uploadsDir);
      try {
        await mkdir(uploadsDir, { recursive: true });
        console.log('Uploads directory created successfully');
      } catch (mkdirError) {
        console.error('Error creating uploads directory:', mkdirError);
        return NextResponse.json(
          { error: 'Failed to create uploads directory' },
          { status: 500 }
        );
      }
    }
    
    // Save the file to the public directory
    const filePath = join(uploadsDir, fileName);
    
    try {
      await writeFile(filePath, buffer);
      console.log('File saved successfully:', filePath);
    } catch (error) {
      console.error('Error writing file:', error);
      return NextResponse.json(
        { error: 'Failed to save image' },
        { status: 500 }
      );
    }
    
    // Return the URL to the saved image
    const imageUrl = `/uploads/${fileName}`;
    console.log('Returning image URL:', imageUrl);
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    );
  }
} 