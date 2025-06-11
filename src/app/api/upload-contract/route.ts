import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

// Nodemailer transporter setup using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const contractFile = formData.get('contract') as File | null;
    const userEmail = formData.get('userEmail') as string | null;
    const planId = formData.get('planId') as string | null;
    const transactionId = formData.get('transactionId') as string | null;

    if (!contractFile || !userEmail || !planId || !transactionId) {
      return NextResponse.json({ success: false, message: 'Dados ausentes. Contrato, email, ID do plano e ID da transação são obrigatórios.' }, { status: 400 });
    }

    // Convert file stream to buffer
    const fileBuffer = Buffer.from(await contractFile.arrayBuffer());

    // Send email to the finance team
    await transporter.sendMail({
      from: `"MedSafe Contratos" <${process.env.SMTP_USER}>`,
      to: 'medsafe.financeiro@gmail.com', // Email for signed contracts
      subject: `Novo Contrato Assinado - ${userEmail}`,
      html: `
        <p>Olá,</p>
        <p>O usuário <strong>${userEmail}</strong> enviou o contrato assinado referente à sua apólice.</p>
        <ul>
          <li><strong>Email do Cliente:</strong> ${userEmail}</li>
          <li><strong>ID do Plano:</strong> ${planId}</li>
          <li><strong>ID da Transação/Assinatura:</strong> ${transactionId}</li>
        </ul>
        <p>O documento está em anexo para verificação.</p>
      `,
      attachments: [
        {
          filename: contractFile.name,
          content: fileBuffer,
          contentType: contractFile.type,
        },
      ],
    });

    // Update user's insurance status to "PENDING_APPROVAL"
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (user) {
      const insurance = await prisma.insurance.findUnique({ where: { userId: user.id } });
      if (insurance && insurance.status === 'PENDING_DOCUMENT') {
        await prisma.insurance.update({
          where: { id: insurance.id },
          data: { status: 'PENDING_APPROVAL' },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Contrato enviado com sucesso! Nossa equipe irá revisar e aprovar sua apólice em breve.' });
  } catch (error) {
    console.error('[upload-contract] Error:', error);
    return NextResponse.json({ success: false, message: 'Ocorreu um erro no servidor ao processar o envio.' }, { status: 500 });
  }
}