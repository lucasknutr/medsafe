'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCookies } from 'react-cookie';
import React from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Paper, Button } from '@mui/material';
import doctorBanner from '../../assets/doctor-banner.jpg';
import hosp1 from '../../assets/hosp1.jpg';
import hosp2 from '../../assets/hosp2.jpg';
import contactImage from '../../assets/contact-image.jpg';

const Carousel = dynamic(() => import('react-material-ui-carousel'), {
  ssr: false,
});

interface ServiceBox {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  order: number;
}

interface Slide {
  id?: number;
  image: string;
  title: string;
  description: string;
  buttonLink: string;
  order?: number;
}

// Hardcoded service boxes
const hardcodedServiceBoxes: ServiceBox[] = [
  {
    id: 1,
    title: "Contrate Agora",
    description: "Proteção completa para profissionais de saúde contra reclamações e processos.",
    imageUrl: "/images/contract.jpg",
    link: "https://medsafeconsultoria.com.br/seguros",
    order: 1
  },
  {
    id: 2,
    title: "Reportar Ocorrência",
    description: "Reportar ocorrência em detalhes para que possamos agir de forma adequada.",
    imageUrl: "/images/plans.jpg",
    link: "https://medsafeconsultoria.com.br/comunicar-processo",
    order: 2
  },
  {
    id: 3,
    title: "Planos e Valores",
    description: "Verifique os planos e valores de cada seguro.",
    imageUrl: "/images/report.jpg",
    link: "https://medsafeconsultoria.com.br/seguros",
    order: 3
  },
  {
    id: 4,
    title: "Trabalhe Conosco",
    description: "Entre em contato para saber mais sobre as vagas disponíveis.",
    imageUrl: "/images/work.jpg",
    link: "https://medsafeconsultoria.com.br/#contact-section",
    order: 4
  }
];

const Dashboard = () => {
  const [serviceBoxes, setServiceBoxes] = useState<ServiceBox[]>(hardcodedServiceBoxes);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [cookies] = useCookies(['role']);
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const stats = [
    { value: '801.720', description: 'Processos sobre saúde pendentes de julgamento no Brasil. Fonte: CNJ' },
    { value: '35%', description: 'Um aumento preocupante de 35% nos números comparativos de 3 anos atrás.' },
    { value: '306.000', description: 'Processos sobre saúde chegaram a justiça apenas no ano de 2024.' },
    { value: '20%', description: 'A cada 5 médicos no Brasil, 1 é processado na justiça (20%). Há 15 anos, este número era próximo a 6%.' },
  ];

  useEffect(() => {
    // Fetch slides from the API
    fetchSlides();
  }, []);

  // Check for scroll parameter in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('scroll') === 'contact') {
        const contactSection = document.getElementById('contact-section');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  }, []);

  const fetchSlides = async () => {
    try {
      console.log('Fetching slides from API...');
      const response = await fetch('/api/slides');
      console.log('Slides response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received slides:', data);
      
      if (Array.isArray(data) && data.length > 0) {
        setSlides(data);
      } else {
        console.log('No slides found or invalid data format');
        // Set default slides if none are found
        setSlides([
          {
            image: doctorBanner.src,
            title: 'Proteção Jurídica para Profissionais de Saúde',
            description: 'Oferecemos consultoria especializada para médicos e profissionais de saúde.',
            buttonLink: '/register',
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
      // Set default slides on error
      setSlides([
        {
          image: doctorBanner.src,
          title: 'Proteção Jurídica para Profissionais de Saúde',
          description: 'Oferecemos consultoria especializada para médicos e profissionais de saúde.',
          buttonLink: '/register',
        }
      ]);
    }
  };

  const handleBoxClick = (link: string) => {
    if (!cookies.role) {
      router.push('/register');
    } else {
      router.push(link);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Clear form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });

      alert('Mensagem enviada com sucesso!');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Por favor, tente novamente.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <div className='first-banner w-full max-w-[85svw] my-0 mx-auto font-amelia pt-4'>
        {slides.length > 0 && (
          <Carousel className="h-[70svh] mb-8">
            {slides.map((slide, i) => (
              <Paper key={i} className="relative h-[70svh] w-[85svw]">
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
                    onClick={() => window.open(slide.buttonLink, '_blank')}
                    className='bg-blue-500 py-2 px-5 rounded-md text-2xl mt-10 hover:bg-white hover:scale-[1] hover:border-blue-500 border-2 hover:text-blue-500'
                  >
                    Saiba mais
                  </button>
                </div>
              </Paper>
            ))}
          </Carousel>
        )}
      </div>

      <div className="grid grid-cols-4 gap-8 mx-40 mb-8 text-lg">
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
          {serviceBoxes.map((box) => (
            <div
              key={box.id}
              onClick={() => handleBoxClick(box.link)}
              className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48">
                <Image
                  src={box.imageUrl}
                  alt={box.title}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{box.title}</h3>
                <p className="text-gray-600">{box.description}</p>
              </div>
            </div>
          ))}
        </div>
        <button className='mx-auto px-6 py-4 bg-black text-white rounded-md hover:bg-white hover:text-black border-2 border-black hover:scale-[1]'>Todos os serviços</button>
      </div>

      <div id="contact-section" className='h-[100svh] w-[100svw] bg-slate-300 flex justify-center items-center'>
        <div className='flex justify-center items-center w-[80%] max-w-6xl'>
          {/* Form Section */}
          <div className='bg-white p-8 rounded-lg shadow-lg w-1/2 h-[87svh]' style={{ background: "rgba(255,255,255,.5)" }}>
            <h2 className='text-5xl font-bold mb-6 text-center text-slate-700'>Contato</h2>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-xl font-medium text-gray-700'>Nome</label>
                <input
                  type='text'
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                />
              </div>
              <div>
                <label className='block text-xl font-medium text-gray-700'>E-mail</label>
                <input
                  type='email'
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                />
              </div>
              <div>
                <label className='block text-xl font-medium text-gray-700'>Telefone</label>
                <input
                  type='tel'
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black'
                />
              </div>
              <div>
                <label className='block text-xl font-medium text-gray-700'>Mensagem</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
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

          {/* Image Section */}
          <div className='w-1/2 flex justify-center items-center rounded-lg lg:block hidden'>
            <Image
              src={contactImage}
              alt="Medica"
              className='w-full h-full object-cover rounded-lg'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;