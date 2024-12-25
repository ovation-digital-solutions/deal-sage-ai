'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardStats {
  totalProperties: number;
  analysesRun: number;
  marketUpdates: number;
  savedDeals: number;
}

interface PriceTrendData {
  month: string;
  pricePerSqft: number;
  avgPrice: number;
  avgSqft: number;
  count: number;
}

interface ActivityItem {
  type: 'analysis' | 'favorite' | 'comparison';
  property?: string;
  properties?: string[];
  date: string;
}

interface DashboardData {
  stats: DashboardStats;
  priceTrends: PriceTrendData[];
  activity: ActivityItem[];
}

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Only fetch data if authenticated
    if (isAuthenticated) {
      const fetchDashboardData = async () => {
        try {
          const response = await fetch('/api/dashboard');
          if (!response.ok) throw new Error('Failed to fetch dashboard data');
          const data = await response.json();
          setDashboardData(data);
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error('Failed to load dashboard data');
        } finally {
          setIsLoadingData(false);
        }
      };

      fetchDashboardData();
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="max-w-[2000px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          Analyze new properties and manage your saved deals.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-2 mr-4">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Properties</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.totalProperties}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-2 mr-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Analyses Run</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.analysesRun}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-2 mr-4">
              <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Market Updates</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.marketUpdates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-2 mr-4">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Saved Deals</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.stats.savedDeals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Market Metrics Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Property Metrics Over Time</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.priceTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => {
                    switch(name) {
                      case 'Price per sqft':
                        return [`$${value}/sqft`, name];
                      case 'Average Price':
                        return [`$${value.toLocaleString()}`, name];
                      case 'Average Size':
                        return [`${value.toLocaleString()} sqft`, name];
                      default:
                        return [value, name];
                    }
                  }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="pricePerSqft" 
                  name="Price per sqft"
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgPrice" 
                  name="Average Price"
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ fill: '#10B981' }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avgSqft" 
                  name="Average Size"
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
            {dashboardData.priceTrends?.[0] ? (
              <>
                <div className="text-center">
                  <p className="text-gray-600">Current Price/sqft</p>
                  <p className="font-semibold text-blue-600">
                    ${dashboardData.priceTrends[0].pricePerSqft || 0}/sqft
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Average Price</p>
                  <p className="font-semibold text-green-600">
                    ${(dashboardData.priceTrends[0].avgPrice || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-600">Average Size</p>
                  <p className="font-semibold text-yellow-600">
                    {(dashboardData.priceTrends[0].avgSqft || 0).toLocaleString()} sqft
                  </p>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                No property data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {dashboardData.activity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                {activity.type === 'analysis' && (
                  <div className="rounded-full bg-blue-100 p-2">
                    <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                )}
                {activity.type === 'favorite' && (
                  <div className="rounded-full bg-yellow-100 p-2">
                    <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {activity.type === 'analysis' && `Analyzed ${activity.property}`}
                    {activity.type === 'favorite' && `Added ${activity.property} to favorites`}
                    {activity.type === 'comparison' && `Compared ${activity.properties?.join(' and ')}`}
                  </p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
