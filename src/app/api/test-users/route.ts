import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ 
      status: 'success',
      userCount: count,
      message: `Found ${count} users in the database`
    });
  } catch (error: any) {
    console.error('Error counting users:', error);
    return NextResponse.json(
      { error: 'Failed to count users', details: error?.message },
      { status: 500 }
    );
  }
} 