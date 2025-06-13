import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pendingSubscriptions = await prisma.insurance.findMany({
      where: {
        status: {
          in: ['PENDING', 'PENDING_PAYMENT', 'PENDING_DOCUMENT', 'PENDING_APPROVAL'],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json(pendingSubscriptions);
  } catch (error) {
    console.error('Failed to fetch pending approvals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending approvals' },
      { status: 500 }
    );
  }
}