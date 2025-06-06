import React from 'react';
import { TextField } from '@mui/material';

interface CredentialsInfoProps {
  formData: {
    emailLogin: string;
    passwordLogin: string;
    confirmPasswordLogin: string;
  };
  onInputChange: (field: 'emailLogin' | 'passwordLogin' | 'confirmPasswordLogin', value: string) => void;
  errors?: {
    emailLogin?: string;
    passwordLogin?: string;
    confirmPasswordLogin?: string;
  };
}

const CredentialsInfo: React.FC<CredentialsInfoProps> = ({ formData, onInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Credenciais de Acesso</h2>
      
      <div>
        <TextField
          fullWidth
          label="E-mail de Login"
          type="email"
          name="emailLogin"
          value={formData.emailLogin}
          onChange={(e) => onInputChange('emailLogin', e.target.value)}
          required
          error={!!errors?.emailLogin}
          helperText={errors?.emailLogin || ''}
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
          // You might want to style helperText directly if MUI default red is not what you want
          // FormHelperTextProps={{ style: { color: 'red' } }} // Example
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