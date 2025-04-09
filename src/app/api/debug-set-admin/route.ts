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

    console.log(`Attempting to set user with email ${email} to ADMIN role...`);

    // Find the user first
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    console.log(`Found user: ${user.name} (${user.email}), current role: ${user.role}`);

    // Update the user's role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });

    console.log(`User role updated successfully. New role: ${updatedUser.role}`);

    return NextResponse.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
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