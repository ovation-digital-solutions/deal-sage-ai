'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

interface DashboardStats {
  totalProperties: number;
  analysesRun: number;
  savedDeals: number;
  propertiesCompared: number;
}

interface PriceTrendData {
  month: string;
  totalAnalysesRun: number;
  totalPropertiesAnalyzed: number;
  totalFavorites: number;
  rawDate: string;
}

interface ActivityItem {
  type: 'analysis' | 'favorite';
  property?: string;
  properties?: string[];
  comparisonCount?: number;
  isComparison?: boolean;
  date: string;
}

interface DashboardData {
  stats: DashboardStats;
  priceTrends: PriceTrendData[];
  activity: ActivityItem[];
}

interface PropertyData {
  address: string;
  price?: number;
  sqft?: number;
  created_at?: string;
}

interface Analysis {
  id: string;
  property_data: PropertyData[];
  created_at: string;
}

interface Property {
  address: string;
  created_at?: string;
  price?: number;
  sqft?: number;
}

const processHistoricalData = (analyses: Analysis[], favorites: Property[]) => {
  // Create initial data point
  const initialPoint = {
    totalAnalyses: analyses.length,
    totalProperties: analyses.reduce((sum, analysis) => sum + analysis.property_data.length, 0),
    totalFavorites: favorites.length
  };

  // Create 10 data points showing progression to the final values
  const trendData = Array.from({ length: 10 }, (_, index) => {
    const progress = (index + 1) / 10; // Progress from 0.1 to 1.0

    return {
      month: `${index + 1}`,
      totalAnalysesRun: Math.round(initialPoint.totalAnalyses * progress),
      totalPropertiesAnalyzed: Math.round(initialPoint.totalProperties * progress),
      totalFavorites: Math.round(initialPoint.totalFavorites * progress),
      rawDate: new Date().toISOString()
    };
  });

  // Ensure the last point matches exactly with the actual totals
  if (trendData.length > 0) {
    const lastPoint = trendData[trendData.length - 1];
    lastPoint.totalAnalysesRun = initialPoint.totalAnalyses;
    lastPoint.totalPropertiesAnalyzed = initialPoint.totalProperties;
    lastPoint.totalFavorites = initialPoint.totalFavorites;
  }

  return trendData;
};

export default function Dashboard() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      const fetchDashboardData = async () => {
        try {
          // Fetch data from multiple endpoints in parallel
          const [analysesResponse, favoritesResponse] = await Promise.all([
            fetch('/api/analyses'),
            fetch('/api/properties/favorite')
          ]);

          const analysesData = await analysesResponse.json();
          const favoritesData = await favoritesResponse.json();

          // Debug log to see what data we're getting
          console.log('Analyses Data:', analysesData);
          console.log('Favorites Data:', favoritesData);

          const analyses = analysesData.analyses?.map((analysis: Analysis) => {
            const propertyCount = analysis.property_data.length;
            return {
              type: 'analysis' as const,
              property: analysis.property_data[0]?.address,
              properties: analysis.property_data.map(p => p.address),
              comparisonCount: propertyCount,
              isComparison: propertyCount > 1,
              date: analysis.created_at || new Date().toISOString()
            };
          }) || [];

          // Debug log processed analyses
          console.log('Processed Analyses:', analyses);

          const favorites = favoritesData.properties?.map((property: Property, index: number) => ({
            type: 'favorite' as const,
            property: property.address,
            // Offset each favorite by a millisecond to preserve order but allow mixing with analyses
            date: new Date(new Date(property.created_at || new Date()).getTime() - index).toISOString()
          })) || [];

          // Debug log processed favorites
          console.log('Processed Favorites:', favorites);
          // Debug the dates before combining
          console.log('Analysis dates:', analyses.map((a: { date: string }) => a.date));
          console.log('Favorite dates:', favorites.map((f: { date: string }) => f.date));

          const combinedActivity = [...analyses, ...favorites]
            .sort((a, b) => {
              const dateA = new Date(a.date).getTime();
              const dateB = new Date(b.date).getTime();
              
              // If dates are equal (within 1 second), prioritize analyses
              if (Math.abs(dateB - dateA) < 1000) {
                return a.type === 'analysis' ? -1 : 1;
              }
              
              return dateB - dateA;
            });

          // Take 2 most recent of each type, then 1 more of the most recent overall
          const recentAnalyses = combinedActivity.filter(item => item.type === 'analysis').slice(0, 2);
          const recentFavorites = combinedActivity.filter(item => item.type === 'favorite').slice(0, 2);
          const remainingItem = combinedActivity
            .filter(item => 
              !recentAnalyses.includes(item) && 
              !recentFavorites.includes(item)
            )
            .slice(0, 1);

          const finalActivity = [...recentAnalyses, ...recentFavorites, ...remainingItem]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);

          console.log('Final mixed activity:', finalActivity);

          // Process historical data
          const priceTrends = processHistoricalData(
            analysesData.analyses || [],
            favoritesData.properties || []
          );
          // Calculate the number of comparison analyses (where multiple properties were analyzed)
          const comparisonCount = analysesData.analyses?.reduce((count: number, analysis: { property_data: PropertyData[] }) => {
            return count + (analysis.property_data.length > 1 ? 1 : 0);
          }, 0) || 0;

          // Calculate the number of unique properties across all analyses
          const analyzedProperties = new Set(
            analysesData.analyses?.flatMap((analysis: { property_data: { address: string }[] }) => 
              analysis.property_data.map((p: { address: string }) => p.address)
            ) || []
          ).size;

          // Calculate current stats
          const stats = {
            totalProperties: analyzedProperties,
            analysesRun: analysesData.analyses?.length || 0,
            savedDeals: favoritesData.properties?.length || 0,
            propertiesCompared: comparisonCount
          };

          setDashboardData({
            stats,
            priceTrends,
            activity: finalActivity
          });
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
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 xs:px-5 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
          Track your property analysis activity and saved properties over time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* Total Properties */}
        <div className="bg-white rounded-lg shadow-sm px-3 py-2.5 xs:p-4 sm:p-5">
          <div className="flex flex-col">
            <div className="flex items-center mb-2 xs:mb-3">
              <div className="rounded-full bg-red-100 p-1.5 xs:p-2 mr-2">
                <svg className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-600">
                Total Properties
              </span>
            </div>
            <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 ml-[34px] xs:ml-[40px]">
              {dashboardData.stats.totalProperties}
            </div>
          </div>
        </div>

        {/* Analyses Run */}
        <div className="bg-white rounded-lg shadow-sm px-3 py-2.5 xs:p-4 sm:p-5">
          <div className="flex flex-col">
            <div className="flex items-center mb-2 xs:mb-3">
              <div className="rounded-full bg-indigo-100 p-1.5 xs:p-2 mr-2">
                <svg className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-600">
                Analyses Run
              </span>
            </div>
            <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 ml-[34px] xs:ml-[40px]">
              {dashboardData.stats.analysesRun}
            </div>
          </div>
        </div>

        {/* Properties Compared */}
        <div className="bg-white rounded-lg shadow-sm px-3 py-2.5 xs:p-4 sm:p-5">
          <div className="flex flex-col">
            <div className="flex items-center mb-2 xs:mb-3">
              <div className="rounded-full bg-cyan-100 p-1.5 xs:p-2 mr-2">
                <svg className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-600">
                Properties Compared
              </span>
            </div>
            <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 ml-[34px] xs:ml-[40px]">
              {dashboardData.stats.propertiesCompared}
            </div>
          </div>
        </div>

        {/* Saved Deals */}
        <div className="bg-white rounded-lg shadow-sm px-3 py-2.5 xs:p-4 sm:p-5">
          <div className="flex flex-col">
            <div className="flex items-center mb-2 xs:mb-3">
              <div className="rounded-full bg-yellow-100 p-1.5 xs:p-2 mr-2">
                <svg className="h-3.5 w-3.5 xs:h-4 xs:w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-gray-600">
                Saved Deals
              </span>
            </div>
            <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 ml-[34px] xs:ml-[40px]">
              {dashboardData.stats.savedDeals}
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Market Metrics Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Property Metrics Over Time</h2>
          <div className="h-[200px] xs:h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={dashboardData.priceTrends || []} 
                margin={{ 
                  top: window.innerWidth <= 475 ? 25 : 20,
                  right: window.innerWidth <= 475 ? 5 : 30,
                  left: window.innerWidth <= 475 ? 10 : 20,
                  bottom: window.innerWidth <= 475 ? 15 : 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  tick={{fontSize: window.innerWidth <= 475 ? 8 : 9}}
                  tickMargin={window.innerWidth <= 475 ? 3 : 10}
                  stroke="#6B7280"
                  label={{ 
                    value: 'Progress', 
                    position: 'bottom',
                    offset: window.innerWidth <= 475 ? 5 : 0,
                    style: { 
                      fill: '#6B7280', 
                      fontSize: window.innerWidth <= 475 ? 8 : 9 
                    }
                  }}
                />
                <YAxis 
                  yAxisId="count"
                  orientation="left"
                  tick={{fontSize: window.innerWidth <= 475 ? 8 : 9}}
                  tickMargin={window.innerWidth <= 475 ? 3 : 10}
                  stroke="#6B7280"
                  label={{ 
                    value: 'Count', 
                    angle: -90, 
                    position: 'insideLeft',
                    offset: window.innerWidth <= 475 ? 8 : 0,
                    style: { 
                      fill: '#6B7280', 
                      fontSize: window.innerWidth <= 475 ? 8 : 9 
                    }
                  }}
                />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '6px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    padding: '6px 8px',
                    fontSize: '10px'
                  }}
                />
                
                <Legend 
                  verticalAlign="top"
                  height={window.innerWidth <= 475 ? 15 : 20}
                  wrapperStyle={{
                    fontSize: window.innerWidth <= 475 ? '8px' : '9px',
                    marginTop: window.innerWidth <= 475 ? '-15px' : '0px'
                  }}
                />
                
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="totalAnalysesRun"
                  name="Total Analyses"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3, stroke: 'white' }}
                />
                
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="totalPropertiesAnalyzed"
                  name="Properties Analyzed"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 3, stroke: 'white' }}
                />
                
                <Line
                  yAxisId="count"
                  type="monotone"
                  dataKey="totalFavorites"
                  name="Saved Properties"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3, stroke: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 xs:mt-3 grid grid-cols-3 gap-1 xs:gap-2 text-[10px] xs:text-xs">
            {dashboardData.priceTrends?.[dashboardData.priceTrends.length - 1] ? (
              <>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <p className="text-gray-600">Total Analyses</p>
                  <p className="font-semibold text-purple-600">
                    {dashboardData.priceTrends[dashboardData.priceTrends.length - 1].totalAnalysesRun}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <p className="text-gray-600">Properties Analyzed</p>
                  <p className="font-semibold text-green-600">
                    {dashboardData.priceTrends[dashboardData.priceTrends.length - 1].totalPropertiesAnalyzed}
                  </p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <p className="text-gray-600">Saved Properties</p>
                  <p className="font-semibold text-yellow-600">
                    {dashboardData.priceTrends[dashboardData.priceTrends.length - 1].totalFavorites}
                  </p>
                </div>
              </>
            ) : (
              <div className="col-span-3 text-center text-gray-500">
                No activity data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {dashboardData.activity.length > 0 ? (
              dashboardData.activity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-md transition-colors border border-gray-100">
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
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {activity.type === 'analysis' && activity.isComparison ? (
                        `Compared ${activity.properties?.join(' vs ')}`
                      ) : activity.type === 'analysis' ? (
                        `Analyzed ${activity.property}`
                      ) : (
                        `Added ${activity.property} to favorites`
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm">
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
