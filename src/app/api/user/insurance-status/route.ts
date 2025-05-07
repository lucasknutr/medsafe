import { NextResponse, NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/app/lib/prisma'; // Adjust path if your prisma client is elsewhere


export async function GET(request: NextRequest) {
  try {
    const requestCookies = cookies();
    // @ts-ignore
    const userIdValue = requestCookies.get('user_id')?.value;

    if (!userIdValue) {
      return NextResponse.json({ error: 'User not authenticated. Missing user_id cookie.' }, { status: 401 });
    }

    const userId = parseInt(userIdValue, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user_id format in cookie.' }, { status: 400 });
    }

    const insurance = await prisma.insurance.findUnique({
      where: { userId: userId },
      // Optionally, include related data if needed by the frontend
      // include: {
      //   user: { select: { name: true, email: true } } 
      // }
    });

    if (!insurance) {
      return NextResponse.json({ message: 'No insurance record found for this user.' }, { status: 404 });
    }

    return NextResponse.json(insurance, { status: 200 });

  } catch (error) {
    console.error('[API /user/insurance-status] Error fetching insurance status:', error);
    let errorMessage = 'Internal Server Error';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to fetch insurance status.', details: errorMessage }, { status: 500 });
  }
}