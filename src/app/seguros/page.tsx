'use client';
import { useState } from 'react';
import Navbar from '../components/Navbar';

export default function SegurosPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const insuranceProducts = [
    { id: '1', name: 'Seguro Básico', price: 'R$ 50/mês' },
    { id: '2', name: 'Seguro Intermediário', price: 'R$ 100/mês' },
    { id: '3', name: 'Seguro Premium', price: 'R$ 200/mês' },
  ];

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
  };

  const handlePayment = () => {
    if (selectedProduct) {
      alert(`Você selecionou o produto: ${selectedProduct}. Redirecionando para pagamento...`);
      // Redirect to payment page or integrate payment gateway
    } else {
      alert('Por favor, selecione um produto antes de prosseguir.');
    }
  };

  return (
    <>
    <Navbar />
    <div className="p-4 flex flex-col justify-center items-center h-[100svh]">
      <h1 className="text-2xl font-bold mb-4">Seguro Contratado: Nenhum</h1>
      <h1 className="text-2xl font-bold mb-4 mt-8">Escolha seu Seguro</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insuranceProducts.map((product) => (
          <div
            key={product.id}
            className={`p-4 border text-slate-700 py-10 my-4 rounded-lg cursor-pointer ${
              selectedProduct === product.id ? 'bg-blue-100' : 'bg-white'
            }`}
            onClick={() => handleSelectProduct(product.id)}
          >
            <h2 className="text-xl font-semibold">{product.name}</h2>
            <p className="text-gray-600">{product.price}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handlePayment}
        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
      >
        Pagar com Cartão de Crédito
      </button>
    </div>
    </>
  );
}