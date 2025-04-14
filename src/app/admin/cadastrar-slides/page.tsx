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

const defaultSlide: Slide = {
  image: '',
  title: '',
  description: '',
  buttonLink: '',
  order: 1
};

export default function SlidesAdminPage() {
  const [slides, setSlides] = useState<Slide[]>([defaultSlide]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/slides');
      if (!response.ok) {
        throw new Error('Failed to fetch slides');
      }
      const data = await response.json();
      setSlides(data.length > 0 ? data : [defaultSlide]);
    } catch (error) {
      console.error('Error fetching slides:', error);
      setError('Failed to fetch slides. Please try again.');
      setSlides([defaultSlide]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (index: number, field: keyof Slide, value: string | number) => {
    const updatedSlides = [...slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setSlides(updatedSlides);
  };

  const handleImageUpload = async (index: number, file: File | null) => {
    if (!file) {
      alert('No file selected');
      return;
    }

    setUploading(index);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
      
      const data = await response.json();

      if (!data.imageUrl) {
        throw new Error('No image URL returned');
      }

      const updatedSlides = [...slides];
      updatedSlides[index] = { ...updatedSlides[index], image: data.imageUrl };
      setSlides(updatedSlides);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error instanceof Error ? error.message : 'Failed to upload image. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Delete all existing slides
      const deleteResponse = await fetch('/api/slides?id=all', { 
        method: 'DELETE',
      });

      if (!deleteResponse.ok) {
        const deleteError = await deleteResponse.json();
        throw new Error(deleteError.error || 'Failed to delete existing slides');
      }

      // Create new slides
      for (const slide of slides) {
        if (!slide.image || !slide.title || !slide.description || !slide.buttonLink) {
          throw new Error('Please fill in all required fields for each slide');
        }

        const response = await fetch('/api/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...slide,
            order: slide.order || 0
          }),
        });
        
        if (!response.ok) {
          const createError = await response.json();
          throw new Error(createError.error || 'Failed to create slide');
        }
      }

      alert('Slides saved successfully!');
      fetchSlides(); // Refresh the slides
    } catch (error) {
      console.error('Error saving slides:', error);
      setError(error instanceof Error ? error.message : 'Failed to save slides. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 mt-24">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="p-8 mt-24">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
          <button
            onClick={fetchSlides}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
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
            <div key={index} className="mb-8 p-6 bg-white rounded-lg shadow-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem {index + 1}
                </label>
                <div className="flex items-center space-x-4">
                  {slide.image && (
                    <img
                      src={slide.image}
                      alt={`Slide ${index + 1}`}
                      className="w-32 h-32 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(index, file);
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                      disabled={uploading === index}
                    />
                    {uploading === index && (
                      <p className="mt-2 text-sm text-blue-600">Uploading image...</p>
                    )}
                  </div>
                </div>
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
            </div>
          ))}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setSlides([...slides, { ...defaultSlide, order: slides.length + 1 }])}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Adicionar Slide
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Salvando...' : 'Salvar Slides'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}