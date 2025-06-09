import React from 'react';
import { TextField, Typography } from '@mui/material';

interface CredentialsInfoProps {
  formData: {
    email: string;
    passwordLogin: string;
    confirmPasswordLogin: string;
  };
  onInputChange: (field: 'passwordLogin' | 'confirmPasswordLogin', value: string) => void;
  errors?: {
    passwordLogin?: string;
    confirmPasswordLogin?: string;
  };
}

const CredentialsInfo: React.FC<CredentialsInfoProps> = ({ formData, onInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Credenciais de Acesso</h2>
      
      <div>
        <Typography variant="subtitle1" gutterBottom>
          E-mail para Login (definido no Passo 1):
        </Typography>
        <TextField
          fullWidth
          label="E-mail de Login"
          type="email"
          name="email"
          value={formData.email}
          disabled
          required
        />
      </div>

      <div>
        <TextField
          fullWidth
          label="Senha"
          type="password"
          name="passwordLogin"
          value={formData.passwordLogin}
          onChange={(e) => onInputChange('passwordLogin', e.target.value)}
          required
          error={!!errors?.passwordLogin}
          helperText={errors?.passwordLogin || ''}
        />
      </div>

      <div>
        <TextField
          fullWidth
          label="Confirmar Senha"
          type="password"
          name="confirmPasswordLogin"
          value={formData.confirmPasswordLogin}
          onChange={(e) => onInputChange('confirmPasswordLogin', e.target.value)}
          required
          error={!!errors?.confirmPasswordLogin}
          helperText={errors?.confirmPasswordLogin || ''}
        />
      </div>
    </div>
  );
};

export default CredentialsInfo;