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
  role: string;
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
  role: '',
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

// Helper function to convert DD/MM/YYYY to YYYY-MM-DD
const convertDateToYMD = (dateString: string): string => {
  if (!dateString || !/\d{2}\/\d{2}\/\d{4}/.test(dateString)) {
    return dateString; // Return original if not in expected format or empty
  }
  const parts = dateString.split('/');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<'email' | 'password' | 'confirmPassword', string>>>({}); // New state for field errors
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['selected_plan']);
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);

  useEffect(() => {
    // Set initial plan from cookie if exists
    if (cookies.selected_plan) {
      setSelectedPlan(cookies.selected_plan);
    }

    // If step is forced via query param, jump to that step
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const stepParam = urlParams.get('step');
      if (stepParam && !isNaN(Number(stepParam))) {
        setCurrentStep(Number(stepParam));
      }
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
        setError('Erro ao carregar os planos de seguro. Por favor, tente novamente.');
      }
    };

    fetchPlans();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear specific errors when user types in relevant fields
    if (field === 'email' || field === 'password' || field === 'confirmPassword') {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [field]: undefined
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(
          formData.role &&
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

  // New function to validate credentials step
  const validateCredentialsStep = (): Partial<Record<'email' | 'password' | 'confirmPassword', string>> => {
    const newErrors: Partial<Record<'email' | 'password' | 'confirmPassword', string>> = {};
    if (!formData.email) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Formato de e-mail inválido.';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'A senha deve ter pelo menos 8 caracteres.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }
    return newErrors;
  };

  const handleNext = async () => {
    // Validate credentials before attempting to register user or advance
    if (currentStep === 2) {
      const credentialErrors = validateCredentialsStep();
      setFormErrors(credentialErrors);

      if (Object.keys(credentialErrors).length > 0) {
        return; // Stop if there are validation errors
      }

      // Proceed with user registration API call if validation passes
      try {
        // Construct the payload with correct field names and transformations for the API
        const payloadForApi = {
          // Mapped fields based on the error message and previous mapFormDataToApi logic
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          profession: formData.especialidadeAtual || formData.role || '',
          phone: formData.telefone,
          address: `${formData.endereco || ''}${formData.numero ? ', ' + formData.numero : ''}${formData.complemento ? ' - ' + formData.complemento : ''}`.trim(),
          city: formData.cidade,
          state: formData.estado,
          zip_code: formData.cep,

          // Core identity and credentials
          email: formData.email,
          cpf: formData.cpf,
          password: formData.password,
          birthDate: convertDateToYMD(formData.birthDate),
          role: formData.role || 'SEGURADO', // Default role if not specified

          // Other personal details from formData likely expected by the API
          rg: formData.rg,
          orgaoExpedidor: formData.orgaoExpedidor,
          residenceSince: formData.residenceSince,
          fezResidencia: formData.fezResidencia,
          pertenceAlgumaAssociacao: formData.pertenceAlgumaAssociacao,
          socioProprietario: formData.socioProprietario,
          entidadeExerce: formData.entidadeExerce,
          realizaProcedimento: formData.realizaProcedimento,
          atividadeProfissional: formData.atividadeProfissional, // string[]
          pais: formData.pais,
          bairro: formData.bairro, // Sending bairro separately, adjust if API expects it in address string

          // Questionnaire fields from step 2
          penalRestritiva: formData.penalRestritiva,
          penaAdministrativa: formData.penaAdministrativa,
          dependenteQuimico: formData.dependenteQuimico,
          recusaSeguro: formData.recusaSeguro,
          conhecimentoReclamacoes: formData.conhecimentoReclamacoes,
          envolvidoReclamacoes: formData.envolvidoReclamacoes,
          assessoradoPorVendas: formData.assessoradoPorVendas,

          // Selected Plan ID (if required by the /api/register endpoint)
          selectedPlanId: typeof formData.selectedPlan === 'object' && formData.selectedPlan !== null ? formData.selectedPlan.id : formData.selectedPlan,
        };

        const userResponse = await fetch('/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payloadForApi),
        });
        if (!userResponse.ok) {
          const error = await userResponse.json();
          throw new Error(error.error || 'Erro ao cadastrar usuário');
        }
        const userData = await userResponse.json();
        if (!userData || !userData.user) {
          throw new Error('Usuário não foi criado corretamente.');
        }
        setRegisteredUserId(userData.user.id); // Store user ID for payment
        setCurrentStep(currentStep + 1);
      } catch (error) {
        // Check if the error indicates the user already exists
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('já existe')) {
          setFormErrors(prevErrors => ({
            ...prevErrors,
            email: 'Este e-mail ou CPF já está cadastrado.' // Set specific error for email field
          }));
          setError(null); // Clear general error if we set a specific one
        } else {
          setError(errorMessage); // Set general error for other API issues
        }
        return; // Stop step advancement if API call fails
      }
      // Successfully registered and advanced step, so return to prevent further step advancement below
      return;
    }
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
    alert('handleSubmit called'); // Debug: ensure this runs
    try {
      if (!selectedPlan || !registeredUserId) {
        throw new Error('Usuário ou plano não selecionado. Cadastre-se antes de pagar.');
      }
      const paymentData: any = {
        planId: selectedPlan.id,
        customerId: registeredUserId, // Always use user ID
        paymentMethod: formData.paymentMethod,
      };
      if (formData.paymentMethod === 'CARTAO') {
        paymentData.cardInfo = {
          holderName: formData.cardHolderName,
          number: formData.cardNumber,
          expiryMonth: formData.cardExpiryMonth,
          expiryYear: formData.cardExpiryYear,
          ccv: formData.cardCcv,
          cpfCnpj: formData.cardCpfCnpj,
          phone: formData.cardPhone,
          email: formData.email,
        };
      }
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
      console.log('Payment response:', payment);
      if (formData.paymentMethod === 'BOLETO') {
        setTimeout(() => {
          if (payment.invoiceUrl) {
            window.open(payment.invoiceUrl, '_blank');
          } else {
            alert('Erro: boleto não gerado. Verifique o retorno da API.');
          }
        }, 100);
        alert('Boleto gerado com sucesso! Por favor, realize o pagamento para ativar seu plano.');
      } else {
        alert('Pagamento processado com sucesso! Seu plano foi ativado.');
      }
      router.push('/dashboard');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao processar sua solicitação');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo formData={formData} onInputChange={handleInputChange} />;
      case 2:
        return <CredentialsInfo formData={formData} onInputChange={handleInputChange} errors={formErrors} />;
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
      <Paper className="p-2 sm:p-4 md:p-6">
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

        <form onSubmit={currentStep === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Voltar
              </button>
            )}
            <button
              type="submit"
              disabled={!validateStep(currentStep)}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {currentStep === 3 ? 'Finalizar Pagamento' : 'Próximo'}
            </button>
          </div>
        </form>
      </Paper>
    </Box>
  );
} 