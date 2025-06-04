"use client"
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container, CircularProgress, Alert, TextField, Box } from '@mui/material';
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
};

const plano200: InsurancePlan = {
  id: 'cmabutev30000ec8p7nanpru7', // Existing ID, plan renamed and price updated
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
  customQuote: false, // Explicitly false to distinguish from the custom quote version
};

export default function InsurancePlansPage() {
  // Initialize plans state with the hardcoded plan, including the new standard +500
  const [plans, setPlans] = useState<InsurancePlan[]>([plano100, plano200, plano500Standard]);
  const [currentInsurance, setCurrentInsurance] = useState<CurrentUserInsurance | null>(null);
  // Loading now refers to fetching user's current insurance status
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
        setUploadError(null); // Clear previous error if new file is selected
        setUploadSuccessMessage(null); // Clear previous success message
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
        setSelectedFile(null); // Clear file input
        // Consider if the input itself should be cleared e.g. event.target.value = '' if it's part of the input element directly
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
      } else if (queryStatus === 'active') { // Example if redirected after direct activation
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
      setPendingStatusMessage(null); // Clear if no relevant query params
    }
  }, [searchParams, plans]);

  useEffect(() => {
    const fetchUserStatus = async () => {
      // No longer fetching plans list here
      if (!cookies.user_id) {
        setLoading(false); // Not logged in, so no status to fetch
        return;
      }

      try {
        setLoading(true);
        const statusResponse = await fetch('/api/user/insurance-status');
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setCurrentInsurance(statusData);
        } else if (statusResponse.status === 404) {
          setCurrentInsurance(null); // No active insurance, which is a valid state
        } else {
          console.error('Error fetching user insurance status:', await statusResponse.text());
          setError('Erro ao carregar seu status de seguro.');
        }
      } catch (err) {
        console.error('Error fetching user status:', err);
        const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar dados da página.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatus();
  }, [cookies.user_id]);

  const handlePlanSelect = (plan: InsurancePlan) => {
    setCookie('selected_plan', plan, { path: '/' });
    if (cookies.role) {
      window.location.href = `/pagamento?planId=${plan.id}`;
    } else {
      router.push('/register');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        {/* Adjusted padding: pt-40 for navbar, pb-12 for bottom space */}
        <Container className="pt-40 pb-12">
          <Typography variant="h4" className="text-center mb-8">
            Carregando...
          </Typography>
          <div className="flex justify-center">
            <CircularProgress />
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        {/* Adjusted padding: pt-40 for navbar, pb-12 for bottom space */}
        <Container className="pt-40 pb-12">
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Adjusted padding: pt-40 for navbar, pb-12 for bottom space */}
      <Container className="pt-40 pb-12">
        <Typography variant="h4" className="text-center mb-8">
          Planos de Seguro
        </Typography>

        {/* Display message from payment redirection */}
        {pendingStatusMessage}

        {currentInsurance && (
          <Alert severity={currentInsurance.status === 'ACTIVE' ? 'success' : 'info'} className="mb-8">
            <Typography variant="h6">
              Seu Plano Atual: {currentInsurance.plan}
            </Typography>
            <Typography>
              Status: {currentInsurance.status === 'ACTIVE' ? 'Ativo' : 
                       currentInsurance.status === 'PENDING_PAYMENT' ? 'Pagamento Pendente' : 
                       currentInsurance.status}
            </Typography>
          </Alert>
        )}

        {!currentInsurance && !loading && (
           <Typography variant="subtitle1" className="text-center mb-8">
              Escolha um plano abaixo ou <Button onClick={() => router.push('/')}>Ainda Vou Decidir</Button>.
          </Typography>
        )}

        {/* Document Upload Section - To be detailed later */}
        {pendingStatus === 'pending_document' && pendingTransactionId && (
          <Box my={4} p={3} border={1} borderColor="grey.300" borderRadius={2}>
            <Typography variant="h6" gutterBottom>
              Envio de Contrato Assinado
            </Typography>
            <Typography variant="body1" gutterBottom>
              Para o plano: {plans.find(p => p.id === pendingPlanId)?.name || 'Plano Selecionado'}<br/>
              ID da Transação: {pendingTransactionId}
            </Typography>
            {/* File input and upload button will go here */}
            <input type="file" accept=".docx" onChange={handleFileChange} />
            <Button 
              variant="contained" 
              onClick={handleFileUpload} // Connect the handler
              disabled={!selectedFile || uploading}
              sx={{ mt: 2 }}
            >
              {uploading ? <CircularProgress size={24} /> : 'Enviar Contrato'}
            </Button>
            {uploadError && <Alert severity="error" sx={{ mt: 2 }}>{uploadError}</Alert>}
            {uploadSuccessMessage && <Alert severity="success" sx={{ mt: 2 }}>{uploadSuccessMessage}</Alert>}
          </Box>
        )}

        <Grid container spacing={4}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card className="h-full flex flex-col">
                <CardContent className="flex-grow">
                  <Typography variant="h5" component="h2" className="mb-4">
                    {plan.name}
                  </Typography>
                  <Typography variant="h6" color="primary" className="mb-1">
                    {plan.customQuote ? 'Consulte-nos' : `R$ ${plan.price.toFixed(2)}/mês`}
                  </Typography>
                  {plan.id === 'plan_plus_500_standard_v1' && (
                    <Typography variant="caption" display="block" color="textSecondary" className="mb-3">
                      *R$ 279,00/mês para médicos com até 3 anos de formação.
                    </Typography>
                  )}
                  <Typography variant="body1" className="mb-4">
                    {plan.description}
                  </Typography>
                  <ul className="list-disc pl-4 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="mb-2">
                        <Typography variant="body2">{feature}</Typography>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardActions className="p-4 pt-0">
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handlePlanSelect(plan)}
                    disabled={currentInsurance?.plan === plan.name && currentInsurance?.status === 'ACTIVE'}
                  >
                    {currentInsurance?.plan === plan.name && currentInsurance?.status === 'ACTIVE' 
                      ? 'Seu Plano Atual'
                      : plan.customQuote ? 'Solicitar Cotação' : 'Selecionar Plano'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
}