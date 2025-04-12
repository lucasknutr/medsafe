import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Attempting to fetch all users for debugging...');
    
    // Fetch all users with their roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`Found ${users.length} users in the database`);
    
    // Count users by role
    const roleCounts = users.reduce((acc: Record<string, number>, user: { role: string }) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('Users by role:', roleCounts);

    return NextResponse.json({
      totalUsers: users.length,
      roleCounts,
      users
    });
  } catch (error: any) {
    console.error('Detailed error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      meta: error?.meta,
      cause: error?.cause
    });
    
    // Check for specific database connection errors
    if (error?.code === 'P1001' || error?.message?.includes('connection')) {
      return NextResponse.json(
        { 
          error: 'Database connection failed', 
          details: 'Could not connect to the database. Please check your DATABASE_URL environment variable.',
          code: error?.code
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { status: 500 }
    );
  }
} 