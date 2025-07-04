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
  brokerId?: string;
}

interface UserData {
  id: string;
  email: string;
  name?: string;
}

interface RegistrationResponse {
  success: boolean;
  userId?: string;
  user?: UserData;
  message?: string;
  error?: string;
  missingFields?: string[];
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
  brokerId: '',
};

const initialFormErrors: Partial<Record<keyof FormData, string>> = {};

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
  const [brokers, setBrokers] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const planId = searchParams.get('planId');
    if (planId) {
      setPlanIdFromUrl(planId);
      console.log('REGISTER_FORM_DEBUG: planId from URL:', planId);
    }

    // Fetch brokers
    const fetchBrokers = async () => {
      try {
        const response = await fetch('/api/brokers');
        if (!response.ok) {
          throw new Error('Failed to fetch brokers');
        }
        const data = await response.json();
        setBrokers(data);
      } catch (error) {
        console.error(error);
        // Handle error appropriately, maybe set an error state
      }
    };

    fetchBrokers();
  }, [searchParams]);

  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, [setFormData]);

  const registerUser = async (data: FormData): Promise<RegistrationResponse> => {
    console.log('REGISTER_FORM_DEBUG: Received data for registration:', data);

    const formDataPayload = new FormData();

    // Append text fields
    formDataPayload.append('name', `${data.firstName} ${data.lastName}`);
    formDataPayload.append('email', data.email);
    formDataPayload.append('cpf', data.cpf);
    formDataPayload.append('profession', data.especialidadeAtual);
    formDataPayload.append('phone', data.telefone);
    formDataPayload.append('address', `${data.endereco}, ${data.numero}${data.complemento ? `, ${data.complemento}` : ''} - ${data.bairro}`);
    formDataPayload.append('city', data.cidade);
    formDataPayload.append('state', data.estado);
    formDataPayload.append('zip_code', data.cep);
    formDataPayload.append('password', data.passwordLogin);

    if (data.brokerId) {
      formDataPayload.append('brokerId', data.brokerId);
    }

    // Append files if they exist
    if (data.crmFile) {
      formDataPayload.append('crmFile', data.crmFile);
    }
    if (data.comprovanteResidencia) {
      formDataPayload.append('comprovanteResidencia', data.comprovanteResidencia);
    }

    console.log('REGISTER_FORM_DEBUG: Sending FormData to backend /api/register');

    try {
      const response = await fetch('/api/register', { 
        method: 'POST',
        body: formDataPayload, // Browser will set Content-Type to multipart/form-data
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('REGISTER_FORM_DEBUG: Registration API error response:', responseData);
        return {
          success: false,
          message: responseData.message || responseData.error || `Error: ${response.status} ${response.statusText}`,
          error: responseData.error,
          missingFields: responseData.missingFields,
        };
      }

      console.log('REGISTER_FORM_DEBUG: Registration API success response:', responseData);
      return {
        success: true,
        message: responseData.message,
        user: responseData.user as UserData,
        userId: responseData.user?.id,
      };

    } catch (error: any) {
      console.error('REGISTER_FORM_DEBUG: Network or parsing error during registration:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred during registration.',
      };
    }
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
      const registrationResponse = await registerUser(formData);
      console.log('REGISTER_FORM_DEBUG: Registration response:', registrationResponse);

      if (registrationResponse && registrationResponse.success && registrationResponse.userId) {
        setRegisteredUserId(registrationResponse.userId);

        // Send documents via email
        const documentsFormData = new FormData();
        if (formData.crmFile) {
          documentsFormData.append('crmFile', formData.crmFile);
        }
        if (formData.comprovanteResidencia) {
          documentsFormData.append('comprovanteResidencia', formData.comprovanteResidencia);
        }
        documentsFormData.append('userName', `${formData.firstName} ${formData.lastName}`);
        documentsFormData.append('userEmail', formData.email);
        documentsFormData.append('userId', registrationResponse.userId);

        // Only attempt to send if there are files to send
        if (formData.crmFile || formData.comprovanteResidencia) {
          try {
            const sendDocsResponse = await fetch('/api/send-registration-documents', {
              method: 'POST',
              body: documentsFormData,
            });
            const sendDocsResult = await sendDocsResponse.json();
            if (!sendDocsResponse.ok) {
              console.error('REGISTER_FORM_DEBUG: Error sending documents:', sendDocsResult.error || sendDocsResult.message);
              // Optionally, set an error state here or notify the user, 
              // but for now, we'll just log it and proceed to the success step.
            } else {
              console.log('REGISTER_FORM_DEBUG: Documents sent successfully:', sendDocsResult.message);
            }
          } catch (docError: any) {
            console.error('REGISTER_FORM_DEBUG: Failed to send documents:', docError.message);
            // Optionally, handle this error more visibly
          }
        } else {
          console.log('REGISTER_FORM_DEBUG: No documents to send.');
        }

        setCurrentStep(MAX_STEPS); // Move to 'Concluído' step
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
            brokers={brokers}
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
              Seu ID de usuário é: {registeredUserId}
            </Typography>
            <Typography className="mb-4">
              {planIdFromUrl ? 'Prossiga para o pagamento.' : 'Clique abaixo para fazer login.'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (planIdFromUrl) {
                  router.push(`/pagamento?planId=${planIdFromUrl}`);
                } else {
                  signIn(undefined, { callbackUrl: '/' }); // Redirect to login, then to home
                }
              }}
            >
              {planIdFromUrl ? 'Ir para Pagamento' : 'Fazer Login'}
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    const cpfRegex = /^\d{11}$/;
    const dateRegex = /^(\d{2})[-/.](\d{2})[-/.](\d{4})$/;

    switch (currentStep) {
      case 1: 
        console.log('REGISTER_FORM_DEBUG: Validating Step 1. formData:', JSON.parse(JSON.stringify(formData)));

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
        if (!formData.telefone?.trim()) newErrors.telefone = 'Telefone é obrigatório.';
        if (!formData.cep?.trim()) newErrors.cep = 'CEP é obrigatório.';
        if (!formData.endereco?.trim()) newErrors.endereco = 'Endereço é obrigatório.';
        if (!formData.numero?.trim()) newErrors.numero = 'Número é obrigatório.';
        if (!formData.bairro?.trim()) newErrors.bairro = 'Bairro é obrigatório.';
        if (!formData.cidade?.trim()) newErrors.cidade = 'Cidade é obrigatória.';
        if (!formData.estado?.trim()) newErrors.estado = 'Estado é obrigatório.';
        
        console.log('REGISTER_FORM_DEBUG: Step 1 newErrors:', JSON.parse(JSON.stringify(newErrors)));
        break;

      case 2: 
        if (!formData.carteiraProfissional?.trim()) newErrors.carteiraProfissional = 'Número do conselho (CRM, CRO, etc.) é obrigatório.';
        
        console.log('REGISTER_FORM_DEBUG: Step 2 newErrors:', JSON.parse(JSON.stringify(newErrors)));
        break;

      case 3: 
        if (!formData.passwordLogin?.trim()) {
          newErrors.passwordLogin = 'Senha é obrigatória.';
        } else if (formData.passwordLogin.length < 6) { 
          newErrors.passwordLogin = 'Senha deve ter no mínimo 6 caracteres.';
        }
        if (!formData.confirmPasswordLogin?.trim()) {
          newErrors.confirmPasswordLogin = 'Confirmação de senha é obrigatória.';
        } else if (formData.passwordLogin !== formData.confirmPasswordLogin) {
          newErrors.confirmPasswordLogin = 'As senhas não coincidem.';
        }
        break;

      case 4: 
        console.log('REGISTER_FORM_DEBUG: Validating Step 4. formData.termsAgreed:', formData.termsAgreed);
        if (!formData.termsAgreed) {
          newErrors.termsAgreed = 'Você deve aceitar os Termos e Condições para continuar.';
        }
        break;

      default:
        break;
    }

    setFormErrors(newErrors);
    setIsStepValid(Object.keys(newErrors).length === 0);
    console.log('REGISTER_FORM_DEBUG: Final isStepValid:', Object.keys(newErrors).length === 0, 'Errors:', JSON.parse(JSON.stringify(newErrors)));
  }, [formData, currentStep]);

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
            {currentStep < MAX_STEPS - 1 && ( 
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={!isStepValid || loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Próximo'}
              </Button>
            )}
            {currentStep === MAX_STEPS - 1 && ( 
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={!isStepValid || loading || !formData.termsAgreed}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Finalizar Cadastro e Aceitar Termos'}
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Box>
  );
}