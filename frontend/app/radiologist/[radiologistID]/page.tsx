'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Image, Activity, Calendar, Eye } from 'lucide-react';

interface Scan {
  id: string;
  patientName: string;
  type: string;
  date: string;
  url: string;
}

interface Props {
  params: {
    radiologistID: string;
  };
}

/**
 * Simple dashboard page for a radiologist.
 * Shows today’s scheduled scans & recent scans. You can replace the mock data
 * with real API calls once the backend endpoints are available.
 */
export default function RadiologistDashboard({ params }: Props) {
  const { radiologistID } = params;
  const [todayScans, setTodayScans] = useState<Scan[]>([]);
  const [recentScans, setRecentScans] = useState<Scan[]>([]);

  // Fetch mock data (replace with real API calls later)
  useEffect(() => {
    // Simulate async fetch
    const timeout = setTimeout(() => {
      const mock: Scan[] = [
        {
          id: 'SCAN001',
          patientName: 'John Doe',
          type: 'MRI',
          date: new Date().toISOString().split('T')[0],
          url: '/api/placeholder/100/100',
        },
        {
          id: 'SCAN002',
          patientName: 'Jane Smith',
          type: 'CT',
          date: new Date().toISOString().split('T')[0],
          url: '/api/placeholder/100/100',
        },
      ];
      setTodayScans(mock);
      setRecentScans(mock);
    }, 250);

    return () => clearTimeout(timeout);
  }, [radiologistID]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Radiologist Dashboard</h1>

      {/* Today’s Scheduled Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Today’s Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {todayScans.length === 0 ? (
            <p className="text-sm text-gray-500">No scans scheduled for today.</p>
          ) : (
            <div className="space-y-3">
              {todayScans.map((scan) => (
                <div key={scan.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
                    <Image className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {scan.patientName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {scan.type} • {scan.date}
                    </p>
                  </div>
                  <a
                    href={scan.url}
                    className="text-emerald-600 hover:underline text-sm flex items-center gap-1"
                    target="_blank"
                  >
                    <Eye className="h-4 w-4" /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Recent Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length === 0 ? (
            <p className="text-sm text-gray-500">No recent scans found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {recentScans.map((scan) => (
                <a
                  key={scan.id}
                  href={scan.url}
                  target="_blank"
                  className="block border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <img src={scan.url} alt={scan.id} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {scan.patientName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {scan.type} • {scan.date}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}