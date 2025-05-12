import React from 'react';
import { TextField } from '@mui/material';

interface CredentialsInfoProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  onInputChange: (field: string, value: string) => void;
  errors?: {
    email?: string;
    password?: string;
    confirmPassword?: string;
  };
}

const CredentialsInfo: React.FC<CredentialsInfoProps> = ({ formData, onInputChange, errors }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Credenciais de Acesso</h2>
      
      <div>
        <TextField
          fullWidth
          label="E-mail"
          type="email"
          name="email"
          value={formData.email}
          onChange={(e) => onInputChange('email', e.target.value)}
          required
          error={!!errors?.email}
          helperText={errors?.email || ''}
        />
      </div>

      <div>
        <TextField
          fullWidth
          label="Senha"
          type="password"
          name="password"
          value={formData.password}
          onChange={(e) => onInputChange('password', e.target.value)}
          required
          error={!!errors?.password}
          helperText={errors?.password || ''}
          // You might want to style helperText directly if MUI default red is not what you want
          // FormHelperTextProps={{ style: { color: 'red' } }} // Example
        />
      </div>

      <div>
        <TextField
          fullWidth
          label="Confirmar Senha"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={(e) => onInputChange('confirmPassword', e.target.value)}
          required
          error={!!errors?.confirmPassword}
          helperText={errors?.confirmPassword || ''}
        />
      </div>
    </div>
  );
};

export default CredentialsInfo;