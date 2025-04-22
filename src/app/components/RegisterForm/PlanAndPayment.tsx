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
  onPlanChange: (plan: InsurancePlan) => void;
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
  return (
    <div className="space-y-8">
      <div>
        <Typography variant="h6" className="mb-4">
          Selecione seu Plano
        </Typography>
        <Grid container spacing={2}>
          {availablePlans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card
                className={`cursor-pointer ${selectedPlan?.id === plan.id ? 'border-2 border-primary' : ''}`}
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
        </Grid>
      </div>

      <div>
        <Typography variant="h6" className="mb-4">
          Forma de Pagamento
        </Typography>
        <div className="grid grid-cols-2 gap-4 mb-4">
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
        </div>
        {formData.paymentMethod === 'CARTAO' && (
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
