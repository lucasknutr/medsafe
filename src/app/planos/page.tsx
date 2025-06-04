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
}

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
  customQuote: true,
};

const plano200: InsurancePlan = {
  id: 'cmabutev30000ec8p7nanpru7',
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

// New Standard Plano +500
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

const plans: InsurancePlan[] = [plano100, plano200, plano500Standard];

function PlanosContentWrapper() {
  "use client";

  const [currentInsurance, setCurrentInsurance] = useState<CurrentUserInsurance | null>(null);
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies<string, MyCookies>(['selected_plan', 'role', 'user_id', 'email']);
  const router = useRouter();
  const searchParams = useSearchParams(); 

  // State for pending status from payment page
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);
  const [pendingStatusMessage, setPendingStatusMessage] = useState<React.ReactNode | null>(null);

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
    if (!selectedFile || !pendingTransactionId) {
      setUploadError("Nenhum arquivo selecionado ou ID da transação ausente.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setUploadSuccessMessage(null);
    const formData = new FormData();
    formData.append('contract', selectedFile);
    formData.append('transactionId', pendingTransactionId);
    if (pendingPlanId) formData.append('planId', pendingPlanId);
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
        // Clear the file input visually if possible
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

  useEffect(() => {
    const queryPlanId = searchParams.get('planId');
    const queryStatus = searchParams.get('status');
    const queryTransactionId = searchParams.get('transactionId');

    if (queryPlanId) setPendingPlanId(queryPlanId);
    if (queryStatus) setPendingStatus(queryStatus);
    if (queryTransactionId) setPendingTransactionId(queryTransactionId);

    if (queryPlanId && queryStatus) {
      const planDetails = plans.find(p => p.id === queryPlanId);
      let message = '';
      let severity: 'info' | 'warning' | 'success' = 'info';

      if (queryStatus === 'pending_payment') {
        message = `Pagamento para ${planDetails?.name || 'o plano selecionado'} está pendente. Por favor, conclua o pagamento do boleto.`;
        severity = 'warning';
      } else if (queryStatus === 'pending_document') {
        message = `Pagamento para ${planDetails?.name || 'o plano selecionado'} recebido! Agora, por favor, envie o contrato assinado para finalizar a ativação.`;
        severity = 'info';
      } else if (queryStatus === 'active') {
        message = `Seu ${planDetails?.name || 'plano'} foi ativado com sucesso!`;
        severity = 'success';
      }
      
      if (message) {
        setPendingStatusMessage(
          <Alert severity={severity} className="mb-8">
            <Typography variant="h6">{message}</Typography>
          </Alert>
        );
      }
    } else {
      setPendingStatusMessage(null); 
    }
  }, [searchParams]); 

  useEffect(() => {
    const fetchUserStatus = async () => {
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
  }, []);

  const handleSelectPlan = (planId: string) => {
    setCookie('selected_plan', planId, { path: '/' });
    router.push('/pagamentos');
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error && !currentInsurance) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Não foi possível carregar seus dados de seguro. Por favor, tente novamente mais tarde.
        </Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h4" className="text-center mb-8">
        Planos de Seguro
      </Typography>

      {pendingStatusMessage}

      {currentInsurance && (
        <Alert severity={currentInsurance.status === 'ACTIVE' ? 'success' : 'info'} className="mb-8">
          <Typography variant="h6">
            Seu plano atual: {currentInsurance.plan} (Status: {currentInsurance.status})
          </Typography>
          {currentInsurance.status !== 'ACTIVE' &&
            <Typography>Aguardando confirmação ou ação necessária.</Typography>
          }
        </Alert>
      )}
      {!currentInsurance && !loading && (
        <Typography variant="body1" className="text-center mb-8">
          Você ainda não possui um plano ativo ou estamos com dificuldades para carregar seus dados.
        </Typography>
      )}

      {pendingStatus === 'pending_document' && pendingTransactionId && (
        <Box my={4} p={3} border={1} borderColor="grey.300" borderRadius={2} component={Paper} elevation={3}>
          <Typography variant="h6" gutterBottom>
            Envio de Contrato Assinado
          </Typography>
          <Typography variant="body1" gutterBottom>
            Para o plano: {plans.find(p => p.id === pendingPlanId)?.name || 'Plano Selecionado'}<br/>
            ID da Transação: {pendingTransactionId}
          </Typography>
          <TextField 
            type="file" 
            // @ts-ignore
            inputProps={{ accept: '.docx' }} 
            onChange={handleFileChange} 
            fullWidth 
            variant="outlined"
            sx={{ mt: 2, mb: 1 }}
            helperText={uploadError ? uploadError : (selectedFile ? selectedFile.name : "Selecione o arquivo .docx do contrato assinado")}
            error={!!uploadError}
          />
          <Button 
            variant="contained" 
            onClick={handleFileUpload}
            disabled={!selectedFile || uploading}
            fullWidth
            sx={{ mt: 1, py: 1.5 }}
          >
            {uploading ? <CircularProgress size={24} /> : 'Enviar Contrato'}
          </Button>
          {uploadSuccessMessage && <Alert severity="success" sx={{ mt: 2 }}>{uploadSuccessMessage}</Alert>}
        </Box>
      )}

      <Grid container spacing={4}>
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card className="h-full flex flex-col">
              <CardContent className="flex-grow">
                <Typography variant="h5" component="div" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {plan.description}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ my: 2 }}>
                  R$ {plan.price.toFixed(2).replace('.', ',')} / mês
                </Typography>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </CardContent>
              <CardActions className="mt-auto">
                {plan.customQuote ? (
                  <Button size="large" variant="contained" fullWidth onClick={() => router.push('/contato?assunto=CotacaoPersonalizada')}>
                    Solicitar Cotação
                  </Button>
                ) : (
                  <Button size="large" variant="contained" fullWidth onClick={() => handleSelectPlan(plan.id)} disabled={!!currentInsurance && currentInsurance.status === 'ACTIVE'}>
                    {!!currentInsurance && currentInsurance.status === 'ACTIVE' ? 'Plano Ativo' : 'Selecionar Plano'}
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

const InsurancePlansPage = () => {
  return (
    <>
      <Navbar />
      <Suspense fallback={
        <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Carregando planos...</Typography>
        </Container>
      }>
        <PlanosContentWrapper />
      </Suspense>
    </>
  );
};

export default InsurancePlansPage;