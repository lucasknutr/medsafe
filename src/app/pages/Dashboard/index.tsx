import React from 'react';
import Image from 'next/image';
import Carousel from 'react-material-ui-carousel';
import { Paper, Button } from '@mui/material';
import doctorBanner from '../../assets/doctor-banner.jpg';
import hosp1 from '../../assets/hosp1.jpg';
import hosp2 from '../../assets/hosp2.jpg';
import contactImage from '../../assets/contact-image.jpg';

const Dashboard = () => {
  const stats = [
    { value: '25 mil', description: 'O Brasil registrou cerca de 25 mil processos por “erro médico” no último ano.' },
    { value: '35%', description: 'Um aumento preocupante de 35% nos números comparativo de 3 anos atrás.' },
    { value: '35 mil', description: 'O valor médio da indenização por danos morais em processos por erro médico no país é de R$ 35.0000.' },
    { value: '20%', description: 'A cada 5 médicos no Brasil, 1 é processado na justiça (20%). Há 15 anos, este número era próximo a 6%.' },
  ];

  // Fetch slides from localStorage
  const slides = JSON.parse(localStorage.getItem('slides')) || Array(6).fill({
    image: '',
    title: 'Default Title',
    description: 'Default Description',
    buttonLink: '', // Add buttonLink field
  });

  return (
    <>
      <div className='first-banner mx-40 mt-1 relative aspect-[16/9] w-full max-w-[1400px] my-0 mx-auto'>
        <Carousel>
          {slides.map((slide, i) => (
            <Paper key={i} className="relative h-[70svh] w-[75svw]">
              <div className="absolute inset-0 w-full h-[70svh]">
                {slide.image && (
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                )}
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center items-start p-8 text-white pr-20" style={{ background: "rgba(255,255,255,.6)" }}>
                <h1 className='text-6xl font-bold mb-4 text-blue-900'>{slide.title}</h1>
                <p className='text-2xl text-slate-900 mt-5'>{slide.description}</p>
                <button
                  onClick={() => window.open(slide.buttonLink, '_blank')} // Redirect to the buttonLink
                  className='bg-blue-500 py-2 px-5 rounded-md text-2xl mt-10 hover:bg-white hover:scale-[1] hover:border-blue-500 border-2 hover:text-blue-500'
                >
                  Saiba mais
                </button>
              </div>
            </Paper>
          ))}
        </Carousel>
      </div>

      <div className="grid grid-cols-4 gap-8 mx-40 my-8 text-lg">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-900">{stat.value}</h1>
            <p className="mt-2 text-gray-700">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className='second-banner py-8 bg-slate-200 h-[100svh] grid grid-cols-3 text-black items-center px-40 gap-8'>
        <div className='flex flex-col gap-16 text-xl'>
          <h1 className='text-6xl font-bold'>Sobre</h1>
          <p>Uma solução para simplificar o seu dia a dia. A sua plataforma completa para gerenciar seguros, processos jurídicos e muito mais, de forma simples e eficiente.</p>
          <button className='mr-auto px-6 py-4 bg-black text-white rounded-md hover:bg-white hover:text-black border-2 border-black hover:scale-[1]'>Saiba mais</button>
        </div>
        <div className='rounded'>
          <Image src={hosp1} alt="Imagem de Hospital" className='rounded-xl' />
        </div>
        <div>
          <Image src={hosp2} alt="Imagem de Hospital" className='rounded-xl' />
        </div>
      </div>

      <div className='w-[100svw] h-[100svh] text-center text-slate-800 px-8 flex flex-col items-center justify-center gap-20' style={{ background: "#1bb4ad" }}>
        <h1 className='text-6xl font-bold'>Serviços</h1>
        <div className='grid grid-cols-4 gap-8'>
          {Array(4).fill().map((_, index) => (
            <div key={index} className='h-[50svh] px-8 w-[20svw] bg-slate-100 rounded-lg flex flex-col items-center justify-center gap-8'>
              <div className='rounded-full bg-black h-[4svh] w-[10%]'></div>
              <h1 className='text-3xl font-bold'>Titulo de Servico Teste</h1>
              <p>Uma rapida descricao do que o servico prestado faz.</p>
            </div>
          ))}
        </div>
        <button className='mx-auto px-6 py-4 bg-black text-white rounded-md hover:bg-white hover:text-black border-2 border-black hover:scale-[1]'>Todos os serviços</button>
      </div>

      <div className='h-[100svh] w-[100svw] bg-slate-300 flex justify-center items-center'>
        <div className='flex justify-center items-center w-[80%] max-w-6xl'>
          <div className='bg-white p-8 rounded-lg shadow-lg w-1/2 h-[87svh]' style={{ background: "rgba(255,255,255,.5)" }}>
            <h2 className='text-5xl font-bold mb-6 text-center text-slate-700'>Contato</h2>
            <form className='space-y-4'>
              <div>
                <label className='block text-xl font-medium text-gray-700'>Nome</label>
                <input
                  type='text'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                />
              </div>
              <div>
                <label className='block text-xl font-medium text-gray-700'>E-mail</label>
                <input
                  type='email'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                />
              </div>
              <div>
                <label className='block text-xl font-medium text-gray-700'>Telefone</label>
                <input
                  type='tel'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                />
              </div>
              <div>
                <label className='block text-xl font-medium text-gray-700'>Mensagem</label>
                <textarea
                  rows='4'
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                ></textarea>
              </div>
              <button
                type='submit'
                className='w-full font-bold bg-blue-400 text-white py-2 px-4 rounded-md hover:scale-[1] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 hover:text-white'
              >
                Enviar
              </button>
            </form>
          </div>
          <div className='w-1/2 flex justify-center items-center rounded-lg'>
            <Image
              src={contactImage}
              alt="Medica"
              className='w-full h-auto rounded-lg'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;