import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // For now, return a mock insurance for testing
    // In a real application, you would get the user ID from the session/cookies
    return NextResponse.json({
      id: 1,
      userId: 1,
      plan: 'Nenhum',
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // The code below is commented out until we fix the cookie handling
    /*
    const userId = 1; // Replace with actual user ID from session/auth
    
    const insurance = await prisma.insurance.findFirst({
      where: { userId },
    });
    
    if (!insurance) {
      return NextResponse.json({ 
        id: 0,
        userId: 1,
        plan: 'Nenhum'
      });
    }
    
    return NextResponse.json(insurance);
    */
  } catch (error) {
    console.error('Error fetching insurance:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch insurance data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 