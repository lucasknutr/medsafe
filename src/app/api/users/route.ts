import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/users
 * Fetches all registered users, excluding their passwords.
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      // Select all fields except password for security
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        profession: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        zip_code: true,
        policy_id: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        asaasCustomerId: true,
        // Example of including a relation selectively:
        // insurance: {
        //   select: { id: true, plan: true, status: true }
        // }
      },
      orderBy: {
        createdAt: 'desc', // Order by newest first
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('[API Users GET] Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 