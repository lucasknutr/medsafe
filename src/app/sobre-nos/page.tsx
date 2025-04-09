'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import Layout from '../components/Layout';
import Image from 'next/image';

export default function SobreNos() {
  return (
    <Layout>
      <Box sx={{ 
        minHeight: '100%'
      }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 6, 
              borderRadius: 2,
              bgcolor: 'white',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Box sx={{ 
              width: '100%', 
              height: '400px', 
              position: 'relative', 
              mb: 6,
              borderRadius: 2,
              overflow: 'hidden'
            }}>
              <Image
                src="/uploads/about-us-header.jpg"
                alt="Sobre a Medsafe"
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            </Box>

            <Typography
              variant="h2"
              component="h1"
              sx={{
                color: '#1976d2',
                mb: 4,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                fontWeight: 700,
                textAlign: 'center'
              }}
            >
              Sobre Nós
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                color: '#333'
              }}
            >
              Bem-vindo à Medsafe, uma empresa inovadora nascida em Fortaleza com a missão de transformar a forma como profissionais da saúde e instituições lidam com os desafios jurídicos e administrativos do setor. Diante de um cenário cada vez mais complexo, onde os processos judiciais relacionados à saúde crescem de forma alarmante, a Medsafe surge como uma solução completa, eficiente e simplificada para gerenciar seguros, processos jurídicos e outras demandas do dia a dia.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                color: '#333'
              }}
            >
              Nos últimos anos, o Brasil tem enfrentado um aumento preocupante de 35% nos processos sobre saúde pendentes de julgamento, segundo dados do Conselho Nacional de Justiça (CNJ). Apenas em 2024, mais de 306 mil novos casos chegaram à justiça, refletindo um sistema sobrecarregado e uma realidade desafiadora para médicos, clínicas e hospitais. Além disso, estatísticas mostram que, atualmente, 20% dos médicos no país são processados judicialmente – um número que triplicou em relação aos 6% registrados há 15 anos.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                color: '#333'
              }}
            >
              É nesse contexto que a Medsafe se destaca. Nossa plataforma foi desenvolvida para oferecer uma gestão integrada e personalizada, ajudando profissionais e instituições de saúde a reduzir riscos, otimizar tempo e focar no que realmente importa: cuidar das pessoas. Com tecnologia avançada e uma equipe especializada, proporcionamos ferramentas que simplificam desde a administração de seguros até a resolução de processos jurídicos, garantindo mais segurança e tranquilidade para nossos clientes.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                color: '#333'
              }}
            >
              Na Medsafe, acreditamos que a saúde e a justiça devem caminhar juntas de forma harmoniosa. Por isso, nos dedicamos a criar soluções que não apenas resolvem problemas, mas também previnem conflitos, promovendo um ambiente mais justo e eficiente para todos.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                color: '#333'
              }}
            >
              Somos mais do que uma empresa; somos parceiros na jornada de quem dedica sua vida a cuidar da saúde dos outros. Com transparência, inovação e compromisso, estamos aqui para transformar desafios em oportunidades e para garantir que o foco permaneça sempre no bem-estar das pessoas.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                mb: 4,
                fontSize: '1.1rem',
                lineHeight: 1.8,
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                color: '#333'
              }}
            >
              Junte-se à Medsafe e descubra como podemos simplificar o seu dia a dia, oferecendo a segurança e a eficiência que você merece.
            </Typography>

            <Typography
              variant="h5"
              sx={{
                color: '#1976d2',
                textAlign: 'center',
                fontFamily: '"Amelia UP W03 Regular", sans-serif',
                fontWeight: 700,
                fontStyle: 'italic'
              }}
            >
              Medsafe: Sua saúde jurídica em boas mãos.
            </Typography>
          </Paper>
        </Container>
      </Box>
    </Layout>
  );
} 