'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Paper, Stepper, Step, StepLabel, Box } from '@mui/material';
import PersonalInfo from './PersonalInfo';
import AdditionalInfo from './AdditionalInfo';
import PurchaseSummary from './PurchaseSummary';
import CredentialsInfo from './CredentialsInfo';
import TermsAndConditions from './TermsAndConditions';

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
  selectedPlan: string;
  paymentMethod: string;
  installments: number;
  acceptedTerms: boolean;
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
  selectedPlan: '',
  paymentMethod: '',
  installments: 0,
  acceptedTerms: false
};

const steps = [
  { label: 'CADASTRO', icon: '📝' },
  { label: 'INFORMAÇÕES ADICIONAIS', icon: 'ℹ️' },
  { label: 'RESUMO DA COMPRA', icon: '🛒' },
];

export default function RegisterForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const router = useRouter();

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
          formData.telefone &&
          formData.password &&
          formData.confirmPassword
        );
      case 2:
        return Boolean(
          formData.penalRestritiva &&
          formData.penaAdministrativa &&
          formData.dependenteQuimico &&
          formData.recusaSeguro &&
          formData.conhecimentoReclamacoes &&
          formData.envolvidoReclamacoes &&
          formData.assessoradoPorVendas &&
          formData.carteiraProfissional &&
          formData.comprovanteResidencia
        );
      case 3:
        return Boolean(
          formData.selectedPlan &&
          formData.paymentMethod &&
          formData.acceptedTerms &&
          (formData.paymentMethod === 'BOLETO' || formData.installments > 0)
        );
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

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      
      // Append all text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'carteiraProfissional' && key !== 'comprovanteResidencia') {
          if (typeof value === 'object') {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value);
          }
        }
      });

      // Append files
      if (formData.carteiraProfissional) {
        formDataToSend.append('carteiraProfissional', formData.carteiraProfissional);
      }
      if (formData.comprovanteResidencia) {
        formDataToSend.append('comprovanteResidencia', formData.comprovanteResidencia);
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Erro ao enviar o formulário');
      }

      alert('Cadastro realizado com sucesso!');
      router.push('/');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar o formulário. Por favor, tente novamente.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo formData={formData} onInputChange={handleInputChange} />;
      case 2:
        return <CredentialsInfo formData={formData} onInputChange={handleInputChange} />;
      case 3:
        return <TermsAndConditions formData={formData} onInputChange={handleInputChange} />;
      default:
        return null;
    }
  };

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