import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ALLOWED_ROLES = ['SEGURADO', 'ADMIN', 'CORRETOR', 'ADVOGADO'];

export async function POST(request: Request) {
  try {
    const { name, email, password, cpf, profession, phone, address, city, state, zip_code, role } = await request.json();

    // Validate role
    if (role && !ALLOWED_ROLES.includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
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
        role: role || 'SEGURADO', // Default to 'SEGURADO' if no role is provided
      },
    });

    // Return success response
    return NextResponse.json({ message: 'Usuário cadastrado com sucesso!', user }, { status: 201 });
  } catch (error) {
    console.error('Erro:', error);

    // Return error response
    return NextResponse.json({ message: 'Usuário já existe.', error: error.message }, { status: 400 });
  }
}