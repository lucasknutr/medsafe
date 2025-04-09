import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, newPassword } = await request.json();
    
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    console.log(`Attempting to reset password for user with email ${email}...`);

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

    console.log(`Found user: ${user.name} (${user.email})`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`Password reset successfully for user: ${updatedUser.email}`);

    return NextResponse.json({
      message: 'Password reset successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Failed to reset password', details: error?.message },
      { status: 500 }
    );
  }
} 