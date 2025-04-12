import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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

/**
 * POST /api/users
 * Creates a new user with proper password hashing
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      cpf,
      profession,
      phone,
      address,
      city,
      state,
      zip_code,
      password,
      role = 'SEGURADO', // Default role
    } = body;

    // Validate required fields
    if (!name || !email || !cpf || !profession || !phone || !address || !city || !state || !zip_code || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        cpf,
        profession,
        phone,
        address,
        city,
        state,
        zip_code,
        password: hashedPassword,
        role,
      },
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
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('[API Users POST] Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 