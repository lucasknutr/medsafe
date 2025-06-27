"use client"
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container, CircularProgress, Alert, TextField, Box, Paper } from '@mui/material';
import { useCookies } from 'react-cookie';
import Navbar from '@/app/components/Navbar';

interface MyCookies {
  selected_plan?: string;
  role?: string;
  user_id?: string;
  email?: string;
}

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
  customQuote?: boolean;
}

interface CurrentUserInsurance {
  id: number;
  plan: string;
  status: string;
  asaasPaymentId: string;
}

// Updated Plan Definitions
const plano100: InsurancePlan = {
  id: 'plan_plus_100_v1',
  name: 'Plano +100',
  price: 279.00,
  description: 'Cobertura de R$ 100.000,00. Ideal para profissionais das especialidades: Clínica Médica, Oftalmologia, Dermatologia (clínica), Cardiologia e Pediatria.',
  features: [
    'Consultoria preventiva',
    'Cobertura de R$ 100.000,00',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
  customQuote: false,
};

const plano200: InsurancePlan = {
  id: 'cmabutev30000ec8p7nanpru7',
  name: 'Plano +200 (Todas as especialidades, inclusive cirúrgicas)',
  price: 449.00,
  description: 'Cobertura de R$ 200.000,00. Abrange todas as especialidades médicas, exceto Cirurgia Plástica.',
  features: [
    'Consultoria preventiva',
    'Cobertura de R$ 200.000,00',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
};

// New Standard Plano +200 (Cirurgia Plástica)
const plano200Plastica: InsurancePlan = {
  id: 'plan_plus_500_plastica_v1',
  name: 'Plano +200 (Cirurgia Plástica)',
  price: 749.00,
  description: 'Cobertura de R$ 200.000,00. Abrange apenas Cirurgia Plástica.',
  features: [
    'Consultoria preventiva',
    'Cobertura de R$ 200.000,00',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
  customQuote: false,
};

// New Standard Plano +500
const plano500Standard: InsurancePlan = {
  id: 'plan_plus_500_standard_v1',
  name: 'Plano +500 (Especialidades Clínicas)',
  price: 458.00,
  description: 'Cobertura de R$ 500.000,00. Ideal para profissionais das especialidades: Clínica Médica, Oftalmologia, Dermatologia, Cardiologia e Pediatria.',
  features: [
    'Consultoria preventiva',
    'Cobertura de R$ 500.000,00',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
  customQuote: false,
};

// New Standard Plano +500 (Cirurgia Plástica)
const plano500Plastica: InsurancePlan = {
  id: 'plan_plus_500_plastica_v1',
  name: 'Plano +500 (Cirurgia Plástica)',
  price: 1099.00,
  description: 'Cobertura de R$ 500.000,00. Abrange apenas Cirurgia Plástica.',
  features: [
    'Consultoria preventiva',
    'Cobertura de R$ 500.000,00',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
  ],
  is_active: true,
  customQuote: false,
};

const plans: InsurancePlan[] = [plano100, plano200, plano200Plastica, plano500Standard, plano500Plastica];

function PlanosContentWrapper() {
  "use client";

  const [currentInsurance, setCurrentInsurance] = useState<CurrentUserInsurance | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies<string, MyCookies>(['selected_plan', 'role', 'user_id', 'email']);
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // State for document upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        setSelectedFile(event.target.files[0]);
        setUploadError(null); 
        setUploadSuccessMessage(null); 
      } else {
        setSelectedFile(null);
        setUploadError("Por favor, selecione um arquivo .docx.");
        setUploadSuccessMessage(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !currentInsurance?.asaasPaymentId) {
      setUploadError("Nenhum arquivo selecionado ou apólice não encontrada.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);
    const formData = new FormData();
    formData.append('contract', selectedFile);
    formData.append('transactionId', currentInsurance.asaasPaymentId);
    formData.append('planId', currentInsurance.plan); 
    if (cookies.email) formData.append('userEmail', cookies.email);

    try {
      const response = await fetch('/api/upload-contract', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setUploadSuccessMessage(result.message || 'Contrato enviado com sucesso! Aguarde a confirmação.');
        setSelectedFile(null); 
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadError(result.message || 'Falha ao enviar o contrato.');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadError('Ocorreu um erro ao enviar o contrato. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const translateStatus = (status: string | undefined): string => {
    if (!status) return "Status Desconhecido";
    const statusMap: { [key: string]: string } = {
      "ACTIVE": "Ativo",
      "PENDING_PAYMENT": "Pagamento Pendente",
      "PENDING_DOCUMENT": "Documento Pendente",
      "PENDING_APPROVAL": "Aprovação Pendente", 
      "PENDING": "Pendente",
      "INACTIVE": "Inativo",
      "CANCELED": "Cancelado",
      "EXPIRED": "Expirado",
      "OVERDUE": "Vencido",
      "CONFIRMED": "Confirmado", 
      "RECEIVED": "Recebido",
      "RECEIVED_IN_CASH": "Recebido em Dinheiro",
    };
    return statusMap[status.toUpperCase()] || status;
  };

  useEffect(() => {
    const fetchUserStatus = async () => {
      // If no user is logged in, clear the insurance state and stop loading.
      if (!cookies.user_id) {
        setCurrentInsurance(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/user/insurance-status', { cache: 'no-store' }); 
        const data = await response.json();

        if (response.ok) {
          setCurrentInsurance(data);
        } else if (response.status === 404) {
          setCurrentInsurance(null);
        } else {
          throw new Error(data.error || data.message || 'Failed to fetch user status');
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
        setCurrentInsurance(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatus();
  }, [cookies]); // Depend on the entire cookies object for robustness

  const renderPlanCard = (plan: InsurancePlan) => {
    const isSelected = currentInsurance?.plan === plan.name;
    const status = isSelected ? currentInsurance?.status : undefined;

    return (
      <Grid item xs={12} md={4} key={plan.id}>
        <Card className={`h-full flex flex-col ${isSelected ? 'border-2 border-yellow-500' : ''}`}>
          <CardContent className="flex-grow">
            <Typography variant="h5" component="div">{plan.name}</Typography>
            {isSelected && status && (
              <Typography variant="subtitle1" className="font-bold text-yellow-600">
                Status: {translateStatus(status)}
              </Typography>
            )}
            <Box sx={{ display: 'flex', alignItems: 'baseline', my: 2 }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                R$ {Number(plan.price).toFixed(2).replace('.', ',')}
              </Typography>
              <Typography variant="body1" component="span" sx={{ ml: 0.5 }}>
                /mês
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" className="mt-2">{plan.description}</Typography>
            <ul className="mt-4 text-sm">
              {plan.features.map((feature, index) => <li key={index}>✓ {feature}</li>)}
            </ul>
          </CardContent>
          <CardActions>
            {!currentInsurance && (
              <Button size="small" variant="contained" onClick={() => handleSelectPlan(plan)}>
                Contratar
              </Button>
            )}
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const renderUploadSection = () => {
    if (!currentInsurance || currentInsurance.status !== 'PENDING_DOCUMENT') {
      return null;
    }

    return (
      <Paper className="p-6 my-8" elevation={3}>
        <Typography variant="h6" className="mb-4">Envio de Contrato</Typography>
        <Typography variant="body1" className="mb-4">
          Para finalizar a ativação do seu plano <strong>{currentInsurance.plan}</strong>, por favor, faça o download do contrato, assine-o digitalmente e envie o arquivo (.docx) abaixo.
        </Typography>
        <Button variant="outlined" href="/path/to/your/contract-template.docx" download className="mb-4">
          Baixar Modelo do Contrato
        </Button>
        <Box className="flex flex-col gap-4">
          <TextField
            type="file"
            onChange={handleFileChange}
            error={!!uploadError}
            helperText={uploadError}
            InputLabelProps={{ shrink: true }}
            inputProps={{ accept: '.docx' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : null}
          >
            {uploading ? 'Enviando...' : 'Enviar Contrato'}
          </Button>
          {uploadSuccessMessage && <Alert severity="success">{uploadSuccessMessage}</Alert>}
        </Box>
      </Paper>
    );
  };

  const handleSelectPlan = (plan: InsurancePlan) => {
    setCookie('selected_plan', plan.id, { path: '/' });
    if (cookies.user_id) {
      router.push(`/pagamento?planId=${plan.id}`); 
    } else {
      router.push('/register'); 
    }
  };

  if (loading) return <div className="w-full flex justify-center py-10"><CircularProgress /></div>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 12, mb: 4 }}>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && (
          <>
            <Typography variant="h4" gutterBottom>Nossos Planos</Typography>

            {renderUploadSection()}

            {currentInsurance && !['PENDING_DOCUMENT'].includes(currentInsurance.status) && (
              <Alert severity="info" className="mb-8">
                Você já possui o <strong>{currentInsurance.plan}</strong> com status <strong>{translateStatus(currentInsurance.status)}</strong>.
              </Alert>
            )}

            <Grid container spacing={4}>
              {plans.map(renderPlanCard)}
            </Grid>
          </>
        )}
      </Container>
    </>
  );
}

export default function PlanosPage() {
  const [cookies] = useCookies(['user_id']);

  return (
    <>
      <Navbar />
      <main>
        <Container className="pt-28 pb-8">
          <Suspense fallback={<div className="w-full flex justify-center py-10"><CircularProgress /></div>}>
            {/* Using the user_id as a key forces a full remount on login/logout, clearing all state. */}
            <PlanosContentWrapper key={cookies.user_id || 'logged-out'} />
          </Suspense>
        </Container>
      </main>
    </>
  );
}