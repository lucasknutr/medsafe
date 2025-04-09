"use client"
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import CreditCardModal from '../components/CreditCardModal';

interface Insurance {
  id: number;
  userId: number;
  plan: string;
}

interface CardDetails {
  cardNumber: string;
  expDate: string;
  cvv: string;
}

interface PaymentMethod {
  id: number;
  type: string;
  lastFour: string;
  brand: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export default function SegurosPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [userInsurance, setUserInsurance] = useState<Insurance | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const insuranceProducts = [
    { id: '1', name: 'Seguro Básico', price: 'R$ 50/mês' },
    { id: '2', name: 'Seguro Intermediário', price: 'R$ 100/mês' },
    { id: '3', name: 'Seguro Premium', price: 'R$ 200/mês' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch('/api/me');
        const userData = await userResponse.json();
        setUserData(userData);
        
        // Fetch insurance data
        const insuranceResponse = await fetch('/api/insurance');
        const insuranceData = await insuranceResponse.json();
        
        if (insuranceData.error) {
          throw new Error(insuranceData.error);
        }
        
        setUserInsurance(insuranceData);

        // Fetch payment methods
        const paymentMethodsResponse = await fetch('/api/payment-methods');
        const paymentMethodsData = await paymentMethodsResponse.json();
        setPaymentMethods(paymentMethodsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err instanceof Error && err.message === 'Failed to fetch insurance data') {
          setUserInsurance({
            id: 0,
            userId: 1,
            plan: 'Nenhum'
          });
        } else {
          setError(err instanceof Error ? err.message : 'An error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
    setShowPaymentOptions(true);
  };

  const handlePayment = () => {
    if (selectedProduct) {
      setShowPaymentOptions(true);
    } else {
      alert('Por favor, selecione um produto antes de prosseguir.');
    }
  };

  const handleCreditCardSubmit = async (cardDetails: CardDetails, saveCard: boolean = false) => {
    try {
      if (!userData) {
        alert('Você precisa estar logado para realizar um pagamento.');
        return;
      }

      // Extract month and year from expDate (format: MM/YY)
      const [expiryMonth, expiryYear] = cardDetails.expDate.split('/');
      
      // Prepare customer data for Asaas
      const customerData = {
        userId: userData.id,
        name: userData.name,
        email: userData.email,
        cpfCnpj: userData.cpf,
        phone: userData.phone || '',
        postalCode: userData.postalCode || '',
        address: userData.address || '',
        addressNumber: userData.addressNumber || '',
        complement: userData.complement || '',
        neighborhood: userData.neighborhood || '',
        city: userData.city || '',
        state: userData.state || ''
      };

      // If saveCard is true, save the payment method first
      if (saveCard) {
        await fetch('/api/payment-methods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'credit_card',
            cardDetails: {
              number: cardDetails.cardNumber,
              brand: 'visa', // You might want to detect the card brand
              name: userData.name,
              expiry: cardDetails.expDate
            },
            isDefault: paymentMethods.length === 0
          })
        });
      }

      // Process the payment with Asaas
      const response = await fetch('/api/payments/credit-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000, // R$ 50,00 in cents
          customerData: {
            userId: userData.id,
            name: userData.name,
            email: userData.email,
            cpfCnpj: userData.cpf,
            phone: userData.phone || '',
            postalCode: userData.postalCode || '',
            address: userData.address || '',
            addressNumber: userData.addressNumber || '',
            complement: userData.complement || '',
            neighborhood: userData.neighborhood || '',
            city: userData.city || '',
            state: userData.state || ''
          },
          insuranceId: selectedProduct,
          creditCard: {
            holderName: userData.name,
            number: cardDetails.cardNumber,
            expiryMonth: expiryMonth,
            expiryYear: expiryYear,
            ccv: cardDetails.cvv
          }
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Pagamento processado com sucesso!\nID da Transação: ${data.transaction.transactionId}`);
        setUserInsurance({
          id: 1,
          userId: userData.id,
          plan: insuranceProducts.find(p => p.id === selectedProduct)?.name || 'Nenhum'
        });
        setIsModalOpen(false);
        setShowPaymentOptions(false);
      } else {
        alert(`Falha no pagamento: ${data.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Erro ao processar o pagamento. Por favor, tente novamente.');
    }
  };

  const handleBoletoPayment = async () => {
    try {
      if (!userData) {
        alert('Você precisa estar logado para gerar um boleto.');
        return;
      }

      // Prepare customer data for Asaas
      const customerData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf,
        asaasCustomerId: userData.asaasCustomerId
      };

      const response = await fetch('/api/payments/boleto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 5000, // R$ 50,00 in cents
          customerData,
          insuranceId: selectedProduct,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.boletoUrl) {
        alert(`Boleto gerado com sucesso!\nCódigo: ${data.boletoCode}\nClique OK para abrir o boleto.`);
        window.open(data.boletoUrl, '_blank');
        setShowPaymentOptions(false);
      } else {
        alert('Erro ao gerar o boleto. Tente novamente.');
      }
    } catch (error) {
      console.error('Error generating boleto:', error);
      alert('Erro ao gerar o boleto. Por favor, tente novamente.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[100svh]">
            <div className="text-xl">Carregando...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-[100svh]">
            <div className="text-xl text-red-500">Erro: {error}</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4 text-white">
          Seguro Contratado: {userInsurance ? userInsurance.plan : 'Nenhum'}
        </h1>
        <h1 className="text-2xl font-bold mb-4 mt-8 text-white">Escolha seu Seguro</h1>
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

        {showPaymentOptions && selectedProduct && (
          <div className="mt-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Escolha a forma de pagamento</h2>
            
            {paymentMethods.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Cartões salvos</h3>
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 border rounded-lg mb-2 cursor-pointer hover:bg-gray-50"
                    onClick={() => {
                      // Handle payment with saved card
                      handleCreditCardSubmit({
                        cardNumber: `****${method.lastFour}`,
                        expDate: `${method.expiryMonth}/${method.expiryYear}`,
                        cvv: '***'
                      });
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{method.holderName}</p>
                        <p className="text-gray-600">**** {method.lastFour}</p>
                        <p className="text-sm text-gray-500">Expira em {method.expiryMonth}/{method.expiryYear}</p>
                      </div>
                      <span className="text-blue-500">{method.brand}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
              >
                {paymentMethods.length > 0 ? 'Usar novo cartão' : 'Pagar com Cartão de Crédito'}
              </button>
              
              <button
                onClick={handleBoletoPayment}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
              >
                Gerar Boleto
              </button>
            </div>
          </div>
        )}

        <CreditCardModal
          isOpen={isModalOpen}
          onRequestClose={() => setIsModalOpen(false)}
          onSubmit={handleCreditCardSubmit}
        />
      </div>
    </Layout>
  );
}