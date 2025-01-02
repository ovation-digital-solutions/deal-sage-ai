'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { parseCSV } from '@/lib/csvParser';

interface Property {
  id: number;
  address: string;
  purchase_price: number;
  current_value: number;
  purchase_date: string;
  notes: string | null;
}

export default function PortfolioPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Property | null>(null);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('/api/portfolio');
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        const data = await response.json();
        setProperties(data.properties);
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error('Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const newProperties = await parseCSV(text);

      const response = await fetch('/api/portfolio/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ properties: newProperties }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setProperties(prevProperties => [...prevProperties, ...data.properties]);
      toast.success(`Successfully uploaded ${data.properties.length} properties`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload portfolio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      setProperties(properties.filter(p => p.id !== id));
      toast.success('Property deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete property');
    }
  };

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setEditForm(property);
  };

  const handleSave = async () => {
    if (!editForm) return;

    try {
      const response = await fetch(`/api/portfolio/${editForm.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update property');

      setProperties(properties.map(p => 
        p.id === editForm.id ? editForm : p
      ));
      setEditingId(null);
      setEditForm(null);
      toast.success('Property updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update property');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Portfolio</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-500">
            Manage and track your real estate investments
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-8">
          <div className="max-w-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <a
                href="/portfolio-template.csv"
                download
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 underline"
              >
                <svg 
                  className="w-4 h-4 mr-2" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download CSV Template
              </a>
              
              <div className="flex-1 max-w-sm">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Portfolio CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-black file:text-white
                      hover:file:bg-gray-800
                      disabled:opacity-50"
                  />
                </label>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              CSV should include: address, purchase_price, current_value, purchase_date, notes
            </p>
          </div>
        </div>

        {/* Portfolio List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading portfolio...</div>
          ) : properties.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No properties in portfolio yet</div>
          ) : (
            <div className="overflow-x-auto">
              {/* Mobile View */}
              <div className="sm:hidden">
                {properties.map((property) => (
                  <div key={property.id} className="p-4 border-b border-gray-200">
                    {editingId === property.id ? (
                      // Edit mode - Mobile
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-500">Address</label>
                          <input
                            type="text"
                            value={editForm?.address || ''}
                            onChange={e => setEditForm(prev => prev ? {...prev, address: e.target.value} : null)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500">Purchase Price</label>
                            <input
                              type="number"
                              value={editForm?.purchase_price || 0}
                              onChange={e => setEditForm(prev => prev ? {...prev, purchase_price: Number(e.target.value)} : null)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500">Current Value</label>
                            <input
                              type="number"
                              value={editForm?.current_value || 0}
                              onChange={e => setEditForm(prev => prev ? {...prev, current_value: Number(e.target.value)} : null)}
                              className="w-full px-2 py-1 border rounded text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Purchase Date</label>
                          <input
                            type="date"
                            value={editForm?.purchase_date?.split('T')[0] || ''}
                            onChange={e => setEditForm(prev => prev ? {...prev, purchase_date: e.target.value} : null)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Notes</label>
                          <input
                            type="text"
                            value={editForm?.notes || ''}
                            onChange={e => setEditForm(prev => prev ? {...prev, notes: e.target.value} : null)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            onClick={handleSave}
                            className="px-3 py-1 text-sm text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditForm(null);
                            }}
                            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode - Mobile
                      <div className="space-y-2">
                        <div className="font-medium text-gray-900">{property.address}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <div className="text-gray-500">Purchase Price</div>
                            <div className="font-medium">${property.purchase_price.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-500">Current Value</div>
                            <div className="font-medium">${property.current_value.toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-gray-500">Purchase Date</div>
                          <div>{new Date(property.purchase_date).toLocaleDateString()}</div>
                        </div>
                        {property.notes && (
                          <div className="text-sm">
                            <div className="text-gray-500">Notes</div>
                            <div>{property.notes}</div>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2 pt-2">
                          <button
                            onClick={() => handleEdit(property)}
                            className="px-3 py-1 text-sm text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(property.id)}
                            className="px-3 py-1 text-sm text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {properties.map((property) => (
                    <tr key={property.id}>
                      {editingId === property.id ? (
                        // Edit mode
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm?.address || ''}
                              onChange={e => setEditForm(prev => prev ? {...prev, address: e.target.value} : null)}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editForm?.purchase_price || 0}
                              onChange={e => setEditForm(prev => prev ? {...prev, purchase_price: Number(e.target.value)} : null)}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="number"
                              value={editForm?.current_value || 0}
                              onChange={e => setEditForm(prev => prev ? {...prev, current_value: Number(e.target.value)} : null)}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="date"
                              value={editForm?.purchase_date?.split('T')[0] || ''}
                              onChange={e => setEditForm(prev => prev ? {...prev, purchase_date: e.target.value} : null)}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={editForm?.notes || ''}
                              onChange={e => setEditForm(prev => prev ? {...prev, notes: e.target.value} : null)}
                              className="w-full px-2 py-1 border rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={handleSave}
                              className="text-green-600 hover:text-green-900"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditForm(null);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              Cancel
                            </button>
                          </td>
                        </>
                      ) : (
                        // View mode
                        <>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{property.address}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${property.purchase_price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${property.current_value.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(property.purchase_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{property.notes}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleEdit(property)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
