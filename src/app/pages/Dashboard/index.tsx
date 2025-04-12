'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  image: string;
  title: string;
  description: string;
  buttonLink: string;
}

const Dashboard = () => {
  const [serviceBoxes, setServiceBoxes] = useState<ServiceBox[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [cookies] = useCookies(['role']);
  const router = useRouter();
  const searchParams = useSearchParams();
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
    // Load slides from localStorage only on client side
    const storedSlides = localStorage.getItem('slides');
    if (storedSlides) {
      setSlides(JSON.parse(storedSlides));
    } else {
      setSlides(Array(6).fill({
        image: '',
        title: 'Default Title',
        description: 'Default Description',
        buttonLink: '',
      }));
    }
  }, []);

  useEffect(() => {
    fetchServiceBoxes();
    // Check if we should scroll to the contact form
    if (searchParams.get('scroll') === 'contact') {
      const contactSection = document.getElementById('contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [searchParams]);

  const fetchServiceBoxes = async () => {
    try {
      console.log('Fetching service boxes...');
      const response = await fetch('/api/service-boxes');
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Received service boxes:', data);
      if (!Array.isArray(data)) {
        console.error('Expected array of service boxes but got:', data);
        setServiceBoxes([]);
        return;
      }
      setServiceBoxes(data);
    } catch (error) {
      console.error('Error fetching service boxes:', error);
      setServiceBoxes([]);
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
    <div className="w-full">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mx-4 md:mx-10 lg:mx-40 mb-8 text-lg">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-blue-900">{stat.value}</h1>
            <p className="mt-2 text-gray-700">{stat.description}</p>
          </div>
        ))}
      </div>
      <div className='second-banner py-8 bg-slate-200 min-h-[100svh] grid grid-cols-1 md:grid-cols-3 text-black items-center px-4 md:px-10 lg:px-40 gap-8'>
        <div className='flex flex-col gap-16 text-xl'>
          <h1 className='text-4xl md:text-6xl font-bold'>Sobre</h1>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mx-4 md:mx-10 lg:mx-40 my-8">
        {serviceBoxes.map((box) => (
          <div
            key={box.id}
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
            onClick={() => handleBoxClick(box.link)}
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
              <h3 className="text-xl font-bold mb-2">{box.title}</h3>
              <p className="text-gray-600">{box.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div id="contact-section" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Entre em Contato</h2>
              <p className="text-gray-600 mb-8">
                Tem alguma dúvida ou precisa de ajuda? Preencha o formulário abaixo e entraremos em contato o mais breve possível.
              </p>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={contactImage}
                  alt="Contato"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            </div>
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Enviar Mensagem
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;