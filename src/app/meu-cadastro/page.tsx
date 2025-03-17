'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function MeuCadastroPage() {
  const [name, setName] = useState('Lucas Canuto');
  const [email, setEmail] = useState('lucasclaudinocc@gmail.com');
  const [phone, setPhone] = useState('(85) 99669-6530');
  const [insurancePlan, setInsurancePlan] = useState('Seguro Básico');
  const [ongoingProcesses, setOngoingProcesses] = useState([
    { id: '1', description: 'Processo 1', status: 'Em andamento' },
    { id: '2', description: 'Processo 2', status: 'Encerrado' },
  ]);

  const handleUpdateInfo = () => {
    alert('Informações atualizadas com sucesso!');
    // Call API to update user info
  };

  return (
    <>
    <Navbar/>
    <div className="p-4 mx-96 pt-40">
      <h1 className="text-2xl font-bold mb-4">Meu Cadastro</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-xl font-medium text-white">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <label className="block text-xl font-medium text-white">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
          />
        </div>
        <div>
          <label className="block text-xl font-medium text-white">Telefone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 p-2 border rounded w-full text-black"
          />
        </div>
        <button
          onClick={handleUpdateInfo}
          className="bg-blue-500 text-white py-2 px-4 rounded"
        >
          Atualizar Informações
        </button>
      </div>

      <h2 className="text-xl font-bold mt-8 mb-4">Meu Seguro</h2>
      <p className="text-gray-400 text-lg">{insurancePlan}</p>

      <h2 className="text-xl font-bold mt-8 mb-4">Processos em Curso</h2>
      <div className="space-y-2">
        {ongoingProcesses.map((process) => (
          <div key={process.id} className="p-4 border rounded">
            <p className="font-semibold">{process.description}</p>
            <p className="text-gray-400">{process.status}</p>
          </div>
        ))}
      </div>
    </div>
    </>

  );
}