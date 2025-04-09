const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'lucasclaudinocc@gmail.com' },
    update: {},
    create: {
      name: 'Lucas Claudino',
      email: 'lucasclaudinocc@gmail.com',
      cpf: '12345678900',
      profession: 'Administrador',
      phone: '11999999999',
      address: 'Rua Exemplo, 123',
      city: 'São Paulo',
      state: 'SP',
      zip_code: '01234567',
      password: hashedPassword,
      role: 'ADMIN'
    }
  });
  console.log('Admin user created:', adminUser);

  // Create initial service boxes
  const serviceBoxes = [
    {
      title: 'CONTRATE AGORA',
      description: 'Contrate seu plano de saúde com a melhor cobertura e preços competitivos.',
      imageUrl: '/images/contract.jpg',
      link: '/seguros',
      order: 1
    },
    {
      title: 'REPORTAR OCORRÊNCIA',
      description: 'Registre uma ocorrência ou solicite suporte para sua demanda.',
      imageUrl: '/images/report.jpg',
      link: '/comunicar-processo',
      order: 2
    },
    {
      title: 'PLANOS E VALORES',
      description: 'Conheça nossos planos e valores para encontrar a melhor opção para você.',
      imageUrl: '/images/plans.jpg',
      link: '/seguros',
      order: 3
    },
    {
      title: 'TRABALHE CONOSCO',
      description: 'Faça parte da nossa equipe e ajude a transformar a saúde no Brasil.',
      imageUrl: '/images/work.jpg',
      link: '/trabalhe-conosco',
      order: 4
    }
  ];

  // First, delete all existing service boxes
  await prisma.serviceBox.deleteMany();

  // Then create new ones
  for (const box of serviceBoxes) {
    await prisma.serviceBox.create({
      data: box
    });
  }
  console.log('Service boxes created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 