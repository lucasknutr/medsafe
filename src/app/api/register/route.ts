import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received registration data:', body);

    // Validate required fields
    const requiredFields = [
      'name',
      'email',
      'cpf',
      'profession',
      'phone',
      'address',
      'city',
      'state',
      'zip_code',
      'password'
    ];

    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          missingFields,
        },
        { status: 400 }
      );
    }

    // Check if user already exists in Prisma/Postgres
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { cpf: body.cpf },
        ]
      },
      select: { email: true, cpf: true }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'User already exists',
          details: existingUser.email === body.email ? 'Email already in use' : 'CPF already in use',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Create user in Prisma/Postgres
    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        cpf: body.cpf,
        profession: body.profession,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip_code: body.zip_code,
        password: hashedPassword,
        role: 'SEGURADO',
      }
    });

    // Remove sensitive data before sending response
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: 'Failed to register user',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}