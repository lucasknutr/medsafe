import React from 'react';
import { TextField } from '@mui/material';

interface CredentialsInfoProps {
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const CredentialsInfo: React.FC<CredentialsInfoProps> = ({ formData, onInputChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold mb-6">Credenciais de Acesso</h2>
      
      <TextField
        fullWidth
        label="E-mail"
        type="email"
        name="email"
        value={formData.email}
        onChange={(e) => onInputChange('email', e.target.value)}
        required
      />

      <TextField
        fullWidth
        label="Senha"
        type="password"
        name="password"
        value={formData.password}
        onChange={(e) => onInputChange('password', e.target.value)}
        required
      />

      <TextField
        fullWidth
        label="Confirmar Senha"
        type="password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={(e) => onInputChange('confirmPassword', e.target.value)}
        required
      />
    </div>
  );
};

export default CredentialsInfo; 