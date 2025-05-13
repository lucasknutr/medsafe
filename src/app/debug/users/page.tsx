'use client';

import { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Button, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RoleCounts {
  [key: string]: number;
}

export default function DebugUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roleCounts, setRoleCounts] = useState<RoleCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; email: string; newPassword: string }>({
    open: false,
    email: '',
    newPassword: 'password123'
  });
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/debug-users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to fetch users');
      }
      
      setUsers(data.users);
      setRoleCounts(data.roleCounts);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching users');
      setSnackbar({
        open: true,
        message: err instanceof Error ? err.message : 'An error occurred while fetching users',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (email: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: 'password123' }),
      });

      const data = await response.json();
      alert(`Login attempt result: ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      alert(`Login error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSetAdmin = async (email: string) => {
    try {
      const response = await fetch('/api/debug-set-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: `User ${email} is now an ADMIN`,
          severity: 'success'
        });
        // Refresh the user list
        fetchUsers();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.error || 'Unknown error'}`,
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleOpenResetPasswordDialog = (email: string) => {
    setResetPasswordDialog({
      open: true,
      email,
      newPassword: 'password123'
    });
  };

  const handleCloseResetPasswordDialog = () => {
    setResetPasswordDialog({
      ...resetPasswordDialog,
      open: false
    });
  };

  const handleResetPassword = async () => {
    try {
      const response = await fetch('/api/debug-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetPasswordDialog.email,
          newPassword: resetPasswordDialog.newPassword
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSnackbar({
          open: true,
          message: `Password reset successfully for ${resetPasswordDialog.email}`,
          severity: 'success'
        });
        handleCloseResetPasswordDialog();
      } else {
        setSnackbar({
          open: true,
          message: `Error: ${data.error || 'Unknown error'}`,
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleDeleteUser = async (userId: number, userEmail: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail} (ID: ${userId})? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        setSnackbar({
          open: true,
          message: `User ${userEmail} (ID: ${userId}) deleted successfully.`,
          severity: 'success'
        });
        // Refresh the user list
        fetchUsers();
      } else {
        setSnackbar({
          open: true,
          message: `Error deleting user: ${data.error || 'Unknown error'}`,
          severity: 'error'
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography color="error">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#1976d2', mb: 4 }}>
          Debug: All Users
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6">User Counts by Role:</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            {Object.entries(roleCounts).map(([role, count]) => (
              <Paper key={role} sx={{ p: 2, bgcolor: role === 'ADMIN' ? '#e3f2fd' : '#f5f5f5' }}>
                <Typography variant="subtitle1">
                  {role}: {count}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Função</TableCell>
                <TableCell>Data de Registro</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Typography 
                      sx={{ 
                        color: user.role === 'ADMIN' ? 'primary.main' : 'text.primary',
                        fontWeight: user.role === 'ADMIN' ? 'bold' : 'normal'
                      }}
                    >
                      {user.role}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => handleTestLogin(user.email)}
                      >
                        Test Login
                      </Button>
                      <Button 
                        variant="outlined" 
                        color="secondary"
                        size="small"
                        onClick={() => handleOpenResetPasswordDialog(user.email)}
                      >
                        Reset Password
                      </Button>
                      {user.role !== 'ADMIN' && (
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          onClick={() => handleSetAdmin(user.email)}
                        >
                          Set Admin
                        </Button>
                      )}
                      <Button 
                        variant="contained" 
                        color="error"
                        size="small"
                        onClick={() => handleDeleteUser(user.id, user.email)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={resetPasswordDialog.open} onClose={handleCloseResetPasswordDialog}>
        <DialogTitle>Reset Password for {resetPasswordDialog.email}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Password"
            type="text"
            fullWidth
            variant="outlined"
            value={resetPasswordDialog.newPassword}
            onChange={(e) => setResetPasswordDialog({ ...resetPasswordDialog, newPassword: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetPasswordDialog}>Cancel</Button>
          <Button onClick={handleResetPassword} color="primary">Reset</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 