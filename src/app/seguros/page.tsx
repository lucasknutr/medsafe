"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container } from '@mui/material';
import { useCookies } from 'react-cookie';

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isActive: boolean;
}

export default function InsurancePlansPage() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [cookies] = useCookies(['role']);
  const router = useRouter();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/insurance-plans');
        if (!response.ok) {
          throw new Error('Failed to fetch insurance plans');
        }
        const data = await response.json();
        setPlans(data.filter((plan: InsurancePlan) => plan.isActive));
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
        alert('Erro ao carregar os planos de seguro. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSelectPlan = (planId: string) => {
    // Store the selected plan ID in localStorage
    localStorage.setItem('selectedInsurancePlan', planId);
    
    // Redirect to registration page
    router.push('/register');
  };

  if (loading) {
    return (
      <Container className="py-12">
        <Typography variant="h4" className="text-center mb-8">
          Carregando planos...
        </Typography>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <Typography variant="h4" className="text-center mb-8">
        Planos de Seguro
      </Typography>
      
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.id}>
            <Card className="h-full flex flex-col">
              <CardContent>
                <Typography variant="h5">{plan.name}</Typography>
                <Typography variant="h6" color="primary">R$ {Number(plan.price).toFixed(2).replace('.', ',')}/mês</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{plan.description}</Typography>
                <ul className="mt-2 text-sm">
                  {plan.features.map((feature, index) => (
                    <li key={index}>✓ {feature}</li>
                  ))}
                </ul>
              </CardContent>
              <CardActions className="p-4 pt-0">
                <Button 
                  variant="contained" 
                  color="primary" 
                  fullWidth
                  onClick={() => handleSelectPlan(plan.id)}
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