'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Stepper, Step, StepLabel, Box, Grid, Card, CardContent, Typography } from '@mui/material';
import PersonalInfo from './PersonalInfo';
import AdditionalInfo from './AdditionalInfo';
import PurchaseSummary from './PurchaseSummary';
import CredentialsInfo from './CredentialsInfo';
import TermsAndConditions from './TermsAndConditions';
import PlanAndPayment from './PlanAndPayment';
import { useCookies } from 'react-cookie';

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  cpf: string;
  birthDate: string;
  rg: string;
  orgaoExpedidor: string;
  residenceSince: string;
  fezResidencia: string;
  especialidadeAtual: string;
  pertenceAlgumaAssociacao: string;
  socioProprietario: string;
  entidadeExerce: string;
  realizaProcedimento: string;
  atividadeProfissional: string[];
  pais: string;
  estado: string;
  cep: string;
  cidade: string;
  bairro: string;
  endereco: string;
  numero: string;
  complemento: string;
  email: string;
  telefone: string;
  password: string;
  confirmPassword: string;
  penalRestritiva: string;
  penaAdministrativa: string;
  dependenteQuimico: string;
  recusaSeguro: string;
  conhecimentoReclamacoes: string;
  envolvidoReclamacoes: string;
  assessoradoPorVendas: string;
  carteiraProfissional: File | null;
  comprovanteResidencia: File | null;
  selectedPlan: InsurancePlan | null;
  paymentMethod: string;
  installments: number;
  acceptedTerms: boolean;
  cardHolderName?: string;
  cardNumber?: string;
  cardExpiryMonth?: string;
  cardExpiryYear?: string;
  cardCcv?: string;
  cardCpfCnpj?: string;
  cardPhone?: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  cpf: '',
  birthDate: '',
  rg: '',
  orgaoExpedidor: '',
  residenceSince: '',
  fezResidencia: '',
  especialidadeAtual: '',
  pertenceAlgumaAssociacao: '',
  socioProprietario: '',
  entidadeExerce: '',
  realizaProcedimento: '',
  atividadeProfissional: [],
  pais: '',
  estado: '',
  cep: '',
  cidade: '',
  bairro: '',
  endereco: '',
  numero: '',
  complemento: '',
  email: '',
  telefone: '',
  password: '',
  confirmPassword: '',
  penalRestritiva: '',
  penaAdministrativa: '',
  dependenteQuimico: '',
  recusaSeguro: '',
  conhecimentoReclamacoes: '',
  envolvidoReclamacoes: '',
  assessoradoPorVendas: '',
  carteiraProfissional: null,
  comprovanteResidencia: null,
  selectedPlan: null,
  paymentMethod: '',
  installments: 0,
  acceptedTerms: false,
  cardHolderName: '',
  cardNumber: '',
  cardExpiryMonth: '',
  cardExpiryYear: '',
  cardCcv: '',
  cardCpfCnpj: '',
  cardPhone: '',
};

const steps = [
  { label: 'CADASTRO', icon: '📝' },
  { label: 'INFORMAÇÕES ADICIONAIS', icon: 'ℹ️' },
  { label: 'RESUMO DA COMPRA', icon: '🛒' },
];

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['selected_plan']);
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);

  useEffect(() => {
    // Set initial plan from cookie if exists
    if (cookies.selected_plan) {
      setSelectedPlan(cookies.selected_plan);
    }

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
  }, [cookies.selected_plan]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          formData.firstName &&
          formData.lastName &&
          formData.cpf &&
          formData.birthDate &&
          formData.rg &&
          formData.orgaoExpedidor &&
          formData.residenceSince &&
          formData.fezResidencia &&
          formData.especialidadeAtual &&
          formData.pertenceAlgumaAssociacao &&
          formData.socioProprietario &&
          formData.entidadeExerce &&
          formData.realizaProcedimento &&
          formData.atividadeProfissional.length > 0 &&
          formData.pais &&
          formData.estado &&
          formData.cep &&
          formData.cidade &&
          formData.bairro &&
          formData.endereco &&
          formData.numero &&
          formData.complemento &&
          formData.email &&
          formData.telefone
        );
      case 2:
        return Boolean(
          formData.email &&
          formData.password &&
          formData.confirmPassword
        );
      case 3:
        // Allow "Ainda Vou Decidir" (selectedPlan === null) to finish WITHOUT payment
        if (!selectedPlan) return true;
        // Otherwise, require payment method and (for credit card) card fields
        if (!formData.paymentMethod) return false;
        if (formData.paymentMethod === 'CARTAO') {
          return Boolean(
            formData.cardHolderName &&
            formData.cardNumber &&
            formData.cardExpiryMonth &&
            formData.cardExpiryYear &&
            formData.cardCcv &&
            formData.cardCpfCnpj &&
            formData.cardPhone
          );
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlanChange = (plan: InsurancePlan | null) => {
    setSelectedPlan(plan);
    setCookie('selected_plan', plan, { path: '/' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedPlan === null) {
        // Allow registration without payment
        const userResponse = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...formData, selectedPlan: null }),
        });
        if (!userResponse.ok) {
          const error = await userResponse.json();
          throw new Error(error.error || 'Erro ao cadastrar usuário');
        }
        alert('Cadastro realizado! Você poderá escolher um plano depois.');
        router.push('/dashboard');
        return;
      }
      // Existing payment logic for selected plan...
      const paymentData: any = {
        planId: selectedPlan.id,
        paymentMethod: formData.paymentMethod,
        cardInfo: formData.paymentMethod === 'CARTAO' ? {
          holderName: formData.cardHolderName,
          number: formData.cardNumber,
          expiryMonth: formData.cardExpiryMonth,
          expiryYear: formData.cardExpiryYear,
          ccv: formData.cardCcv,
          cpfCnpj: formData.cardCpfCnpj,
          phone: formData.cardPhone,
        } : undefined,
      };

      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json();
        throw new Error(error.error || 'Erro ao processar pagamento');
      }

      const payment = await paymentResponse.json();

      // Redirect based on payment method
      if (formData.paymentMethod === 'BOLETO') {
        window.open(payment.invoiceUrl, '_blank');
        alert('Boleto gerado com sucesso! Por favor, realize o pagamento para ativar seu plano.');
      } else {
        alert('Pagamento processado com sucesso! Seu plano foi ativado.');
      }

      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error instanceof Error ? error.message : 'Erro ao processar sua solicitação');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo formData={formData} onInputChange={handleInputChange} />;
      case 2:
        return <CredentialsInfo formData={formData} onInputChange={handleInputChange} />;
      case 3:
        return (
          <PlanAndPayment
            availablePlans={availablePlans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanChange}
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      default:
        return null;
    }
  };

  const renderPaymentStep = () => (
    <div>
      <Typography variant="h6" className="mb-4">
        Selecione seu Plano
      </Typography>
      <Grid container spacing={2}>
        {availablePlans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card 
              className={`cursor-pointer ${selectedPlan?.id === plan.id ? 'border-2 border-primary' : ''}`}
              onClick={() => handlePlanChange(plan)}
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
  );

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <Paper className="p-6">
        <Stepper activeStep={currentStep - 1} alternativeLabel className="mb-8">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-2">{step.icon}</span>
                  <span className="text-xs font-semibold">{step.label}</span>
                </div>
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="mt-8">
          {renderStep()}
        </div>

        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Voltar
            </button>
          )}
          <button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            disabled={!validateStep(currentStep)}
            className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {currentStep === 3 ? 'Finalizar Cadastro' : 'Próximo'}
          </button>
        </div>
      </Paper>
    </Box>
  );
} 