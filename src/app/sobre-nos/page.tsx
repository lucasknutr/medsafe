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
              boxShadow: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
              backdropFilter: 'blur( 4px )',
              WebkitBackdropFilter: 'blur( 4px )',
              border: '1px solid rgba( 255, 255, 255, 0.18 )',
              color: 'text.primary', 
              mt: -11 
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

            <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 4, color: 'primary.main' }}>
              QUEM SOMOS
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              A MEDSAFE é formada por uma equipe altamente qualificada e especializada em questões relativas a área médica e da saúde, atuando de forma preventiva, consultiva e defensiva de modo a proporcionar aos profissionais da medicina um suporte completo e personalizado, visando a prevenção e contenção de eventuais danos patrimoniais e a imagem desses profissionais.
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              Em um cenário cada vez mais difícil ao pleno e efetivo exercício da atividade médica, atuamos de forma estratégica, com foco na mitigação de riscos legais, no esclarecimento de responsabilidades e na construção de uma prática médica mais protegida e consciente.
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 4 }}>
              Nossa missão é que o profissional da medicina possa atuar com tranquilidade, confiança e excelência, sabendo que conta com o respaldo de uma equipe sólida, experiente e comprometida com a valorização da prática médica.
            </Typography>

            <Typography variant="h4" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 4, mt: 6, color: 'primary.main' }}>
              PLANO DE SERVIÇOS
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              A MEDSAFE disponibiliza um plano completo de serviços*, em que o profissional da medicina poderá ter a tranquilidade de contar com suporte consultivo, preventivo, defensivo e financeiro em face das mais variadas e eventuais imputações de responsabilidade médica.
            </Typography>

            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              Neste plano, encontram-se inclusos, dentre outros benefícios:
            </Typography>

            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Assessoria especializada consultiva, preventiva e defensiva em questões cíveis, éticas ou criminais decorrentes do exercício da atividade profissional;
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Custeio de eventuais custas judiciais e honorários periciais;
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Suporte financeiro em honorários sucumbenciais e indenizações por danos morais, materiais, corporais e/ou lucros cessantes decorrentes de eventuais condenações transitadas em julgado;
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Disponibilidade de pronto atendimento através do telefone 0800 544 7000, 24 (vinte e quatro) horas por dia, 07 (sete) vezes por semana.
              </Typography>
            </Box>

            <Typography variant="caption" display="block" sx={{ mt: 4, fontStyle: 'italic' }}>
              *A MEDSAFE conta, ainda, com condições e preços especiais para sociedades, associações, conselhos, cooperativas e demais entidades médicas. Consulte-nos para mais informações.
            </Typography>

          </Paper>
        </Container>
      </Box>
    </Layout>
  );
} 