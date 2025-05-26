"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container, CircularProgress, Alert } from '@mui/material';
import { useCookies } from 'react-cookie';
import Navbar from '@/app/components/Navbar';

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

interface CurrentUserInsurance {
  id: number;
  plan: string;
  status: string;
}

// Define the single hardcoded plan with user-provided details
const medsafeDefaultPlan: InsurancePlan = {
  id: 'cmabutev30000ec8p7nanpru7',
  name: 'Plano de Proteção Profissional MedSafe',
  description: 'Cobertura de R$ 200.000 para defesa em processos éticos, cíveis e criminais decorrentes da atividade profissional.',
  price: 450.00,
  features: [
    'Cobertura de R$ 200.000',
    'Defesas em processos Éticos, Cíveis e Criminais',
    'Perícias e custas judiciais',
    'Honorários de sucumbência',
    'Custas processuais'
  ],
  is_active: true,
};

// Define the new 'Plano +100'
const planoPlus100: InsurancePlan = {
  id: 'plan_plus_100_temp_id', // IMPORTANT: Replace with actual unique ID
  name: 'Plano +100',
  description: 'Este plano oferece uma cobertura adicional para maior tranquilidade e segurança em sua prática profissional.', // TODO: Replace with actual description
  price: 279.00,
  features: [
    'Cobertura adicional de R$ 100.000', // TODO: Replace/add actual features
    'Suporte especializado',
    'Proteção ampliada'
  ],
  is_active: true,
};

export default function InsurancePlansPage() {
  // Initialize plans state with both plans
  const [plans, setPlans] = useState<InsurancePlan[]>([medsafeDefaultPlan, planoPlus100]);
  const [currentInsurance, setCurrentInsurance] = useState<CurrentUserInsurance | null>(null);
  // Loading now refers to fetching user's current insurance status
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['selected_plan', 'role', 'user_id']);
  const router = useRouter();

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

        <Grid container spacing={4}>
          {plans.map((plan) => (
            <Grid item xs={12} sm={6} md={4} key={plan.id}>
              <Card className="h-full flex flex-col">
                <CardContent className="flex-grow">
                  <Typography variant="h5" component="h2" className="mb-4">
                    {plan.name}
                  </Typography>
                  <Typography variant="h6" color="primary" className="mb-4">
                    R$ {plan.price.toFixed(2)}/mês
                  </Typography>
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
                      : 'Selecionar Plano'}
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