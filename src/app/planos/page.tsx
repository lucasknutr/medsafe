"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container, CircularProgress, Alert } from '@mui/material';
import { useCookies } from 'react-cookie';

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

export default function InsurancePlansPage() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cookies, setCookie] = useCookies(['selected_plan']);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/insurance-plans');
        if (!response.ok) {
          throw new Error('Failed to fetch insurance plans');
        }
        const data = await response.json();
        setPlans(data.filter((plan: InsurancePlan) => plan.is_active));
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
        setError('Erro ao carregar os planos de seguro. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePlanSelect = (plan: InsurancePlan) => {
    setCookie('selected_plan', plan, { path: '/' });
    router.push('/cadastro');
  };

  if (loading) {
    return (
      <Container className="py-12">
        <Typography variant="h4" className="text-center mb-8">
          Carregando planos...
        </Typography>
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-12">
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <Typography variant="h4" className="text-center mb-8">
        Planos de Seguro
      </Typography>

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
                >
                  Selecionar Plano
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
} 