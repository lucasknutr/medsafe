import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

// Define the expected structure for the part of formData this component uses
interface PlanPaymentFormData {
  paymentMethod?: 'BOLETO' | 'CARTAO' | string; // Allow string for flexibility
  cardHolderName?: string;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCcv?: string;
  // couponCode is handled as a direct prop and via onInputChange('couponCode', ...)
}

interface PlanAndPaymentProps {
  availablePlans: InsurancePlan[];
  selectedPlan: InsurancePlan | null;
  onPlanChange: (plan: InsurancePlan | null) => void;
  formData: PlanPaymentFormData; // Use the specific type
  onInputChange: (
    field: keyof PlanPaymentFormData | 'couponCode', // 'couponCode' is special here
    value: string // Assuming values for these fields are strings
  ) => void;
  finalPrice: number | null;
  couponCode?: string;
  onApplyCoupon: () => void;
  couponMessage?: string;
}

const PlanAndPayment: React.FC<PlanAndPaymentProps> = ({
  availablePlans,
  selectedPlan,
  onPlanChange,
  formData,
  onInputChange,
  finalPrice,
  couponCode,
  onApplyCoupon,
  couponMessage,
}) => {
  // Disable payment options if 'Ainda Vou Decidir' is selected
  const paymentDisabled = !selectedPlan;

  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h6" className="mb-4">
          Selecione seu Plano
        </Typography>
        <Grid container spacing={2}>
          {availablePlans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id} style={{ display: 'flex' }}>
              <Card
                className={`flex flex-col justify-between h-full cursor-pointer ${selectedPlan?.id === plan.id ? 'border-2 border-primary' : ''}`}
                style={{ minHeight: 220, flex: 1 }}
                onClick={() => onPlanChange(plan)}
              >
                <CardContent>
                  <Typography variant="h6">{plan.name}</Typography>
                  <Typography variant="h5" color="primary" className="my-2">
                    R$ {plan.price.toFixed(2)}/mês
                  </Typography>
                  <ul className="list-disc pl-4">
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <Typography variant="body2">{feature}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {/* Option for "Ainda Vou Decidir" */}
          <Grid item xs={12} sm={6} md={4} style={{ display: 'flex' }}>
            <Card
              className={`flex flex-col justify-between h-full cursor-pointer ${!selectedPlan ? 'border-2 border-primary' : ''}`}
              style={{ minHeight: 220, flex: 1, borderStyle: !selectedPlan ? 'solid' : undefined }}
              onClick={() => onPlanChange(null)}
            >
              <CardContent className="flex flex-col justify-center items-center h-full">
                <Typography variant="h6" color="textSecondary">
                  Ainda Vou Decidir
                </Typography>
                <Typography variant="body2" className="mt-2 text-center">
                  Você pode escolher um plano depois.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>

      {/* Coupon Code Section - Only show if a plan is selected */}
      {selectedPlan && (
        <div>
          <Typography variant="h6" className="mb-2">
            Cupom de Desconto
          </Typography>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Digite seu cupom"
              value={couponCode || ''}
              onChange={(e) => onInputChange('couponCode', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              disabled={paymentDisabled}
            />
            <button
              type="button"
              onClick={onApplyCoupon}
              className={`px-4 py-2 border rounded text-white ${paymentDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
              disabled={paymentDisabled}
            >
              Aplicar
            </button>
          </div>
          {couponMessage && (
            <Typography variant="body2" className={couponMessage.includes('aplicado') ? 'text-green-600' : 'text-red-600'}>
              {couponMessage}
            </Typography>
          )}
        </div>
      )}

      {/* Final Price Display - Only show if a plan is selected */}
      {selectedPlan && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <Typography variant="h6" className="mb-2">
            Resumo do Plano: {selectedPlan.name}
          </Typography>
          <div className="flex justify-between">
            <Typography variant="body1">Preço Original:</Typography>
            <Typography variant="body1">R$ {selectedPlan.price.toFixed(2)}</Typography>
          </div>
          {finalPrice !== null && finalPrice !== selectedPlan.price && (
            <div className="flex justify-between text-green-600 font-semibold">
              <Typography variant="body1" color="inherit">Preço com Desconto:</Typography>
              <Typography variant="body1" color="inherit">R$ {finalPrice.toFixed(2)}</Typography>
            </div>
          )}
          {finalPrice !== null && finalPrice === selectedPlan.price && (
            <div className="flex justify-between">
              <Typography variant="body1">Preço Final:</Typography>
              <Typography variant="body1">R$ {finalPrice.toFixed(2)}</Typography>
            </div>
          )}
        </div>
      )}

      <div>
        <Typography variant="h6" className="mb-4">
          Método de Pagamento
        </Typography>
        <div className="flex gap-4">
          <button
            type="button"
            className={`px-4 py-2 border rounded ${formData.paymentMethod === 'BOLETO' ? 'bg-blue-600 text-white' : 'bg-white text-black'} ${paymentDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !paymentDisabled && onInputChange('paymentMethod', 'BOLETO')}
            disabled={paymentDisabled}
          >
            Boleto Bancário
          </button>
          <button
            type="button"
            className={`px-4 py-2 border rounded ${formData.paymentMethod === 'CARTAO' ? 'bg-blue-600 text-white' : 'bg-white text-black'} ${paymentDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => !paymentDisabled && onInputChange('paymentMethod', 'CARTAO')}
            disabled={paymentDisabled}
          >
            Cartão de Crédito
          </button>
        </div>
        {formData.paymentMethod === 'CARTAO' && !paymentDisabled && (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nome no cartão"
              value={formData.cardHolderName || ''}
              onChange={(e) => onInputChange('cardHolderName', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Número do cartão"
              value={formData.cardNumber || ''}
              onChange={(e) => onInputChange('cardNumber', e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="MM"
                value={formData.cardExpiryMonth || ''}
                onChange={(e) => onInputChange('cardExpiryMonth', e.target.value)}
                className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="AA"
                value={formData.cardExpiryYear || ''}
                onChange={(e) => onInputChange('cardExpiryYear', e.target.value)}
                className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                maxLength={2}
              />
              <input
                type="text"
                placeholder="CVV"
                value={formData.cardCcv || ''}
                onChange={(e) => onInputChange('cardCcv', e.target.value)}
                className="w-1/3 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                maxLength={4}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanAndPayment;
