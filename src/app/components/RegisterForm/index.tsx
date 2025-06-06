'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; 
import { Paper, Stepper, Step, StepLabel, Box, Grid, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';
import PersonalInfo from './PersonalInfo';
import AdditionalInfo from './AdditionalInfo';
import PurchaseSummary from './PurchaseSummary';
import CredentialsInfo from './CredentialsInfo';
import TermsAndConditions from './TermsAndConditions';
import PlanAndPayment from './PlanAndPayment';
// import { useCookies } from 'react-cookie';

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
  email: string; // REINSTATED: For contact email
  telefone: string;
  role: string;
  emailLogin: string;
  passwordLogin: string;
  confirmPasswordLogin: string;
  penalRestritiva: string;
  penaAdministrativa: string;
  dependenteQuimico: string;
  recusaSeguro: string;
  conhecimentoReclamacoes: string;
  envolvidoReclamacoes: string;
  informacoesAdicionais: string;
  assessoradoPorVendas: string;
  carteiraProfissional: string; // CRM Number
  comprovanteResidencia: File | null;
  crmFile: File | null;
  medicalLicenseFile: File | null; // ADDED
  specialistCertificateFile: File | null; // ADDED
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
  contractAgreed: boolean; // Added for contract agreement
  graduationYear: string; // Added for new graduate discount
  couponCode?: string; // ADDED FOR COUPON
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
  pais: 'BR',
  estado: '',
  cep: '',
  cidade: '',
  bairro: '',
  endereco: '',
  numero: '',
  complemento: '',
  email: '', // REINSTATED: For contact email
  telefone: '',
  role: 'SEGURADO', // Default role
  emailLogin: '',
  passwordLogin: '',
  confirmPasswordLogin: '',
  penalRestritiva: 'NAO',
  penaAdministrativa: 'NAO',
  dependenteQuimico: 'NAO',
  recusaSeguro: 'NAO',
  conhecimentoReclamacoes: 'NAO',
  envolvidoReclamacoes: 'NAO',
  informacoesAdicionais: '',
  assessoradoPorVendas: 'NAO',
  carteiraProfissional: '',
  comprovanteResidencia: null,
  crmFile: null,
  medicalLicenseFile: null, // ADDED
  specialistCertificateFile: null, // ADDED
  selectedPlan: null,
  paymentMethod: '',
  installments: 1,
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
  contractAgreed: false,
  graduationYear: '',
  couponCode: '',
};

const initialFormErrors: Partial<Record<keyof FormData, string>> = {};

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

const plano500Standard: InsurancePlan = {
  id: 'plan_plus_500_standard_v1',
  name: 'Plano +500',
  price: 458.00,
  description: 'Cobertura de R$ 500.000. Ideal para profissionais das especialidades: Clínica Médica, Oftalmologia, Dermatologia (clínica), Cardiologia e Pediatria.',
  features: [
    'Cobertura de R$ 500.000',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
  customQuote: false,
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

type UserRegistrationInput = Pick<
  FormData,
  |
  'emailLogin' |
  'passwordLogin' |
  'confirmPasswordLogin' |
  'firstName' |
  'lastName' |
  'cpf' |
  'birthDate' |
  'rg' |
  'orgaoExpedidor' |
  'entidadeExerce' |
  'atividadeProfissional' |
  'pais' |
  'estado' |
  'cep' |
  'cidade' |
  'bairro' |
  'endereco' |
  'numero' |
  'complemento' |
  'telefone' |
  'role'
>;

export default function RegisterForm() {
  console.log('REGISTER_FORM_DEBUG: RegisterForm component function CALLED'); // <<< ADDED THIS LOG
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>(initialFormErrors); 
  const router = useRouter();
  // const [cookies, setCookie, removeCookie] = useCookies([
  //   'selected_plan', // CHANGED: Was 'selected_plan_id', now stores the object
  //   'user_id',
  //   'email',         // ADDED: For storing user's email after registration
  //   'role',
  //   'registration_completed_token' 
  // ]);
  // Initialize availablePlans with the updated plans
  const [availablePlans, setAvailablePlans] = useState<InsurancePlan[]>([plano100, plano200, plano500Standard, plano500Custom]);
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null);
  const [finalPrice, setFinalPrice] = useState<number | null>(null); // State to hold the price after all discounts
  const [appliedCouponDiscount, setAppliedCouponDiscount] = useState<number>(0); // e.g., 0.10 for 10%
  const [couponMessage, setCouponMessage] = useState<string>(''); // To give feedback on coupon application
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false); 
  const [loadingCoupon, setLoadingCoupon] = useState(false); // ADDED
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [isStepValid, setIsStepValid] = useState<boolean>(false);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const calculateFinalPrice = useCallback((plan: InsurancePlan | null, gradYear: string, couponDiscountRate: number) => {
    if (!plan) { // Guard if plan is null, though useEffect should prevent this call path
      setFinalPrice(null);
      return;
    }
    let currentPrice = plan.price;
    // 1. Apply graduation year discount (if applicable)
    if (plan.id === 'plan_plus_500_standard_v1') {
      const currentYear = new Date().getFullYear();
      const graduationYearNum = parseInt(gradYear, 10);
      if (!isNaN(graduationYearNum) && graduationYearNum >= currentYear - 2 && graduationYearNum <= currentYear) {
        currentPrice = 279.00; // Apply discounted price for recent graduates
      }
    }
    // 2. Apply coupon discount to the (potentially already discounted) price
    currentPrice = currentPrice * (1 - couponDiscountRate);
    setFinalPrice(parseFloat(currentPrice.toFixed(2)));
  }, [setFinalPrice]); // setFinalPrice from useState is stable and its reference doesn't change

  const updateFormData = useCallback((field: string, value: string | boolean | string[] | File | null | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'couponCode') {
      // If user types in coupon field, reset applied discount until they click "Apply"
      setAppliedCouponDiscount(0);
      setCouponMessage('');
    }
  }, [setFormData, setAppliedCouponDiscount, setCouponMessage]);

  // Validates coupon and returns discount percentage
  const validateCoupon = (code: string): number => {
    switch (code.toUpperCase()) {
      case 'MEDSAFE10':
        return 0.10;
      case 'QUERO15':
        return 0.15;
      case 'MED20SAFE':
        return 0.20;
      default:
        return 0;
    }
  };

  const handleApplyCoupon = useCallback(() => {
    if (!formData.couponCode) {
      setCouponMessage('Por favor, insira um código de cupom.');
      setAppliedCouponDiscount(0);
      // Ensure price is recalculated if coupon is removed or invalid
      if (selectedPlan) calculateFinalPrice(selectedPlan, formData.graduationYear, 0);
      return;
    }
    setLoadingCoupon(true); // Start loading
    // Simulate API call for coupon validation if needed, otherwise direct validation:
    setTimeout(() => { // Simulating async validation
      const discount = validateCoupon(formData.couponCode as string);
      if (discount > 0) {
        setAppliedCouponDiscount(discount);
        setCouponMessage(`Cupom "${formData.couponCode}" aplicado! Desconto de ${discount * 100}%.`);
      } else {
        setAppliedCouponDiscount(0);
        setCouponMessage('Cupom inválido ou expirado.');
      }
      // Recalculate price with the new coupon status
      if (selectedPlan) {
        calculateFinalPrice(selectedPlan, formData.graduationYear, discount);
      }
      setLoadingCoupon(false); // End loading
    }, 500); // Simulate 0.5 second delay
  }, [formData.couponCode, selectedPlan, formData.graduationYear, calculateFinalPrice, validateCoupon]);

  const handlePlanSelect = useCallback((plan: InsurancePlan | null) => {
    setSelectedPlan(plan);
    // if (plan) {
    //   setCookie('selected_plan', plan, { path: '/', maxAge: 3600 * 24 * 30 }); // Store for 30 days
    // } else {
    //   removeCookie('selected_plan', { path: '/' });
    // }
  }, [setSelectedPlan]); // Removed setCookie, removeCookie from dependencies

  const handlePlanChange = useCallback((plan: InsurancePlan | null) => {
    handlePlanSelect(plan);
  }, [handlePlanSelect]);

  const validatePersonalInfoStep = (): Partial<Record<keyof FormData, string>> => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName) errors.firstName = 'Nome é obrigatório';
    if (!formData.lastName) errors.lastName = 'Sobrenome é obrigatório';
    if (!formData.cpf) errors.cpf = 'CPF é obrigatório';
    else if (formData.cpf.replace(/\D/g, '').length !== 11) errors.cpf = 'CPF inválido';
    if (!formData.birthDate) errors.birthDate = 'Data de Nascimento é obrigatória';
    if (!formData.rg) errors.rg = 'RG é obrigatório';
    if (!formData.orgaoExpedidor) errors.orgaoExpedidor = 'Órgão Expedidor é obrigatório';
    if (!formData.entidadeExerce) errors.entidadeExerce = 'Entidade onde exerce a profissão é obrigatória';
    if (!formData.atividadeProfissional) errors.atividadeProfissional = 'Atividade profissional é obrigatória';
    if (!formData.pais) errors.pais = 'País é obrigatório';
    if (!formData.estado) errors.estado = 'Estado é obrigatório';
    if (!formData.cep) errors.cep = 'CEP é obrigatório';
    if (!formData.cidade) errors.cidade = 'Cidade é obrigatória';
    if (!formData.bairro) errors.bairro = 'Bairro é obrigatório';
    if (!formData.endereco) errors.endereco = 'Endereço é obrigatório';
    if (!formData.numero) errors.numero = 'Número é obrigatório';
    // Email and telefone are often part of personal info but also sometimes validated in credentials or contact steps
    // For now, including basic checks here. Adjust if they are primarily validated elsewhere.
    if (!formData.email) errors.email = 'Email de contato é obrigatório'; // VALIDATE formData.email here
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email de contato inválido';
    if (!formData.emailLogin) errors.emailLogin = 'Email de login é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(formData.emailLogin)) errors.emailLogin = 'Email de login inválido';
    if (!formData.passwordLogin) errors.passwordLogin = 'Senha é obrigatória';
    else if (formData.passwordLogin.length < 6) errors.passwordLogin = 'Senha deve ter no mínimo 6 caracteres';
    if (!formData.confirmPasswordLogin) errors.confirmPasswordLogin = 'Confirmação de senha é obrigatória';
    else if (formData.passwordLogin !== formData.confirmPasswordLogin) errors.confirmPasswordLogin = 'As senhas não coincidem';
    if (!formData.telefone) errors.telefone = 'Telefone é obrigatório';
    // Role is validated separately in handleNext, but could be added here too if preferred
    return errors;
  };

  const validateCredentialsStep = (): Partial<Record<'emailLogin' | 'passwordLogin' | 'confirmPasswordLogin', string>> => {
    const newErrors: Partial<Record<'emailLogin' | 'passwordLogin' | 'confirmPasswordLogin', string>> = {}; // CORRECTED TYPE
    if (!formData.emailLogin) {
      newErrors.emailLogin = 'E-mail de login é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.emailLogin)) {
      newErrors.emailLogin = 'Formato de e-mail de login inválido.';
    }

    if (!formData.passwordLogin) {
      newErrors.passwordLogin = 'Senha é obrigatória.';
    } else if (formData.passwordLogin.length < 6) {
      newErrors.passwordLogin = 'Senha deve ter no mínimo 6 caracteres.';
    }

    if (!formData.confirmPasswordLogin) {
      newErrors.confirmPasswordLogin = 'Confirmação de senha é obrigatória.';
    } else if (formData.passwordLogin !== formData.confirmPasswordLogin) {
      newErrors.confirmPasswordLogin = 'As senhas não coincidem.';
    }
    return newErrors;
  };

  // Function to handle user registration API call
  const registerUser = async (userData: UserRegistrationInput): Promise<{ id: string, user?: { id: string; email: string; role: string} }> => {
    const payloadForApi = {
      email: userData.emailLogin, // API expects 'email'
      password: userData.passwordLogin, // API expects 'password'
      // confirmPassword is typically not sent to backend, password rules are re-validated.
      name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
      cpf: userData.cpf.replace(/\D/g, ''),
      birth_date: userData.birthDate ? convertDateToYMD(userData.birthDate) : undefined,
      rg: userData.rg,
      // orgao_expedidor: userData.orgaoExpedidor, // Uncomment if API expects this
      // entidade_exerce: userData.entidadeExerce, // Uncomment if API expects this
      profession: userData.atividadeProfissional || userData.entidadeExerce || userData.role || '',
      address: `${userData.endereco || ''}, ${userData.numero || ''}${userData.complemento ? ' - ' + userData.complemento : ''}`.trim(),
      city: userData.cidade,
      state: userData.estado,
      zip_code: userData.cep.replace(/\D/g, ''),
      phone: userData.telefone.replace(/\D/g, ''),
      role: userData.role,
      // Include any other fields the /api/register endpoint expects, mapped from userData
    };

    console.log('REGISTER_FORM_DEBUG: Sending to /api/register:', JSON.stringify(payloadForApi, null, 2));

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadForApi),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido ao tentar registrar.' }));
      console.error('REGISTER_FORM_DEBUG: Registration API error response:', errorData);
      throw new Error(errorData.message || `Erro ao registrar usuário: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('REGISTER_FORM_DEBUG: Registration API success response:', responseData);

    // Adjust based on actual API response structure for user ID
    if (!responseData || (!responseData.id && (!responseData.user || !responseData.user.id))) {
      console.error('REGISTER_FORM_DEBUG: Registration response missing essential ID:', responseData);
      throw new Error('Resposta da API de registro inválida ou ID do usuário ausente.');
    }
    // Prefer top-level id if available, otherwise from nested user object
    return { id: responseData.id || responseData.user.id, user: responseData.user };
  };

  useEffect(() => {
    console.log(`REGISTER_FORM_DEBUG: useEffect for validation CALLED - currentStep: ${currentStep}`); // <<< ADDED THIS LOG
    let errors: Partial<Record<keyof FormData, string>> = {};
    let valid = true;

    if (currentStep === 1) { // CADASTRO
      // Basic Personal Info Validation (Can be expanded)
      const personalInfoErrors = validatePersonalInfoStep();
      errors = { ...errors, ...personalInfoErrors };
      if (Object.keys(personalInfoErrors).length > 0) valid = false;

      console.log('REGISTER_FORM_DEBUG: Step 1 Validation - Errors:', errors, 'Valid:', valid); // <<< ADDED THIS LOG

    } else if (currentStep === 2) { // INFORMAÇÕES ADICIONAIS
      console.log('REGISTER_FORM_DEBUG: Validating Step 2 - Additional Info'); // <<< ADDED THIS LOG
      if (!formData.carteiraProfissional) {
        errors.carteiraProfissional = 'Número do CRM é obrigatório.';
        valid = false;
      }
      if (!formData.crmFile) { // Check if CRM file is uploaded
        errors.crmFile = 'Upload do CRM é obrigatório.';
        valid = false;
      }
      // Removed check for formData.addressProofFile
      // if (!formData.addressProofFile) { 
      //   errors.addressProofFile = 'Upload do Comprovante de Endereço é obrigatório.';
      //   valid = false;
      // }
      
      // NEW CHECK for formData.comprovanteResidencia
      if (!formData.comprovanteResidencia) { 
          errors.comprovanteResidencia = 'Upload do Comprovante de Residência é obrigatório.';
          valid = false;
      }

      if (!formData.assessoradoPorVendas) { 
          errors.assessoradoPorVendas = 'Por favor, selecione se está sendo assessorado.';
          valid = false;
      }
      // Ensure other radio button groups have valid selections if they are mandatory
      // Example: if 'penalRestritiva' must be chosen
      if (!formData.penalRestritiva) { // Assuming 'NAO' or 'SIM' must be selected
        errors.penalRestritiva = 'Resposta para "Questões Penais Restritivas" é obrigatória.';
        valid = false;
      }
      if (!formData.penaAdministrativa) {
        errors.penaAdministrativa = 'Resposta para "Questões de Pena Administrativa" é obrigatória.';
        valid = false;
      }
      if (!formData.dependenteQuimico) {
        errors.dependenteQuimico = 'Resposta para "Dependente Químico" é obrigatória.';
        valid = false;
      }
      if (!formData.recusaSeguro) {
        errors.recusaSeguro = 'Resposta para "Recusa de Seguro" é obrigatória.';
        valid = false;
      }
      if (!formData.conhecimentoReclamacoes) {
        errors.conhecimentoReclamacoes = 'Resposta para "Conhecimento de Reclamações" é obrigatória.';
        valid = false;
      }
      // If 'conhecimentoReclamacoes' is 'SIM', then 'envolvidoReclamacoes' might become mandatory
      if (formData.conhecimentoReclamacoes === 'SIM' && !formData.envolvidoReclamacoes) {
        errors.envolvidoReclamacoes = 'Detalhes sobre o envolvimento em reclamações são obrigatórios.';
        valid = false;
      }

      console.log('REGISTER_FORM_DEBUG: Step 2 Validation - Errors:', errors, 'Valid:', valid); // <<< ADDED THIS LOG

    } else if (currentStep === 3) { // RESUMO DA COMPRA (was PlanAndPayment)
      // Validation for step 3 (Purchase Summary)
      // This step primarily depends on selectedPlan and paymentMethod chosen
      console.log('REGISTER_FORM_DEBUG: Validating Step 3 - Resumo da Compra');
      if (!selectedPlan) {
        // This might be an unlikely scenario if navigation to step 3 requires a plan,
        // but good for robustness.
        setError('Por favor, selecione um plano antes de prosseguir para o resumo.');
        valid = false;
      } else {
        // If a plan is selected, check payment method specific validations
        if (formData.paymentMethod === 'CREDIT_CARD') {
          if (!formData.cardHolderName) { errors.cardHolderName = 'Nome no cartão é obrigatório.'; valid = false; }
          if (!formData.cardNumber) { errors.cardNumber = 'Número do cartão é obrigatório.'; valid = false; }
          // Add more specific card validation if needed (Luhn, length, etc.)
          if (!formData.cardExpiryMonth) { errors.cardExpiryMonth = 'Mês de validade é obrigatório.'; valid = false; }
          if (!formData.cardExpiryYear) { errors.cardExpiryYear = 'Ano de validade é obrigatório.'; valid = false; }
          if (!formData.cardCcv) { errors.cardCcv = 'CCV é obrigatório.'; valid = false; }
          if (!formData.cardCpfCnpj) { errors.cardCpfCnpj = 'CPF/CNPJ do titular é obrigatório.'; valid = false; }
          // Basic check for CPF/CNPJ length
          const cpfCnpjLength = formData.cardCpfCnpj?.replace(/\D/g, '').length;
          if (cpfCnpjLength !== 11 && cpfCnpjLength !== 14) {
            errors.cardCpfCnpj = 'CPF/CNPJ do titular inválido.'; valid = false;
          }
          if (!formData.cardPhone) { errors.cardPhone = 'Telefone do titular é obrigatório.'; valid = false; }
          if (formData.installments === undefined || formData.installments < 1) {
            // @ts-ignore
            errors.installments = 'Número de parcelas inválido.';
            valid = false;
          }
        } else if (formData.paymentMethod === 'BOLETO') {
          // No specific field validations for Boleto at this stage usually
        } else if (!formData.paymentMethod && selectedPlan?.id !== 'consultar') { // A plan is selected (not 'consultar'), but no payment method
          errors.paymentMethod = 'Método de pagamento é obrigatório.';
          valid = false;
        }
      }
      if (!formData.acceptedTerms) {
        errors.acceptedTerms = 'Você deve aceitar os Termos e Condições.';
        valid = false;
      }
      console.log('REGISTER_FORM_DEBUG: Step 3 Validation - Errors:', errors, 'Valid:', valid);
    }

    setFormErrors(errors);
    setIsStepValid(valid);
    // Set general error message if not valid and no specific errors were set (or to override)
    // if (!valid && Object.keys(errors).length === 0) {
    //   setError('Por favor, preencha todos os campos obrigatórios corretamente.');
    // }
    // Optionally, clear general error if now valid
    // if (valid) setError(null);

    console.log('REGISTER_FORM_DEBUG: useEffect validation - formErrors:', errors, 'isStepValid:', valid);
  }, [formData, currentStep, selectedPlan, registeredUserId, validatePersonalInfoStep]); // Added registeredUserId and validatePersonalInfoStep to dependencies

  const handleNext = async () => {
    setError(null); // Clear previous general errors
    // Validation is now handled by useEffect, just check isStepValid
    if (!isStepValid) {
      // Errors are already set by the useEffect, so just prevent progression.
      // Optionally, you could re-set a generic message or focus the first error field.
      // setError(prevError => prevError || 'Por favor, corrija os erros antes de prosseguir.');
      return;
    }

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
        const registrationData: UserRegistrationInput = {
          emailLogin: formData.emailLogin,
          passwordLogin: formData.passwordLogin,
          confirmPasswordLogin: formData.confirmPasswordLogin,
          firstName: formData.firstName,
          lastName: formData.lastName,
          cpf: formData.cpf, // Raw value, formatting for API is in registerUser
          birthDate: formData.birthDate,
          rg: formData.rg,
          orgaoExpedidor: formData.orgaoExpedidor,
          entidadeExerce: formData.entidadeExerce,
          atividadeProfissional: formData.atividadeProfissional,
          pais: formData.pais,
          estado: formData.estado,
          cep: formData.cep, // Raw value
          cidade: formData.cidade,
          bairro: formData.bairro,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          telefone: formData.telefone, // Raw value
          role: formData.role,
        };

        const apiResponse = await registerUser(registrationData);

        console.log('REGISTER_FORM_DEBUG: User registered, API Response ID:', apiResponse.id);
        setRegisteredUserId(apiResponse.id); // Store registered user ID

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
          email: formData.email, // Use contact email for payment customer info
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
          email: formData.email, // Use contact email for card holder info
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

  const handleFileUpload = useCallback((field: keyof FormData, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  }, [setFormData]);

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Informações Pessoais
        return (
          <PersonalInfo
            formData={formData}
            onInputChange={updateFormData}
            errors={formErrors}
          />
        );
      case 2: // Informações Adicionais
        return (
          <AdditionalInfo
            formData={formData}
            onInputChange={updateFormData} // Corrected: Use onInputChange, file handling is internal or via this
          />
        );
      case 3: // Plano e Pagamento
        return (
          <PlanAndPayment
            availablePlans={availablePlans}
            selectedPlan={selectedPlan}
            onPlanChange={handlePlanSelect} // Corrected: Maps to handlePlanSelect
            formData={formData}
            onInputChange={updateFormData} // Corrected
            finalPrice={finalPrice}
            couponCode={formData.couponCode}
            onApplyCoupon={handleApplyCoupon} // Corrected: Maps to handleApplyCoupon
            couponMessage={couponMessage}
            // Pass other necessary props like paymentMethod, contractAgreed from formData if PlanAndPayment needs them directly
            // For now, assuming PlanAndPayment uses formData for these, passed via onInputChange
          />
        );
      case 4: // Credenciais de Acesso
        return (
          <CredentialsInfo
            formData={formData} // CredentialsInfo expects specific fields from formData
            onInputChange={updateFormData} // Corrected
            errors={formErrors} // Corrected: Maps to formErrors
          />
        );
      case 5: // Concluído
        return (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
            <Typography variant="h5" className="mb-4 text-green-700">
              Cadastro Realizado com Sucesso!
            </Typography>
            <Typography className="mb-2">
              Seu ID de usuário é: {registeredUserId}
            </Typography>
            <Typography className="mb-4">
              Você será redirecionado para a página de login em alguns segundos...
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/login')}
            >
              Ir para Login Agora
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // Simplified return for diagnostics
  /*
  return (
    <div>
      <h1>Register Form Diagnostic Test</h1>
      <p>Current Step: {currentStep}</p>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
    </div>
  );
  */

  // Restore main layout and Stepper
  return (
    <Box className="max-w-4xl mx-auto p-4">
      <Paper className="p-2 sm:p-4 md:p-6">
        <Typography variant="h4" className="mb-2 text-center font-semibold">
          {currentStep === 1 && 'Informações Pessoais e Plano'}
          {currentStep === 2 && 'Informações Adicionais'}
          {currentStep === 3 && 'Plano e Pagamento'}
          {currentStep === 4 && 'Credenciais de Acesso'}
          {currentStep === 5 && 'Concluído'}
        </Typography>
        <Stepper activeStep={currentStep - 1} alternativeLabel className="mb-6">
          {['Informações Pessoais', 'Informações Adicionais', 'Plano e Pagamento', 'Credenciais de Acesso', 'Concluído'].map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="mb-6">
          {renderStep()} 
        </div>

        {currentStep < 5 && (
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
              disabled={loading || !isStepValid} // Use isStepValid state
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : (currentStep === 4 ? 'Finalizar Cadastro' : 'Próximo')}
            </button>
          </div>
        )}
      </Paper>
    </Box>
  );
}