import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const formData = await request.formData();

  const plaintiff = formData.get('plaintiff');
  const defendant = formData.get('defendant');
  const notificationDate = formData.get('notificationDate');
  const contactPhone = formData.get('contactPhone');
  const description = formData.get('description');
  const file = formData.get('file');

  // Save the process to the database and send an email notification
  console.log({ plaintiff, defendant, notificationDate, contactPhone, description, file });

  return NextResponse.json({ message: 'Processo comunicado com sucesso!' });
}