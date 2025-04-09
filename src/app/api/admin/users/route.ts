import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    console.log('Attempting to fetch users...');
    
    // Try to connect to the database first
    await prisma.$connect();
    console.log('Database connected successfully');

    // Try a simpler query first
    const users = await prisma.$queryRaw`
      SELECT id, name, email, role, created_at
      FROM "User"
      ORDER BY created_at DESC
    `;
    
    console.log('Raw query result:', users);

    // Transform the response to use camelCase for the frontend
    const transformedUsers = (users as any[]).map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      insurance: null
    }));

    console.log('Transformed users:', transformedUsers);
    return NextResponse.json(transformedUsers);
  } catch (error: any) {
    console.error('Detailed error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
      meta: error?.meta,
      cause: error?.cause
    });
    
    // Try to get more specific error information
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Database constraint violation', details: error?.message },
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
  } finally {
    // Always disconnect from the database
    await prisma.$disconnect();
    console.log('Database disconnected');
  }
} 