import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import nodemailer from 'nodemailer';

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    // Get all admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true }
    });

    if (adminUsers.length === 0) {
      throw new Error('No admin users found');
    }

    // Prepare email content
    const emailContent = `
      Nova solicitação de contato recebida:

      Nome: ${name}
      Email: ${email}
      Telefone: ${phone}
      Mensagem: ${message}
    `;

    // Send email to all admins
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: adminUsers.map(admin => admin.email).join(', '),
      subject: 'Nova Solicitação - Medsafe',
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    });

    return NextResponse.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 