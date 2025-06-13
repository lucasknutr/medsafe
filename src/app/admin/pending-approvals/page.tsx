'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Box,
} from '@mui/material';

// Define the type for a pending subscription, including user details
interface PendingSubscription {
  id: number;
  plan: string;
  status: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

// A simple function to make status strings more user-friendly
const translateStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    PENDING: 'Pendente',
    PENDING_PAYMENT: 'Pagamento Pendente',
    PENDING_DOCUMENT: 'Documento Pendente',
    PENDING_APPROVAL: 'Aprovação Pendente',
  };
  return statusMap[status] || status;
};

export default function PendingApprovalsPage() {
  const [subscriptions, setSubscriptions] = useState<PendingSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPendingSubscriptions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/pending-approvals');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setSubscriptions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSubscriptions();
  }, []);

  const handleUpdateStatus = async (id: number, status: 'ACTIVE' | 'CANCELED') => {
    // Optimistically remove the item from the list
    const originalSubscriptions = [...subscriptions];
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));

    try {
      const response = await fetch('/api/update-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId: id, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      // If the API call fails, revert the change in the UI
      setSubscriptions(originalSubscriptions);
    }
  };

  const handleApprove = (id: number) => {
    handleUpdateStatus(id, 'ACTIVE');
  };

  const handleReject = (id: number) => {
    handleUpdateStatus(id, 'CANCELED');
  };

  if (loading) {
    return (
      <Layout>
        <Container className="py-8">
          <Box className="flex justify-center">
            <CircularProgress />
          </Box>
        </Container>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Container className="py-8">
          <Alert severity="error">{error}</Alert>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container className="py-8">
        <Typography variant="h4" component="h1" gutterBottom>
          Aprovações Pendentes
        </Typography>
        {subscriptions.length === 0 ? (
          <Typography>Nenhuma assinatura pendente no momento.</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Plano</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>{sub.user.name}</TableCell>
                    <TableCell>{sub.user.email}</TableCell>
                    <TableCell>{sub.plan}</TableCell>
                    <TableCell>{translateStatus(sub.status)}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleApprove(sub.id)}
                        style={{ marginRight: '8px' }}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleReject(sub.id)}
                      >
                        Rejeitar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
}