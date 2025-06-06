import React from 'react';
import { FormControlLabel, Checkbox, Typography, Link } from '@mui/material';

interface TermsAndConditionsProps {
  acceptedTerms: boolean;
  onInputChange: (field: 'termsAgreed', value: boolean) => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ acceptedTerms, onInputChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Termos e Condições</h2>
      
      <div className="space-y-4">
        <Typography variant="body1" className="mb-4">
          Por favor, leia atentamente os termos e condições antes de prosseguir com o cadastro.
        </Typography>

        <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto mb-4">
          <Typography variant="body2">
            1. Ao se cadastrar, você concorda em fornecer informações verdadeiras e precisas.
            
            2. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
            
            3. O uso indevido da plataforma resultará no cancelamento imediato da conta.
            
            4. Nos reservamos o direito de modificar estes termos a qualquer momento.
            
            5. Seus dados pessoais serão tratados de acordo com nossa Política de Privacidade.
          </Typography>
        </div>

        <FormControlLabel
          control={
            <Checkbox
              checked={acceptedTerms}
              onChange={(e) => onInputChange('termsAgreed', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Typography variant="body2">
              Li e aceito os{' '}
              <Link href="/terms" target="_blank" className="text-primary">
                Termos e Condições
              </Link>{' '}
              e a{' '}
              <Link href="/privacy" target="_blank" className="text-primary">
                Política de Privacidade
              </Link>
            </Typography>
          }
        />
      </div>
    </div>
  );
};

export default TermsAndConditions; 