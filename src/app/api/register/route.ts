import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/app/lib/prisma';
import nodemailer from 'nodemailer';

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const body = Object.fromEntries(formData.entries());
    console.log('Received registration form data:', body);

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
          { email: body.email as string },
          { cpf: body.cpf as string },
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
    const hashedPassword = await bcrypt.hash(body.password as string, 10);

    // Create user in Prisma/Postgres
    const user = await prisma.user.create({
      data: {
        name: body.name as string,
        email: body.email as string,
        cpf: body.cpf as string,
        profession: body.profession as string,
        phone: body.phone as string,
        address: body.address as string,
        city: body.city as string,
        state: body.state as string,
        zip_code: body.zip_code as string,
        password: hashedPassword,
        role: 'SEGURADO',
      }
    });

    // Handle file uploads and email
    const attachments = [];
    const crmFile = formData.get('crmFile') as File | null;
    const comprovanteResidenciaFile = formData.get('comprovanteResidencia') as File | null;

    if (crmFile) {
      console.log('CRM File found, adding to attachments...');
      const fileBuffer = Buffer.from(await crmFile.arrayBuffer());
      attachments.push({
        filename: crmFile.name,
        content: fileBuffer,
        contentType: crmFile.type,
      });
    }

    if (comprovanteResidenciaFile) {
      console.log('Proof of Residence File found, adding to attachments...');
      const fileBuffer = Buffer.from(await comprovanteResidenciaFile.arrayBuffer());
      attachments.push({
        filename: comprovanteResidenciaFile.name,
        content: fileBuffer,
        contentType: comprovanteResidenciaFile.type,
      });
    }

    if (attachments.length > 0) {
      console.log('Preparing email with attachments...');
      await transporter.sendMail({
        from: `"MedSafe" <${process.env.SMTP_USER}>`,
        to: 'medsafe.financeiro@gmail.com',
        subject: `Novos Documentos de Registro: ${body.name}`,
        html: `
          <p>Um novo usuário se registrou e enviou documentos.</p>
          <p><strong>Nome:</strong> ${body.name}</p>
          <p><strong>Email:</strong> ${body.email}</p>
          <p><strong>CPF:</strong> ${body.cpf}</p>
          <p>Os documentos estão anexados a este email.</p>
        `,
        attachments: attachments,
      });
      console.log('Registration documents email sent successfully.');
    }

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