import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // For now, return a mock user for testing
    // In a real application, you would get the user ID from the session/cookies
    return NextResponse.json({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      cpf: '12345678900',
      phone: '11999999999',
      postalCode: '01234567',
      address: 'Rua Teste',
      addressNumber: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      role: 'USER',
      asaasCustomerId: 'cus_123456'
    });
    
    // The code below is commented out until we fix the cookie handling
    /*
    const cookieStore = cookies();
    const userIdCookie = cookieStore.get('userId');
    const userId = userIdCookie?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        phone: true,
        postalCode: true,
        address: true,
        addressNumber: true,
        complement: true,
        neighborhood: true,
        city: true,
        state: true,
        role: true,
        asaasCustomerId: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user);
    */
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 