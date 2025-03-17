'use client'
import { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function CadastroApolice() {
  const [formData, setFormData] = useState({
    numeroApolice: '',
    valorGlobal: '',
    copiaDocumento: null,
    dataInicio: '',
    dataFinalizacao: '',
    quantidadeSegurados: '',
    segurados: [],
    somaApolices: '',
    prorrogada: 'Não',
    novaApolice: '',
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'copiaDocumento') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle form submission (e.g., API call)
    console.log('Form Data:', formData);
  };

  return (
    <>
    <Navbar/>
    <div className='min-h-screen p-8 mt-40'>
      <h1 className='text-3xl font-bold mb-8 text-center'>Cadastro de Apólice Vigente</h1>
      <form onSubmit={handleSubmit} className='max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md'>
        <div className='space-y-4'>
          {/* Número da Apólice */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Número da Apólice</label>
            <input
              type='text'
              name='numeroApolice'
              value={formData.numeroApolice}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Valor Global */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Valor Global</label>
            <input
              type='number'
              name='valorGlobal'
              value={formData.valorGlobal}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Cópia do Documento */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Cópia do Documento</label>
            <input
              type='file'
              name='copiaDocumento'
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              accept='.pdf,.doc,.docx'
            />
          </div>

          {/* Data de Início */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Data de Início</label>
            <input
              type='date'
              name='dataInicio'
              value={formData.dataInicio}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Data de Finalização */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Data de Finalização</label>
            <input
              type='date'
              name='dataFinalizacao'
              value={formData.dataFinalizacao}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Quantidade de Segurados Totais */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Quantidade de Segurados Totais</label>
            <input
              type='number'
              name='quantidadeSegurados'
              value={formData.quantidadeSegurados}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Prorrogada */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Prorrogada</label>
            <select
              name='prorrogada'
              value={formData.prorrogada}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='Não'>Não</option>
              <option value='Sim'>Sim</option>
            </select>
          </div>

          {/* Nova Apólice (conditional) */}
          {formData.prorrogada === 'Sim' && (
            <div>
              <label className='block text-sm font-medium text-gray-700'>Número da Nova Apólice</label>
              <input
                type='text'
                name='novaApolice'
                value={formData.novaApolice}
                onChange={handleChange}
                className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
                required
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type='submit'
            className='w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          >
            Cadastrar Apólice
          </button>
        </div>
      </form>
    </div>
    </>

  );
}