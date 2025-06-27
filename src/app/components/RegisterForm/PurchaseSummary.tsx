import React from 'react';

interface PurchaseSummaryProps {
  formData: {
    selectedPlan: {
      name: string;
      price: number;
      coverage: string;
      description: string[];
    };
    paymentMethod: string;
    installments: number;
  };
  onInputChange: (field: string, value: string | number) => void;
}

export default function PurchaseSummary({ formData, onInputChange }: PurchaseSummaryProps) {
  const installmentOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const installmentValue = formData.selectedPlan.price / (formData.installments || 1);

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
            <span className="font-medium">Cobertura</span>
            <span className="text-lg">{formData.selectedPlan.coverage}</span>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">O que está incluso:</h4>
            <ul className="list-disc list-inside space-y-1">
              {formData.selectedPlan.description.map((item, index) => (
                <li key={index} className="text-gray-600">{item}</li>
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
                    {number}x de R$ {Number(installmentValue / number).toFixed(2).replace('.', ',')}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg">
              <span className="font-medium">Valor Total</span>
              <span className="font-bold text-blue-600">
                R$ {Number(formData.selectedPlan.price).toFixed(2).replace('.', ',')}
              </span>
            </div>
            {formData.paymentMethod === 'CARTAO' && formData.installments > 1 && (
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <span>Parcelas</span>
                <span>{formData.installments}x de R$ {Number(formData.selectedPlan.price / formData.installments).toFixed(2).replace('.', ',')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 