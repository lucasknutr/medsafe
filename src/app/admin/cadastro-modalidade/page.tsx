'use client'
import { useState, ChangeEvent, FormEvent } from 'react';
import Navbar from '../../components/Navbar';

interface FormData {
  nomeModalidade: string;
  cobertura: string;
  premio: string;
  termos: string;
}

export default function CadastroModalidade() {
  const [formData, setFormData] = useState<FormData>({
    nomeModalidade: '',
    cobertura: '',
    premio: '',
    termos: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Add logic to handle form submission (e.g., API call)
    console.log('Form Data:', formData);
  };

  return (
    <>
    <Navbar/>
    <div className='min-h-screen p-8 pt-40'>
      <h1 className='text-3xl font-bold mb-8 text-center'>Cadastro de Modalidade de Seguro</h1>
      <form onSubmit={handleSubmit} className='max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md'>
        <div className='space-y-4'>
          {/* Nome da Modalidade */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Nome da Modalidade</label>
            <input
              type='text'
              name='nomeModalidade'
              value={formData.nomeModalidade}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Cobertura */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Cobertura</label>
            <textarea
              name='cobertura'
              value={formData.cobertura}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Prêmio */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Valor</label>
            <input
              type='text'
              name='premio' bg-gray-100
              value={formData.premio}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Termos */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Termos</label>
            <textarea
              name='termos'
              value={formData.termos}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Cadastrar Modalidade
          </button>
        </div>
      </form>
    </div>
    </>

  );
}