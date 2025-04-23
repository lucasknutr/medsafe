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

interface PlanAndPaymentProps {
  availablePlans: InsurancePlan[];
  selectedPlan: InsurancePlan | null;
  onPlanChange: (plan: InsurancePlan | null) => void;
  formData: any;
  onInputChange: (field: string, value: any) => void;
}

const PlanAndPayment: React.FC<PlanAndPaymentProps> = ({
  availablePlans,
  selectedPlan,
  onPlanChange,
  formData,
  onInputChange,
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
