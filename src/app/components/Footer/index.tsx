"use client";

import React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto', // Pushes footer to the bottom
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 1 }}>
          © {new Date().getFullYear()} Medsafe. Todos os direitos reservados.
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          <Link href="tel:08005447000" color="inherit" underline="hover">
            Telefone: 0800 544 7000
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;