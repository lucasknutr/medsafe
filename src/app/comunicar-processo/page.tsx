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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      } else {
        alert('Erro ao comunicar processo.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao comunicar processo.');
    }
  };

  return (
    <>
    <Navbar/>
    <div className="p-4 mx-96 mt-40">
      <h1 className="text-2xl font-bold mb-4">Comunicar Existência de Processo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium text-gray-200 text-xl">Parte Autora</label>
          <input
            type="text"
            value={plaintiff}
            onChange={(e) => setPlaintiff(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-200 text-xl">Parte Ré</label>
          <input
            type="text"
            value={defendant}
            onChange={(e) => setDefendant(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-200 text-xl">Data de Notificação</label>
          <input
            type="date"
            value={notificationDate}
            onChange={(e) => setNotificationDate(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-200 text-xl">Telefone de Contato</label>
          <input
            type="text"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-200 text-xl">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
            required
          />
        </div>
        <div>
          <label className="block font-medium text-gray-200 text-xl">Anexar Documento</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-1 p-2 border rounded w-full"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Enviar
        </button>
      </form>
    </div>
    </>
  );
}