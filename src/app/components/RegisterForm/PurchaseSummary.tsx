import React, { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';

interface InsurancePlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_active: boolean;
}

interface PurchaseSummaryProps {
  formData: {
    selectedPlan: InsurancePlan | null;
    paymentMethod: string;
    installments: number;
  };
  onInputChange: (field: string, value: string | number | InsurancePlan) => void;
}

export default function PurchaseSummary({ formData, onInputChange }: PurchaseSummaryProps) {
  const [cookies] = useCookies(['selected_plan']);
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  const installmentOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const installmentValue = formData.selectedPlan ? formData.selectedPlan.price / (formData.installments || 1) : 0;

  useEffect(() => {
    // Fetch all available plans
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/insurance-plans');
        if (!response.ok) {
          throw new Error('Failed to fetch insurance plans');
        }
        const data = await response.json();
        setAvailablePlans(data.filter((plan: InsurancePlan) => plan.is_active));
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
      }
    };

    fetchPlans();
  }, []);

  useEffect(() => {
    // Set initial plan from cookie if exists
    if (cookies.selected_plan && !formData.selectedPlan) {
      onInputChange('selectedPlan', cookies.selected_plan);
    }
  }, [cookies.selected_plan, formData.selectedPlan, onInputChange]);

  if (!formData.selectedPlan) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">Selecione um Plano</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlans.map((plan) => (
              <div
                key={plan.id}
                className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${
                  formData.selectedPlan?.id === plan.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => onInputChange('selectedPlan', plan)}
              >
                <h4 className="font-bold text-lg">{plan.name}</h4>
                <p className="text-gray-600">R$ {plan.price.toFixed(2)}</p>
                <ul className="mt-2 space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600">• {feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Resumo do Plano Selecionado</h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Plano</span>
            <span className="text-lg font-bold text-blue-600">{formData.selectedPlan.name}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="font-medium">Valor</span>
            <span className="text-lg">R$ {formData.selectedPlan.price.toFixed(2)}</span>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">O que está incluso:</h4>
            <ul className="list-disc list-inside space-y-1">
              {formData.selectedPlan.features.map((feature, index) => (
                <li key={index} className="text-gray-600">{feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Forma de Pagamento</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Pagamento
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="CARTAO"
                  checked={formData.paymentMethod === 'CARTAO'}
                  onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                  className="mr-2"
                />
                <span>Cartão de Crédito</span>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="BOLETO"
                  checked={formData.paymentMethod === 'BOLETO'}
                  onChange={(e) => onInputChange('paymentMethod', e.target.value)}
                  className="mr-2"
                />
                <span>Boleto Bancário</span>
              </label>
            </div>
          </div>

          {formData.paymentMethod === 'CARTAO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Parcelas
              </label>
              <select
                value={formData.installments}
                onChange={(e) => onInputChange('installments', parseInt(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              >
                {installmentOptions.map((number) => (
                  <option key={number} value={number}>
                    {number}x de R$ {(installmentValue / number).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Valor Total</span>
              <span className="font-bold text-blue-600">
                R$ {formData.selectedPlan.price.toFixed(2)}
              </span>
            </div>
            {formData.paymentMethod === 'CARTAO' && formData.installments > 1 && (
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Parcelas</span>
                <span>{formData.installments}x de R$ {(formData.selectedPlan.price / formData.installments).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 