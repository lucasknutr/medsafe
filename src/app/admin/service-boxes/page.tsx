'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';

interface ServiceBox {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  order: number;
}

export default function ServiceBoxesPage() {
  const [serviceBoxes, setServiceBoxes] = useState<ServiceBox[]>([]);
  const [editingBox, setEditingBox] = useState<ServiceBox | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    order: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchServiceBoxes();
  }, []);

  const fetchServiceBoxes = async () => {
    try {
      const response = await fetch('/api/service-boxes');
      const data = await response.json();
      setServiceBoxes(data);
    } catch (error) {
      console.error('Error fetching service boxes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBox) {
        await fetch(`/api/service-boxes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, id: editingBox.id })
        });
      } else {
        await fetch('/api/service-boxes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      fetchServiceBoxes();
      setIsModalOpen(false);
      setEditingBox(null);
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        link: '',
        order: 0
      });
    } catch (error) {
      console.error('Error saving service box:', error);
    }
  };

  const handleEdit = (box: ServiceBox) => {
    setEditingBox(box);
    setFormData(box);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service box?')) return;
    try {
      await fetch(`/api/service-boxes?id=${id}`, { method: 'DELETE' });
      fetchServiceBoxes();
    } catch (error) {
      console.error('Error deleting service box:', error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Service Boxes</h1>
          <button
            onClick={() => {
              setEditingBox(null);
              setFormData({
                title: '',
                description: '',
                imageUrl: '',
                link: '',
                order: 0
              });
              setIsModalOpen(true);
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add New Box
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceBoxes.map((box) => (
            <div key={box.id} className="border rounded-lg p-4">
              <img src={box.imageUrl} alt={box.title} className="w-full h-48 object-cover rounded mb-4" />
              <h3 className="text-xl font-semibold mb-2">{box.title}</h3>
              <p className="text-gray-600 mb-4">{box.description}</p>
              <p className="text-sm text-gray-500 mb-4">Link: {box.link}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(box)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(box.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">
                {editingBox ? 'Edit Service Box' : 'Add New Service Box'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Link</label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 