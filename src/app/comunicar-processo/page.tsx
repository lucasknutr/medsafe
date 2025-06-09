'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function ComunicarProcessoPage() {
  const [plaintiff, setPlaintiff] = useState('');
  const [defendant, setDefendant] = useState('');
  const [notificationDate, setNotificationDate] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('plaintiff', plaintiff);
    formData.append('defendant', defendant);
    formData.append('notificationDate', notificationDate);
    formData.append('contactPhone', contactPhone);
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await fetch('/api/report-process', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Processo comunicado com sucesso!');
        setPlaintiff('');
        setDefendant('');
        setNotificationDate('');
        setContactPhone('');
        setDescription('');
        setFile(null);
        const fileInput = e.target as HTMLFormElement; fileInput.reset(); } else { const errorData = await response.json().catch(() => null);
        alert(`Erro ao comunicar processo: ${errorData?.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao comunicar processo. Verifique o console para mais detalhes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar/>
      <div className="container mx-auto px-4 py-8 mt-20 md:mt-24 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">Comunicar Existência de Processo</h1>
        <form onSubmit={handleSubmit} className="space-y-6 bg-slate-700 p-6 md:p-8 rounded-lg shadow-xl">
          <div>
            <label htmlFor="plaintiff" className="block font-medium text-gray-200 text-lg mb-1">Parte Autora</label>
            <input
              id="plaintiff"
              type="text"
              value={plaintiff}
              onChange={(e) => setPlaintiff(e.target.value)}
              className="mt-1 p-3 border rounded w-full text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="defendant" className="block font-medium text-gray-200 text-lg mb-1">Parte Ré</label>
            <input
              id="defendant"
              type="text"
              value={defendant}
              onChange={(e) => setDefendant(e.target.value)}
              className="mt-1 p-3 border rounded w-full text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="notificationDate" className="block font-medium text-gray-200 text-lg mb-1">Data de Notificação</label>
            <input
              id="notificationDate"
              type="date"
              value={notificationDate}
              onChange={(e) => setNotificationDate(e.target.value)}
              className="mt-1 p-3 border rounded w-full text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block font-medium text-gray-200 text-lg mb-1">Telefone de Contato</label>
            <input
              id="contactPhone"
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="mt-1 p-3 border rounded w-full text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="description" className="block font-medium text-gray-200 text-lg mb-1">Descrição</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 p-3 border rounded w-full text-black shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={5}
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="file" className="block font-medium text-gray-200 text-lg mb-1">Anexar Documento (PDF, DOCX, JPG, PNG)</label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mt-1 p-3 border rounded w-full bg-white text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              accept=".pdf,.doc,.docx,image/jpeg,image/png"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Enviando...' : 'Enviar Comunicação'}
          </button>
        </form>
      </div>
    </>
  );
}