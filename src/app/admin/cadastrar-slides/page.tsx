'use client';
import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';

interface Slide {
  id?: number;
  image: string;
  title: string;
  description: string;
  buttonLink: string;
  order: number;
}

export default function SlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slides');
      const data = await response.json();
      setSlides(data);
    } catch (error) {
      console.error('Error fetching slides:', error);
      alert('Failed to fetch slides');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, field: keyof Slide, value: string) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setSlides(updatedSlides);
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
      updatedSlides[index] = { ...updatedSlides[index], image: data.imageUrl };
      setSlides(updatedSlides);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    }
  };

  const handleSave = async () => {
    try {
      // Delete all existing slides
      await fetch('/api/slides?id=all', { method: 'DELETE' });

      // Create new slides
      for (const slide of slides) {
        await fetch('/api/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slide),
        });
      }

      alert('Slides saved successfully!');
      fetchSlides(); // Refresh the slides
    } catch (error) {
      console.error('Error saving slides:', error);
      alert('Failed to save slides');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 mt-24">
          <p>Loading...</p>
        </div>
      </>
    );
  }

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
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link do Botão</label>
                  <input
                    type="text"
                    value={slide.buttonLink}
                    onChange={(e) => handleInputChange(index, 'buttonLink', e.target.value)}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Ordem</label>
                  <input
                    type="number"
                    value={slide.order}
                    onChange={(e) => handleInputChange(index, 'order', e.target.value)}
                    className="w-full p-2 border rounded text-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handleSave}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Salvar Slides
        </button>
      </div>
    </>
  );
}