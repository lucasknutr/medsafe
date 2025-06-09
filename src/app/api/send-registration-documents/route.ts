import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Readable } from 'stream';

// Create a transporter using SMTP (same as in contact/route.ts)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true', // Ensure boolean conversion
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const crmFile = formData.get('crmFile') as File | null;
    const comprovanteResidencia = formData.get('comprovanteResidencia') as File | null;
    const userName = formData.get('userName') as string | null;
    const userEmail = formData.get('userEmail') as string | null;
    const userId = formData.get('userId') as string | null;

    if (!userName || !userEmail || !userId) {
      return NextResponse.json({ error: 'Missing user information.' }, { status: 400 });
    }

    if (!crmFile && !comprovanteResidencia) {
      // If you want to allow submissions without files, you can remove this check
      // or log it and proceed. For now, assuming at least one file is expected.
      return NextResponse.json({ error: 'No documents provided.' }, { status: 400 });
    }

    const attachments = [];
    if (crmFile) {
      const crmFileBuffer = Buffer.from(await crmFile.arrayBuffer());
      attachments.push({
        filename: crmFile.name,
        content: crmFileBuffer,
        contentType: crmFile.type,
      });
    }
    if (comprovanteResidencia) {
      const comprovanteResidenciaBuffer = Buffer.from(await comprovanteResidencia.arrayBuffer());
      attachments.push({
        filename: comprovanteResidencia.name,
        content: comprovanteResidenciaBuffer,
        contentType: comprovanteResidencia.type,
      });
    }

    const emailSubject = `Novos Documentos de Cadastro: ${userName} - ID: ${userId}`;
    const emailHtmlBody = `
      <p>Novos documentos de cadastro recebidos:</p>
      <ul>
        <li><strong>Nome do Usuário:</strong> ${userName}</li>
        <li><strong>Email do Usuário:</strong> ${userEmail}</li>
        <li><strong>ID do Usuário:</strong> ${userId}</li>
      </ul>
      <p>Os documentos estão anexados a este email.</p>
    `;
    const emailTextBody = `
      Novos documentos de cadastro recebidos:
      Nome do Usuário: ${userName}
      Email do Usuário: ${userEmail}
      ID do Usuário: ${userId}
      Os documentos estão anexados a este email.
    `;

    await transporter.sendMail({
      from: process.env.SMTP_USER, // Or your "from" address
      to: 'eduarda.souza@medsafeconsultoria.com.br',
      subject: emailSubject,
      text: emailTextBody,
      html: emailHtmlBody,
      attachments: attachments,
    });

    return NextResponse.json({ message: 'Documents sent successfully via email.' });
  } catch (error: any) {
    console.error('Error sending registration documents email:', error);
    return NextResponse.json(
      { error: 'Failed to send documents email.', details: error.message },
      { status: 500 }
    );
  }
}

// Required for Next.js API routes that parse FormData
export const config = {
  api: {
    bodyParser: false,
  },
};