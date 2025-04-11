'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar';

interface Slide {
  image: string;
  title: string;
  description: string;
  buttonLink: string;
}

export default function SlidesAdminPage() {
  // Initialize slides with unique objects, including a buttonLink field
  const [slides, setSlides] = useState<Slide[]>(
    Array.from({ length: 6 }, () => ({ 
      image: '', 
      title: '', 
      description: '', 
      buttonLink: '' // Add buttonLink field
    }))
  );

  const handleInputChange = (index: number, field: keyof Slide, value: string) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value }; // Create a new object for the updated slide
    setSlides(updatedSlides);
    console.log(`Updated slide ${index}:`, updatedSlides[index]); // Debugging
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) {
      alert('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error('No image URL returned');
      }

      const updatedSlides = [...slides];
      updatedSlides[index] = { ...updatedSlides[index], image: data.imageUrl }; // Create a new object for the updated slide
      setSlides(updatedSlides);
      console.log(`Uploaded image for slide ${index}:`, data.imageUrl); // Debugging
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSave = () => {
    console.log('Saving slides:', slides); // Debugging
    localStorage.setItem('slides', JSON.stringify(slides));
    alert('Slides saved successfully!');
  };

  return (
    <>
      <Navbar />
      <div className="p-8 mt-24">
        <h1 className="text-3xl font-bold mb-8">Cadastro de Slides</h1>
        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-4">Slide {index + 1}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Imagem</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleImageUpload(index, e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 border rounded text-black"
                  />
                  {slide.image && (
                    <img src={slide.image} alt={`Slide ${index + 1}`} className="mt-2 w-32 h-auto" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => handleInputChange(index, 'title', e.target.value)}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    value={slide.description}
                    onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link do Botão</label>
                  <input
                    type="text"
                    value={slide.buttonLink}
                    onChange={(e) => handleInputChange(index, 'buttonLink', e.target.value)}
                    className="w-full p-2 border rounded text-black"
                    placeholder="Cadastre uma URL para o botão 'Saiba Mais'"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-8 bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
        >
          Salvar Slides
        </button>
      </div>
    </>
  );
}