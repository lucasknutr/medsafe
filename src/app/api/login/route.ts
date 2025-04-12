import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Credenciais inválidas' }, { status: 401 });
    }

    // Return user data (excluding password)
    const { password: _, ...userData } = user;

    // Set role in a cookie
    const response = NextResponse.json({ message: 'Login efetuado com sucesso!', user: userData }, { status: 200 });
    response.cookies.set('role', user.role);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Opa... Parece que algo deu errado. Tente novamente em instantes.', error: error.message }, { status: 500 });
  }
}