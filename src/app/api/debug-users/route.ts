import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, cpf, profession, phone, address, city, state, zip_code } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user with admin role
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        profession,
        phone,
        address,
        city,
        state,
        zip_code,
        role: 'ADMIN',
      },
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Handle unique constraint violations
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'User already exists with this email or CPF' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create user', details: error.message },
      { status: 500 }
    );
  }
} 