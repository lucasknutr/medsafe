'use client'
import Link from 'next/link';
import Layout from '../components/Layout';

export default function AdminPage() {
  const options = [
    { id: 1, title: 'Cadastro de Usuário/Corretor/Administrador/Advogado', href: '/register' },
    { id: 2, title: 'Cadastro de Apólice Vigente', href: '/admin/cadastro-apolice' },
    { id: 3, title: 'Gerenciar Planos de Seguro', href: '/admin/planos' },
    { id: 5, title: 'Cadastro de Processo', href: '/admin/cadastro-processo' },
    { id: 6, title: 'Cadastro de Modalidade de Seguro', href: '/admin/cadastro-modalidade' },
    { id: 7, title: 'Cadastro de Atos Processuais', href: '/admin/cadastro-atos' },
    { id: 8, title: 'Cadastro de Processo pelo Usuário', href: '/admin/cadastro-processo-usuario' },
    { id: 11, title: 'Gerenciamento Financeiro', href: '/admin/gerenciamento-financeiro' },
    { id: 12, title: 'Cadastro de Palestras e Eventos', href: '/admin/cadastro-eventos' },
    { id: 13, title: 'Alterar Slides da Página Inicial', href: '/admin/cadastrar-slides' },
    { id: 14, title: 'Gerenciamento de Usuários', href: '/admin/users' },
  ];

  return (
    <Layout>
      <div className='min-h-screen p-8'>
        <h1 className='text-3xl font-bold mb-8 text-center'>Painel Administrativo</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {options.map((option) => (
            <Link key={option.id} href={option.href}>
              <div className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer hover:bg-slate-400'>
                <h2 className='text-xl font-semibold text-gray-800'>{option.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}