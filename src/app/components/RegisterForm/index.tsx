'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; 
import { Paper, Stepper, Step, StepLabel, Box, Grid, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
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
  atividadeProfissional: string;
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
  atividadeProfissional: '',
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

// Define the single hardcoded plan
const medsafeDefaultPlan: InsurancePlan = {
  id: 'cmabutev30000ec8p7nanpru7',
  name: 'Plano de Proteção Profissional MedSafe',
  description: 'Cobertura de R$ 200.000 para defesa em processos éticos, cíveis e criminais decorrentes da atividade profissional.',
  price: 450.00,
  features: [
    'Cobertura de R$ 200.000',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
    'Custas processuais'
  ],
  is_active: true,
};

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData | 'email' | 'password' | 'confirmPassword', string>>>({}); 
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['selected_plan']);
  // Initialize availablePlans with the hardcoded plan
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([medsafeDefaultPlan]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [registeredUserId, setRegisteredUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    // Set initial plan from cookie if exists
    const savedPlanId = cookies.selected_plan?.id;
    if (savedPlanId) {
      const planFromCookie = availablePlans.find(p => p.id === savedPlanId);
      if (planFromCookie) {
        setSelectedPlan(planFromCookie);
      }
    }
  }, [availablePlans, cookies.selected_plan]);

  const validatePersonalInfoStep = (): Partial<Record<keyof FormData, string>> => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName) errors.firstName = 'Nome é obrigatório';
    if (!formData.lastName) errors.lastName = 'Sobrenome é obrigatório';
    if (!formData.cpf) errors.cpf = 'CPF é obrigatório';
    else if (formData.cpf.replace(/\D/g, '').length !== 11) errors.cpf = 'CPF inválido';
    if (!formData.birthDate) errors.birthDate = 'Data de Nascimento é obrigatória';
    // Add other personal info validations as needed based on your FormData interface
    if (!formData.rg) errors.rg = 'RG é obrigatório';
    if (!formData.orgaoExpedidor) errors.orgaoExpedidor = 'Órgão Expedidor é obrigatório';
    // Skipping residenceSince, fezResidencia, especialidadeAtual, pertenceAlgumaAssociacao, socioProprietario, realizaProcedimento as they might be optional or part of AdditionalInfo
    if (!formData.entidadeExerce) errors.entidadeExerce = 'Entidade onde exerce a profissão é obrigatória';
    if (!formData.atividadeProfissional) errors.atividadeProfissional = 'Atividade profissional é obrigatória';
    if (!formData.pais) errors.pais = 'País é obrigatório';
    if (!formData.estado) errors.estado = 'Estado é obrigatório';
    if (!formData.cep) errors.cep = 'CEP é obrigatório';
    if (!formData.cidade) errors.cidade = 'Cidade é obrigatória';
    if (!formData.bairro) errors.bairro = 'Bairro é obrigatório';
    if (!formData.endereco) errors.endereco = 'Endereço é obrigatório';
    if (!formData.numero) errors.numero = 'Número é obrigatório';
    if (!formData.email) errors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email inválido';
    if (!formData.telefone) errors.telefone = 'Telefone é obrigatório';
    // Role is validated separately in handleNext, but could be added here too if preferred
    return errors;
  };

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

  // Function to handle user registration API call
  const registerUser = async (userData: Partial<FormData>) => {
    // Construct the payload with correct field names and transformations for the API
    // This should align with what your /api/register endpoint expects
    const payloadForApi = {
      email: userData.email,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      cpf: userData.cpf, // Assuming it's already cleaned by the time it reaches here in handleNext
      birthDate: userData.birthDate, // Ensure format is as API expects (e.g., YYYY-MM-DD)
      rg: userData.rg,
      orgaoExpedidor: userData.orgaoExpedidor,
      entidadeExerce: userData.entidadeExerce,
      atividadeProfissional: userData.atividadeProfissional,
      pais: userData.pais,
      estado: userData.estado,
      cep: userData.cep, // Assuming it's already cleaned
      cidade: userData.cidade,
      bairro: userData.bairro,
      endereco: userData.endereco,
      numero: userData.numero,
      complemento: userData.complemento,
      telefone: userData.telefone, // Assuming it's already cleaned
      role: userData.role,
      // Include any other fields that your API expects from the FormData interface
      // For example, fields from AdditionalInfo if they are part of the initial registration
      // residenceSince: userData.residenceSince,
      // fezResidencia: userData.fezResidencia,
      // etc.
    };

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadForApi),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Try to extract a more specific error message if available
      const message = errorData.message || errorData.error || 'Erro ao cadastrar usuário';
      throw new Error(message);
    }

    return response.json(); // Returns the user data from the API, including user.id
  };

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
        // PersonalInfo step is valid if validatePersonalInfoStep returns no errors
        return Object.keys(validatePersonalInfoStep()).length === 0;
      case 2:
        // Credentials step is valid if validateCredentialsStep returns no errors
        return Object.keys(validateCredentialsStep()).length === 0;
      case 3:
        // Payment step validation logic for enabling/disabling the submit button
        // This can be simple (e.g., selectedPlan exists if payment is intended)
        // or more complex if you have pre-submit checks for payment form fields.
        // If 'Ainda Vou Decidir' (no selectedPlan), it's considered valid to proceed to submit (which then redirects).
        if (!selectedPlan) return true;
        // If a plan is selected, ensure a payment method is chosen.
        if (!formData.paymentMethod) return false;
        // If card, basic checks (more thorough validation happens on submit)
        if (formData.paymentMethod === 'CARTAO') {
          return Boolean(
            formData.cardHolderName &&
            formData.cardNumber &&
            formData.cardExpiryMonth &&
            formData.cardExpiryYear &&
            formData.cardCcv
          );
        }
        return true; // For Boleto and PIX, just having method selected might be enough here
      default:
        return false;
    }
  };

  const handleNext = async () => {
    // Clear previous specific errors if any
    setFormErrors({});
    setError(null); 

    if (currentStep === 1) {
      const personalInfoErrors = validatePersonalInfoStep();
      if (Object.keys(personalInfoErrors).length > 0) {
        setFormErrors(personalInfoErrors);
        return;
      }
      // Additional check for role, which is part of PersonalInfo but might be missed
      if (!formData.role) {
        setFormErrors(prev => ({ ...prev, role: 'Seleção de perfil é obrigatória.'}));
        return;
      }
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 2) { 
      setLoading(true);

      const credentialsErrors = validateCredentialsStep();
      if (Object.keys(credentialsErrors).length > 0) {
        setFormErrors(credentialsErrors);
        setLoading(false);
        return;
      }

      try {
        const userData = await registerUser({
          email: formData.email,
          password: formData.password,
          // Pass all other necessary fields from formData for registration
          firstName: formData.firstName,
          lastName: formData.lastName,
          cpf: formData.cpf.replace(/\D/g, ''), 
          birthDate: formData.birthDate, 
          rg: formData.rg,
          orgaoExpedidor: formData.orgaoExpedidor,
          entidadeExerce: formData.entidadeExerce,
          atividadeProfissional: formData.atividadeProfissional,
          pais: formData.pais,
          estado: formData.estado,
          cep: formData.cep.replace(/\D/g, ''), 
          cidade: formData.cidade,
          bairro: formData.bairro,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          telefone: formData.telefone.replace(/\D/g, ''), 
          role: formData.role,
          // Include any other fields from AdditionalInfo if they are part of initial registration
          // e.g., residenceSince, fezResidencia, etc., if your API needs them at this stage.
        });

        if (!userData || !userData.user || !userData.user.id) {
          throw new Error('Usuário não foi criado corretamente ou ID não retornado.');
        }
        setRegisteredUserId(userData.user.id);

        // Attempt to sign in the user automatically
        const signInResponse = await signIn('credentials', {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResponse && signInResponse.ok) {
          // Sign-in successful, proceed to payment
          setCurrentStep(currentStep + 1);
        } else {
          // Sign-in failed
          setError('Falha ao fazer login automaticamente após o registro. ' + (signInResponse?.error || 'Por favor, tente fazer login manualmente.'));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        // Check for specific error messages from your API
        if (errorMessage.includes('Email already exists') || errorMessage.includes('CPF already exists')) {
          setError(errorMessage); 
        } else {
          setError(`Ocorreu um erro durante o registro: ${errorMessage}`);
        }
        console.error('Registration or auto sign-in error:', error);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 3) { 
        // Logic for step 3 is handled by handleSubmit, not handleNext for progression
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Check if user chose 'Ainda Vou Decidir'
    if (!selectedPlan) {
      if (!registeredUserId) {
        setError('Erro: ID do usuário não encontrado. Tente recarregar a página.');
        setLoading(false); 
        return;
      }
      router.push('/'); 
      setLoading(false); 
      return; 
    }

    // If a plan IS selected, proceed with payment logic
    try {
      // Ensure we have user ID for payment API
      if (!registeredUserId) { 
        throw new Error('ID do usuário não registrado. Não é possível processar o pagamento.');
      }

      // Construct payment data (only if plan is selected)
      const paymentData: any = {
        planId: selectedPlan.id,
        customerId: registeredUserId, 
        paymentMethod: formData.paymentMethod,
        customer: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          cpfCnpj: formData.cpf.replace(/\D/g, ''),
          phone: formData.telefone.replace(/\D/g, ''),
          mobilePhone: formData.telefone.replace(/\D/g, ''), 
          address: formData.endereco,
          addressNumber: formData.numero,
          complement: formData.complemento || null, 
          province: formData.bairro, 
          postalCode: formData.cep.replace(/\D/g, ''),
        }
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
      setLoading(false); 
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