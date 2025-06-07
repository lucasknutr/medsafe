'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { signIn } from 'next-auth/react'; 
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from '@mui/material';
import PersonalInfo from './PersonalInfo';
import AdditionalInfo from './AdditionalInfo';
import CredentialsInfo from './CredentialsInfo';
import TermsAndConditions from './TermsAndConditions';

interface FormData {
  firstName: string;
  lastName: string;
  cpf: string;
  birthDate: string;
  graduationYear: string;
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
  carteiraProfissional: string; 
  comprovanteResidencia: File | null;
  crmFile: File | null;
  termsAgreed: boolean;
  areaAtuacao?: string; 
  especialidade?: string;
  anoConclusaoCurso?: string;
  instituicaoEnsino?: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  cpf: '',
  birthDate: '',
  graduationYear: '',
  rg: '',
  orgaoExpedidor: '',
  residenceSince: '',
  fezResidencia: 'NAO',
  especialidadeAtual: '',
  pertenceAlgumaAssociacao: 'NAO',
  socioProprietario: 'NAO',
  entidadeExerce: '',
  realizaProcedimento: 'NAO',
  atividadeProfissional: '',
  pais: 'BR',
  estado: '',
  cep: '',
  cidade: '',
  bairro: '',
  endereco: '',
  numero: '',
  complemento: '',
  email: '', 
  telefone: '',
  role: 'SEGURADO', 
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
  termsAgreed: false,
  areaAtuacao: '',
  especialidade: '',
  anoConclusaoCurso: '',
  instituicaoEnsino: '',
};

const initialFormErrors: Partial<Record<keyof FormData, string>> = {};

type UserRegistrationInput = Omit<
  FormData,
  'comprovanteResidencia' | 
  'crmFile' | 
  'termsAgreed' |
  'confirmPasswordLogin'
>;

const MAX_STEPS = 5; 

const steps = [
  'Informações Pessoais',
  'Informações Adicionais',
  'Credenciais de Acesso',
  'Termos e Condições',
  'Concluído'
];

export default function RegisterForm(): React.ReactElement {
  console.log('REGISTER_FORM_DEBUG: RegisterForm component function CALLED');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>(initialFormErrors);
  const router = useRouter();
  const searchParams = useSearchParams(); 

  const [planIdFromUrl, setPlanIdFromUrl] = useState<string | null>(null);
  const [isStepValid, setIsStepValid] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [registeredUserId, setRegisteredUserId] = useState<string | null>(null);

  useEffect(() => {
    const planId = searchParams.get('planId');
    if (planId) {
      setPlanIdFromUrl(planId);
      console.log('REGISTER_FORM_DEBUG: planId from URL:', planId);
    }
  }, [searchParams]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const registerUser = async (data: UserRegistrationInput, planId: string | null): Promise<any> => {
    console.log('REGISTER_FORM_DEBUG: registerUser called with data:', data, 'and planId:', planId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, userId: 'mock-user-id', user: { email: data.emailLogin } }; 
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('REGISTER_FORM_DEBUG: handleSubmit called');
    if (!isStepValid) {
      setError('Por favor, corrija os erros no formulário antes de continuar.');
      return;
    }
    if (!formData.termsAgreed && currentStep === MAX_STEPS -1) { 
        setError('Você deve aceitar os Termos e Condições para continuar.');
        return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare data for registration, excluding unnecessary fields
      const {
        comprovanteResidencia, 
        crmFile, 
        termsAgreed, 
        confirmPasswordLogin, 
        ...registrationData 
      } = formData;

      const registrationResponse = await registerUser(registrationData, planIdFromUrl);
      console.log('REGISTER_FORM_DEBUG: Registration response:', registrationResponse);

      if (registrationResponse && registrationResponse.success && registrationResponse.userId) {
        setRegisteredUserId(registrationResponse.userId);

        const signInResponse = await signIn('credentials', {
          redirect: false,
          email: formData.emailLogin,
          password: formData.passwordLogin,
        });
        console.log('REGISTER_FORM_DEBUG: Sign-in response:', signInResponse);

        if (signInResponse && !signInResponse.error) {
          console.log('REGISTER_FORM_DEBUG: Sign-in successful, proceeding to next step/redirect.');
          if (currentStep === MAX_STEPS -1) { 
            setCurrentStep(currentStep + 1);
          } else {
            if (planIdFromUrl) {
              router.push(`/pagamento?planId=${planIdFromUrl}`);
            } else {
              router.push('/');
            }
          }
        } else {
          setError(`Erro ao fazer login: ${signInResponse?.error || 'Erro desconhecido'}`);
          console.error('REGISTER_FORM_DEBUG: Sign-in error:', signInResponse?.error);
        }
      } else {
        setError(registrationResponse?.message || 'Erro ao registrar usuário. Tente novamente.');
        console.error('REGISTER_FORM_DEBUG: Registration error:', registrationResponse?.message);
      }
    } catch (err: any) {
      setError(`Ocorreu um erro inesperado: ${err.message || 'Verifique sua conexão'}`);
      console.error('REGISTER_FORM_DEBUG: Unexpected error in handleSubmit:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    // Basic email validation regex
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    // Basic CPF validation: 11 digits (can be improved with actual CPF validation algorithm)
    const cpfRegex = /^\d{11}$/;
    // Date validation for DD/MM/YYYY or DD-MM-YYYY
    const dateRegex = /^(\d{2})[-/.](\d{2})[-/.](\d{4})$/;

    switch (currentStep) {
      case 1: // Informações Pessoais
        console.log('REGISTER_FORM_DEBUG: Validating Step 1. formData:', JSON.parse(JSON.stringify(formData))); // Log formData for step 1

        if (!formData.firstName?.trim()) newErrors.firstName = 'Nome é obrigatório.';
        if (!formData.lastName?.trim()) newErrors.lastName = 'Sobrenome é obrigatório.';
        if (!formData.cpf?.trim()) {
          newErrors.cpf = 'CPF é obrigatório.';
        } else if (!cpfRegex.test(formData.cpf.replace(/\D/g, ''))) {
          newErrors.cpf = 'CPF inválido. Deve conter 11 dígitos.';
        }
        if (!formData.birthDate?.trim()) {
          newErrors.birthDate = 'Data de nascimento é obrigatória.';
        } else if (!dateRegex.test(formData.birthDate)) {
          newErrors.birthDate = 'Formato de data inválido. Use DD/MM/AAAA ou DD-MM-AAAA.';
        }
        if (!formData.rg?.trim()) newErrors.rg = 'RG é obrigatório.';
        if (!formData.orgaoExpedidor?.trim()) newErrors.orgaoExpedidor = 'Órgão expedidor é obrigatório.';
        if (!formData.email?.trim()) {
          newErrors.email = 'Email é obrigatório.';
        } else if (!emailRegex.test(formData.email)) {
          newErrors.email = 'Formato de email inválido.';
        }
        if (!formData.telefone?.trim()) newErrors.telefone = 'Telefone é obrigatório.'; // Add more specific phone validation if needed
        if (!formData.cep?.trim()) newErrors.cep = 'CEP é obrigatório.';
        if (!formData.endereco?.trim()) newErrors.endereco = 'Endereço é obrigatório.';
        if (!formData.numero?.trim()) newErrors.numero = 'Número é obrigatório.';
        if (!formData.bairro?.trim()) newErrors.bairro = 'Bairro é obrigatório.';
        if (!formData.cidade?.trim()) newErrors.cidade = 'Cidade é obrigatória.';
        if (!formData.estado?.trim()) newErrors.estado = 'Estado é obrigatório.';
        // formData.pais has a default, so validation might not be strictly needed unless it can be cleared
        
        console.log('REGISTER_FORM_DEBUG: Step 1 newErrors:', JSON.parse(JSON.stringify(newErrors))); // Log errors for step 1
        break;

      case 2: // Informações Adicionais
        // Example validations for Step 2 - adapt as needed
        // if (!formData.areaAtuacao?.trim()) newErrors.areaAtuacao = 'Área de atuação é obrigatória.'; // Optional for now
        // if (!formData.especialidade?.trim()) newErrors.especialidade = 'Especialidade é obrigatória.'; // Optional for now
        // if (!formData.anoConclusaoCurso?.trim()) { // Optional for now
        //   newErrors.anoConclusaoCurso = 'Ano de conclusão do curso é obrigatório.';
        // } else if (!/^\d{4}$/.test(formData.anoConclusaoCurso)) {
        //   newErrors.anoConclusaoCurso = 'Ano de conclusão inválido. Use AAAA.';
        // }
        // if (!formData.instituicaoEnsino?.trim()) newErrors.instituicaoEnsino = 'Instituição de ensino é obrigatória.'; // Optional for now
        if (!formData.carteiraProfissional?.trim()) newErrors.carteiraProfissional = 'Número do conselho (CRM, CRO, etc.) é obrigatório.'; // MOVED HERE

        // Add other validations for Step 2 as they are defined
        console.log('REGISTER_FORM_DEBUG: Step 2 newErrors:', JSON.parse(JSON.stringify(newErrors)));
        break;

      case 3: // Credenciais de Acesso
        if (!formData.emailLogin?.trim()) {
          newErrors.emailLogin = 'Email de login é obrigatório.';
        } else if (!emailRegex.test(formData.emailLogin)) {
          newErrors.emailLogin = 'Formato de email de login inválido.';
        }
        if (!formData.passwordLogin?.trim()) {
          newErrors.passwordLogin = 'Senha é obrigatória.';
        } else if (formData.passwordLogin.length < 6) { // Example: min 6 chars
          newErrors.passwordLogin = 'Senha deve ter no mínimo 6 caracteres.';
        }
        if (!formData.confirmPasswordLogin?.trim()) {
          newErrors.confirmPasswordLogin = 'Confirmação de senha é obrigatória.';
        } else if (formData.passwordLogin !== formData.confirmPasswordLogin) {
          newErrors.confirmPasswordLogin = 'As senhas não coincidem.';
        }
        break;

      case 4: // Termos e Condições
        if (!formData.termsAgreed) {
          newErrors.termsAgreed = 'Você deve aceitar os Termos e Condições para continuar.';
        }
        break;

      // No validation needed for step 5 (Concluído)
    }

    setFormErrors(newErrors);
    setIsStepValid(Object.keys(newErrors).length === 0);
    console.log('REGISTER_FORM_DEBUG: Final isStepValid:', Object.keys(newErrors).length === 0, 'Errors:', JSON.parse(JSON.stringify(newErrors))); // Log final validation status
  }, [formData, currentStep]);

  useEffect(() => {
    if (currentStep === MAX_STEPS) {
      console.log('REGISTER_FORM_DEBUG: Reached Concluído step. Preparing for redirect.');
      const timer = setTimeout(() => {
        if (planIdFromUrl) {
          console.log(`REGISTER_FORM_DEBUG: Redirecting to /pagamento?planId=${planIdFromUrl}`);
          router.push(`/pagamento?planId=${planIdFromUrl}`);
        } else {
          console.log('REGISTER_FORM_DEBUG: Redirecting to /');
          router.push('/');
        }
      }, 3000); // 3-second delay

      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [currentStep, planIdFromUrl, router, MAX_STEPS]);

  const handleNext = async () => {
    setError(null); 
    if (!isStepValid) {
      setError('Por favor, corrija os erros no formulário.');
      return;
    }
    if (currentStep < MAX_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = (): React.ReactElement | null => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfo
            formData={formData}
            onInputChange={updateFormData}
            errors={formErrors}
          />
        );
      case 2:
        return (
          <AdditionalInfo
            formData={formData}
            onInputChange={updateFormData}
          />
        );
      case 3:
        return (
          <CredentialsInfo
            formData={formData}
            onInputChange={updateFormData}
            errors={formErrors}
          />
        );
      case 4:
        return (
          <TermsAndConditions
            acceptedTerms={formData.termsAgreed}
            onInputChange={updateFormData}
          />
        );
      case 5:
        return (
          <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg shadow-md">
            <Typography variant="h5" className="mb-4 text-green-700">
              Cadastro Realizado com Sucesso!
            </Typography>
            <Typography className="mb-2">
              Login automático efetuado. Seu ID de usuário é: {registeredUserId}
            </Typography>
            <Typography className="mb-4">
              Você será redirecionado em alguns segundos...
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (planIdFromUrl) {
                  router.push(`/pagamento?planId=${planIdFromUrl}`);
                } else {
                  router.push('/');
                }
              }}
            >
              {planIdFromUrl ? 'Ir para Pagamento Agora' : 'Ir para Início Agora'}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ maxWidth: '800px', margin: 'auto', mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" className="mb-6">
          Formulário de Cadastro
        </Typography>

        <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ minHeight: '300px', marginBottom: '2rem' }}>
            {renderStep()} 
          </div>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="outlined"
              disabled={currentStep === 1 || loading}
              onClick={handlePrev}
            >
              Anterior
            </Button>
            {currentStep < MAX_STEPS - 1 && ( // Steps 1, 2, 3
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!isStepValid || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Próximo'}
              </Button>
            )}
            {currentStep === MAX_STEPS - 1 && ( // Step 4 (Termos e Condições)
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isStepValid || loading || !formData.termsAgreed}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Cadastro e Aceitar Termos'}
              </Button>
            )}
            {/* No next/submit button on Concluído step (currentStep === MAX_STEPS) */}
          </Box>
        </form>
      </Paper>
    </Box>
  );
}