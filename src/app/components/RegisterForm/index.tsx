'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

interface FormErrors {
  firstName?: string;
  lastName?: string;
  cpf?: string;
  password?: string;
  confirmPassword?: string;
  birthDate?: string;
  email?: string;
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
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams(); // Call useSearchParams
  const [cookies, setCookie] = useCookies(['selected_plan']);
  const planFromCookie = cookies.selected_plan; // Get a stable reference
  const stringifiedPlanFromCookie = useMemo(() => JSON.stringify(planFromCookie), [planFromCookie]); // Memoize
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);

  // Effect to set isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Effect for handling selected plan from cookie
  useEffect(() => {
    if (!isMounted) {
      return; // Only run this logic on the client after mounting
    }
    if (planFromCookie) {
      setSelectedPlan(prevPlan => {
        if (JSON.stringify(prevPlan) !== JSON.stringify(planFromCookie)) {
          return planFromCookie;
        }
        return prevPlan;
      });
    }
  }, [isMounted, stringifiedPlanFromCookie]); // Dependencies: isMounted and the memoized cookie string

  // Effect for handling current step from URL parameters
  useEffect(() => {
    if (!isMounted) {
      return; // Only run this logic on the client after mounting
    }
    const stepFromUrl = searchParams.get('step'); // Use searchParams
    if (stepFromUrl) {
      const numericStepParam = parseInt(stepFromUrl, 10);
      if (!isNaN(numericStepParam) && numericStepParam >= 1 && numericStepParam <= steps.length) {
        if (currentStep !== numericStepParam) { // Only update if different
          setCurrentStep(numericStepParam);
        }
      }
    }
  }, [isMounted, currentStep, searchParams]); // Use searchParams in dependency array

  // Effect for fetching available insurance plans
  useEffect(() => {
    const fetchPlansAsync = async () => {
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

    fetchPlansAsync();
  }, []); // Runs once to fetch plans

  // Validation functions
  const validateCpf = (cpf: string): string => {
    const cleanedCpf = cpf.replace(/\D/g, '');
    if (cleanedCpf.length !== 11) {
      return 'CPF deve conter 11 dígitos.';
    }
    return ''; // No error
  };

  const validatePassword = (password: string): string => {
    if (password.length < 8) {
      return 'Senha deve ter no mínimo 8 caracteres.';
    }
    return ''; // No error
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (password !== confirmPassword) {
      return 'As senhas não coincidem.';
    }
    return ''; // No error
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Clear previous error for this field and general error message
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) setError(null); 

    // Validate CPF on change
    if (field === 'cpf') {
      const cpfError = validateCpf(value);
      setFormErrors(prev => ({ ...prev, cpf: cpfError || undefined }));
    }

    // Validate Password on change
    if (field === 'password') {
      const passwordError = validatePassword(value);
      setFormErrors(prev => ({ ...prev, password: passwordError || undefined }));
      // Also re-validate confirmPassword if it's already filled
      if (formData.confirmPassword) {
        const confirmPasswordError = validateConfirmPassword(value, formData.confirmPassword);
        setFormErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError || undefined }));
      }
    }

    // Validate Confirm Password on change
    if (field === 'confirmPassword') {
      const confirmPasswordError = validateConfirmPassword(formData.password, value);
      setFormErrors(prev => ({ ...prev, confirmPassword: confirmPasswordError || undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    let isValid = true;
    const newFormErrors: FormErrors = {};

    if (step === 1) {
      // Basic presence checks (can be expanded)
      if (!formData.firstName) { newFormErrors.firstName = 'Primeiro nome é obrigatório.'; isValid = false; }
      if (!formData.lastName) { newFormErrors.lastName = 'Sobrenome é obrigatório.'; isValid = false; }
      
      const cpfError = validateCpf(formData.cpf);
      if (cpfError) {
        newFormErrors.cpf = cpfError;
        isValid = false;
      }
      // Add other field validations for step 1 as needed
      // e.g., birthDate, rg, etc.
    }
    
    if (step === 2) { // Assuming CredentialsInfo is in step 2
      if (!formData.email) { 
        newFormErrors.email = 'E-mail é obrigatório.'; // Note: FormErrors needs email field
        isValid = false; 
      }
      // else if (!/\S+@\S+\.\S+/.test(formData.email)) { // Basic email format check
      //   newFormErrors.email = 'Formato de e-mail inválido.';
      //   isValid = false;
      // }

      const passwordError = validatePassword(formData.password);
      if (passwordError) {
        newFormErrors.password = passwordError;
        isValid = false;
      }

      const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
      if (confirmPasswordError) {
        newFormErrors.confirmPassword = confirmPasswordError;
        isValid = false;
      }
    }
    // Add validations for other steps as needed

    setFormErrors(prev => ({ ...prev, ...newFormErrors })); // Merge with existing errors
    return isValid;
  };

  const handleNext = async () => {
    setError(null); // Clear general error
    // setFormErrors({}); // Clear field-specific errors before validating current step

    // Validate current step before proceeding (for fields not validated onInputChange or for a final check)
    if (currentStep === 1) {
      const isStep1Valid = validateStep(1);
      if (!isStep1Valid) {
        return; // Stop if validation fails
      }
    }
    // Add similar validation for other steps if needed before API calls

    // Logic for handling step transitions and API calls
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step: Process registration and payment or 'Ainda Vou Decidir'
      // This is typically where you would make the API call for registration if not done earlier
    }

    // Step 2 specific logic (Registration API call) was here, now integrated with validation
    // Ensure this runs only when moving from step 2 to 3 (or equivalent final step)
    if (currentStep === 2) { // Assuming step 2 is 'Additional Info' and registration happens before 'Purchase Summary'
      try {
        const payloadForApi = {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          profession: formData.especialidadeAtual || formData.role || '',
          phone: formData.telefone,
          address: `${formData.endereco || ''}${formData.numero ? ', ' + formData.numero : ''}${formData.complemento ? ' - ' + formData.complemento : ''}`.trim(),
          city: formData.cidade,
          state: formData.estado,
          zip_code: formData.cep,
          email: formData.email,
          cpf: formData.cpf.replace(/\D/g, ''), // Send cleaned CPF
          password: formData.password,
          birthDate: convertDateToYMD(formData.birthDate),
          role: formData.role || 'SEGURADO',
          rg: formData.rg,
          orgaoExpedidor: formData.orgaoExpedidor,
          residenceSince: formData.residenceSince,
          fezResidencia: formData.fezResidencia,
          pertenceAlgumaAssociacao: formData.pertenceAlgumaAssociacao,
          socioProprietario: formData.socioProprietario,
          entidadeExerce: formData.entidadeExerce,
          realizaProcedimento: formData.realizaProcedimento,
          atividadeProfissional: formData.atividadeProfissional,
          pais: formData.pais,
          bairro: formData.bairro,
          penalRestritiva: formData.penalRestritiva,
          penaAdministrativa: formData.penaAdministrativa,
          dependenteQuimico: formData.dependenteQuimico,
          recusaSeguro: formData.recusaSeguro,
          conhecimentoReclamacoes: formData.conhecimentoReclamacoes,
          envolvidoReclamacoes: formData.envolvidoReclamacoes,
          assessoradoPorVendas: formData.assessoradoPorVendas,
          selectedPlanId: typeof formData.selectedPlan === 'object' && formData.selectedPlan !== null ? formData.selectedPlan.id : formData.selectedPlan,
        };

        const userResponse = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadForApi),
        });

        if (!userResponse.ok) {
          const errorData = await userResponse.json();
          if (errorData.details === "CPF already in use" || errorData.error === "User already exists") {
            setFormErrors(prev => ({ ...prev, cpf: 'CPF já cadastrado.' }));
            setError('Erro no registro. Verifique os campos.'); // General error as well
          } else if (errorData.missingFields) {
            setError(`Campos obrigatórios faltando: ${errorData.missingFields.join(', ')}`);
            // Potentially set formErrors for missing fields if backend provides them in a parsable way
          } else {
            setError(errorData.message || errorData.error || 'Erro ao registrar. Tente novamente.');
          }
          return; // Stop if registration fails
        }

        const responseData = await userResponse.json();
        setRegisteredUserId(responseData.userId); // Assuming API returns userId
        // If successful, then proceed to next step or final action
        if (currentStep < steps.length) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Handle final step actions (e.g. payment or 'Ainda Vou Decidir')
            console.log('Registration successful, proceed to payment or decision.');
        }

      } catch (err: any) {
        console.error('Registration API error:', err);
        setError(err.message || 'Ocorreu um erro na comunicação com o servidor.');
      }
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
        return <PersonalInfo formData={formData} onInputChange={handleInputChange} errors={formErrors} />;
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
              onClick={() => alert('Button onClick fired!')}
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