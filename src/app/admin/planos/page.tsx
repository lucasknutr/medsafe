"use client"
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardActions, Typography, Button, Grid, Container, TextField, IconButton, Alert, Snackbar } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useCookies } from 'react-cookie';

interface InsurancePlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  is_active: boolean;
}

export default function InsurancePlansAdminPage() {
  const [plans, setPlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cookies] = useCookies(['role']);
  const router = useRouter();

  const [newPlan, setNewPlan] = useState({
    name: '',
    description: '',
    price: '',
    features: [''],
  });

  useEffect(() => {
    if (cookies.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/insurance-plans');
        if (!response.ok) {
          throw new Error('Failed to fetch insurance plans');
        }
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error('Error fetching insurance plans:', error);
        setError('Erro ao carregar os planos de seguro. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, [cookies.role, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewPlan(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...newPlan.features];
    newFeatures[index] = value;
    setNewPlan(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setNewPlan(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = [...newPlan.features];
    newFeatures.splice(index, 1);
    setNewPlan(prev => ({ ...prev, features: newFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/insurance-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPlan.name,
          description: newPlan.description,
          price: parseFloat(newPlan.price),
          features: newPlan.features.filter(f => f.trim() !== ''),
          is_active: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create insurance plan');
      }

      const data = await response.json();
      setPlans(prev => [...prev, data]);
      setNewPlan({
        name: '',
        description: '',
        price: '',
        features: [''],
      });
      setSuccess('Plano de seguro criado com sucesso!');
    } catch (error) {
      console.error('Error creating insurance plan:', error);
      setError('Erro ao criar o plano de seguro. Por favor, tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este plano?')) {
      return;
    }

    try {
      const response = await fetch(`/api/insurance-plans?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete insurance plan');
      }

      setPlans(prev => prev.filter(plan => plan.id !== id));
      setSuccess('Plano de seguro excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting insurance plan:', error);
      setError('Erro ao excluir o plano de seguro. Por favor, tente novamente.');
    }
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
        Gerenciar Planos de Seguro
      </Typography>

      <form onSubmit={handleSubmit} className="mb-8">
        <Card className="mb-4">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nome do Plano"
                  name="name"
                  value={newPlan.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  name="description"
                  value={newPlan.description}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Preço (R$)"
                  name="price"
                  type="number"
                  value={newPlan.price}
                  onChange={handleInputChange}
                  required
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" className="mb-2">
                  Benefícios
                </Typography>
                {newPlan.features.map((feature, index) => (
                  <Grid container spacing={1} key={index} className="mb-2">
                    <Grid item xs={11}>
                      <TextField
                        fullWidth
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={1}>
                      <IconButton
                        color="error"
                        onClick={() => removeFeature(index)}
                        disabled={newPlan.features.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                ))}
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addFeature}
                  className="mt-2"
                >
                  Adicionar Benefício
                </Button>
              </Grid>
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={saving}
            >
              {saving ? 'Salvando...' : 'Criar Plano'}
            </Button>
          </CardActions>
        </Card>
      </form>

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
                  color="error"
                  fullWidth
                  onClick={() => handleDelete(plan.id)}
                >
                  Excluir Plano
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Container>
  );
} 