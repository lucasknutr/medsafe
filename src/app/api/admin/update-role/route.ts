import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Failed to update user role', details: error?.message },
      { status: 500 }
    );
  }
} 