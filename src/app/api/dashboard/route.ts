import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

interface DashboardStats {
  totalProperties: number;
  analysesRun: number;
  marketUpdates: number;
  savedDeals: number;
}

interface PriceTrend {
  month: string;
  price: number;
}

interface ActivityItem {
  type: 'analysis' | 'favorite' | 'comparison';
  property?: string;
  properties?: string[];
  date: string;
  timestamp: Date;
}

export async function GET() {
  try {
    const userId = 1; // TODO: Get from session

    // Get basic stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT fp.id) as saved_deals,
        COUNT(DISTINCT pa.id) as analyses_run
      FROM favorite_properties fp
      LEFT JOIN property_analyses pa ON pa.user_id = fp.user_id
      WHERE fp.user_id = $1
    `, [userId]);

    // Get price trends (last 6 months)
    const trendResult = await pool.query(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        AVG((property_data->>'price')::numeric) as avg_price
      FROM favorite_properties
      WHERE user_id = $1
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 6
    `, [userId]);

    // Get recent activity
    const activityResult = await pool.query(`
      (SELECT 
        'analysis' as type,
        property_data->>'address' as property,
        created_at as timestamp
      FROM property_analyses
      WHERE user_id = $1)
      UNION ALL
      (SELECT 
        'favorite' as type,
        property_data->>'address' as property,
        created_at as timestamp
      FROM favorite_properties
      WHERE user_id = $1)
      ORDER BY timestamp DESC
      LIMIT 10
    `, [userId]);

    const stats: DashboardStats = {
      totalProperties: parseInt(statsResult.rows[0].saved_deals) || 0,
      analysesRun: parseInt(statsResult.rows[0].analyses_run) || 0,
      marketUpdates: 8, // TODO: Implement market updates tracking
      savedDeals: parseInt(statsResult.rows[0].saved_deals) || 0
    };

    const priceTrends: PriceTrend[] = trendResult.rows.map(row => ({
      month: new Date(row.month).toLocaleString('default', { month: 'short' }),
      price: parseFloat(row.avg_price)
    }));

    const activity: ActivityItem[] = activityResult.rows.map(row => ({
      type: row.type,
      property: row.property,
      date: formatRelativeTime(new Date(row.timestamp)),
      timestamp: row.timestamp
    }));

    return NextResponse.json({
      stats,
      priceTrends,
      activity
    });

  } catch (err) {
    console.error('Dashboard data error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}
