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
  customQuote?: boolean; // Added for 'Consulte-nos' type plans
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
  carteiraProfissional: string; // CRM Number
  comprovanteResidencia: string; // Details about residence proof, if any
  crmFile: File | null;
  addressProofFile: File | null;
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
  cepProfissional: string;
  enderecoProfissional: string;
  numeroProfissional: string;
  complementoProfissional: string;
  bairroProfissional: string;
  cidadeProfissional: string;
  estadoProfissional: string;
  cepResidencial: string;
  enderecoResidencial: string;
  numeroResidencial: string;
  complementoResidencial: string;
  bairroResidencial: string;
  cidadeResidencial: string;
  estadoResidencial: string;
  telefoneCelular: string;
  telefoneFixo: string;
  emailLogin: string;
  passwordLogin: string;
  confirmPasswordLogin: string;
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
  carteiraProfissional: '',
  comprovanteResidencia: '',
  crmFile: null,
  addressProofFile: null,
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
  cepProfissional: '',
  enderecoProfissional: '',
  numeroProfissional: '',
  complementoProfissional: '',
  bairroProfissional: '',
  cidadeProfissional: '',
  estadoProfissional: '',
  cepResidencial: '',
  enderecoResidencial: '',
  numeroResidencial: '',
  complementoResidencial: '',
  bairroResidencial: '',
  cidadeResidencial: '',
  estadoResidencial: '',
  telefoneCelular: '',
  telefoneFixo: '',
  emailLogin: '',
  passwordLogin: '',
  confirmPasswordLogin: '',
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

// Updated Plan Definitions
const plano100: InsurancePlan = {
  id: 'plan_plus_100_v1',
  name: 'Plano +100',
  price: 279.00,
  description: 'Cobertura de R$ 100.000. Ideal para profissionais das especialidades: Clínica Médica, Oftalmologia, Dermatologia (clínica), Cardiologia e Pediatria.',
  features: [
    'Cobertura de R$ 100.000',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
};

const plano200: InsurancePlan = {
  id: 'cmabutev30000ec8p7nanpru7', // Existing ID, plan renamed and price updated
  name: 'Plano +200',
  price: 449.00,
  description: 'Cobertura de R$ 200.000. Abrange todas as especialidades médicas, exceto Cirurgia Plástica Estética.',
  features: [
    'Cobertura de R$ 200.000',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
};

const plano500Custom: InsurancePlan = {
  id: 'plan_plus_500_custom_v1',
  name: 'Plano +500 e Coberturas Especiais',
  price: 0, // Symbolic, UI will show 'Consulte-nos'
  description: 'Coberturas a partir de R$ 500.000, Cirurgia Plástica Estética, ou outras necessidades específicas. Entre em contato para uma cotação personalizada.',
  features: [
    'Cobertura a partir de R$ 500.000 (personalizável)',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
    'Ideal para Cirurgia Plástica Estética e casos de alta complexidade',
  ],
  is_active: true,
  customQuote: true,
};

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData | 'email' | 'password' | 'confirmPassword', string>>>({}); 
  const router = useRouter();
  const [cookies, setCookie] = useCookies(['selected_plan', 'user_id', 'email', 'role']);
  // Initialize availablePlans with the updated plans
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([plano100, plano200, plano500Custom]);
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
      // API expects 'name', 'profession', 'phone', 'address', 'city', 'state', 'zip_code'
      name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      profession: userData.atividadeProfissional || userData.especialidadeAtual || userData.role || '', // Choose the most appropriate field or combine
      phone: userData.telefone?.replace(/\D/g, ''), // Cleaned phone number
      address: `${userData.endereco || ''}${userData.numero ? ', ' + userData.numero : ''}${userData.complemento ? ' - ' + userData.complemento : ''}`.trim(),
      city: userData.cidade,
      state: userData.estado,
      zip_code: userData.cep?.replace(/\D/g, ''), // Cleaned CEP

      // Original fields that might also be needed by the API directly, or are correctly named:
      firstName: userData.firstName, // Keep if API also uses it separately
      lastName: userData.lastName,   // Keep if API also uses it separately
      cpf: userData.cpf?.replace(/\D/g, ''), 
      birthDate: userData.birthDate, 
      rg: userData.rg,
      orgaoExpedidor: userData.orgaoExpedidor,
      entidadeExerce: userData.entidadeExerce,
      // atividadeProfissional is now part of 'profession', remove if not needed separately
      pais: userData.pais,
      // estado, cep, cidade, bairro, endereco, numero, complemento are used in combined fields above
      // telefone is now 'phone'
      role: userData.role,
      // Ensure all other necessary fields expected by your API are included here
      // For example, if 'bairro' is needed separately by API:
      // bairro: userData.bairro, 
    };

    // Clean up payload: remove undefined/null to avoid sending empty fields if API doesn't like them
    Object.keys(payloadForApi).forEach(key => {
      const K = key as keyof typeof payloadForApi;
      if (payloadForApi[K] === undefined || payloadForApi[K] === null || payloadForApi[K] === '') {
        // Consider if API prefers null or empty string, or field to be absent
        // delete payloadForApi[K]; // if API prefers fields to be absent
      }
    });

    console.log('Sending to API:', payloadForApi); // DEBUG: Log the payload

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

  const updateFormData = (field: string, value: string | string[] | File | null | boolean) => {
    let processedValue = value;

    if (field === 'cpf' && typeof value === 'string') {
      const numericValue = value.replace(/\D/g, '');
      let formattedCpf = numericValue;
      if (numericValue.length > 3) formattedCpf = `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
      if (numericValue.length > 6) formattedCpf = `${formattedCpf.slice(0, 7)}.${numericValue.slice(6)}`;
      if (numericValue.length > 9) formattedCpf = `${formattedCpf.slice(0, 11)}-${numericValue.slice(9, 11)}`;
      processedValue = formattedCpf.substring(0, 14); // Ensure max length
    } else if (field === 'birthDate' && typeof value === 'string') {
      let bDate = value.replace(/\D/g, '');
      if (bDate.length > 2) bDate = `${bDate.slice(0, 2)}/${bDate.slice(2)}`;
      if (bDate.length > 5) bDate = `${bDate.slice(0, 5)}/${bDate.slice(5, 9)}`;
      processedValue = bDate.substring(0, 10);
    }
    // Add other specific formatting if needed, e.g., for phone numbers, CEP

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear specific errors when user types in relevant fields
    if (formErrors[field as keyof FormData]) {
      setFormErrors(prevErrors => ({
        ...prevErrors,
        [field]: undefined
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    // Basic validation, can be expanded. 
    // For now, primarily to ensure the function exists.
    // TODO: Implement more specific validation rules for each step based on required fields.
    switch (step) {
      case 1: // PersonalInfo
        // Example: Check if critical personal info fields are filled
        // if (!formData.firstName || !formData.cpf || !formData.birthDate) return false;
        return true; 
      case 2: // CredentialsInfo
        // Example: Check if login credentials are provided
        // if (!formData.emailLogin || !formData.passwordLogin) return false;
        return true;
      case 3: // PlanAndPayment + TermsAndConditions (Terms are usually validated by a checkbox)
        if (selectedPlan && !formData.paymentMethod) {
          // If a plan is selected (not 'Ainda Vou Decidir'), a payment method should be chosen.
          // setError('Por favor, selecione um método de pagamento.');
          // return false; 
        }
        // If card, basic checks (more thorough validation happens on submit)
        if (selectedPlan && formData.paymentMethod === 'CARTAO') {
          // return Boolean(
          //   formData.cardHolderName &&
          //   formData.cardNumber &&
          //   formData.cardExpiryMonth &&
          //   formData.cardExpiryYear &&
          //   formData.cardCcv
          // );
        }
        return true; // For Boleto, PIX, or 'Ainda Vou Decidir'
      case 4: // AdditionalInfo
        // Example: Check if file uploads are present if they become mandatory
        // if (!formData.crmFile || !formData.addressProofFile) return false;
        return true;
      case 5: // PurchaseSummary - usually no validation here, just display
        return true;
      default:
        return true; // Allow progression by default for unhandled steps
    }
  };

  const handleNext = async () => {
    setError(null); // Clear previous errors
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

        if (!userData || !userData.user || !userData.user.id || !userData.user.email || !userData.user.role) {
          // Ensure role is also present for cookie setting
          console.error('Registration response missing essential user data:', userData);
          throw new Error('Usuário não foi criado corretamente ou dados essenciais (id, email, role) não retornados.');
        }
        setRegisteredUserId(userData.user.id);

        // Manually set cookies, similar to the login page logic
        try {
          console.log('Attempting to set cookies for user:', userData.user.email, 'ID:', userData.user.id, 'Role:', userData.user.role);
          setCookie('user_id', userData.user.id, { path: '/' });
          setCookie('email', userData.user.email, { path: '/' });
          setCookie('role', userData.user.role, { path: '/' }); // Crucial for session consistency
          console.log('Cookies set successfully.');

          // NEW LOGIC: Check if a plan was selected during registration
          if (selectedPlan && selectedPlan.id) {
            console.log(`Plan selected (ID: ${selectedPlan.id}), redirecting to /pagamento`);
            router.push(`/pagamento?planId=${selectedPlan.id}`);
            // setLoading(false) is not strictly necessary here if navigating away immediately,
            // but good practice if there's any delay or potential for not navigating.
            // However, since router.push can take a moment, we might not want to set loading false yet.
            return; // Important to prevent setCurrentStep if redirecting
          } else {
            // No plan selected, proceed to simplified Step 3
            console.log('No plan selected during registration, proceeding to simplified Step 3.');
            setCurrentStep(currentStep + 1);
          }

        } catch (cookieError) {
          console.error('Error setting cookies:', cookieError);
          setError('Falha ao configurar a sessão após o registro. Por favor, tente fazer login manualmente.');
          // Do not proceed to next step if cookies can't be set
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
          city: formData.cidade, 
          province: formData.bairro, 
          state: formData.estado, 
          postalCode: formData.cep.replace(/\D/g, ''),
        }
      };
      if (formData.paymentMethod === 'CARTAO') {
        paymentData.cardInfo = {
          holderName: formData.cardHolderName,
          number: formData.cardNumber?.replace(/\D/g, ''), 
          expiryMonth: formData.cardExpiryMonth,
          expiryYear: formData.cardExpiryYear,
          ccv: formData.cardCcv,
          cpfCnpj: formData.cardCpfCnpj?.replace(/\D/g, ''), 
          phone: formData.cardPhone?.replace(/\D/g, ''), 
          email: formData.email, 
        };
      }
      console.log('Sending paymentData to /api/payments:', JSON.stringify(paymentData, null, 2));

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
        return <PersonalInfo formData={formData} onInputChange={updateFormData} />;
      case 2:
        return <CredentialsInfo formData={formData} onInputChange={updateFormData} errors={formErrors} />;
      case 3:
        return (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
            <Typography variant="h5" className="mb-4 text-green-700">
              Cadastro Realizado com Sucesso!
            </Typography>
            
            {/* This message primarily applies if no plan was chosen, as they'd be redirected otherwise */}
            {!selectedPlan && (
              <Typography variant="body1" className="mb-6 text-gray-700">
                Seu perfil foi criado. Você pode agora explorar nossos planos ou retornar à página inicial.
              </Typography>
            )}
            {selectedPlan && (
               <Typography variant="body1" className="mb-6 text-gray-700">
                Você selecionou o plano: <strong>{selectedPlan.name}</strong>. Você já foi redirecionado para a página de pagamento.
                Se o redirecionamento falhou, por favor, clique abaixo para tentar novamente ou escolha outra opção.
              </Typography>
            )}

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
              {selectedPlan && (
                   <Button
                      variant="contained"
                      color="primary"
                      onClick={() => router.push(`/pagamento?planId=${selectedPlan.id}`)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                      Ir para Pagamento do Plano: {selectedPlan.name}
                  </Button>
              )}
              <Button
                variant="contained"
                color="secondary"
                onClick={() => router.push('/planos')}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Ver Planos
              </Button>
              <Button
                variant="outlined"
                color="inherit" // Using inherit to make it less prominent if plan was selected
                onClick={() => router.push('/')}
                className="border-gray-400 text-gray-700 hover:bg-gray-100"
              >
                Ir para Início
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Box className="max-w-4xl mx-auto p-4">
      <Paper className="p-2 sm:p-4 md:p-6">
        <Typography variant="h4" className="mb-2 text-center font-semibold">
          {currentStep === 1 && 'Informações Pessoais e Plano'}
          {currentStep === 2 && 'Credenciais de Acesso'}
          {currentStep === 3 && 'Conclusão do Cadastro'}
        </Typography>
        <Stepper activeStep={currentStep - 1} alternativeLabel className="mb-6">
          {['Informações Pessoais', 'Credenciais', 'Concluído'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="mb-6">
          {renderStep()}
        </div>

        {currentStep < 3 && (
           <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Voltar
              </button>
            )}
            <button
              type="button" 
              onClick={handleNext} 
              disabled={loading || !validateStep(currentStep)} 
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (currentStep === 2 ? 'Finalizar Cadastro' : 'Próximo')}
            </button>
          </div>
        )}
      </Paper>
    </Box>
  );
} 