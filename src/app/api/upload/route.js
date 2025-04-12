import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // Disable default body parsing
  },
};

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Upload to Vercel Blob Storage
    const { url } = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json({ imageUrl: url });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}