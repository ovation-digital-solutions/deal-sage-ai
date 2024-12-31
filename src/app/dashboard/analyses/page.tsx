'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import Image from 'next/image';

interface Property {
  id: string;
  address: string;
  price: number;
  image_url: string;
}

interface Analysis {
  id: number;
  property_data: Property[];
  analysis_text: string;
  created_at: string;
}

export default function AnalysesPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch('/api/analyses');
        if (response.status === 401) {
          router.push('/login');
          return;
        }
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        setAnalyses(data.analyses);
      } catch (error) {
        console.error('Error fetching analyses:', error);
        toast.error('Failed to load analyses');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, [router]);

  const handleDelete = async (analysisId: number) => {
    try {
      const response = await fetch(`/api/analyses?id=${analysisId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete analysis');
      }

      setAnalyses(prev => prev.filter(analysis => analysis.id !== analysisId));
      toast.success('Analysis deleted successfully');
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Property Analyses History</h1>
      
      {analyses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No analyses found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {analyses.map((analysis) => (
            <div key={analysis.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Comparison Analysis
                  </h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(analysis.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(analysis.id)}
                  className="px-4 py-2 text-sm bg-red-100 text-red-600 rounded-lg 
                           hover:bg-red-200 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Analysis
                </button>
              </div>
              
              {/* Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {analysis.property_data.map((property: Property) => (
                  <div key={property.id} className="p-4 bg-gray-50 rounded-lg">
                    {property.image_url && (
                      <div className="relative w-full h-40 mb-3">
                        <Image
                          src={property.image_url}
                          alt={property.address}
                          fill
                          className="object-cover rounded-lg"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    )}
                    <h4 className="font-medium">{property.address}</h4>
                    <p className="text-sm text-gray-600">${property.price.toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Analysis Text */}
              <div className="prose max-w-none">
                {analysis.analysis_text.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700">{paragraph}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
