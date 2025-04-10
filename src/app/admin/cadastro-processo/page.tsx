'use client'
import { useState } from 'react';
import Navbar from '../../../components/Navbar';

export default function CadastroProcesso() {
  const [formData, setFormData] = useState({
    parteAutora: '',
    parteRe: '',
    localTramite: '',
    situacaoProcesso: '',
    dataAcidente: '',
    dataContratoSeguro: '',
    advogadoResponsavel: '',
    numeroProcesso: '',
    valorCausa: '',
    cobertoSeguro: 'Não',
    probabilidadePerda: 1,
    atosPraticados: [],
    arquivosAnexados: null,
    custoPericia: '',
    custoTotal: 0,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'arquivosAnexados') {
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
    <div className='min-h-screen p-8 pt-40'>
      <h1 className='text-3xl font-bold mb-8 text-center'>Cadastro de Processo</h1>
      <form onSubmit={handleSubmit} className='max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md'>
        <div className='space-y-4'>
          {/* Parte Autora */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Parte Autora</label>
            <input
              type='text'
              name='parteAutora'
              value={formData.parteAutora}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Parte Ré/Segurada */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Parte Ré/Segurada</label>
            <input
              type='text'
              name='parteRe'
              value={formData.parteRe}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Local do Trâmite do Processo */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Local do Trâmite do Processo</label>
            <input
              type='text'
              name='localTramite'
              value={formData.localTramite}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Situação do Processo */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Situação do Processo</label>
            <input
              type='text'
              name='situacaoProcesso'
              value={formData.situacaoProcesso}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Data do Acidente */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Data do Acidente</label>
            <input
              type='date'
              name='dataAcidente'
              value={formData.dataAcidente}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Data do Contrato do Seguro */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Data do Contrato do Seguro</label>
            <input
              type='date'
              name='dataContratoSeguro'
              value={formData.dataContratoSeguro}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Advogado Responsável */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Advogado Responsável</label>
            <input
              type='text'
              name='advogadoResponsavel'
              value={formData.advogadoResponsavel}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Número do Processo */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Número do Processo</label>
            <input
              type='text'
              name='numeroProcesso'
              value={formData.numeroProcesso}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Valor da Causa */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Valor da Causa</label>
            <input
              type='number'
              name='valorCausa'
              value={formData.valorCausa}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Processo Coberto pelo Seguro */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Processo Coberto pelo Seguro</label>
            <select
              name='cobertoSeguro'
              value={formData.cobertoSeguro}
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='Não'>Não</option>
              <option value='Sim'>Sim</option>
            </select>
          </div>

          {/* Probabilidade de Perda */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Probabilidade de Perda (1 a 5)</label>
            <input
              type='number'
              name='probabilidadePerda'
              value={formData.probabilidadePerda}
              onChange={handleChange}
              min='1'
              max='5'
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              required
            />
          </div>

          {/* Arquivos Anexados */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Arquivos Anexados</label>
            <input
              type='file'
              name='arquivosAnexados'
              onChange={handleChange}
              className='text-black mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500'
              accept='.pdf,.doc,.docx'
            />
          </div>

          {/* Custo de Perícia */}
          <div>
            <label className='block text-sm font-medium text-gray-700'>Custo de Perícia</label>
            <input
              type='number'
              name='custoPericia'
              value={formData.custoPericia}
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
            Cadastrar Processo
          </button>
        </div>
      </form>
    </div>
    </>
  );
}